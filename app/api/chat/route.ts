import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const result = await query(
            `SELECT gm.id, gm.message, gm.sender_name, gm.mentions, gm.created_at,
              gm.sender_id = $1 as is_mine
       FROM group_messages gm
       ORDER BY gm.created_at DESC
       LIMIT 100`,
            [user.id]
        );

        return NextResponse.json({ messages: result.rows.reverse() });
    } catch (error: unknown) {
        console.error('Chat GET error:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { message } = await request.json();
        if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

        const mentionNames = [...message.matchAll(/@(\w+)/g)].map((m: RegExpMatchArray) => m[1].toLowerCase());
        let mentionIds: number[] = [];
        if (mentionNames.length > 0) {
            const mentioned = await query<{ id: number }>(
                `SELECT id FROM employees WHERE LOWER(name) LIKE ANY($1)`,
                [mentionNames.map((n: string) => `%${n}%`)]
            );
            mentionIds = mentioned.rows.map((r) => r.id);
        }

        const result = await query(
            'INSERT INTO group_messages (sender_id, sender_name, message, mentions) VALUES ($1, $2, $3, $4) RETURNING *',
            [user.id, user.name, message.trim(), mentionIds]
        );

        return NextResponse.json({ message: result.rows[0] });
    } catch (error: unknown) {
        console.error('Chat POST error:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getSessionUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const adminCheck = await query<{ role: string }>('SELECT role FROM employees WHERE id = $1', [user.id]);
        if (adminCheck.rows[0]?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await request.json();
        await query('DELETE FROM group_messages WHERE id = $1', [id]);
        return NextResponse.json({ message: 'Message deleted' });
    } catch (error: unknown) {
        console.error('Chat DELETE error:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}