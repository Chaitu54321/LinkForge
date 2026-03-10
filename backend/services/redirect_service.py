import json
from datetime import datetime, timezone
from fastapi import Request
from database.redis_client import redis_client

class RedirectService:
    @staticmethod
    def publish_analytics_event(short_code: str, request: Request, link_id: int = None):
        if not redis_client:
            return
            
        # Get basic info
        ip_address = request.client.host
        user_agent = request.headers.get('user-agent', 'Unknown')
        
        # Simple extraction
        browser = "Unknown"
        if "Chrome" in user_agent: browser = "Chrome"
        elif "Firefox" in user_agent: browser = "Firefox"
        elif "Safari" in user_agent: browser = "Safari"
        elif "Edge" in user_agent: browser = "Edge"
        
        device = "desktop"
        if "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent:
            device = "mobile"
        elif "Tablet" in user_agent or "iPad" in user_agent:
            device = "tablet"
            
        event_time = datetime.now(timezone.utc).isoformat()
        
        # In a real app we'd use IP geolocation here, we'll mock it for now
        country = "Unknown"
        
        event_data = {
            "short_code": short_code,
            "link_id": link_id if link_id else 0, # Worker can resolve if 0
            "timestamp": event_time,
            "ip_address": ip_address,
            "browser": browser,
            "device": device,
            "country": country
        }
        
        try:
            # Publish to redis stream
            redis_client.xadd("analytics_stream", {"data": json.dumps(event_data)})
        except Exception as e:
            print(f"Error publishing to Redis stream: {e}")
