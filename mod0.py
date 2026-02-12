# python_patcher.py
from pathlib import Path

def patch_db_management():
    path = Path("./src/dbManagement/index.ts")
    original_content = path.read_text()
    
    # Check if we already patched it to avoid double-imports
    if "from '@supabase/supabase-js'" in original_content:
        print("File already patched.")
        return

    supabase_init = """import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

"""
    # Combine the init, the original IndexedDB logic, and new sync helpers
    new_content = supabase_init + original_content
    path.write_text(new_content)
    print("Successfully augmented dbManagement/index.ts")

if __name__ == "__main__":
    patch_db_management()
