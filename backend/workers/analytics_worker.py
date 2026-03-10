import sys
import os
import time
import json
import threading
from datetime import datetime

# Add the backend directory to python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal
from database.redis_client import redis_client
from database.models import Analytics, Link

STREAM_NAME = "analytics_stream"
GROUP_NAME = "analytics_group"
CONSUMER_NAME = "worker_1"

def setup_stream():
    if not redis_client:
        print("Redis not available, worker exiting.")
        sys.exit(1)
    try:
        redis_client.xgroup_create(STREAM_NAME, GROUP_NAME, id="0", mkstream=True)
    except Exception as e:
        if "BUSYGROUP" not in str(e):
            print(f"Error creating group: {e}")

def process_events(stop_event: threading.Event = None):
    print("Analytics worker started gracefully in background thread, waiting for events...")
    setup_stream()
    
    while True:
        if stop_event and stop_event.is_set():
            print("Analytics worker shutting down...")
            break
            
        try:
            # Read from stream, wait up to 5 seconds
            events = redis_client.xreadgroup(
                GROUP_NAME, CONSUMER_NAME, {STREAM_NAME: ">"}, count=10, block=5000
            )
            
            if not events:
                continue
                
            db = SessionLocal()
            try:
                for stream, messages in events:
                    for message_id, message_data in messages:
                        data = json.loads(message_data["data"])
                        
                        # Process link ID if it was sent as 0
                        link_id = data.get("link_id", 0)
                        short_code = data.get("short_code")
                        
                        if link_id == 0 and short_code:
                            link = db.query(Link).filter(Link.short_code == short_code).first()
                            if link:
                                link_id = link.id
                        
                        if link_id > 0:
                            # 1. Insert Analytics record
                            new_analytics = Analytics(
                                link_id=link_id,
                                country=data.get("country"),
                                browser=data.get("browser"),
                                device=data.get("device"),
                                ip_address=data.get("ip_address"),
                                # Using standard datetimes here since psycopg handles parsing typically, 
                                # but using server_default in models.py handles datetime directly
                            )
                            db.add(new_analytics)
                            
                            # 2. Update Link click count
                            link = db.query(Link).filter(Link.id == link_id).first()
                            if link:
                                link.click_count += 1
                                
                            # Acknowledge the message
                            redis_client.xack(STREAM_NAME, GROUP_NAME, message_id)
                db.commit()
            except Exception as inner_e:
                print(f"Database/Processing error: {inner_e}")
                db.rollback()
            finally:
                db.close()
                
        except Exception as e:
            print(f"Worker loop error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    process_events()
