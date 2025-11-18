# AI Chat Standalone

A modern, standalone AI chat application built with React, TypeScript, and Vite. Features real-time streaming responses, multiple chat sessions, location awareness, and beautiful light/dark themes.

## Features

- 🚀 **Real-time Streaming** - SSE-based streaming for live AI responses
- 💬 **Multiple Sessions** - Create and manage multiple concurrent chats
- 📝 **Markdown Support** - Beautiful markdown rendering with code highlighting
- 📍 **Location Aware** - Browser geolocation with IP-based fallback
- 💾 **Local Persistence** - 5-day chat history retention
- 🎨 **Theme Support** - Light and dark themes with smooth transitions
- 🔒 **Privacy First** - All data stored locally
- 📱 **Responsive Design** - Works on desktop and mobile

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to S3
npm run deploy
```

## Documentation

- **[CHAT_GUIDE.md](./CHAT_GUIDE.md)** - Complete guide to the chat application
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - S3 deployment instructions

## API Configuration

**Default Server**: `https://example.com/v1/chat`

Override via URL parameter:
```
https://your-app.com/?server=https://custom-api.com/v1/chat
```

See [CHAT_GUIDE.md](./CHAT_GUIDE.md) for full API details.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Markdown** - Markdown rendering
- **@microsoft/fetch-event-source** - SSE streaming

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
