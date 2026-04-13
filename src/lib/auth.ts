import NextAuth, { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/helpers/dbConnect';
import User from '@/model/User';
import { signInSchema } from '@/schemas/auth';

const ADMIN_EMAIL = 'root@gmail.com';
const ADMIN_PASSWORD = '12345678';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedFields = signInSchema.safeParse(credentials);

        if (!validatedFields.success) {
          throw new Error('Invalid credentials');
        }

        const email = validatedFields.data.email.trim().toLowerCase();
        const { password } = validatedFields.data;

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return {
            id: 'admin',
            email: ADMIN_EMAIL,
            name: 'Admin',
            role: 'admin',
          };
        }

        await dbConnect();
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
          throw new Error('No account found with this email. Please sign up first.');
        }

        if (!user.password) {
          throw new Error('This account uses Google sign-in. Please use Google to log in.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: 'user',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.email === ADMIN_EMAIL) {
        user.role = 'admin';
        return true;
      }

      if (account?.provider === 'google') {
        await dbConnect();

        const email = user.email?.trim().toLowerCase();
        if (!email) return false;

        try {
          // Find existing user by email
          let dbUser = await User.findOne({ email });

          if (!dbUser) {
            // Create new user for Google OAuth
            dbUser = await User.create({
              email,
              name: user.name || profile?.name || undefined,
              image: user.image || profile?.picture || undefined,
              emailVerified: new Date(),
            });
          } else {
            // Update existing user's name and image if they changed
            if (user.name && !dbUser.name) {
              dbUser.name = user.name;
            }
            if (user.image && !dbUser.image) {
              dbUser.image = user.image;
            }
            if (!dbUser.emailVerified) {
              dbUser.emailVerified = new Date();
            }
            await dbUser.save();
          }

          // Attach database user ID to the user object
          user.id = dbUser._id.toString();
          user.role = 'user';
          return true;
        } catch (error) {
          console.error('Google OAuth signIn error:', error);
          return false;
        }
      }

      // For credentials auth
      await dbConnect();
      const dbUser = await User.findById(user.id);

      if (!dbUser) {
        return false;
      }

      user.role = 'user';
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      if (!token.role) {
        token.role = token.email === ADMIN_EMAIL ? 'admin' : 'user';
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      try {
        const nextUrl = new URL(url);

        if (nextUrl.origin === baseUrl) {
          return nextUrl.toString();
        }
      } catch {
        return baseUrl;
      }

      return baseUrl;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin';

        if (token.role === 'user' && token.id) {
          try {
            await dbConnect();
            const currentUser = await User.findById(token.id).select('name image');

            if (currentUser) {
              session.user.name = currentUser.name;
              session.user.image = currentUser.image;
            }
          } catch (error) {
            console.error('Session sync error:', error);
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
