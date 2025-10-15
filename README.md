# Yummy Restaurant App

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Firebase SDK (Firestore) Setup

The project includes a small SDK layer in `src/lib/` that writes/reads data directly from Firebase (no LocalStorage persistence). Files added:

- `src/lib/firebase.ts`: Initialize Firebase App, Firestore, Auth, Storage
- `src/lib/firestore.service.ts`: Generic CRUD service with `serverTimestamp`
- `src/lib/menu.service.ts`, `src/lib/order.service.ts`, `src/lib/feedback.service.ts`, `src/lib/reservation.service.ts`
- `src/lib/types.ts`: Shared TypeScript types
- `src/lib/sdk.ts`: Re-exports for convenient imports

Create `.env.local` at the project root and populate with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Example usage in a client component:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { menuService, type MenuItem } from '@/lib/sdk';

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  useEffect(() => {
    menuService.listAvailable().then(setItems);
  }, []);
  return (
    <ul>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>
  );
}
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Quick migrate (Option 1)

If your localStorage data lives on a different port and you want to move it here:

- Go to Admin → Migrate at `/admin/migrate`
- Follow the on-screen steps to Export from the old port and Import to the new port

More details in `MIGRATE-GUIDE.md` (Phương án 1).

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
