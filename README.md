# Spectre - Device Specs Dashboard
[Live Demo](https://spectre-689l.vercel.app/)
![Spectre Logo](public/logo.png)

## Overview

Spectre is a modern web application that allows users to collect, view, and analyze device specifications in a beautiful, intuitive interface. With support for both dark and light modes, Spectre provides a seamless experience for tracking hardware specifications across multiple devices.

## Features

### Core Functionality
- **Multi-device Management**: Track specifications for all your devices in one centralized dashboard
- **Automatic Specs Collection**: Download our collector tool to automatically gather and upload device specifications
- **Manual Specs Entry**: Manually input device specifications or upload from JSON/CSV files
- **Detailed Device Views**: Comprehensive display of CPU, GPU, memory, storage, and OS information
- **User Authentication**: Secure login and registration system powered by Supabase

### Advanced Features
- **AI Technician**: Get expert advice and recommendations about your hardware from our AI assistant powered by Google Gemini
- **Theme Support**: Toggle between dark and light modes with custom wallpaper backgrounds
- **Responsive Design**: Beautiful interface that works across desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Integration**: Google Gemini API
- **Styling**: TailwindCSS with custom theme support via next-themes
- **UI Components**: Headless UI
- **Icons**: Heroicons

## Project Structure

```
next-app/
├── public/               # Static assets
│   ├── logo.png          # Project logo
│   ├── wallpaperdark.png # Dark mode background
│   ├── wallpaperlight.png # Light mode background
│   └── DeviceSpecsCollector.exe # Automatic collector tool
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── ai-technician/  # AI assistant for hardware advice
│   │   ├── automatic-specs/ # Automatic specs collection page
│   │   ├── login/         # User login page
│   │   ├── manual-specs/  # Manual specs entry page
│   │   ├── signup/        # User registration page
│   │   ├── specs/         # Device specifications dashboard
│   │   └── globals.css    # Global styles
│   ├── components/        # Reusable UI components
│   │   └── Navbar.tsx     # Navigation bar with theme toggle
│   ├── providers/         # React context providers
│   │   └── ThemeProvider.tsx # Theme management
│   └── utils/             # Utility functions
│       ├── supabase.ts    # Supabase client configuration
│       └── formatBytes.ts # Data formatting utilities
└── package.json          # Project dependencies
```

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Supabase account for backend services

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/spectre.git
cd spectre
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Theme Customization

Spectre comes with built-in support for dark and light modes:

- **Dark Mode**: Features a sleek, dark interface with `wallpaperdark.png` background
- **Light Mode**: Offers a clean, bright interface with `wallpaperlight.png` background

The theme automatically syncs with your system preferences but can be toggled manually from the navigation bar.

## Authentication Flow

1. Users can sign up with email and password
2. Login is handled securely through Supabase Auth
3. Protected routes ensure only authenticated users can access device information

## Device Specs Collection

### Automatic Collection
1. Download the DeviceSpecsCollector.exe tool
2. Run the executable on your device
3. The tool automatically collects hardware information and uploads it to your account

### Manual Entry
1. Navigate to the Manual Entry page
2. Fill in the form with your device specifications
3. Alternatively, upload a JSON or CSV file with device information

## AI Technician

The AI Technician feature uses Google's Gemini API to provide:
- Hardware recommendations based on your devices
- Troubleshooting assistance
- Performance optimization advice
- Upgrade suggestions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.io/) - Open source Firebase alternative
- [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Google Gemini](https://ai.google.dev/) - AI model for the technician feature
