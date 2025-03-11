'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function ManualSpecs() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    system: '',
    node_name: '',
    processor: '',
    cpu_brand: '',
    cpu_cores_physical: '',
    cpu_cores_logical: '',
    memory_total: '',
    disk_info: '',
    gpu_info: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Format the data for Supabase
      const deviceData = {
        device_id: uuidv4(),
        system: formData.system,
        node_name: formData.node_name,
        processor: formData.processor,
        cpu_brand: formData.cpu_brand,
        cpu_cores_physical: parseInt(formData.cpu_cores_physical) || 0,
        cpu_cores_logical: parseInt(formData.cpu_cores_logical) || 0,
        memory_total: parseInt(formData.memory_total) || 0,
        disk_info: formData.disk_info ? JSON.parse(formData.disk_info) : [],
        gpu_info: formData.gpu_info ? JSON.parse(formData.gpu_info) : [],
        timestamp: Math.floor(Date.now() / 1000),
      };
      
      // Insert data into Supabase
      const { data, error } = await supabase
        .from('device_specs')
        .insert([deviceData])
        .select();
      
      if (error) throw error;
      
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        system: '',
        node_name: '',
        processor: '',
        cpu_brand: '',
        cpu_cores_physical: '',
        cpu_cores_logical: '',
        memory_total: '',
        disk_info: '',
        gpu_info: '',
      });
      
      // Redirect to specs page after 2 seconds
      setTimeout(() => {
        router.push('/specs');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error submitting manual specs:', err);
      setError(err.message || 'An error occurred while submitting your device specifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Manual Device Specs Entry
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
            Enter your device specifications manually
          </p>
        </div>

        <div className="mt-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/30 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>Your device specifications have been successfully submitted!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="system" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Operating System
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="system"
                    id="system"
                    value={formData.system}
                    onChange={handleChange}
                    placeholder="e.g., Windows 10, macOS, Linux"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="node_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Computer Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="node_name"
                    id="node_name"
                    value={formData.node_name}
                    onChange={handleChange}
                    placeholder="e.g., DESKTOP-ABC123"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="processor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Processor
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="processor"
                    id="processor"
                    value={formData.processor}
                    onChange={handleChange}
                    placeholder="e.g., Intel64 Family 6 Model 158"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="cpu_brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  CPU Brand
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="cpu_brand"
                    id="cpu_brand"
                    value={formData.cpu_brand}
                    onChange={handleChange}
                    placeholder="e.g., Intel(R) Core(TM) i7-8700K"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="cpu_cores_physical" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Physical CPU Cores
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="cpu_cores_physical"
                    id="cpu_cores_physical"
                    value={formData.cpu_cores_physical}
                    onChange={handleChange}
                    placeholder="e.g., 6"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="cpu_cores_logical" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Logical CPU Cores
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="cpu_cores_logical"
                    id="cpu_cores_logical"
                    value={formData.cpu_cores_logical}
                    onChange={handleChange}
                    placeholder="e.g., 12"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="memory_total" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Memory (in bytes)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="memory_total"
                    id="memory_total"
                    value={formData.memory_total}
                    onChange={handleChange}
                    placeholder="e.g., 17179869184 (16GB)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="disk_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Disk Information (JSON format)
              </label>
              <div className="mt-1">
                <textarea
                  name="disk_info"
                  id="disk_info"
                  rows={3}
                  value={formData.disk_info}
                  onChange={handleChange}
                  placeholder='e.g., [{"device": "C:", "total_size": 512110190592}]'
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter disk information in JSON format. Leave empty if not available.
              </p>
            </div>
            
            <div>
              <label htmlFor="gpu_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                GPU Information (JSON format)
              </label>
              <div className="mt-1">
                <textarea
                  name="gpu_info"
                  id="gpu_info"
                  rows={3}
                  value={formData.gpu_info}
                  onChange={handleChange}
                  placeholder='e.g., [{"name": "NVIDIA GeForce RTX 3080", "memory_total": 10240}]'
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter GPU information in JSON format. Leave empty if not available.
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Device Specifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
