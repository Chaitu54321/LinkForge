from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db
from database.models import User, Link
from schemas import LinkCreate, LinkResponse
from routers.deps import get_current_user
from services.link_service import LinkService
from services.rate_limiter import get_rate_limiter

router = APIRouter()

# 100 requests per minute
rate_limit = get_rate_limiter(10)

@router.post("/create", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
def create_link(link_data: LinkCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Check rate limit using user ID
        rate_limit(f"user_{current_user.id}")
        
        new_link = LinkService.generate_short_code(
            db=db,
            original_url=link_data.original_url,
            custom_alias=link_data.custom_alias,
            user_id=current_user.id,
            expires_at=link_data.expires_at,
            password=link_data.password
        )
        return new_link
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-links", response_model=List[LinkResponse])
def get_user_links(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    links = db.query(Link).filter(Link.user_id == current_user.id).order_by(Link.created_at.desc()).all()
    return links

@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_link(link_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    link = db.query(Link).filter(Link.id == link_id, Link.user_id == current_user.id).first()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
        
    # delete from redis
    from database.redis_client import redis_client
    if redis_client:
        redis_client.delete(link.short_code)
        
    db.delete(link)
    db.commit()
    return
