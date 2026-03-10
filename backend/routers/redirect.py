from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database.connection import get_db
from database.models import Link
from services.link_service import LinkService
from services.redirect_service import RedirectService

router = APIRouter()

@router.get("/{short_code}")
def redirect_to_original(short_code: str, request: Request, db: Session = Depends(get_db)):
    # 1. Look up link
    link_data = LinkService.get_link_by_code(db, short_code)
    
    if not link_data:
        raise HTTPException(status_code=404, detail="Link not found")
        
    original_url = link_data["original_url"]
    
    # 2. Check Expiration if cached object or db object
    # For performance, if it's purely from cache we might skip expiration check 
    # but ideally we cache expiration time too. Let's hit DB async or just rely on worker
    # to clean up expired cache.
    db_link = link_data.get("db_link")
    if db_link:
        if db_link.expires_at and db_link.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=410, detail="Link has expired")
            
        # Increment clicks fast or let worker do it?
        # User requested highly optimized: let worker handle click count increment
    
    # Get ID for event purely from db_link if available, else 0 (worker resolves)
    link_id = db_link.id if db_link else 0
    
    # 3. Queue Analytics Event asynchronously
    RedirectService.publish_analytics_event(
        short_code=short_code,
        request=request,
        link_id=link_id
    )
    
    # 4. Redirect
    return RedirectResponse(url=original_url, status_code=status.HTTP_302_FOUND)
