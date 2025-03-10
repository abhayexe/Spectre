import platform
import psutil
import cpuinfo
import GPUtil
import uuid
import json
import os
import socket
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://gvvuhsiiwouxhfydansg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dnVoc2lpd291eGhmeWRhbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjU2MDAsImV4cCI6MjA1NzEwMTYwMH0.nDsRjKBel14QXaAOSsVcnnF1MWeN0PQqZmabAznLqvU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_device_id():
    """Generate a unique device ID based on hardware information that remains consistent across runs"""
    # Get hardware-specific information that doesn't change
    try:
        # Get MAC address of the first network interface
        mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) 
                        for elements in range(0, 48, 8)][::-1])
        
        # Get CPU serial or ID
        cpu_info = cpuinfo.get_cpu_info()
        cpu_brand = cpu_info.get('brand_raw', '')
        
        # Get hostname
        hostname = socket.gethostname()
        
        # Combine these values to create a consistent device ID
        device_info = f"{mac}:{cpu_brand}:{hostname}"
        
        # Create a UUID based on this information (UUID5 with namespace)
        namespace = uuid.UUID('00000000-0000-0000-0000-000000000000')
        device_uuid = str(uuid.uuid5(namespace, device_info))
        
        return device_uuid
    except Exception as e:
        print(f"Error generating consistent device ID: {e}")
        # Fallback to a random UUID if we can't generate a consistent one
        return str(uuid.uuid4())

def get_system_info():
    """Collect system specifications and return as a dictionary"""
    system_info = {}
    
    # Generate a unique but consistent device ID
    system_info["device_id"] = generate_device_id()
    
    # Basic system information
    system_info["system"] = platform.system()
    system_info["node_name"] = platform.node()
    system_info["release"] = platform.release()
    system_info["version"] = platform.version()
    system_info["machine"] = platform.machine()
    system_info["processor"] = platform.processor()
    
    # CPU information
    cpu_info = cpuinfo.get_cpu_info()
    system_info["cpu_brand"] = cpu_info.get('brand_raw', 'Unknown')
    system_info["cpu_cores_physical"] = psutil.cpu_count(logical=False)
    system_info["cpu_cores_logical"] = psutil.cpu_count(logical=True)
    system_info["cpu_frequency"] = {
        "current": psutil.cpu_freq().current if psutil.cpu_freq() else "Unknown",
        "min": psutil.cpu_freq().min if psutil.cpu_freq() and psutil.cpu_freq().min else "Unknown",
        "max": psutil.cpu_freq().max if psutil.cpu_freq() and psutil.cpu_freq().max else "Unknown"
    }
    
    # Memory information
    memory = psutil.virtual_memory()
    system_info["memory_total"] = memory.total
    system_info["memory_available"] = memory.available
    system_info["memory_percent_used"] = memory.percent
    
    # Disk information
    disk_info = []
    for partition in psutil.disk_partitions():
        try:
            partition_usage = psutil.disk_usage(partition.mountpoint)
            disk_info.append({
                "device": partition.device,
                "mountpoint": partition.mountpoint,
                "file_system_type": partition.fstype,
                "total_size": partition_usage.total,
                "used": partition_usage.used,
                "free": partition_usage.free,
                "percent_used": partition_usage.percent
            })
        except Exception:
            # Some disk partitions aren't accessible
            pass
    
    system_info["disk_info"] = disk_info
    
    # GPU information
    try:
        gpus = GPUtil.getGPUs()
        gpu_info = []
        for gpu in gpus:
            gpu_info.append({
                "id": gpu.id,
                "name": gpu.name,
                "load": gpu.load,
                "memory_total": gpu.memoryTotal,
                "memory_used": gpu.memoryUsed,
                "memory_free": gpu.memoryFree,
                "temperature": gpu.temperature
            })
        system_info["gpu_info"] = gpu_info
    except Exception as e:
        system_info["gpu_info"] = [{"error": str(e)}]
    
    # Network information
    network_info = []
    for interface_name, interface_addresses in psutil.net_if_addrs().items():
        for address in interface_addresses:
            if str(address.family) == 'AddressFamily.AF_INET':
                network_info.append({
                    "interface": interface_name,
                    "ip": address.address,
                    "netmask": address.netmask,
                    "broadcast": address.broadcast
                })
    
    system_info["network_info"] = network_info
    
    # Timestamp
    system_info["timestamp"] = int(psutil.time.time())
    
    return system_info

def upload_to_supabase(system_info):
    """Upload system information to Supabase, updating existing record if it exists"""
    try:
        device_id = system_info["device_id"]
        
        # First, check if a record with this device_id already exists
        print(f"Checking if device with ID {device_id} already exists...")
        
        # Get existing record with this device_id
        response = supabase.table("device_specs").select("id").eq("device_id", device_id).execute()
        
        if response.data and len(response.data) > 0:
            # Record exists, update it
            existing_id = response.data[0]["id"]
            print(f"Existing record found with ID {existing_id}, updating...")
            
            # Option 1: Update the existing record
            update_response = supabase.table("device_specs").update(system_info).eq("id", existing_id).execute()
            print("Record updated successfully!")
            return update_response
            
            # Option 2: If you prefer to delete and insert instead, uncomment these lines
            # delete_response = supabase.table("device_specs").delete().eq("id", existing_id).execute()
            # print(f"Deleted existing record with ID {existing_id}")
            # insert_response = supabase.table("device_specs").insert(system_info).execute()
            # print("New record inserted successfully!")
            # return insert_response
        else:
            # No existing record, insert a new one
            print("No existing record found, inserting new record...")
            insert_response = supabase.table("device_specs").insert(system_info).execute()
            print("Data uploaded successfully!")
            return insert_response
            
    except Exception as e:
        print(f"Error uploading data to Supabase: {e}")
        return None

def main():
    """Main function to collect and upload system information"""
    print("Collecting system information...")
    system_info = get_system_info()
    
    # Save to local file for debugging
    with open("system_info.json", "w") as f:
        json.dump(system_info, f, indent=4)
    print("System information saved to system_info.json")
    
    # Upload to Supabase
    print("Uploading to Supabase...")
    upload_to_supabase(system_info)

if __name__ == "__main__":
    main()
