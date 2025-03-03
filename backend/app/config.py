import os
from dotenv import load_dotenv

# loading the environment variables from .env file
load_dotenv()

# FRED API configuration
FRED_API_KEY = os.getenv("FRED_API_KEY", "")
if not FRED_API_KEY:
    print("Warning: FRED_API_KEY not set in environment variables")
    
API_PREFIX = "/api"

# app settings
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")