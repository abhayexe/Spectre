'use client';

import { Fragment, useEffect, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    // Check if user is logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Define navigation items
  const navigation = [
    { name: 'Dashboard', href: '/', current: pathname === '/' },
    { name: 'Device Specs', href: '/specs', current: pathname === '/specs' },
  ];

  if (!mounted) return null;

  return (
    <div className="sticky top-0 z-50">
      <Disclosure as="nav" className="backdrop-blur-md bg-white/70 dark:bg-gray-900/80 border-b border-gray-200/30 dark:border-gray-700/30">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <Link href="/" className="flex items-center space-x-2 group">
                      <div className="p-1 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg">
                        <img 
                          src="/logo.png" 
                          alt="Spectre Logo" 
                          className="h-8 w-8 object-contain transform transition-transform group-hover:scale-110" 
                        />
                      </div>
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        Spectre
                      </span>
                    </Link>
                  </div>
                  <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'border-indigo-500 text-gray-900 dark:text-white font-medium'
                            : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm transition-colors duration-200'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                  {/* Theme toggle button */}
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-full p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm hover:shadow transition-all duration-200"
                  >
                    <span className="sr-only">Toggle dark mode</span>
                    {theme === 'dark' ? (
                      <SunIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <MoonIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white/50 dark:bg-gray-800/50 p-0.5 backdrop-blur-sm shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-inner">
                          {user ? user.email?.charAt(0).toUpperCase() : 'G'}
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
                        {user ? (
                          <>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/profile"
                                  className={classNames(
                                    active ? 'bg-gray-100/80 dark:bg-gray-700/80' : '',
                                    'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                                  )}
                                >
                                  Your Profile
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleSignOut}
                                  className={classNames(
                                    active ? 'bg-gray-100/80 dark:bg-gray-700/80' : '',
                                    'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                                  )}
                                >
                                  Sign out
                                </button>
                              )}
                            </Menu.Item>
                          </>
                        ) : (
                          <>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/login"
                                  className={classNames(
                                    active ? 'bg-gray-100/80 dark:bg-gray-700/80' : '',
                                    'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                                  )}
                                >
                                  Sign in
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/signup"
                                  className={classNames(
                                    active ? 'bg-gray-100/80 dark:bg-gray-700/80' : '',
                                    'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                                  )}
                                >
                                  Sign up
                                </Link>
                              )}
                            </Menu.Item>
                          </>
                        )}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="flex items-center sm:hidden">
                  {/* Mobile theme toggle */}
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-full p-1 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm"
                  >
                    <span className="sr-only">Toggle dark mode</span>
                    {theme === 'dark' ? (
                      <SunIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <MoonIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                  
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100/50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-indigo-50/80 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                        : 'border-transparent text-gray-600 hover:bg-gray-50/80 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-white',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors duration-200'
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200/30 dark:border-gray-700/30 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                      {user ? user.email?.charAt(0).toUpperCase() : 'G'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-white">
                      {user ? user.email : 'Guest'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {user ? (
                    <>
                      <Disclosure.Button
                        as="a"
                        href="/profile"
                        className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100/50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white transition-colors duration-200"
                      >
                        Your Profile
                      </Disclosure.Button>
                      <Disclosure.Button
                        as="button"
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100/50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white transition-colors duration-200"
                      >
                        Sign out
                      </Disclosure.Button>
                    </>
                  ) : (
                    <>
                      <Disclosure.Button
                        as="a"
                        href="/login"
                        className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100/50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white transition-colors duration-200"
                      >
                        Sign in
                      </Disclosure.Button>
                      <Disclosure.Button
                        as="a"
                        href="/signup"
                        className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100/50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white transition-colors duration-200"
                      >
                        Sign up
                      </Disclosure.Button>
                    </>
                  )}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}