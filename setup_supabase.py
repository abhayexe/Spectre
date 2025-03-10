from supabase import create_client, Client
import json

# Supabase configuration
SUPABASE_URL = "https://gvvuhsiiwouxhfydansg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dnVoc2lpd291eGhmeWRhbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjU2MDAsImV4cCI6MjA1NzEwMTYwMH0.nDsRjKBel14QXaAOSsVcnnF1MWeN0PQqZmabAznLqvU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_device_specs_table():
    """Create the device_specs table in Supabase"""
    try:
        # This SQL will create the device_specs table
        sql = """
        CREATE TABLE IF NOT EXISTS device_specs (
          id BIGSERIAL PRIMARY KEY,
          device_id UUID NOT NULL,
          system TEXT,
          node_name TEXT,
          release TEXT,
          version TEXT,
          machine TEXT,
          processor TEXT,
          cpu_brand TEXT,
          cpu_cores_physical INTEGER,
          cpu_cores_logical INTEGER,
          cpu_frequency JSONB,
          memory_total BIGINT,
          memory_available BIGINT,
          memory_percent_used FLOAT,
          disk_info JSONB,
          gpu_info JSONB,
          network_info JSONB,
          timestamp BIGINT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
        
        # Execute the SQL to create the table
        response = supabase.rpc('exec_sql', {'query': sql}).execute()
        print("Table creation response:", response)
        
        # Create index and policies
        index_sql = """
        CREATE INDEX IF NOT EXISTS idx_device_specs_device_id ON device_specs(device_id);
        """
        supabase.rpc('exec_sql', {'query': index_sql}).execute()
        
        policy_sql = """
        BEGIN;
        -- Create a policy to allow anyone to select from the table
        DROP POLICY IF EXISTS "Allow public read access" ON device_specs;
        CREATE POLICY "Allow public read access" 
          ON device_specs FOR SELECT 
          USING (true);
        
        -- Create a policy to allow anonymous users to insert into the table
        DROP POLICY IF EXISTS "Allow anonymous insert access" ON device_specs;
        CREATE POLICY "Allow anonymous insert access" 
          ON device_specs FOR INSERT 
          TO anon 
          WITH CHECK (true);
        
        -- Enable RLS
        ALTER TABLE device_specs ENABLE ROW LEVEL SECURITY;
        COMMIT;
        """
        supabase.rpc('exec_sql', {'query': policy_sql}).execute()
        
        print("Successfully created device_specs table and policies")
        return True
    except Exception as e:
        print(f"Error creating device_specs table: {e}")
        return False

def test_table_exists():
    """Test if the device_specs table exists"""
    try:
        # Try to select from the table
        response = supabase.table("device_specs").select("count").execute()
        print("Table exists, response:", response)
        return True
    except Exception as e:
        print(f"Error testing if table exists: {e}")
        return False

def main():
    """Main function to set up Supabase"""
    print("=== Supabase Setup ===")
    
    # Test if table exists
    print("\nChecking if device_specs table exists...")
    table_exists = test_table_exists()
    
    if not table_exists:
        print("\nCreating device_specs table...")
        create_device_specs_table()
    else:
        print("\nTable already exists, no need to create it")
    
    # Test again after creation
    print("\nVerifying table exists...")
    test_table_exists()
    
    print("\nSetup complete!")

if __name__ == "__main__":
    main()
