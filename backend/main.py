from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import engine, Base
from database import models
import routers.auth as auth
import routers.links as links
import routers.analytics as analytics
import routers.redirect as redirect

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Scalable Smart Link Platform")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test route
@app.get("/")
def read_root():
    return {"message": "Welcome to Smart Link Platform API"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(links.router, prefix="/api/link", tags=["links"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(redirect.router, tags=["redirect"])
