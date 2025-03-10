'use client';

import { useState, useEffect } from 'react';
import { DeviceSpecs } from '@/types/deviceSpecs';
import { formatBytes } from '@/utils/formatBytes';

export default function DeviceSpecsComponent() {
  const [specs, setSpecs] = useState<DeviceSpecs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpecs() {
      try {
        const response = await fetch('/api/specs');
        const result = await response.json();
        
        console.log('API response:', result); // Add logging to debug
        
        if (result.error) {
          setError(result.error);
        } else if (result.data && result.data.length > 0) {
          setSpecs(result.data[0]); // Get the most recent specs
        } else {
          setError('No device specifications found');
        }
      } catch (err) {
        console.error('Error fetching specs:', err);
        setError('Failed to fetch device specifications');
      } finally {
        setLoading(false);
      }
    }

    fetchSpecs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!specs) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Notice:</strong>
        <span className="block sm:inline"> No device specifications available. Please run the Python script to collect and upload device data.</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Device Specifications</h2>
        
        {/* System Information */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Operating System</p>
              <p className="font-medium">{specs.system} {specs.release}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
              <p className="font-medium">{specs.version}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Machine</p>
              <p className="font-medium">{specs.machine}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Node Name</p>
              <p className="font-medium">{specs.node_name}</p>
            </div>
          </div>
        </div>
        
        {/* CPU Information */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2">CPU Information</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">CPU Model</p>
            <p className="font-medium">{specs.cpu_brand}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Physical Cores</p>
              <p className="font-medium">{specs.cpu_cores_physical}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Logical Cores</p>
              <p className="font-medium">{specs.cpu_cores_logical}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Frequency</p>
              <p className="font-medium">
                {typeof specs.cpu_frequency.current === 'number' 
                  ? `${specs.cpu_frequency.current.toFixed(2)} MHz` 
                  : specs.cpu_frequency.current}
              </p>
            </div>
          </div>
        </div>
        
        {/* Memory Information */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2">Memory Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Memory</p>
              <p className="font-medium">{formatBytes(specs.memory_total)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Available Memory</p>
              <p className="font-medium">{formatBytes(specs.memory_available)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${specs.memory_percent_used}%` }}
                ></div>
              </div>
              <p className="text-right text-xs mt-1">{specs.memory_percent_used.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        {/* GPU Information */}
        {specs.gpu_info && specs.gpu_info.length > 0 && !specs.gpu_info[0].error && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2">GPU Information</h3>
            {specs.gpu_info.map((gpu, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-lg mb-2">{gpu.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">GPU Memory</p>
                    <p className="font-medium">{formatBytes(gpu.memory_total * 1024 * 1024)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600 mt-2">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${(gpu.memory_used / gpu.memory_total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs mt-1">
                      {((gpu.memory_used / gpu.memory_total) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Temperature</p>
                    <p className="font-medium">{gpu.temperature}°C</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Disk Information */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2">Disk Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {specs.disk_info.map((disk, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{disk.device} ({disk.mountpoint})</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {disk.file_system_type} - {formatBytes(disk.total_size)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600 mt-2">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${disk.percent_used}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Used: {formatBytes(disk.used)}</span>
                  <span>Free: {formatBytes(disk.free)}</span>
                  <span>{disk.percent_used.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Network Information */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2">Network Information</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {specs.network_info.map((network, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{network.interface}</h4>
                <p className="text-sm"><span className="text-gray-500 dark:text-gray-400">IP: </span>{network.ip}</p>
                <p className="text-sm"><span className="text-gray-500 dark:text-gray-400">Netmask: </span>{network.netmask}</p>
                {network.broadcast && (
                  <p className="text-sm"><span className="text-gray-500 dark:text-gray-400">Broadcast: </span>{network.broadcast}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-right text-xs text-gray-500 dark:text-gray-400">
          Last updated: {new Date(specs.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
