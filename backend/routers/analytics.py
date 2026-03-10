from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from database.connection import get_db
from database.models import User, Link, Analytics
from routers.deps import get_current_user

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Total links created
    total_links = db.query(Link).filter(Link.user_id == current_user.id).count()
    
    # Total clicks
    total_clicks = db.query(func.sum(Link.click_count)).filter(Link.user_id == current_user.id).scalar() or 0
    
    # Links data
    recent_links = db.query(Link).filter(Link.user_id == current_user.id).order_by(Link.created_at.desc()).limit(5).all()
    
    return {
        "total_links": total_links,
        "total_clicks": total_clicks,
        "recent_links": recent_links
    }

@router.get("/{link_id}")
def get_link_analytics(link_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify ownership
    link = db.query(Link).filter(Link.id == link_id, Link.user_id == current_user.id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
        
    # Group by browser
    browsers = db.query(Analytics.browser, func.count(Analytics.id)).filter(Analytics.link_id == link_id).group_by(Analytics.browser).all()
    
    # Group by device
    devices = db.query(Analytics.device, func.count(Analytics.id)).filter(Analytics.link_id == link_id).group_by(Analytics.device).all()
    
    # Group by country
    countries = db.query(Analytics.country, func.count(Analytics.id)).filter(Analytics.link_id == link_id).group_by(Analytics.country).all()
    
    return {
        "overview": {
            "click_count": link.click_count,
            "created_at": link.created_at,
            "original_url": link.original_url
        },
        "browsers": dict(browsers),
        "devices": dict(devices),
        "countries": dict(countries)
    }
