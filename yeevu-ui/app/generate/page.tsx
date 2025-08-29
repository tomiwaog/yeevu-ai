"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HostingOptions from "@/components/HostingOptions";
import { ExternalLink } from "lucide-react";

interface Message {
  type: "claude_message" | "tool_use" | "tool_result" | "progress" | "error" | "complete";
  content?: string;
  name?: string;
  input?: any;
  result?: any;
  message?: string;
  previewUrl?: string;
  sandboxId?: string;
}

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prompt = searchParams.get("prompt") || "";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHostingOptions, setShowHostingOptions] = useState(false);
  const [permanentUrl, setPermanentUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (!prompt) {
      router.push("/");
      return;
    }
    
    // Prevent double execution in StrictMode
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    
    setIsGenerating(true);
    generateWebsite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, router]);
  
  const generateWebsite = async () => {
    try {
      const response = await fetch("/api/generate-daytona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate website");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              setIsGenerating(false);
              setShowHostingOptions(true); // Show hosting options after generation
              break;
            }

            try {
              const message = JSON.parse(data) as Message;
              
              if (message.type === "error") {
                throw new Error(message.message);
              } else if (message.type === "complete") {
                setPreviewUrl(message.previewUrl || null);
                setSandboxId(message.sandboxId || null);
                setIsGenerating(false);
                setShowHostingOptions(true); // Show hosting options after generation
              } else {
                setMessages((prev) => [...prev, message]);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Error generating website:", err);
      setError(err.message || "An error occurred");
      setIsGenerating(false);
    }
  };
  
  const formatToolInput = (input: any) => {
    if (!input) return "";
    
    // Extract key information based on tool type
    if (input.file_path) {
      return `File: ${input.file_path}`;
    } else if (input.command) {
      return `Command: ${input.command}`;
    } else if (input.pattern) {
      return `Pattern: ${input.pattern}`;
    } else if (input.prompt) {
      return `Prompt: ${input.prompt.substring(0, 100)}...`;
    }
    
    // For other cases, show first meaningful field
    const keys = Object.keys(input);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const value = input[firstKey];
      if (typeof value === 'string' && value.length > 100) {
        return `${firstKey}: ${value.substring(0, 100)}...`;
      }
      return `${firstKey}: ${value}`;
    }
    
    return JSON.stringify(input).substring(0, 100) + "...";
  };

  const handleHostingComplete = (hostingInfo: any) => {
    if (hostingInfo.type === "download") {
      // For downloads, show success state without URL
      setShowHostingOptions(false);
      setPermanentUrl("download_complete");
    } else {
      // For hosting options, show the URL
      setPermanentUrl(hostingInfo.url);
      setShowHostingOptions(false);
    }
  };

  return (
    <main className="h-screen bg-black flex flex-col overflow-hidden relative">
      <Navbar />
      {/* Spacer for navbar */}
      <div className="h-16" />
      
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left side - Messages */}
        <div className="w-full lg:w-[30%] bg-gray-950 border-r border-gray-800 flex flex-col">
          {/* Messages Header */}
<div className="p-4 pt-20 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">Yeevu AI Progress</h2>
              <div className="flex items-center gap-2">
                {isGenerating && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <span className="text-xs text-gray-400">
                  {isGenerating ? "Generating..." : "Complete"}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            {isGenerating && (
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={index}>
                {message.type === "claude_message" && (
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Y</span>
                      </div>
                      <span className="text-white font-semibold">Yeevu AI</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></div>
                    </div>
                    <p className="text-gray-200 whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  </div>
                )}
                
                {message.type === "tool_use" && (
                  <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-800/30 overflow-hidden">
                    <div className="flex items-start gap-3 text-sm">
                      <div className="flex items-center gap-1 text-blue-400 flex-shrink-0">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⚡</span>
                        </div>
                        <span className="font-medium">{message.name}</span>
                      </div>
                      <span className="text-gray-400 break-all text-xs">{formatToolInput(message.input)}</span>
                    </div>
                  </div>
                )}
                
                {message.type === "progress" && (
                  <div className="bg-gray-800/50 rounded-lg p-3 border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-spin"></div>
                      <span className="text-gray-300 text-sm font-mono break-all">{message.message}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isGenerating && (
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-800/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-purple-400 border-r-blue-400"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-6 w-6 border border-purple-400 opacity-20"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-medium">Generating your website...</span>
                    <span className="text-gray-400 text-xs">This may take a few minutes</span>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Section */}
          <div className="p-4 border-t border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Yeevu AI..."
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-800 focus:outline-none focus:border-gray-700"
                disabled={isGenerating}
              />
              <button className="p-2 text-gray-400 hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Right side - Preview or Hosting Options */}
        <div className="w-full lg:w-[70%] bg-gray-950 flex items-center justify-center py-6 px-4 lg:px-6 overflow-hidden">
          {isGenerating && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-xl animate-pulse"></div>
              </div>
              <p className="text-gray-400">Spinning up preview...</p>
            </div>
          )}
          
          {showHostingOptions && sandboxId && previewUrl && (
            <div className="w-full h-full max-w-7xl">
              <HostingOptions 
                sandboxId={sandboxId}
                previewUrl={previewUrl}
                onHostingComplete={handleHostingComplete}
              />
            </div>
          )}
          
          {permanentUrl && !showHostingOptions && (
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-800 rounded-2xl flex items-center justify-center mb-4">
                <div className="text-3xl">✅</div>
              </div>
              {permanentUrl === "download_complete" ? (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">Download Complete!</h3>
                  <p className="text-gray-400 mb-4">Your project has been downloaded as a zip file</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Extract the zip file and run:</p>
                    <div className="bg-gray-900 rounded-lg p-4 text-left">
                      <code className="text-blue-400">
                        cd website-project-[id]<br/>
                        npm install<br/>
                        npm run dev
                      </code>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      ✅ Files also saved to: ./temp-downloads/[sandbox-id]/
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">Deployment Successful!</h3>
                  <p className="text-gray-400 mb-4">Your website is now live</p>
                  <a
                    href={permanentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Visit Your Website
                  </a>
                </>
              )}
            </div>
          )}
          
          {previewUrl && !showHostingOptions && !permanentUrl && (
            <div className="w-full h-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900/50">
                <h3 className="text-sm font-semibold text-white">Live Preview</h3>
                                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                  >
                    Open in new tab <ExternalLink className="w-3 h-3" />
                  </a>
              </div>
              <div className="h-full relative">
                <iframe
                  src={previewUrl}
                  title="Website Preview"
                  loading="lazy"
                  width="100%"
                  height="100%"
                />
                {/* Loading overlay */}
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center iframe-loading">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-400 text-xs">Loading preview...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!previewUrl && !isGenerating && !showHostingOptions && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
              </div>
              <p className="text-gray-400">Preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}