import time
from fastapi import HTTPException, status
from database.redis_client import redis_client

class RateLimiter:
    def __init__(self, requests_per_minute: int = 100):
        self.requests_per_minute = requests_per_minute

    def check_rate_limit(self, identifier: str):
        if not redis_client:
            # If Redis is down, fail open (allow request) or strict (deny)?
            # Usually fail open is better for availability.
            return True

        current_minute = int(time.time() / 60)
        key = f"rate_limit:{identifier}:{current_minute}"
        
        try:
            # Increment the counter for this minute
            current_count = redis_client.incr(key)
            
            # If this is the first request in this minute, set an expiration
            if current_count == 1:
                redis_client.expire(key, 60)
                
            if current_count > self.requests_per_minute:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later."
                )
            return True
        except HTTPException:
            raise
        except Exception as e:
            # Fail open on Redis errors
            print(f"Rate limiting error: {e}")
            return True

def get_rate_limiter(requests_per_minute: int = 100):
    limiter = RateLimiter(requests_per_minute)
    return limiter.check_rate_limit
