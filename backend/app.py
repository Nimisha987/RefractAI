


import os
import csv
import io
import tempfile
import traceback
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Project, Interview, Insight
from analyst import analyze_transcript, synthesize_insights, AnalysisError
from transcriber import transcribe_audio, TranscriptionError

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///refract.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'

db.init_app(app)
migrate = Migrate(app, db)

VALID_STATUSES = ('pending', 'confirmed', 'rejected')


@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    """Accepts an uploaded audio/video file, returns raw transcribed text.
    Purely a speech-to-text step — doesn't touch the database. Frontend then
    sends the returned text to /api/analyze like any other transcript."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    tmp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name

        text = transcribe_audio(tmp_path, file.filename)
        return jsonify({"transcript": text}), 200

    except TranscriptionError as e:
        return jsonify({"error": str(e)}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    if request.method == 'OPTIONS':
        return jsonify({"status": "preflight_ok"}), 200

    try:
        data = request.json or {}
        transcript = data.get('transcript', '')
        participant = data.get('participant_name', 'Anonymous')
        project_id = data.get('project_id', 1)

        if not transcript.strip():
            return jsonify({"error": "Transcript cannot be empty"}), 400

        project = db.session.get(Project, project_id)
        if project is None:
            return jsonify({"error": f"No project with id {project_id}"}), 404

        print(f"\n[INFO] Starting analysis for participant: {participant}...")

        parsed_result = analyze_transcript(transcript)

        new_interview = Interview(
            project_id=project_id,
            participant_name=participant,
            raw_transcript=transcript,
            sentiment_score=parsed_result['sentiment'],
        )
        db.session.add(new_interview)
        db.session.flush()

        for item in parsed_result['insights']:
            new_insight = Insight(
                interview_id=new_interview.id,
                category=item['category'],
                content=item['content'],
                quote=item['quote'],
                status='pending',
            )
            db.session.add(new_insight)

        db.session.commit()
        print(f"[SUCCESS] Saved interview ID {new_interview.id} successfully.\n")

        return jsonify({
            "status": "success",
            "interview_id": new_interview.id,
            "sentiment": new_interview.sentiment_score,
            "insights": parsed_result['insights'],
        }), 200

    except AnalysisError as ai_err:
        print(f"[AI ERROR] {ai_err}")
        return jsonify({"error": "AI analysis failed", "details": str(ai_err)}), 502

    except Exception as general_err:
        db.session.rollback()
        print(f"[CRITICAL FAILURE] Exception trace:")
        traceback.print_exc()
        return jsonify({"error": "Internal Server Exception", "details": str(general_err)}), 500


@app.route('/api/interviews', methods=['GET'])
def get_interviews():
    try:
        interviews = Interview.query.order_by(Interview.created_at.desc()).all()
        return jsonify([_serialize_interview(i) for i in interviews]), 200
    except Exception as e:
        print(f"[ERROR] Failed fetching interviews: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/interviews/<int:interview_id>', methods=['DELETE'])
def delete_interview(interview_id):
    try:
        interview = db.session.get(Interview, interview_id)
        if interview is None:
            return jsonify({"error": "Interview not found"}), 404

        db.session.delete(interview)
        db.session.commit()
        return jsonify({"status": "deleted", "id": interview_id}), 200
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed deleting interview {interview_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/projects/<int:project_id>/interviews', methods=['GET'])
def get_project_interviews(project_id):
    try:
        interviews = (
            Interview.query.filter_by(project_id=project_id)
            .order_by(Interview.created_at.desc())
            .all()
        )
        return jsonify([_serialize_interview(i) for i in interviews]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/insights', methods=['GET'])
def get_all_insights():
    try:
        project_id = request.args.get('project_id', type=int)
        category = request.args.get('category')
        status = request.args.get('status')
        search = request.args.get('search', '').strip().lower()

        query = Insight.query.join(Interview)

        if project_id:
            query = query.filter(Interview.project_id == project_id)
        if category:
            query = query.filter(Insight.category == category)
        if status:
            query = query.filter(Insight.status == status)

        insights = query.order_by(Interview.created_at.desc()).all()

        result = []
        for i in insights:
            if search and search not in i.content.lower() and search not in (i.quote or "").lower():
                continue
            result.append(_serialize_insight(i))

        return jsonify(result), 200
    except Exception as e:
        print(f"[ERROR] Failed fetching insights: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/insights/<int:insight_id>', methods=['PATCH'])
def update_insight(insight_id):
    try:
        insight = db.session.get(Insight, insight_id)
        if insight is None:
            return jsonify({"error": "Insight not found"}), 404

        data = request.json or {}

        if 'status' in data:
            if data['status'] not in VALID_STATUSES:
                return jsonify({"error": f"status must be one of {VALID_STATUSES}"}), 400
            insight.status = data['status']

        if 'category' in data:
            if data['category'] not in ('Pain Point', 'Feature Request'):
                return jsonify({"error": "category must be 'Pain Point' or 'Feature Request'"}), 400
            insight.category = data['category']

        if 'content' in data:
            if not data['content'].strip():
                return jsonify({"error": "content cannot be empty"}), 400
            insight.content = data['content'].strip()

        db.session.commit()
        return jsonify(_serialize_insight(insight)), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed updating insight {insight_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/insights/<int:insight_id>', methods=['DELETE'])
def delete_insight(insight_id):
    try:
        insight = db.session.get(Insight, insight_id)
        if insight is None:
            return jsonify({"error": "Insight not found"}), 404

        db.session.delete(insight)
        db.session.commit()
        return jsonify({"status": "deleted", "id": insight_id}), 200
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed deleting insight {insight_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/insights/export', methods=['GET'])
def export_insights():
    try:
        project_id = request.args.get('project_id', type=int)
        category = request.args.get('category')
        status = request.args.get('status')
        search = request.args.get('search', '').strip().lower()

        query = Insight.query.join(Interview)
        if project_id:
            query = query.filter(Interview.project_id == project_id)
        if category:
            query = query.filter(Insight.category == category)
        if status:
            query = query.filter(Insight.status == status)

        insights = query.order_by(Interview.created_at.desc()).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Category", "Insight", "Quote", "Participant", "Date", "Sentiment", "Status"])

        for i in insights:
            if search and search not in i.content.lower() and search not in (i.quote or "").lower():
                continue
            writer.writerow([
                i.category,
                i.content,
                i.quote,
                i.interview.participant_name,
                i.interview.created_at.strftime('%Y-%m-%d') if i.interview.created_at else '',
                i.interview.sentiment_score,
                i.status,
            ])

        csv_data = output.getvalue()
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=refract_insights.csv'},
        )
    except Exception as e:
        print(f"[ERROR] Failed exporting insights: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/synthesize', methods=['POST'])
def synthesize():
    try:
        data = request.json or {}
        project_id = data.get('project_id')

        query = Insight.query.join(Interview).filter(Insight.status == 'confirmed')
        if project_id:
            query = query.filter(Interview.project_id == project_id)

        confirmed = query.all()

        insight_dicts = [
            {
                "category": i.category,
                "content": i.content,
                "quote": i.quote,
                "participant_name": i.interview.participant_name,
            }
            for i in confirmed
        ]

        brief = synthesize_insights(insight_dicts)
        return jsonify(brief), 200

    except AnalysisError as ai_err:
        print(f"[AI ERROR] {ai_err}")
        return jsonify({"error": "Synthesis failed", "details": str(ai_err)}), 502

    except Exception as e:
        print(f"[ERROR] Failed generating brief: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/trends', methods=['GET'])
def get_trends():
    try:
        project_id = request.args.get('project_id', type=int)

        query = Interview.query
        if project_id:
            query = query.filter(Interview.project_id == project_id)

        interviews = query.order_by(Interview.created_at.asc()).all()

        by_date = {}
        for interview in interviews:
            date_key = interview.created_at.strftime('%Y-%m-%d') if interview.created_at else 'unknown'
            if date_key not in by_date:
                by_date[date_key] = {
                    "date": date_key,
                    "interviews": 0,
                    "pain_points": 0,
                    "feature_requests": 0,
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0,
                }
            by_date[date_key]["interviews"] += 1
            sentiment_key = (interview.sentiment_score or "Neutral").lower()
            if sentiment_key in ("positive", "neutral", "negative"):
                by_date[date_key][sentiment_key] += 1
            for insight in interview.insights:
                if insight.category == "Pain Point":
                    by_date[date_key]["pain_points"] += 1
                elif insight.category == "Feature Request":
                    by_date[date_key]["feature_requests"] += 1

        result = sorted(by_date.values(), key=lambda x: x["date"])
        return jsonify(result), 200

    except Exception as e:
        print(f"[ERROR] Failed fetching trends: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/participants', methods=['GET'])
def get_participants():
    """Groups all interviews + insights by participant_name — lets you see
    if the same person was interviewed multiple times and how their feedback
    evolved, instead of only viewing data per-interview or per-category."""
    try:
        project_id = request.args.get('project_id', type=int)
        query = Interview.query
        if project_id:
            query = query.filter(Interview.project_id == project_id)
        interviews = query.order_by(Interview.created_at.asc()).all()

        grouped = {}
        for interview in interviews:
            name = interview.participant_name or "Anonymous"
            if name not in grouped:
                grouped[name] = {
                    "participant_name": name,
                    "interview_count": 0,
                    "pain_point_count": 0,
                    "feature_request_count": 0,
                    "interviews": [],
                }
            grouped[name]["interview_count"] += 1
            grouped[name]["interviews"].append(_serialize_interview(interview))
            for insight in interview.insights:
                if insight.category == "Pain Point":
                    grouped[name]["pain_point_count"] += 1
                elif insight.category == "Feature Request":
                    grouped[name]["feature_request_count"] += 1

        return jsonify(list(grouped.values())), 200
    except Exception as e:
        print(f"[ERROR] Failed fetching participants: {e}")
        return jsonify({"error": str(e)}), 500


def _serialize_interview(interview):
    return {
        "id": interview.id,
        "project_id": interview.project_id,
        "participant_name": interview.participant_name,
        "raw_transcript": interview.raw_transcript,
        "sentiment_score": interview.sentiment_score,
        "created_at": interview.created_at.isoformat() if interview.created_at else None,
        "insights": [_serialize_insight(i, include_interview_meta=False) for i in interview.insights],
    }


def _serialize_insight(insight, include_interview_meta=True):
    base = {
        "id": insight.id,
        "category": insight.category,
        "content": insight.content,
        "quote": insight.quote,
        "status": insight.status,
    }
    if include_interview_meta:
        base.update({
            "interview_id": insight.interview_id,
            "participant_name": insight.interview.participant_name,
            "created_at": insight.interview.created_at.isoformat() if insight.interview.created_at else None,
            "sentiment_score": insight.interview.sentiment_score,
        })
    return base


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not db.session.get(Project, 1):
            default_project = Project(id=1, name="Default Workspace Collection")
            db.session.add(default_project)
            db.session.commit()
            print("[INIT] Database configured and default base workspace seeded.")

    app.run(port=5000, debug=app.config['DEBUG'])