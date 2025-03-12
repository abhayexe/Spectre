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

  // Section Card Component
  const SectionCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
      <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 border-b border-gray-100 dark:border-gray-600">
        <h3 className="text-lg leading-6 font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );

  // Info Item Component for consistent styling
  const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="mb-4">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{value}</dd>
    </div>
  );
  
  // Progress Bar Component
  const ProgressBar = ({ percentage, label }: { percentage: number; label?: string }) => (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">{label || `${percentage.toFixed(1)}%`}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading device specifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !spec) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-6 border border-red-200 dark:border-red-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error || 'Device specification not found'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link
              href="/specs"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              &larr; Back to all specifications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/specs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-150 ease-in-out"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all specifications
          </Link>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
            {spec.node_name} Specifications
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Detailed hardware and software information for your device
          </p>
        </div>

        {/* QR Code Generator Component */}
        <div className="mb-12 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 flex flex-col items-center sm:flex-row sm:items-start sm:justify-center gap-8">
          <QRCodeGenerator 
            url={currentUrl} 
            deviceName={spec.node_name} 
            osInfo={spec.system} 
          />
          <div className="sm:mt-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Share Device Details</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              Scan this QR code to quickly access this device specification on another device or share with your team.
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              URL: {currentUrl}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SectionCard 
            title="System Information" 
            subtitle="Basic details about the operating system and hardware"
          >
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <InfoItem label="Operating System" value={spec.system} />
              <InfoItem label="Computer Name" value={spec.node_name} />
              <InfoItem label="OS Version" value={spec.version || 'N/A'} />
              <InfoItem label="Machine Type" value={spec.machine || 'N/A'} />
              <InfoItem label="Date Added" value={formatDate(spec.created_at)} />
            </dl>
          </SectionCard>

          <SectionCard 
            title="CPU Information" 
            subtitle="Details about the processor"
          >
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <InfoItem label="CPU Brand" value={spec.cpu_brand || 'N/A'} />
              <InfoItem label="Processor" value={spec.processor || 'N/A'} />
              <InfoItem label="Physical Cores" value={spec.cpu_cores_physical || 'N/A'} />
              <InfoItem label="Logical Cores" value={spec.cpu_cores_logical || 'N/A'} />
              
              {spec.cpu_frequency && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">CPU Frequency</dt>
                  <dd className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-indigo-700 dark:text-indigo-300 mb-1">Current</div>
                      <div className="text-lg font-semibold text-indigo-900 dark:text-white">{spec.cpu_frequency.current} MHz</div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-indigo-700 dark:text-indigo-300 mb-1">Min</div>
                      <div className="text-lg font-semibold text-indigo-900 dark:text-white">{spec.cpu_frequency.min} MHz</div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-indigo-700 dark:text-indigo-300 mb-1">Max</div>
                      <div className="text-lg font-semibold text-indigo-900 dark:text-white">{spec.cpu_frequency.max} MHz</div>
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </SectionCard>
        </div>

        <div className="mt-8">
          <SectionCard 
            title="Memory Information" 
            subtitle="Details about RAM and usage"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <dl className="grid grid-cols-1 gap-y-4">
                  <InfoItem 
                    label="Total Memory" 
                    value={
                      <span className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                        {formatBytes(spec.memory_total)}
                      </span>
                    } 
                  />
                  
                  {spec.memory_available && (
                    <InfoItem 
                      label="Available Memory" 
                      value={formatBytes(spec.memory_available)} 
                    />
                  )}
                </dl>
              </div>
              
              {spec.memory_percent_used && (
                <div className="flex flex-col justify-center">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Memory Usage</dt>
                  <dd className="mt-1">
                    <ProgressBar 
                      percentage={spec.memory_percent_used} 
                      label={`${spec.memory_percent_used.toFixed(1)}% Used`} 
                    />
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Used: {formatBytes(spec.memory_total - (spec.memory_available || 0))} of {formatBytes(spec.memory_total)}
                    </div>
                  </dd>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {spec.gpu_info && spec.gpu_info.length > 0 && (
          <div className="mt-8">
            <SectionCard 
              title="GPU Information" 
              subtitle="Details about graphics processing units"
            >
              <div className="space-y-8">
                {spec.gpu_info.map((gpu: any, index: number) => (
                  <div key={index} className={index > 0 ? "pt-6 border-t border-gray-200 dark:border-gray-700" : ""}>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs mr-2">
                        {index + 1}
                      </span>
                      {gpu.name || `GPU #${index + 1}`}
                    </h4>
                    
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                      {gpu.memory_total && (
                        <InfoItem label="Memory Total" value={`${gpu.memory_total} MB`} />
                      )}
                      {gpu.memory_used && (
                        <InfoItem label="Memory Used" value={`${gpu.memory_used} MB`} />
                      )}
                      {gpu.memory_free && (
                        <InfoItem label="Memory Free" value={`${gpu.memory_free} MB`} />
                      )}
                      
                      {gpu.memory_total && gpu.memory_used && (
                        <div className="sm:col-span-2 md:col-span-3 mt-2">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Memory Usage</dt>
                          <dd>
                            <ProgressBar 
                              percentage={(gpu.memory_used / gpu.memory_total) * 100} 
                              label={`${((gpu.memory_used / gpu.memory_total) * 100).toFixed(1)}% Used`} 
                            />
                          </dd>
                        </div>
                      )}
                      
                      {gpu.load && (
                        <div className="sm:col-span-2 md:col-span-3 mt-2">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">GPU Load</dt>
                          <dd>
                            <ProgressBar 
                              percentage={gpu.load * 100} 
                              label={`${(gpu.load * 100).toFixed(1)}% Load`} 
                            />
                          </dd>
                        </div>
                      )}
                      
                      {gpu.temperature && (
                        <InfoItem 
                          label="Temperature" 
                          value={
                            <div className="flex items-center">
                              <span className={`text-lg font-semibold ${
                                gpu.temperature > 80 ? 'text-red-600 dark:text-red-400' : 
                                gpu.temperature > 70 ? 'text-orange-600 dark:text-orange-400' : 
                                'text-green-600 dark:text-green-400'
                              }`}>
                                {gpu.temperature}°C
                              </span>
                              <svg 
                                className={`ml-2 h-5 w-5 ${
                                  gpu.temperature > 80 ? 'text-red-500 dark:text-red-400' : 
                                  gpu.temperature > 70 ? 'text-orange-500 dark:text-orange-400' : 
                                  'text-green-500 dark:text-green-400'
                                }`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          } 
                        />
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {spec.disk_info && spec.disk_info.length > 0 && (
          <div className="mt-8">
            <SectionCard 
              title="Disk Information" 
              subtitle="Details about storage devices"
            >
              <div className="space-y-8">
                {spec.disk_info.map((disk: any, index: number) => (
                  <div key={index} className={index > 0 ? "pt-6 border-t border-gray-200 dark:border-gray-700" : ""}>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs mr-2">
                        {index + 1}
                      </span>
                      {disk.device || `Disk #${index + 1}`}
                      {disk.mountpoint && (
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          ({disk.mountpoint})
                        </span>
                      )}
                    </h4>
                    
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                      {disk.file_system_type && (
                        <InfoItem label="File System" value={disk.file_system_type} />
                      )}
                      
                      {disk.total_size && (
                        <InfoItem 
                          label="Total Size" 
                          value={
                            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                              {formatBytes(disk.total_size)}
                            </span>
                          } 
                        />
                      )}
                      
                      <div className="grid grid-cols-2 gap-x-4 sm:col-span-2 md:col-span-3">
                        {disk.used && (
                          <InfoItem label="Used Space" value={formatBytes(disk.used)} />
                        )}
                        {disk.free && (
                          <InfoItem label="Free Space" value={formatBytes(disk.free)} />
                        )}
                      </div>
                      
                      {disk.percent_used && (
                        <div className="sm:col-span-2 md:col-span-3 mt-2">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Disk Usage</dt>
                          <dd>
                            <ProgressBar 
                              percentage={disk.percent_used} 
                              label={`${disk.percent_used.toFixed(1)}% Used`} 
                            />
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {spec.network_info && spec.network_info.length > 0 && (
          <div className="mt-8 mb-10">
            <SectionCard 
              title="Network Information" 
              subtitle="Details about network interfaces"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {spec.network_info.map((network: any, index: number) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs mr-2">
                        {index + 1}
                      </span>
                      {network.interface || `Interface #${index + 1}`}
                    </h4>
                    
                    <dl className="grid grid-cols-1 gap-y-4">
                      {network.ip && (
                        <InfoItem 
                          label="IP Address" 
                          value={
                            <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 text-indigo-700 dark:text-indigo-300">
                              {network.ip}
                            </div>
                          } 
                        />
                      )}
                      {network.netmask && (
                        <InfoItem label="Netmask" value={network.netmask} />
                      )}
                      {network.broadcast && (
                        <InfoItem label="Broadcast" value={network.broadcast} />
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}