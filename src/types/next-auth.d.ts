import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      role: 'user' | 'admin';
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: 'user' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'user' | 'admin';
  }
}
