# Lost & Found

A community-driven Lost & Found web app built with Next.js, React, MongoDB, NextAuth, and Tailwind CSS.

Users can report lost/found items, manage their profile, browse other users, chat with each other, and track messages. Admins can moderate item records and manage user profiles from a dedicated admin panel.

## Features

- User authentication with:
  - Email/password sign up and sign in
  - Google sign in
- User profile management:
  - Profile image upload
  - Name, phone, location, and bio
- Lost & found item management:
  - Create lost and found item reports
  - Browse recent items
  - Search listings
  - Manage your own reported items
- User directory:
  - Browse other public user profiles
  - Open public user profile pages
- Messaging and chat:
  - Start a chat with another signed-in user
  - Track conversation history
  - Delete your own sent messages
- Admin tools:
  - View and moderate all items
  - Change item type
  - Mark items active/resolved
  - Record `claimed by` name when resolving an item
  - Open admin user view
  - Remove user profiles from Atlas

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- MongoDB + Mongoose
- NextAuth v5 beta
- Tailwind CSS 4
- Zod
- Cloudinary

## Project Structure

```text
src/
  app/
    (app)/
    admin/
    api/
  components/
    admin/
    auth/
    items/
    profile/
    shared/
    ui/
    users/
  helpers/
  lib/
  model/
  schemas/
  types/
```

## Environment Variables

Create `.env.local` and add the required values.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
DB_NAME=lost-found

NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RESEND_API_KEY=your_resend_api_key
```

You can also use `.env.sample` as a starting point.

For production, set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your real deployed domain, not `localhost`.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Add your environment variables in `.env.local`.

3. Start the development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Admin Access

The app currently uses hardcoded admin credentials in [src/lib/auth.ts](src/lib/auth.ts):

```ts
const ADMIN_EMAIL = 'root@gmail.com';
const ADMIN_PASSWORD = '12345678';
```

Before deploying publicly, change these values to something secure or move them to environment variables.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Recommended Pre-Deploy Checklist

- Replace the hardcoded admin credentials with secure values
- Confirm MongoDB Atlas network access is configured for your hosting platform
- Confirm Google OAuth redirect URLs include your production domain
- Confirm Cloudinary credentials are valid
- Run lint locally:

```bash
npm run lint
```

- Run a production build locally:

```bash
npm run build
```

## Notes

- If you add new Mongoose fields during development, restarting the dev server is sometimes necessary because Next.js hot reload can keep older compiled models in memory.
- Admin user removal also cleans up related items and user messages.
- Only the sender can delete their own chat messages.

## License

Use this project however you like, or add your preferred license here.
