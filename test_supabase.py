from supabase import create_client, Client
import json

# Supabase configuration - using the same credentials as in main.py
SUPABASE_URL = "https://gvvuhsiiwouxhfydansg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dnVoc2lpd291eGhmeWRhbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjU2MDAsImV4cCI6MjA1NzEwMTYwMH0.nDsRjKBel14QXaAOSsVcnnF1MWeN0PQqZmabAznLqvU"

def test_supabase_connection():
    """Test the connection to Supabase and check if the device_specs table exists and has data."""
    try:
        print(f"Connecting to Supabase at {SUPABASE_URL}...")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Check if we can query the database
        print("Testing database query...")
        response = supabase.table("device_specs").select("count").execute()
        print(f"Response: {response}")
        
        # Try to get data from device_specs
        print("\nTrying to fetch data from device_specs table...")
        data_response = supabase.table("device_specs").select("*").limit(1).execute()
        
        if data_response.data:
            print(f"Found {len(data_response.data)} records in device_specs table")
            print("Sample data:")
            print(json.dumps(data_response.data[0], indent=2))
        else:
            print("No data found in device_specs table")
            
            # Check if the table exists by trying to get its structure
            print("\nChecking if device_specs table exists...")
            try:
                # Try to get the table structure
                structure_response = supabase.rpc('get_table_structure', {'table_name': 'device_specs'}).execute()
                print("Table structure response:", structure_response)
            except Exception as e:
                print(f"Error getting table structure: {e}")
                print("The device_specs table might not exist. Please run the SQL setup script in Supabase.")
        
        return True
    except Exception as e:
        print(f"Error testing Supabase connection: {e}")
        return False

if __name__ == "__main__":
    print("=== Supabase Connection Test ===")
    success = test_supabase_connection()
    if success:
        print("\nSupabase connection test completed")
    else:
        print("\nSupabase connection test failed")
