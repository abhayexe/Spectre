'use client';

import Image from "next/image";
import { Suspense } from 'react';
import DeviceSpecs from '@/components/DeviceSpecs';

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 gap-8 font-[family-name:var(--font-geist-sans)]">
      <header className="flex justify-center items-center">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
      </header>
      
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-3xl font-bold text-center">Device Specifications Dashboard</h1>
        <p className="text-center max-w-2xl mb-6">
          This dashboard displays the hardware specifications of your device. The data is collected using a Python script
          and stored in Supabase.
        </p>
        
        <div className="w-full max-w-6xl">
          <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>}>
            <DeviceSpecs />
          </Suspense>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg max-w-2xl mt-4">
          <h2 className="text-lg font-semibold mb-2">How to collect your device specs:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you have Python installed on your system</li>
            <li>Install the required packages: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">pip install -r requirements.txt</code></li>
            <li>Update the Supabase URL and API key in the <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">main.py</code> file</li>
            <li>Run the script: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">python main.py</code></li>
            <li>Refresh this page to see your device specifications</li>
          </ol>
        </div>
      </main>
      
      <footer className="flex gap-6 flex-wrap items-center justify-center py-4">
        <p className="text-sm text-gray-500">
          Built with Next.js, Supabase, and Python
        </p>
      </footer>
    </div>
  );
}
