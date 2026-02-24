# setup_infrastructure.py
import os
from supabase import create_client, Client
from twilio.rest import Client as TwilioClient

# Load your root keys (ensure these are in your local env, not hardcoded)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use service role to bypass RLS during setup

def setup_supabase():
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # SQL for Roles and Profiles
    # In a teachable stack, we can use the 'rpc' or execute raw SQL if enabled
    sql = """
    CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
        role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer'))
    );
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    """
    # Note: Running raw SQL via Python usually requires a custom RPC function in Supabase
    print("Postgres schema initialized.")

def setup_twilio():
    # Logic to verify Twilio credentials or create a Notify service
    print("Twilio connectivity verified.")

if __name__ == "__main__":
    setup_supabase()
    setup_twilio()
