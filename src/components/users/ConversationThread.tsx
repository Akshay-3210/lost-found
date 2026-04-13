import ChatDeleteButton from '@/components/users/ChatDeleteButton';

interface ConversationMessage {
  _id: string;
  senderId: string;
  senderName?: string;
  senderEmail: string;
  recipientId: string;
  message: string;
  createdAt: string;
}

interface ConversationThreadProps {
  currentUserId: string;
  messages: ConversationMessage[];
}

export default function ConversationThread({ currentUserId, messages }: ConversationThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        No messages yet. Start the conversation below.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUserId;

        return (
          <div
            key={message._id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                isCurrentUser
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white'
              }`}
            >
              <p className={`text-xs font-medium ${isCurrentUser ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {isCurrentUser ? 'You' : message.senderName || message.senderEmail}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.message}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className={`text-[11px] ${isCurrentUser ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {new Date(message.createdAt).toLocaleString()}
                </p>
                {isCurrentUser && <ChatDeleteButton messageId={message._id} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
