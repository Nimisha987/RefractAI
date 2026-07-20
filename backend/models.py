# # # from flask_sqlalchemy import SQLAlchemy
# # # from datetime import datetime

# # # db=SQLAlchemy()

# # # class Project(db.Model):
# # #     __tablename__="projects"

# # #     id- db.Column(db.Integer, primary_key=True)
# # #     name= db.Column(db.String(100),nullable=False)
# # #     description= db.Column(db.String(255))
# # #     created_at = db.Column(db.DateTime, default = datetime.utcnow)

# # #     #Relationship: A project can have many interviews
# # #     interviews = db.relationship('Interview',backref='project',lazy=True,cascade = 'all, delete-orphan')

# # # class Interview(db.Model):
# # #     __tablename__ ='interviews'

# # #     id=db.Column(db.Integer, primary_key=True)
# # #     project_id = db.Column(db.Integer, db.ForeignKey('projects.id'),nullable=False)
# # #     raw_transcript = db.Column(db.Text, nullable=False)
# # #     sentiment_score = db.Column(db.String(20)) #e.g., Positive, Neutral, Negative
# # #     created_at = db.Column(db.DateTime, default=datetime.utcnow)

# # #     insights = db.relationship('Insight',backref='interview',lazy=True,cascade = 'all, delete-orphan')

# # # class Insight(db.Model):
# # #     __tablename__='insights'

# # #     id=db.Column(db.Integer,primary_key=True)
# # #     interview_id= db.Column(db.Integer,db.ForeignKey('interviews.id'),nullable=False)
# # #     category = db.Column(db.String(50))   #e.g. 'Pain Point','Feature Request'
# # #     content=db.Column(db.Text, nullable=False)  #The AI's summarized transcript
# # #     quote=db.Column(db.Text)  #The verbatim proof from the transcript
# # from flask_sqlalchemy import SQLAlchemy
# # from sqlalchemy import Integer, String, Text, DateTime
# # from datetime import datetime

# # db = SQLAlchemy()

# # class Project(db.Model):
# #     __tablename__ = 'projects'
# #     id = db.Column(Integer, primary_key=True)
# #     name = db.Column(String(100), nullable=False)
# #     created_at = db.Column(DateTime, default=datetime.utcnow)
    
# #     interviews = db.relationship('Interview', backref='project', lazy=True, cascade="all, delete-orphan")

# # class Interview(db.Model):
# #     __tablename__ = 'interviews'
# #     id = db.Column(Integer, primary_key=True)
# #     project_id = db.Column(Integer, db.ForeignKey('projects.id'), nullable=False)
# #     participant_name = db.Column(String(100))
# #     raw_transcript = db.Column(Text, nullable=False)
# #     sentiment_score = db.Column(String(20))
# #     created_at = db.Column(DateTime, default=datetime.utcnow)
    
# #     insights = db.relationship('Insight', backref='interview', lazy=True, cascade="all, delete-orphan")

# # class Insight(db.Model):
# #     __tablename__ = 'insights'
# #     id = db.Column(Integer, primary_key=True)
# #     interview_id = db.Column(Integer, db.ForeignKey('interviews.id'), nullable=False)
# #     category = db.Column(String(50))
# #     content = db.Column(Text, nullable=False)
# #     quote = db.Column(Text)


# from flask_sqlalchemy import SQLAlchemy
# from sqlalchemy import Integer, String, Text, DateTime
# from datetime import datetime

# db = SQLAlchemy()

# class Project(db.Model):
#     __tablename__ = 'projects'
#     id = db.Column(Integer, primary_key=True)
#     name = db.Column(String(100), nullable=False)
#     created_at = db.Column(DateTime, default=datetime.utcnow)

#     interviews = db.relationship('Interview', backref='project', lazy=True, cascade="all, delete-orphan")

# class Interview(db.Model):
#     __tablename__ = 'interviews'
#     id = db.Column(Integer, primary_key=True)
#     project_id = db.Column(Integer, db.ForeignKey('projects.id'), nullable=False)
#     participant_name = db.Column(String(100))
#     raw_transcript = db.Column(Text, nullable=False)
#     sentiment_score = db.Column(String(20))
#     created_at = db.Column(DateTime, default=datetime.utcnow)

#     insights = db.relationship('Insight', backref='interview', lazy=True, cascade="all, delete-orphan")

# class Insight(db.Model):
#     __tablename__ = 'insights'
#     id = db.Column(Integer, primary_key=True)
#     interview_id = db.Column(Integer, db.ForeignKey('interviews.id'), nullable=False)
#     category = db.Column(String(50))
#     content = db.Column(Text, nullable=False)
#     quote = db.Column(Text)



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
    # Verification workflow: a PM reviews each AI-extracted insight and marks
    # it confirmed or rejected, closing the loop on Refract's traceability promise.
    status = db.Column(String(20), default='pending', nullable=False)  # 'pending' | 'confirmed' | 'rejected'