import { Metadata } from 'next';
import Link from 'next/link';
import HeroSearch from '@/components/shared/HeroSearch';
import StatsBar from '@/components/shared/StatsBar';
import ItemList from '@/components/items/ItemList';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Lost & Found - Report and Find Lost Items',
  description: 'A community-driven platform to report and find lost items. Reunite people with their belongings.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <HeroSearch />

          <div className="flex justify-center gap-4 mt-8">
            <Button size="lg" asChild>
              <Link href="/items/new">Report an Item</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Items */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Recent Items
            </h2>
            <Link
              href="/search"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              View all &rarr;
            </Link>
          </div>
          <ItemList status="active" />
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

      {/* Features */}
      <section className="py-16 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white dark:text-zinc-900 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Report an Item
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Found something or lost something? Create a listing with details and photos.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white dark:text-zinc-900 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Browse Listings
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Search through listings to find items that match what you&apos;re looking for.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white dark:text-zinc-900 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Get Reunited
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Connect with the finder/owner and arrange to get the item back.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
