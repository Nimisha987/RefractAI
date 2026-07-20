import os
import csv
import io
import traceback
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from models import db, Project, Interview, Insight
from analyst import analyze_transcript, synthesize_insights, AnalysisError

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///refract.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'

db.init_app(app)

VALID_STATUSES = ('pending', 'confirmed', 'rejected')


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