export interface DeviceSpecs {
  id: number;
  device_id: string;
  system: string;
  node_name: string;
  release: string;
  version: string;
  machine: string;
  processor: string;
  cpu_brand: string;
  cpu_cores_physical: number;
  cpu_cores_logical: number;
  cpu_frequency: {
    current: number | string;
    min: number | string;
    max: number | string;
  };
  memory_total: number;
  memory_available: number;
  memory_percent_used: number;
  disk_info: DiskInfo[];
  gpu_info: GpuInfo[];
  network_info: NetworkInfo[];
  timestamp: number;
  created_at: string;
}

export interface DiskInfo {
  device: string;
  mountpoint: string;
  file_system_type: string;
  total_size: number;
  used: number;
  free: number;
  percent_used: number;
}

export interface GpuInfo {
  id: number;
  name: string;
  load: number;
  memory_total: number;
  memory_used: number;
  memory_free: number;
  temperature: number;
  error?: string;
}

export interface NetworkInfo {
  interface: string;
  ip: string;
  netmask: string;
  broadcast: string;
}
