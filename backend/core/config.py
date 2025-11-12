from dotenv import load_dotenv
import os
# from supabase import create_client, Client
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Validate that required environment variables are set
if not SUPABASE_URL:
    raise ValueError(
        "SUPABASE_URL environment variable is required. "
        "Please create a .env file in the backend directory with SUPABASE_URL set."
    )
if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError(
        "SUPABASE_SERVICE_ROLE_KEY environment variable is required. "
        "Please create a .env file in the backend directory with SUPABASE_SERVICE_ROLE_KEY set."
    )

supabase_clt: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
