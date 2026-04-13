import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface ReceivedMessage {
  _id: string;
  senderId: string;
  senderName?: string;
  senderEmail: string;
  message: string;
  createdAt: string;
}

interface ReceivedMessagesProps {
  messages: ReceivedMessage[];
}

export default function ReceivedMessages({ messages }: ReceivedMessagesProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Inbox</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No messages yet from other users.
          </p>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {message.senderName || 'Lost & Found User'}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{message.senderEmail}</p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                {message.message}
              </p>
              <a
                href={`/chat/${message.senderId}`}
                className="mt-3 inline-flex text-sm font-medium text-zinc-900 hover:underline dark:text-white"
              >
                Open chat
              </a>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
