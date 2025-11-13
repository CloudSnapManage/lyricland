# 🎤 Lyric Land

Welcome to Lyric Land, a sleek and modern web application designed for music lovers who want to find, save, and enjoy song lyrics. Search for your favorite tracks and build a personal library that's beautifully displayed as a virtual bookshelf.

![Lyric Land Screenshot](src/apps/screenshots/screenshot.png)

---

## ✨ Key Features

- **Instant Lyric Search:** Quickly find lyrics by track name and optional artist name. The app fetches data from `lrclib.net` to provide accurate results.
- **Personal Library:** Save your favorite lyrics to your personal library, which persists in your browser's local storage.
- **Virtual Bookshelf:** Your saved lyrics are displayed as a beautiful, responsive bookshelf, with each "book" representing a song.
- **Listen on YouTube:** Found a song you want to hear? The "Listen" button opens a YouTube search in a new tab, making it easy to find the official music video.
- **Download Lyrics:** Save a text file of the lyrics directly to your device for offline viewing.
- **Responsive Design:** A clean, mobile-first interface built with Tailwind CSS and ShadCN UI components ensures a great experience on any device.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **API:** [lrclib.net](https://lrclib.net/docs)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks (`useState`, `useEffect`)
- **Linting & Formatting:** ESLint & Prettier (via Next.js defaults)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CloudSnapManage/lyricland.git
   cd lyricland
   ```

2. **Install NPM packages:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
