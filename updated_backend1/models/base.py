from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class BaseModel(db.Model):
    """Base model class with common fields"""
    __abstract__ = True
    
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert model instance to dictionary"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def save(self):
        """Save the model instance to database"""
        db.session.add(self)
        db.session.commit()
        return self
    
    def delete(self):
        """Delete the model instance from database"""
        db.session.delete(self)
        db.session.commit()
        return True
    
    @classmethod
    def get_by_id(cls, id):
        """Get model instance by ID"""
        return cls.query.get(id)
    
    @classmethod
    def get_all(cls):
        """Get all model instances"""
        return cls.query.all()
    
    @classmethod
    def get_paginated(cls, page=1, per_page=20):
        """Get paginated model instances"""
        return cls.query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
