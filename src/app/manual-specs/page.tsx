'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

export default function ManualSpecs() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    if (lines.length < 2) {
      throw new Error('Invalid CSV format: file must contain at least a header row and a data row');
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    const dataRow = lines[1].split(',').map(value => value.trim());
    
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (index < dataRow.length) {
        data[header] = dataRow[index];
      }
    });
    
    return data;
  };

  const processFileData = (data: Record<string, any>) => {
    // Map the file data to our form structure
    const newFormData = { ...formData };
    
    // Map common fields
    if (data.system) newFormData.system = data.system;
    if (data.node_name) newFormData.node_name = data.node_name;
    if (data.processor) newFormData.processor = data.processor;
    if (data.cpu_brand) newFormData.cpu_brand = data.cpu_brand;
    if (data.cpu_cores_physical) newFormData.cpu_cores_physical = data.cpu_cores_physical.toString();
    if (data.cpu_cores_logical) newFormData.cpu_cores_logical = data.cpu_cores_logical.toString();
    if (data.memory_total) newFormData.memory_total = data.memory_total.toString();
    
    // Handle arrays (disk_info and gpu_info)
    if (data.disk_info) {
      if (typeof data.disk_info === 'string') {
        // If it's already a string, use it directly
        newFormData.disk_info = data.disk_info;
      } else {
        // If it's an array or object, stringify it
        newFormData.disk_info = JSON.stringify(data.disk_info);
      }
    }
    
    if (data.gpu_info) {
      if (typeof data.gpu_info === 'string') {
        newFormData.gpu_info = data.gpu_info;
      } else {
        newFormData.gpu_info = JSON.stringify(data.gpu_info);
      }
    }
    
    setFormData(newFormData);
  };

  const handleFileDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setFileError(null);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      const fileContent = await file.text();
      
      if (fileExtension === 'json') {
        // Parse JSON file
        const data = JSON.parse(fileContent);
        processFileData(data);
      } else if (fileExtension === 'csv') {
        // Parse CSV file
        const data = parseCSV(fileContent);
        processFileData(data);
      } else {
        setFileError('Unsupported file format. Please upload a .json or .csv file.');
      }
    } catch (err: any) {
      console.error('Error processing file:', err);
      setFileError(`Error processing file: ${err.message}`);
    }
  }, [formData]);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      const fileContent = await file.text();
      
      if (fileExtension === 'json') {
        // Parse JSON file
        const data = JSON.parse(fileContent);
        processFileData(data);
      } else if (fileExtension === 'csv') {
        // Parse CSV file
        const data = parseCSV(fileContent);
        processFileData(data);
      } else {
        setFileError('Unsupported file format. Please upload a .json or .csv file.');
      }
    } catch (err: any) {
      console.error('Error processing file:', err);
      setFileError(`Error processing file: ${err.message}`);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-800 dark:text-indigo-400 sm:text-5xl">
            Device Specs
          </h1>
          <p className="mt-3 text-xl text-gray-600 dark:text-gray-300">
            Easily record and analyze your hardware information
          </p>
        </div>

        <div className="mt-12">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 shadow-sm border-l-4 border-red-500">
              <div className="flex items-center">
                <img src="/icons/alert-circle.svg" alt="Error" className="h-5 w-5 text-red-600 dark:text-red-400" />
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
            <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/30 p-4 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center">
                <img src="/icons/check-circle.svg" alt="Success" className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>Your device specifications have been successfully submitted!</p>
                    <p className="mt-1">Redirecting to specs overview...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl divide-y divide-gray-200 dark:divide-gray-700">
            <div 
              className={`border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-102' 
                : 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
              onClick={handleBrowseClick}
            >
              <input 
                type="file" 
                className="hidden" 
                accept=".json,.csv" 
                onChange={handleFileInputChange}
                ref={fileInputRef}
              />
              <img src="/icons/upload-cloud.svg" alt="Upload" className="mx-auto h-16 w-16 text-indigo-400 dark:text-indigo-300 mb-4" />
              
              <div className="mt-2 flex flex-col space-y-1">
                <span className="text-xl font-medium text-gray-700 dark:text-gray-300">
                  Drag and drop your file
                </span>
                <span className="text-gray-500 dark:text-gray-400">or</span>
                <span className="text-lg font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Click to browse
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Upload a CSV or JSON file with your device specs
              </p>
            </div>
            
            {fileError && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-4 mt-4">
                <div className="flex items-center">
                  <img src="/icons/alert-triangle.svg" alt="Warning" className="h-5 w-5 text-amber-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">File Error</h3>
                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                      <p>{fileError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <img src="/icons/cpu.svg" alt="Device" className="h-5 w-5 mr-2" />
                  Device Specifications
                </h3>
                <div className="flex space-x-4">
                  <Link 
                    href="/demo-files/demo.csv" 
                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                    download
                  >
                    <img src="/icons/file-csv.svg" alt="CSV" className="h-4 w-4 mr-1" />
                    Demo CSV
                  </Link>
                  <Link 
                    href="/demo-files/demo.json" 
                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                    download
                  >
                    <img src="/icons/file-json.svg" alt="JSON" className="h-4 w-4 mr-1" />
                    Demo JSON
                  </Link>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                <div className="group">
                  <label htmlFor="system" className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <div className="flex items-center">
                      <img src="/icons/server.svg" alt="OS" className="h-4 w-4 mr-2" />
                      Operating System
                    </div>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="system"
                      id="system"
                      value={formData.system}
                      onChange={handleChange}
                      placeholder="e.g., Windows 10, macOS, Linux"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div className="group">
                  <label htmlFor="node_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <div className="flex items-center">
                      <img src="/icons/pc.svg" alt="Computer" className="h-4 w-4 mr-2" />
                      Computer Name
                    </div>
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
                
                <div className="group">
                  <label htmlFor="processor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <div className="flex items-center">
                      <img src="/icons/cpu.svg" alt="CPU" className="h-4 w-4 mr-2" />
                      Processor
                    </div>
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
                
                <div className="group">
                  <label htmlFor="cpu_brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <div className="flex items-center">
                      <img src="/icons/chip.svg" alt="CPU Brand" className="h-4 w-4 mr-2" />
                      CPU Brand
                    </div>
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
                
                <div className="group">
                  <label htmlFor="cpu_cores_physical" className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <div className="flex items-center">
                      <img src="/icons/layers.svg" alt="Physical Cores" className="h-4 w-4 mr-2" />
                      Physical CPU Cores
                    </div>
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
                
                <div className="group">
                  <label htmlFor="cpu_cores_logical" className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <div className="flex items-center">
                      <img src="/icons/cpu-threads.svg" alt="Logical Cores" className="h-4 w-4 mr-2" />
                      Logical CPU Cores
                    </div>
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
                
                <div className="group">
                  <label htmlFor="memory_total" className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <div className="flex items-center">
                      <img src="/icons/memory.svg" alt="Memory" className="h-4 w-4 mr-2" />
                      Total Memory (in bytes)
                    </div>
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
            </div>
            
            <div className="pt-6">
              <div className="group mb-4">
                <label htmlFor="disk_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <div className="flex items-center">
                    <img src="/icons/hard-drive.svg" alt="Disk" className="h-4 w-4 mr-2" />
                    Disk Information (JSON format)
                  </div>
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
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <img src="/icons/info.svg" alt="Info" className="h-3 w-3 mr-1" />
                  Enter disk information in JSON format. Leave empty if not available.
                </p>
              </div>
              
              <div className="group">
                <label htmlFor="gpu_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <div className="flex items-center">
                    <img src="/icons/gpu.svg" alt="GPU" className="h-4 w-4 mr-2" />
                    GPU Information (JSON format)
                  </div>
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
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <img src="/icons/info.svg" alt="Info" className="h-3 w-3 mr-1" />
                  Enter GPU information in JSON format. Leave empty if not available.
                </p>
              </div>
            </div>
            
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-md font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <img src="/icons/loader.svg" className="animate-spin -ml-1 mr-2 h-5 w-5" alt="Loading" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <img src="/icons/save.svg" className="mr-2 h-5 w-5" alt="Save" />
                    Submit Device Specifications
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}