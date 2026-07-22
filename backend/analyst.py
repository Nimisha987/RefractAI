
import os
import json
import re
import time
from openai import OpenAI
from dotenv import load_dotenv
from json_repair import repair_json

load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")

_client = None

def _get_client():
    global _client
    if _client is None:
        if not api_key:
            raise AnalysisError(
                "No API key found. Set OPENROUTER_API_KEY in backend/.env"
            )
        _client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
    return _client

MODEL = "openrouter/free"
REQUEST_TIMEOUT_SECONDS = 30
MAX_ATTEMPTS = 3


class AnalysisError(Exception):
    """Raised when the AI call fails or returns data we don't trust.
    Callers must NOT substitute fabricated data on this — Refract's value
    proposition depends on every insight being traceable to real transcript
    text."""
    pass


def clean_json_string(raw_string):
    if not raw_string:
        return "{}"
    match = re.search(r'\{.*\}', raw_string, re.DOTALL)
    if match:
        return match.group(0).strip()
    return raw_string.strip()


def parse_json_safely(raw_string):
    if not raw_string or not raw_string.strip():
        raise AnalysisError("Model returned an empty response")

    cleaned = clean_json_string(raw_string)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    try:
        repaired = repair_json(cleaned)
        return json.loads(repaired)
    except Exception as e:
        raise AnalysisError(f"Model did not return valid JSON, even after repair attempt: {e}") from e


def validate_schema(data):
    if not isinstance(data, dict):
        raise AnalysisError("Response was not a JSON object")
    if "sentiment" not in data or data["sentiment"] not in ("Positive", "Neutral", "Negative"):
        raise AnalysisError(f"Missing or invalid 'sentiment' field: {data.get('sentiment')!r}")
    if "insights" not in data or not isinstance(data["insights"], list):
        raise AnalysisError("Missing or invalid 'insights' field")

    valid_insights = []
    for i, item in enumerate(data["insights"]):
        if not isinstance(item, dict):
            continue
        if not all(field in item and isinstance(item[field], str) for field in ("category", "content", "quote")):
            continue
        if item["category"] not in ("Pain Point", "Feature Request"):
            print(f"[WARN] Dropping insight[{i}] with invalid category: {item['category']!r}")
            continue
        valid_insights.append(item)

    data["insights"] = valid_insights
    return data


def _call_model(text, system_prompt):
    client = _get_client()
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analyze this transcript:\n\n{text}"},
        ],
        max_tokens=800,
        temperature=0.1,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    print(f"[INFO] Routed to model: {getattr(response, 'model', 'unknown')}")

    raw_output = response.choices[0].message.content
    parsed = parse_json_safely(raw_output)
    return validate_schema(parsed)


def analyze_transcript(text):
    system_prompt = (
        "You are a Senior UX Researcher. Analyze the provided user transcript.\n"
        "Identify the overall sentiment and find specific insights. Every insight MUST be "
        "categorized as EXACTLY one of these two strings: 'Pain Point' or 'Feature Request'.\n"
        "Do not invent other categories. If a comment is purely positive praise with no "
        "actionable pain point or feature request, do not include it as an insight — "
        "reflect it in the overall 'sentiment' field instead.\n"
        "For every single insight, you must provide a short, direct verbatim quote "
        "from the transcript as evidence. Escape any quotation marks inside the quote "
        "field properly so the JSON stays valid.\n\n"
        "Return a JSON object with this exact shape:\n"
        "{\n"
        '  "sentiment": "Positive" | "Neutral" | "Negative",\n'
        '  "insights": [\n'
        '    {"category": "Pain Point" | "Feature Request", "content": "Description here", "quote": "Exact quote here"}\n'
        "  ]\n"
        "}"
    )

    last_error = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            return _call_model(text, system_prompt)
        except AnalysisError as e:
            last_error = e
            print(f"[WARN] Attempt {attempt}/{MAX_ATTEMPTS} failed: {e}")
            if attempt < MAX_ATTEMPTS:
                time.sleep(1)
        except Exception as e:
            last_error = AnalysisError(f"API request failed: {e}")
            print(f"[WARN] Attempt {attempt}/{MAX_ATTEMPTS} failed: {e}")
            if attempt < MAX_ATTEMPTS:
                time.sleep(1)

    raise last_error


def _call_synthesis(insight_block, system_prompt):
    client = _get_client()
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Here are the confirmed insights:\n\n{insight_block}"},
        ],
        max_tokens=900,
        temperature=0.2,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    print(f"[INFO] Synthesis routed to model: {getattr(response, 'model', 'unknown')}")

    raw_output = response.choices[0].message.content
    parsed = parse_json_safely(raw_output)

    if not isinstance(parsed, dict) or "themes" not in parsed or "executive_summary" not in parsed:
        raise AnalysisError("Synthesis response missing required fields")

    return parsed


def synthesize_insights(insights):
    """
    Takes a list of confirmed insight dicts (category, content, quote, participant_name)
    and produces a synthesized research brief: recurring themes grouped by frequency,
    plus a short executive summary. Retries on transient failures since
    openrouter/free routes to a different model each call.
    """
    if not insights:
        raise AnalysisError("No confirmed insights to synthesize. Confirm at least one insight first.")

    insight_lines = []
    for idx, i in enumerate(insights):
        insight_lines.append(
            f"[{idx}] ({i['category']}) {i['content']} — participant: {i['participant_name']} — quote: \"{i['quote']}\""
        )
    insight_block = "\n".join(insight_lines)

    system_prompt = (
        "You are a Senior Product Research Analyst. You will be given a numbered list of "
        "confirmed research insights gathered across multiple user interviews. Your job is to "
        "synthesize them into a research brief for a Product Manager.\n\n"
        "1. Identify recurring THEMES — insights from different participants that describe the "
        "same underlying issue or request. Group insight indices under each theme.\n"
        "2. Write a concise 3-5 sentence executive summary of the overall findings.\n"
        "3. Identify the single highest-priority theme (the one mentioned by the most participants, "
        "or with the clearest impact) as 'top_priority'.\n\n"
        "Return ONLY a JSON object with this exact shape:\n"
        "{\n"
        '  "executive_summary": "...",\n'
        '  "top_priority": "short theme title",\n'
        '  "themes": [\n'
        '    {"title": "short theme name", "category": "Pain Point" | "Feature Request", '
        '"insight_indices": [0, 2], "participant_count": 2}\n'
        "  ]\n"
        "}"
    )

    last_error = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            parsed = _call_synthesis(insight_block, system_prompt)
            for theme in parsed.get("themes", []):
                indices = theme.get("insight_indices", [])
                theme["insights"] = [insights[i] for i in indices if isinstance(i, int) and 0 <= i < len(insights)]
                theme.pop("insight_indices", None)
            return parsed
        except AnalysisError as e:
            last_error = e
            print(f"[WARN] Synthesis attempt {attempt}/{MAX_ATTEMPTS} failed: {e}")
            if attempt < MAX_ATTEMPTS:
                time.sleep(1)
        except Exception as e:
            last_error = AnalysisError(f"Synthesis API request failed: {e}")
            print(f"[WARN] Synthesis attempt {attempt}/{MAX_ATTEMPTS} failed: {e}")
            if attempt < MAX_ATTEMPTS:
                time.sleep(1)

    raise last_error