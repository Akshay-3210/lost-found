import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || 'lost-found';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  compatibilityPromise: Promise<void> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null, compatibilityPromise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    await ensureDatabaseCompatibility(cached.conn);
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
    }).then((mongoose) => {
      return mongoose;
    }).catch((error) => {
      cached.promise = null;
      throw error;
    });
  }

  cached.conn = await cached.promise;
  await ensureDatabaseCompatibility(cached.conn);
  return cached.conn;
}

async function ensureDatabaseCompatibility(connection: typeof mongoose) {
  if (!cached.compatibilityPromise) {
    cached.compatibilityPromise = (async () => {
      const usersCollection = connection.connection.db?.collection('users');

      if (!usersCollection) {
        return;
      }

      try {
        const indexes = await usersCollection.indexes();
        const hasLegacyUsernameIndex = indexes.some((index) => index.name === 'username_1');

        if (hasLegacyUsernameIndex) {
          await usersCollection.dropIndex('username_1');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        const isSafeToIgnore =
          typeof error === 'object' &&
          error !== null &&
          'codeName' in error &&
          error.codeName === 'NamespaceNotFound';

        if (!isSafeToIgnore && !message.includes('ns does not exist')) {
          throw error;
        }
      }
    })().catch((error) => {
      cached.compatibilityPromise = null;
      throw error;
    });
  }

  await cached.compatibilityPromise;
}
