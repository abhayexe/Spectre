'use client';

import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';

interface QRCodeGeneratorProps {
  url: string;
  deviceName?: string;
  osInfo?: string;
}

export default function QRCodeGenerator({ url, deviceName = 'Device', osInfo = 'N/A' }: QRCodeGeneratorProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Function to generate QR code
  const generateQRCode = () => {
    setShowQRCode(true);
  };

  // Function to print QR code
  const printQRCode = () => {
    if (!qrCodeRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the QR code');
      return;
    }

    const qrCodeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code for ${deviceName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 8px;
            }
            h2 {
              margin-bottom: 20px;
            }
            .device-info {
              margin-top: 20px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>Scan to view device specifications</h2>
            ${qrCodeRef.current.innerHTML}
            <div class="device-info">
              <p><strong>Device:</strong> ${deviceName}</p>
              <p><strong>OS:</strong> ${osInfo}</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(qrCodeHTML);
    printWindow.document.close();
  };

  // Function to download QR code as an image
  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;
    
    const svg = qrCodeRef.current.querySelector('svg');
    if (!svg) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match the SVG
    canvas.width = 200;
    canvas.height = 200;
    
    // Create an image from the SVG
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL and create download link
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${deviceName.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`;
      link.href = dataUrl;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(svgUrl);
    };
    
    img.src = svgUrl;
  };

  return (
    <div className="mb-8 text-center">
      <button
        onClick={generateQRCode}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Get your QR code
      </button>

      {showQRCode && (
        <div className="mt-6 flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg shadow-md" ref={qrCodeRef}>
            <QRCode value={url} size={200} />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Scan this QR code to access this device specification page
          </p>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={printQRCode}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Print QR code
            </button>
            <button
              onClick={downloadQRCode}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Download QR code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
