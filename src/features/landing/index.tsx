import { useEffect, useState } from 'react';
import { Link, Navigate } from '@tanstack/react-router';
import { useConvexAuth } from '@convex-dev/react-query';
import { ArrowRight, Blocks, ArrowUpRight, LayoutDashboard, Shield, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';

const features = [
    {
        icon: Zap,
        title: 'Real-Time Sync',
        description: 'Instant updates across all your devices. See balance changes as they happen.',
    },
    {
        icon: Shield,
        title: 'Secure & Private',
        description: 'Bank-grade security with encrypted data. Your financial information stays protected.',
    },
    {
        icon: Blocks,
        title: 'Multiple Wallets',
        description: 'Create unlimited wallets for different purposes. Organize your money your way.',
    },
    {
        icon: Sparkles,
        title: 'Smart Insights',
        description: 'Track spending patterns and get actionable insights to improve your finances.',
    },
];

const stats = [
    { value: 'Multi', label: 'Wallet Support' },
    { value: 'Real-time', label: 'Updates' },
    { value: 'Secure', label: 'Encryption' },
    { value: 'Free', label: 'To Start' },
];

export function LandingPage() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isLoading && isAuthenticated) {
        return <Navigate to='/dashboard' />;
    }

    return (
        <>
            {/* Floating Header */}
            <header className='fixed top-0 z-50 w-full px-2 py-3 md:px-4 md:py-4'>
                <div
                    className={cn(
                        'mx-auto flex max-w-7xl items-center justify-between rounded-sm px-3 py-2 transition-all duration-300 md:px-4',
                        scrolled ? 'bg-background/95 border backdrop-blur-xl' : 'bg-background/80 border border-transparent'
                    )}>
                    <Link to='/' className='flex items-center gap-2 transition-opacity hover:opacity-80 md:gap-2.5'>
                        <div className='bg-brand flex size-7 items-center justify-center rounded-sm md:size-8'>
                            <ArrowUpRight className='text-brand-foreground size-3.5 md:size-4' />
                        </div>
                        <span className='text-base font-semibold tracking-tight md:text-lg'>MoneyPal</span>
                    </Link>
                    <nav className='flex items-center gap-1 md:gap-1.5'>
                        {isLoading ? (
                            <>
                                <Skeleton className='hidden size-9 rounded-md md:flex' />
                                <Skeleton className='h-8 w-16 rounded-md md:w-20' />
                                <Skeleton className='hidden h-8 w-20 rounded-md sm:flex md:w-24' />
                            </>
                        ) : isAuthenticated ? (
                            <>
                                <Button size='sm' asChild className='min-h-11 rounded-sm text-xs md:text-sm'>
                                    <Link to='/dashboard'>
                                        <LayoutDashboard className='size-3.5 md:size-4' />
                                        <span className='hidden sm:inline'>Dashboard</span>
                                    </Link>
                                </Button>
                                <ThemeSwitch />
                                <ProfileDropdown />
                            </>
                        ) : (
                            <>
                                <ThemeSwitch />
                                <Button variant='ghost' size='sm' asChild className='hidden text-xs sm:flex md:text-sm'>
                                    <Link to='/sign-in'>Sign In</Link>
                                </Button>
                                <Button size='sm' asChild className='min-h-11 rounded-sm text-xs md:text-sm'>
                                    <Link to='/sign-up'>Get Started</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <Main className='overflow-x-hidden p-0!'>
                {/* Hero Section */}
                <section className='relative min-h-screen overflow-hidden'>
                    <div aria-hidden='true' className='bg-muted/30 pointer-events-none absolute inset-x-0 bottom-0 h-1/3 border-t' />
                    <div className='container mx-auto flex min-h-screen flex-col items-start justify-center px-4 pt-32 pb-16 text-left md:pt-40 md:pb-24'>
                        <Badge variant='secondary' className='mb-6 gap-2 rounded-sm px-3 py-2 font-mono text-xs tracking-widest uppercase'>
                            <span className='relative flex size-2'>
                                <span className='bg-primary absolute inline-flex size-full rounded-full opacity-75' />
                                <span className='bg-primary relative inline-flex size-2 rounded-full' />
                            </span>
                            Real-time wallet synchronization
                        </Badge>

                        <h1 className='mb-4 max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl xl:text-7xl'>
                            Your money.
                            <br />
                            <span className='text-primary'>In focus.</span>
                        </h1>

                        <p className='text-muted-foreground mb-6 max-w-2xl text-sm sm:text-base md:mb-10 md:text-lg'>
                            Manage multiple wallets, track expenses, set budgets, and gain insights into your spending habits. Take control of your money with
                            real-time synchronization.
                        </p>

                        <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4'>
                            <Button
                                size='lg'
                                asChild
                                className='bg-brand text-brand-foreground hover:bg-brand/90 min-h-12 w-full gap-2 rounded-sm px-6 sm:w-auto md:px-8'>
                                <Link to={isAuthenticated ? '/dashboard' : '/sign-up'}>
                                    {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                                    <ArrowRight className='size-4' />
                                </Link>
                            </Button>
                            <Button size='lg' variant='outline' asChild className='min-h-12 w-full rounded-sm sm:w-auto'>
                                <a href='https://github.com/bakrmatlab/MoneyPal' target='_blank' rel='noopener noreferrer' aria-label='View on GitHub'>
                                    View on GitHub
                                </a>
                            </Button>
                        </div>

                        <div className='mt-10 grid w-full gap-0 border md:mt-16 md:grid-cols-[2fr_1fr]'>
                            <div className='bg-card p-6 sm:p-8'>
                                <p className='text-muted-foreground font-mono text-xs tracking-widest uppercase'>01 / Your overview</p>
                                <p className='mt-6 text-4xl font-medium tabular-nums sm:text-6xl'>$14,850</p>
                                <p className='text-muted-foreground mt-3 text-sm'>Illustrative total balance · 3 wallets</p>
                            </div>
                            <div className='bg-muted/50 space-y-4 border-t p-6 sm:p-8 md:border-t-0 md:border-l'>
                                <p className='text-muted-foreground font-mono text-xs tracking-widest uppercase'>02 / Organized your way</p>
                                {['Everyday', 'Savings', 'Travel'].map((name) => (
                                    <div key={name} className='flex items-center justify-between border-b pb-3'>
                                        <span>{name}</span>
                                        <ArrowUpRight className='text-primary size-4' aria-hidden='true' />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className='bg-muted/30 border-t py-12 md:py-24'>
                    <div className='container mx-auto px-4'>
                        <div className='mb-10 text-center md:mb-16'>
                            <Badge variant='outline' className='mb-4'>
                                Features
                            </Badge>
                            <h2 className='mb-3 text-2xl font-semibold tracking-tight sm:text-3xl md:mb-4 md:text-4xl'>
                                Everything you need to manage your money
                            </h2>
                            <p className='text-muted-foreground mx-auto max-w-2xl text-sm md:text-base'>
                                Powerful features designed to give you complete control over your finances, from simple tracking to advanced budgeting.
                            </p>
                        </div>

                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                            {features.map((feature) => (
                                <Card key={feature.title} className='group relative min-w-0 overflow-hidden rounded-sm shadow-none'>
                                    <div className='from-primary/5 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                                    <CardHeader>
                                        <div className='bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-2 flex size-12 items-center justify-center rounded-sm transition-colors'>
                                            <feature.icon className='size-6' />
                                        </div>
                                        <CardTitle className='text-lg'>{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className='text-sm'>{feature.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className='border-t py-12 md:py-24'>
                    <div className='container mx-auto px-4'>
                        <div className='grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8'>
                            {stats.map((stat) => (
                                <div key={stat.label} className='text-center'>
                                    <div className='text-primary mb-1 text-2xl font-semibold sm:text-3xl md:mb-2 md:text-4xl lg:text-5xl'>{stat.value}</div>
                                    <div className='text-muted-foreground min-h-11 rounded-sm text-xs md:text-sm'>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className='bg-muted/30 border-t py-12 md:py-24'>
                    <div className='container mx-auto px-4 text-center'>
                        <h2 className='mb-3 text-2xl font-semibold tracking-tight sm:text-3xl md:mb-4 md:text-4xl'>Ready to take control of your finances?</h2>
                        <p className='text-muted-foreground mx-auto mb-6 max-w-xl text-sm md:mb-8 md:text-base'>
                            Join MoneyPal today and start managing your money smarter. Create unlimited wallets, track every transaction, and achieve your
                            financial goals.
                        </p>
                        <div className='flex flex-col justify-center gap-3 sm:flex-row md:gap-4'>
                            <Button size='lg' asChild className='w-full gap-2 sm:w-auto'>
                                <Link to={isAuthenticated ? '/dashboard' : '/sign-up'}>
                                    {isAuthenticated ? 'Go to Dashboard' : 'Start Managing Your Money'}
                                    <ArrowRight className='size-4' />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className='border-t py-8'>
                    <div className='container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row'>
                        <div className='flex items-center gap-2'>
                            <ArrowUpRight className='size-4' />
                            <span className='text-sm font-medium'>MoneyPal</span>
                        </div>
                        <p className='text-muted-foreground text-sm'>© {new Date().getFullYear()} MoneyPal. All rights reserved.</p>
                    </div>
                </footer>
            </Main>
        </>
    );
}
