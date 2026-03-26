// @ts-check
import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { getSessionUser } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const subscription = await request.json();

        await query(
            `INSERT INTO push_subscriptions (employee_id, subscription)
       VALUES ($1, $2)
       ON CONFLICT (employee_id) DO UPDATE SET subscription = $2`,
            [user.id, JSON.stringify(subscription)]
        );

        return NextResponse.json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}