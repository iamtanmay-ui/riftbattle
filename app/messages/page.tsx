"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Send, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: number;
  text: string;
  sender_id: number;
  receiver_id: number;
  date: number;
}

interface Chat {
  id: number;
  order_id: number;
  product_name: string;
  seller_name: string;
  last_message: string;
  last_message_time: number;
  unread_count: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [selectedChat, setSelectedChat] = useState<number | null>(
    searchParams?.get('order') ? parseInt(searchParams.get('order')!, 10) : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages periodically
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/user/messages?seller_id=${selectedChat}`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to fetch messages');
        setLoading(false);
      }
    };

    fetchMessages(); // Initial fetch
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [selectedChat]);

  // Fetch chats list
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/user/messages?filter=chats');
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast.error('Failed to fetch chats');
      }
    };

    fetchChats();
    const interval = setInterval(fetchChats, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch('/api/user/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          receiver_id: selectedChat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      // Message sent successfully, the next poll will update the messages
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday ? format(date, 'h:mm a') : format(date, 'MMM d, h:mm a');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-8 text-gray-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat List */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
            {chats.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-4">
                  <p className="text-gray-400">No conversations yet</p>
                </CardContent>
              </Card>
            ) : (
              chats.map((chat) => (
                <Card 
                  key={chat.id}
                  className={`bg-slate-800/50 border-slate-700/50 cursor-pointer transition-colors hover:border-blue-500/50 ${
                    selectedChat === chat.order_id ? 'border-blue-500/50' : ''
                  }`}
                  onClick={() => setSelectedChat(chat.order_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{chat.product_name}</h3>
                        <p className="text-sm text-gray-400">{chat.seller_name}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.last_message_time)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">{chat.last_message}</p>
                    {chat.unread_count > 0 && (
                      <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {chat.unread_count} new
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700/50 h-[600px] flex flex-col">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle>
                  {selectedChat ? (
                    chats.find(chat => chat.order_id === selectedChat)?.product_name || 'Loading...'
                  ) : (
                    'Select a conversation'
                  )}
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender_id === user.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700/50 text-white'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              {selectedChat && (
                <div className="p-4 border-t border-slate-700/50">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-slate-700/50 border-slate-600"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}