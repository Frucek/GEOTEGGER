from dotenv import load_dotenv
import os
# from supabase import create_client, Client
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase_clt: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
