import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { ThemeSwitch } from '@/components/theme-switch';

export function AuthPresentation({ children }: { children: ReactNode }) {
    return (
        <div className='bg-background min-h-svh'>
            <header className='flex items-center justify-between border-b px-4 py-4 sm:px-8'>
                <Link to='/' className='flex min-h-11 items-center gap-2 font-semibold'>
                    <span className='bg-brand text-brand-foreground flex size-8 items-center justify-center'>
                        <ArrowUpRight className='size-4' />
                    </span>
                    MoneyPal
                </Link>
                <ThemeSwitch />
            </header>
            <main className='mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-20'>
                <div className='space-y-4'>
                    <p className='text-muted-foreground font-mono text-xs tracking-widest uppercase'>Your money, in focus.</p>
                    <h1 className='text-3xl font-semibold tracking-tight sm:text-5xl'>A clearer view of your finances.</h1>
                    <p className='text-muted-foreground max-w-sm'>Your wallets, transactions, and budgets, together in MoneyPal.</p>
                </div>
                <div className='flex min-w-0 justify-center'>{children}</div>
            </main>
        </div>
    );
}
