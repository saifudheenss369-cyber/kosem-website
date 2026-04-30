
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

async function isAdmin() {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return false;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        return decoded.role === 'ADMIN';
    } catch (err) { return false; }
}

export async function GET(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(expenses);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { amount, investorName, reason, date } = await req.json();

        const expense = await prisma.expense.create({
            data: {
                amount: parseFloat(amount),
                investorName,
                reason,
                date: new Date(date)
            }
        });

        await logAudit('CREATE_EXPENSE', `Logged expense: ${reason} (${amount})`, 1);

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
    }
}

export async function DELETE(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
        await prisma.expense.delete({ where: { id: parseInt(id) } });
        await logAudit('DELETE_EXPENSE', `Deleted expense ID: ${id}`, 1);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
