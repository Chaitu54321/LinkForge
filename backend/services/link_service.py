import base62
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database.models import Link
from database.redis_client import redis_client

class LinkService:
    @staticmethod
    def generate_short_code(db: Session, original_url: str, custom_alias: str = None, user_id: int = None, expires_at: datetime = None, password: str = None) -> Link:
        if custom_alias:
            # Check if alias exists
            existing = db.query(Link).filter(Link.short_code == custom_alias).first()
            if existing:
                raise ValueError("Custom alias already in use")
            short_code = custom_alias
        else:
            # Generate ID-based base62 code
            # To do this safely, we insert a placeholder or we can use a sequence
            # we'll insert the link with a temp code, then update it
            temp_code = f"tmp_{datetime.now().timestamp()}"
            new_link = Link(
                short_code=temp_code,
                original_url=original_url,
                user_id=user_id,
                expires_at=expires_at,
                password=password
            )
            db.add(new_link)
            db.commit()
            db.refresh(new_link)
            
            # Now generate base62
            short_code = base62.encode(new_link.id)
            new_link.short_code = short_code
            db.commit()
            db.refresh(new_link)
            
            # Cache in Redis
            if redis_client:
                # Cache for 1 hour
                redis_client.setex(short_code, 3600, original_url)
                
            return new_link
        
        # If custom alias, just create
        new_link = Link(
            short_code=short_code,
            original_url=original_url,
            user_id=user_id,
            expires_at=expires_at,
            password=password
        )
        db.add(new_link)
        db.commit()
        db.refresh(new_link)
        
        # Cache in Redis
        if redis_client:
            redis_client.setex(short_code, 3600, original_url)
            
        return new_link

    @staticmethod
    def get_link_by_code(db: Session, short_code: str):
        # First check redis
        if redis_client:
            cached_url = redis_client.get(short_code)
            if cached_url:
                return {"original_url": cached_url, "cached": True}
                
        # Fallback to DB
        link = db.query(Link).filter(Link.short_code == short_code).first()
        if not link:
            return None
            
        # Re-cache
        if redis_client:
            redis_client.setex(short_code, 3600, link.original_url)
            
        return {"original_url": link.original_url, "cached": False, "db_link": link}
