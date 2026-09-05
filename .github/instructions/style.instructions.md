---
description: 'Tailwind CSS v4 styling patterns and dark theme guidelines'
applyTo: '**/*.{astro,css}'
---

# Tailwind CSS Instructions

## Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4.1.14 via the `@tailwindcss/vite` plugin.

### Global CSS Setup

- Import Tailwind in `global.css`: `@import "tailwindcss";`
- No separate `tailwind.config.js` file is used
- Configuration is handled through the Vite plugin

## Dark Theme Styling

ALL UI components MUST use dark theme colors:

### Color Palette

- Background colors: `bg-slate-800`, `bg-slate-900`, `bg-slate-950`
- Text colors: `text-slate-100`, `text-slate-200`, `text-slate-300`
- Border colors: `border-slate-700`, `border-slate-600`
- Accent colors for hover/focus states

### Common Patterns

- Cards and containers: `bg-slate-800 rounded-xl p-6 shadow-lg`
- Hover effects: `hover:bg-slate-700 transition-colors duration-200`
- Borders: `border border-slate-700`
- Gradients for visual interest: `bg-gradient-to-br from-slate-800 to-slate-900`
- Backdrop effects: `backdrop-blur-sm bg-slate-900/50`

### Responsive Design

- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Mobile-first approach
- Ensure readability on all screen sizes

## Utility Classes

- Prefer utility classes over custom CSS when possible
- Use semantic grouping: layout, spacing, colors, typography
- Keep utility combinations readable and maintainable

## Commenting and TypeScript style

Write comments that explain intent, not mechanics. A comment should tell a future maintainer why a decision exists or what edge case it handles; it should not repeat the code in prose.

Good:

```ts
// Keep the title ordering stable so the generated static pages remain deterministic.
const sorted = [...games].sort((a, b) => a.title.localeCompare(b.title));
```

Avoid:

```ts
// Sort the games by title.
const sorted = [...games].sort((a, b) => a.title.localeCompare(b.title));
```

TypeScript rules for this repo:

- Prefer explicit parameter and return types for exported functions in `db/` and `src/lib/`.
- Keep interfaces and types in the same file as their consuming component or helper when practical.
- Avoid `any` unless there is a narrow, justified reason; prefer the most specific type available.
- Keep formatting consistent with the project: semicolons, trailing commas, and readable multiline signatures.

The repo's ESLint config already enforces `@typescript-eslint/no-unused-vars`, and future rule additions should continue to prefer editor feedback over noisy comment policing.

## Modern UI Patterns

- Rounded corners: `rounded-lg`, `rounded-xl`, `rounded-2xl`
- Smooth transitions: `transition-all duration-200 ease-in-out`
- Shadows for depth: `shadow-md`, `shadow-lg`, `shadow-xl`
- Focus states for accessibility: `focus:ring-2 focus:ring-blue-500`
