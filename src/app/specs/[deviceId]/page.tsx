'use client';

import { useEffect, useState } from 'react';
import { getDeviceSpecById } from '@/utils/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import QRCodeGenerator from '@/components/QRCodeGenerator';

export default function DeviceSpecDetail() {
  const params = useParams();
  const deviceId = params.deviceId as string;
  
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    async function fetchSpecDetails() {
      try {
        const data = await getDeviceSpecById(deviceId);
        setSpec(data);
      } catch (err: any) {
        console.error('Error fetching spec details:', err);
        setError(err.message || 'Failed to load device specification details');
      } finally {
        setLoading(false);
      }
    }

    if (deviceId) {
      fetchSpecDetails();
    }
    
    // Set the current URL for QR code
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [deviceId]);

  // Function to format bytes to a human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !spec) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error || 'Device specification not found'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/specs"
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              &larr; Back to all specifications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/specs"
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            &larr; Back to all specifications
          </Link>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {spec.node_name} Specifications
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
            Detailed hardware and software information
          </p>
        </div>

        {/* QR Code Generator Component */}
        <QRCodeGenerator 
          url={currentUrl} 
          deviceName={spec.node_name} 
          osInfo={spec.system} 
        />

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              System Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Basic details about the operating system and hardware.
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Operating System</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{spec.system}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Computer Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{spec.node_name}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">OS Version</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{spec.version || 'N/A'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Machine Type</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{spec.machine || 'N/A'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Added</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{formatDate(spec.created_at)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              CPU Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Details about the processor.
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CPU Brand</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{spec.cpu_brand || 'N/A'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Processor</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{spec.processor || 'N/A'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Physical Cores</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{spec.cpu_cores_physical || 'N/A'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Logical Cores</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{spec.cpu_cores_logical || 'N/A'}</dd>
              </div>
              {spec.cpu_frequency && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CPU Frequency</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    Current: {spec.cpu_frequency.current} MHz<br />
                    Min: {spec.cpu_frequency.min} MHz<br />
                    Max: {spec.cpu_frequency.max} MHz
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Memory Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Details about RAM.
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Memory</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{formatBytes(spec.memory_total)}</dd>
              </div>
              {spec.memory_available && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Memory</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{formatBytes(spec.memory_available)}</dd>
                </div>
              )}
              {spec.memory_percent_used && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Memory Usage</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{spec.memory_percent_used.toFixed(2)}%</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {spec.gpu_info && spec.gpu_info.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                GPU Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Details about graphics processing units.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              {spec.gpu_info.map((gpu: any, index: number) => (
                <div key={index} className="px-4 py-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">GPU #{index + 1}</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{gpu.name || 'N/A'}</dd>
                    </div>
                    {gpu.memory_total && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Memory Total</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{gpu.memory_total} MB</dd>
                      </div>
                    )}
                    {gpu.memory_used && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Memory Used</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{gpu.memory_used} MB</dd>
                      </div>
                    )}
                    {gpu.memory_free && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Memory Free</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{gpu.memory_free} MB</dd>
                      </div>
                    )}
                    {gpu.load && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Load</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{(gpu.load * 100).toFixed(2)}%</dd>
                      </div>
                    )}
                    {gpu.temperature && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Temperature</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{gpu.temperature}°C</dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}

        {spec.disk_info && spec.disk_info.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Disk Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Details about storage devices.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              {spec.disk_info.map((disk: any, index: number) => (
                <div key={index} className="px-4 py-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    {disk.device || `Disk #${index + 1}`}
                  </h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {disk.mountpoint && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mount Point</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{disk.mountpoint}</dd>
                      </div>
                    )}
                    {disk.file_system_type && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">File System</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{disk.file_system_type}</dd>
                      </div>
                    )}
                    {disk.total_size && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Size</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatBytes(disk.total_size)}</dd>
                      </div>
                    )}
                    {disk.used && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Used Space</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatBytes(disk.used)}</dd>
                      </div>
                    )}
                    {disk.free && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Free Space</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatBytes(disk.free)}</dd>
                      </div>
                    )}
                    {disk.percent_used && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Usage</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{disk.percent_used.toFixed(2)}%</dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}

        {spec.network_info && spec.network_info.length > 0 && (
          <div className="mt-8 mb-10 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Network Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Details about network interfaces.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              {spec.network_info.map((network: any, index: number) => (
                <div key={index} className="px-4 py-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    {network.interface || `Interface #${index + 1}`}
                  </h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {network.ip && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{network.ip}</dd>
                      </div>
                    )}
                    {network.netmask && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Netmask</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{network.netmask}</dd>
                      </div>
                    )}
                    {network.broadcast && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Broadcast</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{network.broadcast}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
