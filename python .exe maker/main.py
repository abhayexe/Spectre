import platform
import psutil
import cpuinfo
import GPUtil
import uuid
import json
import os
import socket
import threading
import time
from supabase import create_client, Client
import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk, ImageDraw, ImageFilter
import win32event
import win32api
import winerror
import sys

# Supabase configuration
SUPABASE_URL = "https://gvvuhsiiwouxhfydansg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dnVoc2lpd291eGhmeWRhbnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MjU2MDAsImV4cCI6MjA1NzEwMTYwMH0.nDsRjKBel14QXaAOSsVcnnF1MWeN0PQqZmabAznLqvU"

# Global flag to prevent multiple instances
already_running = False

def generate_device_id():
    """Generate a unique device ID based on hardware information that remains consistent across runs"""
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
    system_info["timestamp"] = int(time.time())
    
    return system_info

def upload_to_supabase(system_info):
    """Upload system information to Supabase, updating existing record if it exists"""
    try:
        # Create Supabase client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        device_id = system_info["device_id"]
        
        # Check if a record with this device_id already exists
        response = supabase.table("device_specs").select("id").eq("device_id", device_id).execute()
        
        if response.data and len(response.data) > 0:
            # Record exists, update it
            existing_id = response.data[0]["id"]
            
            # Update the existing record
            update_response = supabase.table("device_specs").update(system_info).eq("id", existing_id).execute()
            return update_response
        else:
            # No existing record, insert a new one
            insert_response = supabase.table("device_specs").insert(system_info).execute()
            return insert_response
            
    except Exception as e:
        print(f"Error uploading data to Supabase: {e}")
        return None

class AppGUI:

    def __init__(self, root):
        self.root = root
        self.root.title("Device Specs Collector")
        
        # Set window size and position it in center of screen
        window_width = 500
        window_height = 350
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        center_x = int(screen_width/2 - window_width/2)
        center_y = int(screen_height/2 - window_height/2)
        self.root.geometry(f'{window_width}x{window_height}+{center_x}+{center_y}')
        
        # Prevent resizing
        self.root.resizable(False, False)
        
        # Configure window theme
        self.root.configure(bg="#f0f2f5")
        
        # Create a main frame
        self.main_frame = tk.Frame(self.root, bg="#f0f2f5")
        self.main_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Create header label
        self.header_label = tk.Label(
            self.main_frame, 
            text="Fetching Device Specs", 
            font=("Segoe UI", 24, "bold"),
            fg="#1a73e8",
            bg="#f0f2f5"
        )
        self.header_label.pack(pady=(20, 30))
        
        # Create status frame with rounded corners (visual effect)
        self.status_frame_outer = tk.Frame(self.main_frame, bg="#f0f2f5")
        self.status_frame_outer.pack(fill="x", padx=20, pady=20)
        
        # Status message
        self.status_message = tk.StringVar()
        self.status_message.set("Initializing...")
        self.status_label = tk.Label(
            self.status_frame_outer,
            textvariable=self.status_message,
            font=("Segoe UI", 14),
            fg="#202124",
            bg="#f0f2f5",
            justify="center"
        )
        self.status_label.pack(pady=10)
        
        # Progress bar
        self.progress = ttk.Progressbar(
            self.status_frame_outer, 
            orient="horizontal", 
            length=400, 
            mode="determinate"
        )
        self.progress.pack(pady=10)
        
        # Exit button (hidden initially)
        self.exit_button = tk.Button(
            self.main_frame,
            text="Exit",
            font=("Segoe UI", 12, "bold"),
            bg="#1a73e8",
            fg="white",
            relief="flat",
            command=self.exit_app,
            padx=20,
            pady=5
        )
        
        # Configure the button to have rounded corners using event binding
        self.exit_button.bind("<Enter>", lambda e: self.exit_button.config(bg="#1967d2"))
        self.exit_button.bind("<Leave>", lambda e: self.exit_button.config(bg="#1a73e8"))
        
        # Style for ttk widgets
        self.style = ttk.Style()
        self.style.configure("TProgressbar", thickness=10, background="#1a73e8")
        
        # Start the processing thread
        self.processing_thread = threading.Thread(target=self.process_and_upload)
        self.processing_thread.daemon = True
        self.processing_thread.start()
    
    def process_and_upload(self):
        # Update status
        self.update_status("Gathering system information...", 10)
        time.sleep(0.5)  # Small delay for UI update
        
        # Get system info
        try:
            system_info = get_system_info()
            self.update_status("System information collected", 40)
            time.sleep(0.5)  # Small delay for UI update
            
            # Save to file
            with open("system_info.json", "w") as f:
                json.dump(system_info, f, indent=4)
            self.update_status("Information saved locally", 60)
            time.sleep(0.5)  # Small delay for UI update
            
            # Upload to Supabase
            self.update_status("Uploading to database...", 80)
            time.sleep(0.5)  # Small delay for UI update
            
            upload_result = upload_to_supabase(system_info)
            
            # Check upload result
            if upload_result:
                self.update_status("All Done", 100)
                # Show exit button
                self.root.after(0, lambda: self.exit_button.pack(pady=20))
                # Start countdown
                self.start_exit_countdown()
            else:
                self.update_status("Error uploading data", 100)
                self.root.after(0, lambda: self.exit_button.pack(pady=20))
                
        except Exception as e:
            self.update_status(f"Error: {str(e)[:50]}...", 100)
            self.root.after(0, lambda: self.exit_button.pack(pady=20))
    
    def update_status(self, message, progress_value):
        # This method safely updates the UI from a non-main thread
        self.root.after(0, lambda: self.status_message.set(message))
        self.root.after(0, lambda: self.progress.config(value=progress_value))
    
    def start_exit_countdown(self):
        # Start a countdown before exit
        self.countdown_value = 3
        self.countdown()
    
    def countdown(self):
        if self.countdown_value > 0:
            self.exit_button.config(text=f"Exiting in {self.countdown_value}...")
            self.countdown_value -= 1
            self.root.after(1000, self.countdown)
        else:
            self.exit_app()
    
    def exit_app(self):
        self.root.destroy()

def main():
    global already_running
    
    # Prevent multiple instances
    if already_running:
        return
    
    already_running = True
    
    # Create and run the application
    mutex = win32event.CreateMutex(None, 1, 'DeviceSpecsCollector')
    if win32api.GetLastError() == winerror.ERROR_ALREADY_EXISTS:
        print("Application already running")
        sys.exit(0)
    root = tk.Tk()
    app = AppGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()