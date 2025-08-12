#!/usr/bin/env python3
"""
Simple HTTP Server for AI Agent Memory Dashboard Development

This script provides a local development server for the dashboard.
It includes CORS headers and basic error handling for development purposes.

Usage:
    python server.py [port]
    
Default port is 8000 if none specified.
"""

import http.server
import socketserver
import sys
import os
from urllib.parse import urlparse

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS support for development."""
    
    def end_headers(self):
        """Add CORS headers for development."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight OPTIONS request."""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom logging for development."""
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    """Main function to start the development server."""
    # Get port from command line or use default
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create server
    with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
        print(f"🚀 AI Agent Memory Dashboard Development Server")
        print(f"📍 Serving at: http://localhost:{port}")
        print(f"📁 Root directory: {os.getcwd()}")
        print(f"🔗 Open your browser to: http://localhost:{port}")
        print(f"⏹️  Press Ctrl+C to stop the server")
        print("-" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            httpd.shutdown()

if __name__ == "__main__":
    main()
