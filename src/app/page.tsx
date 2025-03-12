'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If user is not logged in, show login page
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* Graph pattern background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="graph-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40 L40 0 M-10 10 L10 -10 M30 50 L50 30" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#graph-pattern)" />
          </svg>
        </div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-700 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-700 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <div className="mb-8 inline-block">
                <svg className="h-16 w-16 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Device Specs Dashboard
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Collect, view, and share your device specifications with ease. Sign in to get started.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/login"
                  className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all duration-300 hover:shadow-indigo-500/30 hover:shadow-lg"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Create an account <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in, show dashboard
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Graph pattern background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="graph-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40 L40 0 M-10 10 L10 -10 M30 50 L50 30" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#graph-pattern)" />
        </svg>
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-700 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-700 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <div className="inline-flex space-x-6">
                <span className="rounded-full bg-indigo-600/20 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-600/20">
                  Welcome back
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-400">
                  <span>{user.email}</span>
                </span>
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Device Specs Dashboard
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Collect and view detailed specifications for all your devices in one place. Choose how you want to collect your device information.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/automatic-specs"
                className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all duration-300 hover:shadow-indigo-500/30 hover:shadow-lg"
              >
                Automatic Specs Collection
              </Link>
              <Link
                href="/manual-specs"
                className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors duration-300"
              >
                Manual Entry <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="relative rounded-xl bg-gray-800/30 p-2 ring-1 ring-inset ring-gray-700/30 lg:rounded-2xl lg:p-4 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image
                  src="/wallpaperdark.png"
                  alt="App screenshot"
                  width={1200}
                  height={1000}
                  className="w-full rounded-md shadow-2xl ring-1 ring-gray-700/30 transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-gray-900/50 backdrop-blur-sm py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Powerful Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to manage your device specifications
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Our dashboard provides comprehensive tools to collect, view, and share your device specifications.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col rounded-2xl bg-gray-800/30 p-6 ring-1 ring-gray-700/30 hover:bg-gray-800/50 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 flex-none text-indigo-400">
                    <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875z" />
                    <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 001.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 001.897 1.384C6.809 12.164 9.315 12.75 12 12.75z" />
                    <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 15.914 9.315 16.5 12 16.5z" />
                    <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 19.664 9.315 20.25 12 20.25z" />
                  </svg>
                  Comprehensive Data Collection
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Automatically collect detailed information about your CPU, GPU, memory, storage, and network interfaces.
                  </p>
                  <p className="mt-6">
                    <Link href="/specs" className="text-sm font-semibold leading-6 text-indigo-400 hover:text-indigo-300 transition-colors duration-300">
                      View your specs <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col rounded-2xl bg-gray-800/30 p-6 ring-1 ring-gray-700/30 hover:bg-gray-800/50 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 flex-none text-indigo-400">
                  <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V15a3 3 0 01-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 01-.53 1.28h-9a.75.75 0 01-.53-1.28l.621-.622a2.25 2.25 0 00.659-1.59V18h-3a3 3 0 01-3-3V5.25zm1.5 0v9.75c0 .83.67 1.5 1.5 1.5h13.5c.83 0 1.5-.67 1.5-1.5V5.25c0-.83-.67-1.5-1.5-1.5H5.25c-.83 0-1.5.67-1.5 1.5z" clipRule="evenodd" />
                  </svg>
                  Easy Sharing
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Share your device specifications with others using unique links. Perfect for troubleshooting or comparing systems.
                  </p>
                  <p className="mt-6">
                    <Link href="/automatic-specs" className="text-sm font-semibold leading-6 text-indigo-400 hover:text-indigo-300 transition-colors duration-300">
                      Get the collector <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col rounded-2xl bg-gray-800/30 p-6 ring-1 ring-gray-700/30 hover:bg-gray-800/50 transition-colors duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 flex-none text-indigo-400">
                    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
                  </svg>
                  Manual Entry Option
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Don't want to run the collector? No problem. You can manually enter your device specifications.
                  </p>
                  <p className="mt-6">
                    <Link href="/manual-specs" className="text-sm font-semibold leading-6 text-indigo-400 hover:text-indigo-300 transition-colors duration-300">
                      Enter specs manually <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-sm mt-16 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-8 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/about" className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
              About
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
              Terms
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2025 Spectre Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}