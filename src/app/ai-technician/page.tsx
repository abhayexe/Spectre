'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gemini API base URL and key
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GeminiModel {
  id: string;
  name: string;
  description: string;
}

const GEMINI_MODELS: GeminiModel[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast, efficient model for most use cases'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Alternative model if Flash is unavailable'
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    description: 'Legacy model for compatibility'
  }
];

// Create a client component that uses useSearchParams
function AITechnicianContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi there! I\'m your AI Technician powered by Google Gemini. I can help you with your device specifications, troubleshooting, and recommendations. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [apiKey, setApiKey] = useState(GEMINI_API_KEY);
  const [apiKeyEntered, setApiKeyEntered] = useState(!!GEMINI_API_KEY);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if model is specified in URL
    const modelParam = searchParams.get('model');
    if (modelParam && GEMINI_MODELS.some(model => model.id === modelParam)) {
      setSelectedModel(modelParam);
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Fetch user's devices - using the correct query
        const { data, error } = await supabase
          .from('device_specs')
          .select('*');
          
        if (data && !error) {
          console.log('Fetched devices:', data);
          setDevices(data);
        } else {
          console.error('Error fetching devices:', error);
        }
      }
    };
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/');
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isProcessing || !apiKey) return;
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Debug: Check if API key is available
      console.log('API Key available:', !!apiKey);
      console.log('Using model:', selectedModel);
      
      // Prepare context about user's devices
      let deviceContext = '';
      if (devices && devices.length > 0) {
        deviceContext = 'Here is information about the user\'s devices:\n';
        devices.forEach((device, index) => {
          // Format device name using node_name or a default
          const deviceName = device.node_name || `Device ${index + 1}`;
          
          deviceContext += `Device ${index + 1}: ${deviceName}\n`;
          deviceContext += `- Device ID: ${device.device_id || device.id}\n`;
          
          // CPU information
          if (device.cpu_brand) {
            deviceContext += `- CPU: ${device.cpu_brand}\n`;
            deviceContext += `  - Physical cores: ${device.cpu_cores_physical}\n`;
            deviceContext += `  - Logical cores: ${device.cpu_cores_logical}\n`;
            deviceContext += `  - Frequency: ${device.cpu_frequency?.current ? device.cpu_frequency.current + ' MHz' : 'Unknown'}\n`;
          } else {
            deviceContext += `- CPU: ${device.cpu || 'Unknown'}\n`;
          }
          
          // GPU information
          if (device.gpu_info && device.gpu_info.length > 0) {
            device.gpu_info.forEach((gpu: any, gpuIndex: number) => {
              deviceContext += `- GPU ${gpuIndex + 1}: ${gpu.name}\n`;
              deviceContext += `  - VRAM: ${gpu.memory_total} MB\n`;
            });
          } else {
            deviceContext += `- GPU: ${device.gpu || 'Unknown'}\n`;
          }
          
          // Memory information
          if (device.memory_total) {
            const ramGB = (device.memory_total / (1024 * 1024 * 1024)).toFixed(2);
            deviceContext += `- RAM: ${ramGB} GB\n`;
            deviceContext += `  - Available: ${((device.memory_available || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB\n`;
            deviceContext += `  - Used: ${device.memory_percent_used}%\n`;
          } else {
            deviceContext += `- RAM: ${device.ram || 'Unknown'}\n`;
          }
          
          // Storage information
          if (device.disk_info && device.disk_info.length > 0) {
            deviceContext += `- Storage:\n`;
            device.disk_info.forEach((disk: any, diskIndex: number) => {
              const totalGB = (disk.total_size / (1024 * 1024 * 1024)).toFixed(2);
              const usedGB = (disk.used / (1024 * 1024 * 1024)).toFixed(2);
              const freeGB = (disk.free / (1024 * 1024 * 1024)).toFixed(2);
              
              deviceContext += `  - Drive ${diskIndex + 1} (${disk.device}): ${totalGB} GB total\n`;
              deviceContext += `    - Used: ${usedGB} GB (${disk.percent_used}%)\n`;
              deviceContext += `    - Free: ${freeGB} GB\n`;
            });
          } else {
            deviceContext += `- Storage: ${device.storage || 'Unknown'}\n`;
          }
          
          // Operating System information
          if (device.system && device.release) {
            deviceContext += `- Operating System: ${device.system} ${device.release} (${device.version || ''})\n`;
          } else {
            deviceContext += `- Operating System: ${device.os || 'Unknown'}\n`;
          }
          
          deviceContext += '\n';
        });
      } else {
        deviceContext = 'The user has not registered any devices yet.';
      }
      
      // Prepare conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));
      
      // Create a user message with the device context and user's input
      // Instead of using a system message (which is not supported), include context in the user message
      const userMessageWithContext = {
        role: 'user',
        parts: [{ 
          text: `You are an AI Technician specialized in computer hardware and software. 
          Your goal is to help users with their device specifications, troubleshooting, and recommendations.
          ${deviceContext}
          
          When I ask about a specific device, try to reference the device information provided above.
          If I ask about a device not in the list, inform me that you don't have information about that device
          and suggest I add it to my profile.
          
          Be helpful, concise, and technical when appropriate. If you're unsure about something, admit it
          rather than making up information.
          
          Here's my question: ${input}`
        }]
      };
      
      // Debug: Log request body
      const requestBody = {
        contents: [
          ...conversationHistory.slice(0, -1), // Include all previous messages except the last user message
          userMessageWithContext
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      // Prepare the request to Gemini API
      const apiUrl = `${GEMINI_API_BASE_URL}/${selectedModel}:generateContent?key=${apiKey}`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // Debug: Log response status
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Debug: Log response data
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (data.error) {
        // Handle specific API error
        console.error('Gemini API Error:', data.error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${data.error.message || 'Unknown API error'}. Please check your API key and try again.`
        }]);
      } else {
        // Handle empty or unexpected response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I apologize, but I encountered an issue processing your request. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please check your API key and try again.`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6">Sign In Required</h1>
          <p className="text-gray-300 mb-6">
            You need to be signed in to chat with the AI Technician. This allows us to provide personalized assistance based on your devices.
          </p>
          <Link 
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-xl font-bold text-white">Spectre Dashboard</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              {user.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
              <path d="M12 2a10 10 0 0 1 10 10h-10V2Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Technician</h1>
            <p className="text-gray-400">Powered by Google Gemini {selectedModel}</p>
          </div>
        </div>

        {/* Model Selection */}
        <div className="mb-6 bg-gray-800/70 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Select Gemini Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {GEMINI_MODELS.map((model) => (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`cursor-pointer p-3 rounded-lg border ${
                  selectedModel === model.id
                    ? 'bg-emerald-900/30 border-emerald-500/50'
                    : 'bg-gray-700/30 border-gray-700 hover:bg-gray-700/50'
                } transition-colors`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    selectedModel === model.id ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}></div>
                  <span className="font-medium text-white">{model.name}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{model.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-blue-500/30">
            <p className="text-sm text-gray-300">
              We apologize as Gemini Pro and 1.0 Pro models are currently unavailable.
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-6 bg-gray-800/50 rounded-lg p-4 shadow-inner">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your devices..."
            className="w-full bg-gray-800 rounded-lg pl-4 pr-16 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-2 ${
              isProcessing || !input.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            } transition-colors`}
          >
            {isProcessing ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>

        {/* Device Information */}
        {devices && devices.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Your Registered Devices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <div key={device.id} className="bg-gray-800/70 rounded-lg p-4 shadow">
                  <h3 className="font-medium text-white">{device.node_name || 'Unnamed Device'}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-400">
                    <p>CPU: {device.cpu_brand || 'Not specified'}</p>
                    <p>GPU: {device.gpu_info && device.gpu_info.length > 0 ? device.gpu_info[0].name : 'Not specified'}</p>
                    <p>RAM: {device.memory_total ? (device.memory_total / (1024 * 1024 * 1024)).toFixed(2) + ' GB' : 'Not specified'}</p>
                    <p>Storage: {device.disk_info && device.disk_info.length > 0 ? (device.disk_info[0].total_size / (1024 * 1024 * 1024)).toFixed(2) + ' GB' : 'Not specified'}</p>
                    <p>OS: {device.system && device.release ? `${device.system} ${device.release}` : 'Not specified'}</p>
                  </div>
                  <div className="mt-3">
                    <Link 
                      href={`/specs/${device.id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      View full details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {devices && devices.length === 0 && (
          <div className="mt-8 bg-gray-800/50 rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">No devices found</h3>
            <p className="mt-2 text-gray-400">
              You haven't registered any devices yet. The AI Technician can provide more personalized help when you add your devices.
            </p>
            <div className="mt-4">
              <Link
                href="/manual-specs"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add a Device
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Powered by Google Gemini {selectedModel} API</p>
        </div>
      </footer>
    </div>
  );
}

// Wrap the component that uses useSearchParams in a Suspense boundary
export default function AITechnician() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <AITechnicianContent />
    </Suspense>
  );
}
