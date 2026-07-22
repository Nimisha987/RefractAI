
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, Text, DateTime
from datetime import datetime

db = SQLAlchemy()

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(100), nullable=False)
    created_at = db.Column(DateTime, default=datetime.utcnow)

    interviews = db.relationship('Interview', backref='project', lazy=True, cascade="all, delete-orphan")

class Interview(db.Model):
    __tablename__ = 'interviews'
    id = db.Column(Integer, primary_key=True)
    project_id = db.Column(Integer, db.ForeignKey('projects.id'), nullable=False)
    participant_name = db.Column(String(100))
    raw_transcript = db.Column(Text, nullable=False)
    sentiment_score = db.Column(String(20))
    created_at = db.Column(DateTime, default=datetime.utcnow)

    insights = db.relationship('Insight', backref='interview', lazy=True, cascade="all, delete-orphan")

class Insight(db.Model):
    __tablename__ = 'insights'
    id = db.Column(Integer, primary_key=True)
    interview_id = db.Column(Integer, db.ForeignKey('interviews.id'), nullable=False)
    category = db.Column(String(50))
    content = db.Column(Text, nullable=False)
    quote = db.Column(Text)
    status = db.Column(String(20), default='pending', nullable=False)  # 'pending' | 'confirmed' | 'rejected'