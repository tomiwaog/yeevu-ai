"use client";

import { useState } from "react";
import { Download, Globe, ExternalLink, Loader2 } from "lucide-react";

interface HostingOptionsProps {
  sandboxId: string;
  previewUrl: string;
  onHostingComplete: (hostingInfo: any) => void;
}

export default function HostingOptions({ sandboxId, previewUrl, onHostingComplete }: HostingOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string>("");

  const handleDownload = async () => {
    setSelectedOption("download");
    setIsProcessing(true);
    setDownloadProgress("Preparing download...");

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sandboxId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Download failed");
      }

      // Check if response is a zip file or JSON
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("application/zip")) {
        setDownloadProgress("Creating zip file...");
        
        // Handle zip file download
        const blob = await response.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `website-project-${sandboxId.substring(0, 8)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(downloadUrl);
        
        setDownloadProgress("Download complete! Check your downloads folder.");
        
        // Complete the hosting flow
        setTimeout(() => {
          onHostingComplete({
            type: "download",
            filename: `website-project-${sandboxId.substring(0, 8)}.zip`,
            success: true
          });
        }, 2000);
      } else {
        // Handle JSON response (error case)
        const result = await response.json();
        throw new Error(result.error || "Unexpected response format");
      }
      
    } catch (error: any) {
      console.error("Download failed:", error);
      setDownloadProgress(`Download failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleVercelDeploy = async () => {
    setSelectedOption("vercel");
    setIsProcessing(true);
    
    try {
      // TODO: Implement Vercel deployment
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      onHostingComplete({
        type: "vercel",
        url: "https://your-project-vercel.app",
        success: true
      });
    } catch (error) {
      console.error("Vercel deployment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlatformHost = async () => {
    setSelectedOption("platform");
    setIsProcessing(true);
    
    try {
      // TODO: Implement platform hosting
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      onHostingComplete({
        type: "platform",
        url: "https://your-project.lovable-clone.com",
        success: true
      });
    } catch (error) {
      console.error("Platform hosting failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {selectedOption === "download" && "Preparing Download"}
          {selectedOption === "vercel" && "Deploying to Vercel"}
          {selectedOption === "platform" && "Setting up Hosting"}
        </h3>
        <p className="text-gray-400 mb-4">
          {downloadProgress || "This may take a moment..."}
        </p>
        {selectedOption === "download" && downloadProgress.includes("ready") && (
          <p className="text-green-400 text-sm">✓ Download should start automatically</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col">
      {/* Header */}
      <div className="text-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-white mb-1">Your website is ready! 🎉</h2>
        <p className="text-gray-400 text-xs">Choose how you'd like to host your new website</p>
      </div>

      {/* Preview */}
      <div className="bg-gray-900 rounded-xl p-2 mb-3 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Preview</h3>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="h-full bg-gray-800 rounded-lg overflow-hidden">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Website Preview"
          />
        </div>
      </div>

      {/* Hosting Options */}
      <div className="grid md:grid-cols-3 gap-3 flex-shrink-0">
        {/* Download Locally */}
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Download</h3>
          </div>
          <p className="text-gray-400 mb-3 text-xs">
            Get source code and run locally
          </p>
          <button
            onClick={handleDownload}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-xs"
          >
            Download Project
          </button>
        </div>

        {/* Deploy to Vercel */}
        <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Deploy to Vercel</h3>
          </div>
          <p className="text-gray-400 mb-3 text-xs">
            Professional hosting with custom domains
          </p>
          <button
            onClick={handleVercelDeploy}
            className="w-full py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors border border-gray-700 text-xs"
          >
            Deploy to Vercel
          </button>
        </div>

        {/* Host on Platform */}
        <div className="bg-gray-900 rounded-xl p-3 border border-blue-800 hover:border-blue-700 transition-colors relative">
          <div className="absolute -top-2 -right-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Recommended</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Host with Us</h3>
          </div>
          <p className="text-gray-400 mb-3 text-xs">
            Managed hosting with analytics and updates
          </p>
          <button
            onClick={handlePlatformHost}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-xs"
          >
            Host on Platform
          </button>
        </div>
      </div>

      {/* Technical Info */}
      <div className="mt-2 p-2 bg-gray-900/50 rounded-lg border border-gray-800 flex-shrink-0">
        <details className="text-xs">
          <summary className="text-gray-400 cursor-pointer hover:text-gray-300 mb-1">
            Technical Details
          </summary>
          <div className="text-gray-500 space-y-1 text-xs">
            <p>• Sandbox ID: <code className="bg-gray-800 px-1 py-0.5 rounded text-xs">{sandboxId}</code></p>
            <p>• Framework: Next.js with TypeScript</p>
            <p>• Styling: Tailwind CSS</p>
            <p>• Preview URL: <a href={previewUrl} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">{previewUrl}</a></p>
          </div>
        </details>
      </div>
    </div>
  );
}