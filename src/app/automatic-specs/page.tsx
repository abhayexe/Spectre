'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AutomaticSpecs() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    
    // Create a link element to download the file
    const link = document.createElement('a');
    link.href = '/DeviceSpecsCollector.exe';
    link.download = 'DeviceSpecsCollector.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Automatic Device Specs Collection
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-400">
            Download our collector tool to automatically gather and upload your device specifications
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {downloading ? 'Downloading...' : 'Download DeviceSpecsCollector.exe'}
          </button>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            How to use the Device Specs Collector
          </h2>
          
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-2">
            <div className="flex flex-col items-center">
              <div className="relative h-64 w-full overflow-hidden rounded-lg">
                <Image
                  src="/tutorialpic1.png"
                  alt="Tutorial Step 1"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="bg-gray-100 dark:bg-gray-800 p-2"
                />
              </div>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 text-center">
                
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative h-64 w-full overflow-hidden rounded-lg">
                <Image
                  src="/tutorialpic2.jpeg"
                  alt="Tutorial Step 2"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="bg-gray-100 dark:bg-gray-800 p-2"
                />
              </div>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 text-center">
                
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative h-64 w-full overflow-hidden rounded-lg">
                <Image
                  src="/tutorialpic3.jpeg"
                  alt="Tutorial Step 3"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="bg-gray-100 dark:bg-gray-800 p-2"
                />
              </div>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 text-center">
                
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative h-64 w-full overflow-hidden rounded-lg">
                <Image
                  src="/tutorialpic4.jpeg"
                  alt="Tutorial Step 4"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="bg-gray-100 dark:bg-gray-800 p-2"
                />
              </div>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 text-center">
                
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/manual-specs"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-lg font-medium"
          >
            Prefer to enter specs manually? Click here
          </Link>
        </div>
      </div>
    </div>
  );
}
