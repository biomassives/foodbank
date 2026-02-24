from pathlib import Path

def update_quasar_config():
    db_index_path = Path("./src/dbManagement/index.ts")
    
    content = """
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
    """
    
    db_index_path.write_text(content)
    print(f"Updated {db_index_path}")

update_quasar_config()
