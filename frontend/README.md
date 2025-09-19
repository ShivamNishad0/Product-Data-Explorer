# Product Data Explorer - Frontend

Frontend application for the Product Data Explorer, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features
- Modern React application with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive design
- Integration with backend API for product data

## Prerequisites
- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables by creating a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

## Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Mode
```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
└── components/            # Reusable components (if any)
```

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Styling

This project uses Tailwind CSS for styling. The global styles are defined in `src/app/globals.css`.

## API Integration

The frontend communicates with the backend API through the `NEXT_PUBLIC_API_URL` environment variable. Make sure the backend is running and accessible.

## Development

- The application auto-reloads during development
- TypeScript provides type checking
- ESLint helps maintain code quality

## Deployment

### Vercel (Recommended)
The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy

### Other Platforms
This is a standard Next.js application that can be deployed to any platform supporting Node.js applications.

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Test your changes in development mode
4. Ensure the build passes before submitting a pull request

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework.

## License

This project is licensed under the MIT License.
