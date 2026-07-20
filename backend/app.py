# # import os
# # import json
# # import traceback
# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # from models import db, Project, Interview, Insight
# # from analyst import analyze_transcript

# # app = Flask(__name__)
# # CORS(app)  # Enables cross-origin resource sharing for your React frontend

# # # Correct database path matching standard Flask-SQLAlchemy URI configurations
# # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///refract.db'
# # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# # db.init_app(app)

# # @app.route('/api/analyze', methods=['POST', 'OPTIONS'])
# # def analyze():
# #     # Handle preflight CORS requests seamlessly
# #     if request.method == 'OPTIONS':
# #         return jsonify({"status": "preflight_ok"}), 200

# #     try:
# #         data = request.json or {}
# #         transcript = data.get('transcript', '')
# #         participant = data.get('participant_name', 'Anonymous')
# #         project_id = data.get('project_id', 1)

# #         if not transcript.strip():
# #             return jsonify({"error": "Transcript cannot be empty"}), 400

# #         print(f"\n[INFO] Starting analysis for participant: {participant}...")

# #         # 1. Fetch raw analyzed string payload from OpenRouter
# #         ai_response_string = analyze_transcript(transcript)
# #         print(f"[INFO] AI Raw Output received:\n{ai_response_string}")

# #         # 2. Parse the text response cleanly into a Python dictionary
# #         parsed_result = json.loads(ai_response_string)

# #         # 3. Save parent row layout (Interview Data)
# #         new_interview = Interview(
# #             project_id=project_id,
# #             participant_name=participant,
# #             raw_transcript=transcript,
# #             sentiment_score=parsed_result.get('sentiment', 'Neutral')
# #         )
# #         db.session.add(new_interview)
# #         db.session.flush()  # Flushes session state to generate new_interview.id immediately

# #         # 4. Loop through and add child row insights
# #         for item in parsed_result.get('insights', []):
# #             new_insight = Insight(
# #                 interview_id=new_interview.id,
# #                 category=item.get('category', 'Pain Point'),
# #                 content=item.get('content', 'No descriptive breakdown provided.'),
# #                 quote=item.get('quote', 'N/A')
# #             )
# #             db.session.add(new_insight)

# #         # 5. Commit complete transaction to refract.db
# #         db.session.commit()
# #         print(f"[SUCCESS] Saved interview ID {new_interview.id} successfully.\n")
        
# #         return jsonify({
# #             "status": "success",
# #             "interview_id": new_interview.id,
# #             "sentiment": new_interview.sentiment_score,
# #             "insights": parsed_result.get('insights', [])
# #         }), 200

# #     except json.JSONDecodeError as json_err:
# #         print(f"[ERROR] JSON Parsing Engine Failed: {json_err}")
# #         return jsonify({"error": "AI returned malformed or non-JSON data structural layouts", "details": str(json_err)}), 500

# #     except Exception as general_err:
# #         db.session.rollback()  # Rollback changes to prevent database corruption
# #         print(f"[CRITICAL FAILURE] Exception trace:")
# #         traceback.print_exc()
# #         return jsonify({"error": "Internal Server Exception", "details": str(general_err)}), 500


# # @app.route('/api/interviews', methods=['GET'])
# # def get_interviews():
# #     """
# #     Fetches all historical interview records along with their nested child insights.
# #     """
# #     try:
# #         interviews = Interview.query.order_by(Interview.created_at.desc()).all()
# #         result = []
# #         for interview in interviews:
# #             insights_list = []
# #             for insight in interview.insights:
# #                 insights_list.append({
# #                     "id": insight.id,
# #                     "category": insight.category,
# #                     "content": insight.content,
# #                     "quote": insight.quote
# #                 })
                
# #             result.append({
# #                 "id": interview.id,
# #                 "project_id": interview.project_id,
# #                 "participant_name": interview.participant_name,
# #                 "raw_transcript": interview.raw_transcript,
# #                 "sentiment_score": interview.sentiment_score,
# #                 "created_at": interview.created_at.isoformat() if interview.created_at else None,
# #                 "insights": insights_list
# #             })
# #         return jsonify(result), 200
# #     except Exception as e:
# #         print(f"[ERROR] Failed fetching interviews: {e}")
# #         return jsonify({"error": str(e)}), 500


# # @app.route('/api/projects/<int:project_id>/interviews', methods=['GET'])
# # def get_project_interviews(project_id):
# #     """
# #     Fetches interviews assigned to a specific workspace ID context.
# #     """
# #     try:
# #         interviews = Interview.query.filter_by(project_id=project_id).order_by(Interview.created_at.desc()).all()
# #         result = []
# #         for interview in interviews:
# #             insights_list = [{"id": i.id, "category": i.category, "content": i.content, "quote": i.quote} for i in interview.insights]
# #             result.append({
# #                 "id": interview.id,
# #                 "participant_name": interview.participant_name,
# #                 "raw_transcript": interview.raw_transcript,
# #                 "sentiment_score": interview.sentiment_score,
# #                 "insights": insights_list
# #             })
# #         return jsonify(result), 200
# #     except Exception as e:
# #         return jsonify({"error": str(e)}), 500


# # # Application Startup Context Factory
# # if __name__ == '__main__':
# #     with app.app_context():
# #         db.create_all()
# #         # Seed a default workspace project using modern warning-free Session.get() syntax
# #         if not db.session.get(Project, 1):
# #             default_project = Project(id=1, name="Default Workspace Collection")
# #             db.session.add(default_project)
# #             db.session.commit()
# #             print("[INIT] Database configured and default base workspace seeded.")
            
# #     app.run(port=5000, debug=True)

# import os
# import traceback
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from models import db, Project, Interview, Insight
# from analyst import analyze_transcript, AnalysisError

# app = Flask(__name__)
# CORS(app)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///refract.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'

# db.init_app(app)


# @app.route('/api/analyze', methods=['POST', 'OPTIONS'])
# def analyze():
#     if request.method == 'OPTIONS':
#         return jsonify({"status": "preflight_ok"}), 200

#     try:
#         data = request.json or {}
#         transcript = data.get('transcript', '')
#         participant = data.get('participant_name', 'Anonymous')
#         project_id = data.get('project_id', 1)

#         if not transcript.strip():
#             return jsonify({"error": "Transcript cannot be empty"}), 400

#         project = db.session.get(Project, project_id)
#         if project is None:
#             return jsonify({"error": f"No project with id {project_id}"}), 404

#         print(f"\n[INFO] Starting analysis for participant: {participant}...")

#         parsed_result = analyze_transcript(transcript)

#         new_interview = Interview(
#             project_id=project_id,
#             participant_name=participant,
#             raw_transcript=transcript,
#             sentiment_score=parsed_result['sentiment'],
#         )
#         db.session.add(new_interview)
#         db.session.flush()

#         for item in parsed_result['insights']:
#             new_insight = Insight(
#                 interview_id=new_interview.id,
#                 category=item['category'],
#                 content=item['content'],
#                 quote=item['quote'],
#             )
#             db.session.add(new_insight)

#         db.session.commit()
#         print(f"[SUCCESS] Saved interview ID {new_interview.id} successfully.\n")

#         return jsonify({
#             "status": "success",
#             "interview_id": new_interview.id,
#             "sentiment": new_interview.sentiment_score,
#             "insights": parsed_result['insights'],
#         }), 200

#     except AnalysisError as ai_err:
#         print(f"[AI ERROR] {ai_err}")
#         return jsonify({
#             "error": "AI analysis failed",
#             "details": str(ai_err),
#         }), 502

#     except Exception as general_err:
#         db.session.rollback()
#         print(f"[CRITICAL FAILURE] Exception trace:")
#         traceback.print_exc()
#         return jsonify({"error": "Internal Server Exception", "details": str(general_err)}), 500


# @app.route('/api/interviews', methods=['GET'])
# def get_interviews():
#     try:
#         interviews = Interview.query.order_by(Interview.created_at.desc()).all()
#         return jsonify([_serialize_interview(i) for i in interviews]), 200
#     except Exception as e:
#         print(f"[ERROR] Failed fetching interviews: {e}")
#         return jsonify({"error": str(e)}), 500


# @app.route('/api/projects/<int:project_id>/interviews', methods=['GET'])
# def get_project_interviews(project_id):
#     try:
#         interviews = (
#             Interview.query.filter_by(project_id=project_id)
#             .order_by(Interview.created_at.desc())
#             .all()
#         )
#         return jsonify([_serialize_interview(i) for i in interviews]), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# def _serialize_interview(interview):
#     """Single source of truth for interview JSON shape across endpoints."""
#     return {
#         "id": interview.id,
#         "project_id": interview.project_id,
#         "participant_name": interview.participant_name,
#         "raw_transcript": interview.raw_transcript,
#         "sentiment_score": interview.sentiment_score,
#         "created_at": interview.created_at.isoformat() if interview.created_at else None,
#         "insights": [
#             {"id": i.id, "category": i.category, "content": i.content, "quote": i.quote}
#             for i in interview.insights
#         ],
#     }

# @app.route('/api/insights', methods=['GET'])
# def get_all_insights():
#     """
#     Cross-interview insight aggregation. Supports optional query params:
#       ?project_id=1        — restrict to one project
#       ?category=Pain Point — restrict to one category
#       ?search=export        — case-insensitive match on content or quote text
#     This is the endpoint that lets a PM ask "show me every Pain Point about
#     the export button across all interviews" instead of reading one at a time.
#     """
#     try:
#         project_id = request.args.get('project_id', type=int)
#         category = request.args.get('category')
#         search = request.args.get('search', '').strip().lower()

#         query = Insight.query.join(Interview)

#         if project_id:
#             query = query.filter(Interview.project_id == project_id)
#         if category:
#             query = query.filter(Insight.category == category)

#         insights = query.order_by(Interview.created_at.desc()).all()

#         result = []
#         for i in insights:
#             if search and search not in i.content.lower() and search not in (i.quote or "").lower():
#                 continue
#             result.append({
#                 "id": i.id,
#                 "category": i.category,
#                 "content": i.content,
#                 "quote": i.quote,
#                 "interview_id": i.interview_id,
#                 "participant_name": i.interview.participant_name,
#                 "created_at": i.interview.created_at.isoformat() if i.interview.created_at else None,
#                 "sentiment_score": i.interview.sentiment_score,
#             })

#         return jsonify(result), 200
#     except Exception as e:
#         print(f"[ERROR] Failed fetching insights: {e}")
#         return jsonify({"error": str(e)}), 500
    
# if __name__ == '__main__':
#     with app.app_context():
#         db.create_all()
#         if not db.session.get(Project, 1):
#             default_project = Project(id=1, name="Default Workspace Collection")
#             db.session.add(default_project)
#             db.session.commit()
#             print("[INIT] Database configured and default base workspace seeded.")

#     app.run(port=5000, debug=app.config['DEBUG'])



import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Project, Interview, Insight
from analyst import analyze_transcript, AnalysisError

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///refract.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'

db.init_app(app)


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
        return jsonify({
            "error": "AI analysis failed",
            "details": str(ai_err),
        }), 502

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
    """
    Cross-interview insight aggregation. Optional query params:
      ?project_id=1
      ?category=Pain Point
      ?search=export
    """
    try:
        project_id = request.args.get('project_id', type=int)
        category = request.args.get('category')
        search = request.args.get('search', '').strip().lower()

        query = Insight.query.join(Interview)

        if project_id:
            query = query.filter(Interview.project_id == project_id)
        if category:
            query = query.filter(Insight.category == category)

        insights = query.order_by(Interview.created_at.desc()).all()

        result = []
        for i in insights:
            if search and search not in i.content.lower() and search not in (i.quote or "").lower():
                continue
            result.append({
                "id": i.id,
                "category": i.category,
                "content": i.content,
                "quote": i.quote,
                "interview_id": i.interview_id,
                "participant_name": i.interview.participant_name,
                "created_at": i.interview.created_at.isoformat() if i.interview.created_at else None,
                "sentiment_score": i.interview.sentiment_score,
            })

        return jsonify(result), 200
    except Exception as e:
        print(f"[ERROR] Failed fetching insights: {e}")
        return jsonify({"error": str(e)}), 500


def _serialize_interview(interview):
    return {
        "id": interview.id,
        "project_id": interview.project_id,
        "participant_name": interview.participant_name,
        "raw_transcript": interview.raw_transcript,
        "sentiment_score": interview.sentiment_score,
        "created_at": interview.created_at.isoformat() if interview.created_at else None,
        "insights": [
            {"id": i.id, "category": i.category, "content": i.content, "quote": i.quote}
            for i in interview.insights
        ],
    }


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not db.session.get(Project, 1):
            default_project = Project(id=1, name="Default Workspace Collection")
            db.session.add(default_project)
            db.session.commit()
            print("[INIT] Database configured and default base workspace seeded.")

    app.run(port=5000, debug=app.config['DEBUG'])