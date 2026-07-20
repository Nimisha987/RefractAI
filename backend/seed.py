"""
Populates the database with realistic demo data so the dashboard isn't
empty on first run. Does NOT call the AI — inserts pre-written insights
directly, so it works even without an API key configured.

Usage:
    cd backend
    python seed.py
"""
from datetime import datetime, timedelta
from app import app
from models import db, Project, Interview, Insight

DEMO_INTERVIEWS = [
    {
        "participant_name": "Sarah Chen",
        "sentiment_score": "Neutral",
        "days_ago": 6,
        "raw_transcript": "Interviewer: Walk me through your last session...\nSarah: The dashboard takes forever to load, and the export button is buried in Settings...",
        "insights": [
            ("Pain Point", "Dashboard overview page takes ~10 seconds to load, used multiple times daily.", "It takes almost 10 seconds just to load the overview page"),
            ("Pain Point", "Export function is hard to discover, hidden under Settings submenu.", "The export button is really hard to find. It's buried in a submenu under Settings"),
            ("Feature Request", "Requesting a dark mode option to reduce eye strain during long sessions.", "I'd love a dark mode option. I'm on this dashboard for hours"),
            ("Feature Request", "Wants bulk task assignment instead of assigning tasks one at a time.", "It would be amazing if we could bulk-assign tasks to multiple people at once"),
        ],
    },
    {
        "participant_name": "Rahul Kumar",
        "sentiment_score": "Positive",
        "days_ago": 3,
        "raw_transcript": "Interviewer: How's the onboarding experience?\nRahul: Honestly really smooth, but notifications are a bit noisy...",
        "insights": [
            ("Pain Point", "Notification volume feels excessive, especially for minor comment updates.", "I get pinged for every tiny comment, even ones that don't need my attention"),
            ("Feature Request", "Wants the ability to customize which notification types are sent.", "It'd be great if I could choose which notifications I actually get"),
        ],
    },
    {
        "participant_name": "Maria Gonzalez",
        "sentiment_score": "Negative",
        "days_ago": 1,
        "raw_transcript": "Interviewer: Tell me about a recent frustration.\nMaria: The export button issue again, and also the app crashed twice this week...",
        "insights": [
            ("Pain Point", "Export button placement remains a recurring friction point across users.", "Same issue, I still can't find the export button quickly"),
            ("Pain Point", "App has crashed twice in one week during active editing sessions.", "The app crashed on me twice this week while I was mid-edit"),
        ],
    },
]

with app.app_context():
    db.create_all()

    project = db.session.get(Project, 1)
    if project is None:
        project = Project(id=1, name="Default Workspace Collection")
        db.session.add(project)
        db.session.flush()

    for demo in DEMO_INTERVIEWS:
        interview = Interview(
            project_id=project.id,
            participant_name=demo["participant_name"],
            raw_transcript=demo["raw_transcript"],
            sentiment_score=demo["sentiment_score"],
            created_at=datetime.utcnow() - timedelta(days=demo["days_ago"]),
        )
        db.session.add(interview)
        db.session.flush()

        for category, content, quote in demo["insights"]:
            db.session.add(Insight(
                interview_id=interview.id,
                category=category,
                content=content,
                quote=quote,
                status='pending',
            ))

    db.session.commit()
    print(f"[SEED] Added {len(DEMO_INTERVIEWS)} demo interviews with insights.")