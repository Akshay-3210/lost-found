// User types
export interface User {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  phone?: string;
  location?: string;
  bio?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Item types
export type ItemType = 'lost' | 'found';

export type ItemStatus = 'active' | 'resolved' | 'claimed';

export interface Item {
  _id: string;
  title: string;
  description: string;
  type: ItemType;
  status: ItemStatus;
  location?: string;
  date?: Date;
  images?: string[];
  contactInfo?: string;
  userId: string;
  claimedBy?: string;
  claimedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: 'user' | 'admin';
  };
  expires: string;
}
