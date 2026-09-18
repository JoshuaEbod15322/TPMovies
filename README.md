# TPMovies

<p align="center">
  <img src="public/ptflix-preview.png" alt="TPMovies preview" width="800"/>
</p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19"/></a>
  <a href="https://www.typescriptlang.org/docs/"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6"/></a>
  <a href="https://vitejs.dev/guide/"><img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8"/></a>
  <a href="https://tailwindcss.com/docs"><img src="https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"/></a>
  <a href="https://oxc.rs/docs/guide/usage/linter.html"><img src="https://img.shields.io/badge/Linter-Oxlint-FFB86C" alt="Oxlint"/></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"/></a>
</p>

TPMovies is a movie, TV series, anime, and Western catalog application built with React and TypeScript. The project relies on an external movie API for media information and offers browsing, search, detailed media pages, cast filmographies, season and episode navigation, continue watching functionality, trailers, and external video player sources.

## Tech Stack

- React 19 with React DOM
- TypeScript 6
- Vite 8 for development and production builds
- Tailwind CSS 4 for styling
- Motion for page and modal animations
- Lucide React for icons
- Local storage for continue watching progress
- Oxlint for linting

## Features

- Browse movies, TV series, anime, Westerns, and genres
- View details, ratings, descriptions, trailers, recommendations, and cast
- Open cast profiles and filter filmographies
- Watch movies and navigate TV or anime seasons and episodes
- Switch between configured external streaming sources
- Save and resume continue watching progress in the browser
- Responsive desktop and mobile layout
- Poster placeholders when images are unavailable or fail to load

## Getting Started

### Requirements

- Node.js 20 or newer
- npm

### Install and Run

```bash
npm install
npm run dev
```

Vite will print the local development URL, typically `http://localhost:5173`.

The application includes a fallback demo key, though using a personal key is recommended for reliable access. Private keys and secret credentials should never be committed to the repository.

### Gemini AI Recommendations

Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to a valid Gemini API key. The server loads this key with `dotenv`. A `VITE_` prefix should not be used, since that would expose the key in the browser bundle.

## Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the Vite development server        |
| `npm run build`   | Type-check and create a production build |
| `npm run lint`    | Run Oxlint                               |
| `npm run preview` | Preview the production build locally     |

## Project Structure

```text
src/
  components/   Reusable UI such as cards, navigation, players, and modals
  hooks/        Shared React hooks
  pages/        Home, catalog, details, search, and watch views
  services/     Movie, anime, streaming, and progress services
  types/        Shared TypeScript models
  utils/        Formatting and helper functions
public/         Static assets such as screenshots and icons
```

## Streaming Sources

Streaming URL builders are configured in [`src/services/streamingSources.ts`](src/services/streamingSources.ts). Each source defines movie and TV URL functions. TV and anime playback receives the media ID together with the season number and episode number.

Streaming sources should only be used when the underlying content is one the user is authorized to access and distribute. External providers may change their URLs or block iframe embedding at any time.

## Production Build

```bash
npm run build
npm run preview
```

The generated production files are placed in the `dist/` directory.

## License

This project is distributed under the MIT License.
