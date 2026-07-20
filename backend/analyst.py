# # # # # import os
# # # # # import json
# # # # # import re
# # # # # from openai import OpenAI
# # # # # from dotenv import load_dotenv

# # # # # # 1. Load system environment variables safely
# # # # # load_dotenv()
# # # # # api_key = os.getenv("OPENAI_API_KEY")

# # # # # # 2. Global OpenRouter Client Definition
# # # # # client = OpenAI(
# # # # #     base_url="https://openrouter.ai/api/v1",
# # # # #     api_key=api_key
# # # # # )

# # # # # def clean_json_string(raw_string):
# # # # #     """
# # # # #     Strips away conversational text fillers, markdown boundaries,
# # # # #     or random formatting blocks added by open-source LLMs.
# # # # #     """
# # # # #     if not raw_string:
# # # # #         return "{}"
    
# # # # #     # Isolate patterns explicitly starting with '{' and ending with '}'
# # # # #     match = re.search(r'\{.*\}', raw_string, re.DOTALL)
# # # # #     if match:
# # # # #         return match.group(0).strip()
    
# # # # #     return raw_string.strip()

# # # # # def analyze_transcript(text):
# # # # #     """
# # # # #     Sends raw textual data to OpenRouter's universal free tier pool.
# # # # #     Returns a strict, clean string representation of a JSON payload.
# # # # #     """
# # # # #     system_prompt = (
# # # # #         "You are a Senior UX Researcher. Analyze the provided user transcript.\n"
# # # # #         "Identify the overall sentiment and find specific insights. Categorize each insight as either 'Pain Point' or 'Feature Request'.\n"
# # # # #         "For every single insight, you must provide a short, direct verbatim quote from the transcript as evidence.\n\n"
# # # # #         "CRITICAL: Return ONLY a raw JSON object. Do not include markdown code blocks, backticks, or introduction text.\n\n"
# # # # #         "JSON Schema Structure:\n"
# # # # #         "{\n"
# # # # #         "  \"sentiment\": \"Positive/Neutral/Negative\",\n"
# # # # #         "  \"insights\": [\n"
# # # # #         "    {\"category\": \"Pain Point\", \"content\": \"Description here\", \"quote\": \"Exact quote here\"}\n"
# # # # #         "  ]\n"
# # # # #         "}"
# # # # #     )

# # # # #     try:
# # # # #         # Utilizing universal routing endpoint to eliminate 404 model shift errors
# # # # #         response = client.chat.completions.create(
# # # # #             model="openrouter/free",
# # # # #             messages=[
# # # # #                 {"role": "system", "content": system_prompt},
# # # # #                 {"role": "user", "content": f"Analyze this transcript: {text}"}
# # # # #             ],
# # # # #             max_tokens=600,      # Restricts resource consumption to safely bypass 402 billing errors
# # # # #             temperature=0.1      # Keeps responses consistent and heavily anchored to your prompt format
# # # # #         )

# # # # #         raw_output = response.choices[0].message.content
        
# # # # #         # Isolate the core JSON dataset
# # # # #         clean_output = clean_json_string(raw_output)
        
# # # # #         # Test locally to verify structure integrity
# # # # #         json.loads(clean_output)
# # # # #         return clean_output

# # # # #     except Exception as e:
# # # # #         print(f"[ENGINE ERROR] Connection or Parse event fault: {e}")
# # # # #         # Bulletproof structured string layout to keep SQLite transactions alive
# # # # #         return json.dumps({
# # # # #             "sentiment": "Neutral",
# # # # #             "insights": [{
# # # # #                 "category": "Pain Point",
# # # # #                 "content": "AI Cluster experience high demand latency. Dashboard fallback displayed.",
# # # # #                 "quote": "N/A"
# # # # #             }]
# # # # #         })


# # # # import os
# # # # import json
# # # # import re
# # # # from openai import OpenAI
# # # # from dotenv import load_dotenv

# # # # load_dotenv()
# # # # api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")

# # # # client = OpenAI(
# # # #     base_url="https://openrouter.ai/api/v1",
# # # #     api_key=api_key,
# # # # )

# # # # # Pin a specific model. "openrouter/free" is not a real model id on OpenRouter —
# # # # # check https://openrouter.ai/models?max_price=0 for current free-tier options
# # # # # and swap this string if the one below stops being available.
# # # # MODEL = "meta-llama/llama-3.1-8b-instruct:free"

# # # # REQUEST_TIMEOUT_SECONDS = 30


# # # # class AnalysisError(Exception):
# # # #     """Raised when the AI call fails or returns data that doesn't match our contract.
# # # #     Callers (app.py) should catch this and surface a real error to the client —
# # # #     never silently substitute fabricated insights, since Refract's whole value
# # # #     proposition is that every insight is traceable to real transcript data."""
# # # #     pass


# # # # def clean_json_string(raw_string):
# # # #     """Strips markdown fences / conversational filler some models add around JSON."""
# # # #     if not raw_string:
# # # #         return "{}"
# # # #     match = re.search(r'\{.*\}', raw_string, re.DOTALL)
# # # #     if match:
# # # #         return match.group(0).strip()
# # # #     return raw_string.strip()


# # # # def validate_schema(data):
# # # #     """Confirms the parsed JSON actually matches the contract app.py expects.
# # # #     Raises AnalysisError with a specific reason if not, rather than letting
# # # #     malformed data flow into the database."""
# # # #     if not isinstance(data, dict):
# # # #         raise AnalysisError("Response was not a JSON object")

# # # #     if "sentiment" not in data or data["sentiment"] not in ("Positive", "Neutral", "Negative"):
# # # #         raise AnalysisError(f"Missing or invalid 'sentiment' field: {data.get('sentiment')!r}")

# # # #     if "insights" not in data or not isinstance(data["insights"], list):
# # # #         raise AnalysisError("Missing or invalid 'insights' field")

# # # #     for i, item in enumerate(data["insights"]):
# # # #         if not isinstance(item, dict):
# # # #             raise AnalysisError(f"insights[{i}] is not an object")
# # # #         for field in ("category", "content", "quote"):
# # # #             if field not in item or not isinstance(item[field], str):
# # # #                 raise AnalysisError(f"insights[{i}] missing/invalid '{field}'")
# # # #         if item["category"] not in ("Pain Point", "Feature Request"):
# # # #             raise AnalysisError(f"insights[{i}] has unexpected category: {item['category']!r}")

# # # #     return data


# # # # def analyze_transcript(text):
# # # #     """
# # # #     Sends a transcript to the LLM and returns a validated dict matching:
# # # #     {"sentiment": ..., "insights": [{"category", "content", "quote"}, ...]}

# # # #     Raises AnalysisError on any failure. Callers must NOT treat a raised
# # # #     exception as recoverable-with-placeholder-data — that would silently
# # # #     break the traceability guarantee this product is built on.
# # # #     """
# # # #     if not api_key:
# # # #         raise AnalysisError("No OpenRouter/OpenAI API key configured (check .env)")

# # # #     system_prompt = (
# # # #         "You are a Senior UX Researcher. Analyze the provided user transcript.\n"
# # # #         "Identify the overall sentiment and find specific insights. Categorize each "
# # # #         "insight as either 'Pain Point' or 'Feature Request'.\n"
# # # #         "For every single insight, you must provide a short, direct verbatim quote "
# # # #         "from the transcript as evidence. The quote must be copied exactly from the "
# # # #         "transcript text — never paraphrased or invented.\n\n"
# # # #         "CRITICAL: Return ONLY a raw JSON object. Do not include markdown code blocks, "
# # # #         "backticks, or introduction text.\n\n"
# # # #         "JSON Schema Structure:\n"
# # # #         "{\n"
# # # #         '  "sentiment": "Positive" | "Neutral" | "Negative",\n'
# # # #         '  "insights": [\n'
# # # #         '    {"category": "Pain Point" | "Feature Request", "content": "Description here", "quote": "Exact quote here"}\n'
# # # #         "  ]\n"
# # # #         "}"
# # # #     )

# # # #     try:
# # # #         response = client.chat.completions.create(
# # # #             model=MODEL,
# # # #             messages=[
# # # #                 {"role": "system", "content": system_prompt},
# # # #                 {"role": "user", "content": f"Analyze this transcript:\n\n{text}"},
# # # #             ],
# # # #             max_tokens=1200,
# # # #             temperature=0.1,
# # # #             timeout=REQUEST_TIMEOUT_SECONDS,
# # # #         )
# # # #     except Exception as e:
# # # #         raise AnalysisError(f"API request failed: {e}") from e

# # # #     raw_output = response.choices[0].message.content
# # # #     clean_output = clean_json_string(raw_output)

# # # #     try:
# # # #         parsed = json.loads(clean_output)
# # # #     except json.JSONDecodeError as e:
# # # #         raise AnalysisError(f"Model did not return valid JSON: {e}") from e

# # # #     return validate_schema(parsed)


# # # import os
# # # import json
# # # import re
# # # from openai import OpenAI
# # # from dotenv import load_dotenv

# # # load_dotenv()
# # # api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")

# # # # Defer client creation instead of building it at import time — a missing
# # # # key should surface as a clear error when analysis is attempted, not crash
# # # # the whole Flask process on startup.
# # # _client = None

# # # def _get_client():
# # #     global _client
# # #     if _client is None:
# # #         if not api_key:
# # #             raise AnalysisError(
# # #                 "No API key found. Set OPENROUTER_API_KEY in backend/.env"
# # #             )
# # #         _client = OpenAI(
# # #             base_url="https://openrouter.ai/api/v1",
# # #             api_key=api_key,
# # #         )
# # #     return _client

# # # MODEL = "meta-llama/llama-3.1-8b-instruct:free"
# # # REQUEST_TIMEOUT_SECONDS = 30


# # # class AnalysisError(Exception):
# # #     pass


# # # def clean_json_string(raw_string):
# # #     if not raw_string:
# # #         return "{}"
# # #     match = re.search(r'\{.*\}', raw_string, re.DOTALL)
# # #     if match:
# # #         return match.group(0).strip()
# # #     return raw_string.strip()


# # # def validate_schema(data):
# # #     if not isinstance(data, dict):
# # #         raise AnalysisError("Response was not a JSON object")
# # #     if "sentiment" not in data or data["sentiment"] not in ("Positive", "Neutral", "Negative"):
# # #         raise AnalysisError(f"Missing or invalid 'sentiment' field: {data.get('sentiment')!r}")
# # #     if "insights" not in data or not isinstance(data["insights"], list):
# # #         raise AnalysisError("Missing or invalid 'insights' field")
# # #     for i, item in enumerate(data["insights"]):
# # #         if not isinstance(item, dict):
# # #             raise AnalysisError(f"insights[{i}] is not an object")
# # #         for field in ("category", "content", "quote"):
# # #             if field not in item or not isinstance(item[field], str):
# # #                 raise AnalysisError(f"insights[{i}] missing/invalid '{field}'")
# # #         if item["category"] not in ("Pain Point", "Feature Request"):
# # #             raise AnalysisError(f"insights[{i}] has unexpected category: {item['category']!r}")
# # #     return data


# # # def analyze_transcript(text):
# # #     client = _get_client()

# # #     system_prompt = (
# # #         "You are a Senior UX Researcher. Analyze the provided user transcript.\n"
# # #         "Identify the overall sentiment and find specific insights. Categorize each "
# # #         "insight as either 'Pain Point' or 'Feature Request'.\n"
# # #         "For every single insight, you must provide a short, direct verbatim quote "
# # #         "from the transcript as evidence. The quote must be copied exactly from the "
# # #         "transcript text — never paraphrased or invented.\n\n"
# # #         "CRITICAL: Return ONLY a raw JSON object. Do not include markdown code blocks, "
# # #         "backticks, or introduction text.\n\n"
# # #         "JSON Schema Structure:\n"
# # #         "{\n"
# # #         '  "sentiment": "Positive" | "Neutral" | "Negative",\n'
# # #         '  "insights": [\n'
# # #         '    {"category": "Pain Point" | "Feature Request", "content": "Description here", "quote": "Exact quote here"}\n'
# # #         "  ]\n"
# # #         "}"
# # #     )

# # #     try:
# # #         response = client.chat.completions.create(
# # #             model=MODEL,
# # #             messages=[
# # #                 {"role": "system", "content": system_prompt},
# # #                 {"role": "user", "content": f"Analyze this transcript:\n\n{text}"},
# # #             ],
# # #             max_tokens=1200,
# # #             temperature=0.1,
# # #             timeout=REQUEST_TIMEOUT_SECONDS,
# # #         )
# # #     except Exception as e:
# # #         raise AnalysisError(f"API request failed: {e}") from e

# # #     raw_output = response.choices[0].message.content
# # #     clean_output = clean_json_string(raw_output)

# # #     try:
# # #         parsed = json.loads(clean_output)
# # #     except json.JSONDecodeError as e:
# # #         raise AnalysisError(f"Model did not return valid JSON: {e}") from e

# # #     return validate_schema(parsed)

# # import os
# # import json
# # import re
# # from openai import OpenAI
# # from dotenv import load_dotenv

# # load_dotenv()
# # api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")

# # _client = None

# # def _get_client():
# #     global _client
# #     if _client is None:
# #         if not api_key:
# #             raise AnalysisError(
# #                 "No API key found. Set OPENROUTER_API_KEY in backend/.env"
# #             )
# #         _client = OpenAI(
# #             base_url="https://openrouter.ai/api/v1",
# #             api_key=api_key,
# #         )
# #     return _client

# # # Using an OpenAI model via OpenRouter — requires OpenRouter credits (not free tier).
# # # Other good options: "openai/gpt-4o", "openai/gpt-4.1-mini"
# # MODEL = "openrouter/free"
# # REQUEST_TIMEOUT_SECONDS = 30


# # class AnalysisError(Exception):
# #     pass


# # def clean_json_string(raw_string):
# #     if not raw_string:
# #         return "{}"
# #     match = re.search(r'\{.*\}', raw_string, re.DOTALL)
# #     if match:
# #         return match.group(0).strip()
# #     return raw_string.strip()



# # def validate_schema(data):
# #     if not isinstance(data, dict):
# #         raise AnalysisError("Response was not a JSON object")
# #     if "sentiment" not in data or data["sentiment"] not in ("Positive", "Neutral", "Negative"):
# #         raise AnalysisError(f"Missing or invalid 'sentiment' field: {data.get('sentiment')!r}")
# #     if "insights" not in data or not isinstance(data["insights"], list):
# #         raise AnalysisError("Missing or invalid 'insights' field")

# #     valid_insights = []
# #     for i, item in enumerate(data["insights"]):
# #         if not isinstance(item, dict):
# #             continue
# #         if not all(field in item and isinstance(item[field], str) for field in ("category", "content", "quote")):
# #             continue
# #         if item["category"] not in ("Pain Point", "Feature Request"):
# #             # Model drifted off-schema for this one item — skip it instead of
# #             # failing the whole analysis. Logged so you can see how often this happens.
# #             print(f"[WARN] Dropping insight[{i}] with invalid category: {item['category']!r}")
# #             continue
# #         valid_insights.append(item)

# #     data["insights"] = valid_insights
# #     return data

# # # def validate_schema(data):
# # #     if not isinstance(data, dict):
# # #         raise AnalysisError("Response was not a JSON object")
# # #     if "sentiment" not in data or data["sentiment"] not in ("Positive", "Neutral", "Negative"):
# # #         raise AnalysisError(f"Missing or invalid 'sentiment' field: {data.get('sentiment')!r}")
# # #     if "insights" not in data or not isinstance(data["insights"], list):
# # #         raise AnalysisError("Missing or invalid 'insights' field")
# # #     for i, item in enumerate(data["insights"]):
# # #         if not isinstance(item, dict):
# # #             raise AnalysisError(f"insights[{i}] is not an object")
# # #         for field in ("category", "content", "quote"):
# # #             if field not in item or not isinstance(item[field], str):
# # #                 raise AnalysisError(f"insights[{i}] missing/invalid '{field}'")
# # #         if item["category"] not in ("Pain Point", "Feature Request"):
# # #             raise AnalysisError(f"insights[{i}] has unexpected category: {item['category']!r}")
# # #     return data


# # def analyze_transcript(text):
# #     client = _get_client()

# #     system_prompt = (
# #     "You are a Senior UX Researcher. Analyze the provided user transcript.\n"
# #     "Identify the overall sentiment and find specific insights. Every insight MUST be "
# #     "categorized as EXACTLY one of these two strings: 'Pain Point' or 'Feature Request'.\n"
# #     "Do not invent other categories. If a comment is purely positive praise with no "
# #     "actionable pain point or feature request, do not include it as an insight — "
# #     "reflect it in the overall 'sentiment' field instead.\n"
# #     "For every single insight, you must provide a short, direct verbatim quote "
# #     "from the transcript as evidence. The quote must be copied exactly from the "
# #     "transcript text — never paraphrased or invented.\n\n"
# #     "Return a JSON object with this exact shape:\n"
# #     "{\n"
# #     '  "sentiment": "Positive" | "Neutral" | "Negative",\n'
# #     '  "insights": [\n'
# #     '    {"category": "Pain Point" | "Feature Request", "content": "Description here", "quote": "Exact quote here"}\n'
# #     "  ]\n"
# #     "}"
# # )
# #     try:
# #         response = client.chat.completions.create(
# #             model=MODEL,
# #             messages=[
# #                 {"role": "system", "content": system_prompt},
# #                 {"role": "user", "content": f"Analyze this transcript:\n\n{text}"},
# #             ],
# #             max_tokens=800,
# #             temperature=0.1,
# #             timeout=REQUEST_TIMEOUT_SECONDS,
# #             response_format={"type": "json_object"},  # OpenAI models support strict JSON mode
# #         )
# #     except Exception as e:
# #         raise AnalysisError(f"API request failed: {e}") from e

# #     raw_output = response.choices[0].message.content
# #     clean_output = clean_json_string(raw_output)

# #     try:
# #         parsed = json.loads(clean_output)
# #     except json.JSONDecodeError as e:
# #         raise AnalysisError(f"Model did not return valid JSON: {e}") from e

# #     return validate_schema(parsed)


# import os
# import json
# import re
# from openai import OpenAI
# from dotenv import load_dotenv
# from json_repair import repair_json

# load_dotenv()
# api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")

# _client = None

# def _get_client():
#     global _client
#     if _client is None:
#         if not api_key:
#             raise AnalysisError(
#                 "No API key found. Set OPENROUTER_API_KEY in backend/.env"
#             )
#         _client = OpenAI(
#             base_url="https://openrouter.ai/api/v1",
#             api_key=api_key,
#         )
#     return _client

# MODEL = "openrouter/free"
# REQUEST_TIMEOUT_SECONDS = 30


# class AnalysisError(Exception):
#     pass


# def clean_json_string(raw_string):
#     if not raw_string:
#         return "{}"
#     match = re.search(r'\{.*\}', raw_string, re.DOTALL)
#     if match:
#         return match.group(0).strip()
#     return raw_string.strip()


# def parse_json_safely(raw_string):
#     """Tries strict parsing first, then falls back to repairing common
#     LLM JSON mistakes (unescaped quotes, trailing commas, etc.) before
#     giving up entirely."""
#     cleaned = clean_json_string(raw_string)
#     try:
#         return json.loads(cleaned)
#     except json.JSONDecodeError:
#         pass

#     try:
#         repaired = repair_json(cleaned)
#         return json.loads(repaired)
#     except Exception as e:
#         raise AnalysisError(f"Model did not return valid JSON, even after repair attempt: {e}") from e


# def validate_schema(data):
#     if not isinstance(data, dict):
#         raise AnalysisError("Response was not a JSON object")
#     if "sentiment" not in data or data["sentiment"] not in ("Positive", "Neutral", "Negative"):
#         raise AnalysisError(f"Missing or invalid 'sentiment' field: {data.get('sentiment')!r}")
#     if "insights" not in data or not isinstance(data["insights"], list):
#         raise AnalysisError("Missing or invalid 'insights' field")

#     valid_insights = []
#     for i, item in enumerate(data["insights"]):
#         if not isinstance(item, dict):
#             continue
#         if not all(field in item and isinstance(item[field], str) for field in ("category", "content", "quote")):
#             continue
#         if item["category"] not in ("Pain Point", "Feature Request"):
#             print(f"[WARN] Dropping insight[{i}] with invalid category: {item['category']!r}")
#             continue
#         valid_insights.append(item)

#     data["insights"] = valid_insights
#     return data


# def analyze_transcript(text):
#     client = _get_client()

#     system_prompt = (
#         "You are a Senior UX Researcher. Analyze the provided user transcript.\n"
#         "Identify the overall sentiment and find specific insights. Every insight MUST be "
#         "categorized as EXACTLY one of these two strings: 'Pain Point' or 'Feature Request'.\n"
#         "Do not invent other categories. If a comment is purely positive praise with no "
#         "actionable pain point or feature request, do not include it as an insight — "
#         "reflect it in the overall 'sentiment' field instead.\n"
#         "For every single insight, you must provide a short, direct verbatim quote "
#         "from the transcript as evidence. Escape any quotation marks inside the quote "
#         "field properly so the JSON stays valid.\n\n"
#         "Return a JSON object with this exact shape:\n"
#         "{\n"
#         '  "sentiment": "Positive" | "Neutral" | "Negative",\n'
#         '  "insights": [\n'
#         '    {"category": "Pain Point" | "Feature Request", "content": "Description here", "quote": "Exact quote here"}\n'
#         "  ]\n"
#         "}"
#     )

#     try:
#         response = client.chat.completions.create(
#             model=MODEL,
#             messages=[
#                 {"role": "system", "content": system_prompt},
#                 {"role": "user", "content": f"Analyze this transcript:\n\n{text}"},
#             ],
#             max_tokens=800,
#             temperature=0.1,
#             timeout=REQUEST_TIMEOUT_SECONDS,
#         )
#     except Exception as e:
#         raise AnalysisError(f"API request failed: {e}") from e

#     print(f"[INFO] Routed to model: {getattr(response, 'model', 'unknown')}")

#     raw_output = response.choices[0].message.content
#     parsed = parse_json_safely(raw_output)

#     return validate_schema(parsed)


import os
import json
import re
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

# Auto-router: OpenRouter picks a currently-live free model per request,
# so this can't go stale like a hardcoded slug can. Swap to a paid model
# (e.g. "openai/gpt-4o-mini") if you add OpenRouter credits and want more
# consistent JSON output.
MODEL = "openrouter/free"
REQUEST_TIMEOUT_SECONDS = 30


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
    """Strict parse first, then falls back to repairing common LLM JSON
    mistakes (unescaped quotes, trailing commas, etc.) before giving up."""
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


def analyze_transcript(text):
    client = _get_client()

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

    try:
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
    except Exception as e:
        raise AnalysisError(f"API request failed: {e}") from e

    print(f"[INFO] Routed to model: {getattr(response, 'model', 'unknown')}")

    raw_output = response.choices[0].message.content
    parsed = parse_json_safely(raw_output)

    return validate_schema(parsed)