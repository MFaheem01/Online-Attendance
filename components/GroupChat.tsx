'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
    id: number;
    message: string;
    sender_name: string;
    is_mine: boolean;
    mentions: number[];
    created_at: string;
}

interface GroupChatProps {
    isAdmin?: boolean;
}

export function GroupChat({ isAdmin = false }: GroupChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [notifPermission, setNotifPermission] = useState<string>('default');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        registerServiceWorker();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const registerServiceWorker = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            const permission = await Notification.requestPermission();
            setNotifPermission(permission);

            if (permission === 'granted') {
                const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });

                await fetch('/api/notifications/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sub),
                });
            }
        } catch (err) {
            console.error('Service worker error:', err);
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/chat');
            const data = await res.json();
            if (data.messages) setMessages(data.messages);
        } catch { }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage }),
            });
            const data = await res.json();
            if (res.ok) {
                // Send push notification to others
                await fetch('/api/notifications/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        senderName: data.message.sender_name,
                        message: newMessage,
                    }),
                });
                setNewMessage('');
                await fetchMessages();
            }
        } catch { }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this message?')) return;
        await fetch('/api/chat', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        setMessages(messages.filter(m => m.id !== id));
    };

    const formatMessage = (text: string) => {
        return text.replace(/@(\w+)/g, '<span class="font-semibold text-blue-300">@$1</span>');
    };

    return (
        <Card className="p-4 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-slate-900">💬 Group Chat</h2>
                <div className="flex items-center gap-2">
                    {notifPermission !== 'granted' && (
                        <button
                            onClick={registerServiceWorker}
                            className="text-xs text-blue-500 hover:underline"
                        >
                            🔔 Enable Notifications
                        </button>
                    )}
                    {notifPermission === 'granted' && (
                        <span className="text-xs text-green-500">🔔 Notifications On</span>
                    )}
                    <span className="text-xs text-slate-400">Use @name to mention</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
                {messages.length === 0 && (
                    <p className="text-center text-slate-400 text-sm mt-8">No messages yet</p>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${msg.is_mine
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                            }`}>
                            {!msg.is_mine && (
                                <p className="font-semibold text-xs mb-1 text-blue-500">{msg.sender_name}</p>
                            )}
                            <p dangerouslySetInnerHTML={{ __html: formatMessage(msg.message) }} />
                            <div className="flex items-center justify-between gap-2 mt-1">
                                <span className={`text-xs ${msg.is_mine ? 'text-blue-200' : 'text-slate-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isAdmin && (
                                    <button onClick={() => handleDelete(msg.id)} className="text-xs text-red-400 hover:text-red-600">
                                        🗑
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message... use @name to mention"
                    className="flex-1"
                />
                <Button onClick={handleSend} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? '...' : 'Send'}
                </Button>
            </div>
        </Card>
    );
}