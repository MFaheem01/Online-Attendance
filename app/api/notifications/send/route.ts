import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import webpush from 'web-push';

webpush.setVapidDetails(
    'mailto:' + process.env.SMTP_USER,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Get all subscriptions except sender
        const result = await query<{ employee_id: string; subscription: string }>(
            'SELECT employee_id, subscription FROM push_subscriptions WHERE employee_id != $1',
            [user.id]
        );

        const payload = JSON.stringify({
            title: `${user.name} in Group Chat`,
            body: message.length > 60 ? message.substring(0, 60) + '...' : message,
        });

        const sendPromises = result.rows.map(async (row) => {
            try {
                const sub = JSON.parse(row.subscription);
                await webpush.sendNotification(sub, payload);
            } catch (err: any) {
                // Remove invalid subscriptions (410 Gone or 404 Not Found)
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log(`Removing expired subscription for employee: ${row.employee_id}`);
                    await query('DELETE FROM push_subscriptions WHERE employee_id = $1', [row.employee_id]);
                } else {
                    console.error('Failed to send notification:', err.message || err);
                }
            }
        });

        await Promise.all(sendPromises);

        return NextResponse.json({ message: 'Notifications sent' });
    } catch (error: unknown) {
        console.error('Send notification error:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}