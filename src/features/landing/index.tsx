import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useConvexAuth } from '@convex-dev/react-query';
import { ArrowRight, Blocks, Fan, LayoutDashboard, Shield, Sparkles, Zap } from 'lucide-react';
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

    return (
        <>
            {/* Floating Header */}
            <header className='fixed top-0 z-50 w-full px-2 py-3 md:px-4 md:py-4'>
                <div
                    className={cn(
                        'mx-auto flex max-w-5xl items-center justify-between rounded-2xl px-3 py-2 transition-all duration-300 md:px-4',
                        scrolled ? 'bg-background/80 border shadow-lg backdrop-blur-xl' : 'bg-transparent'
                    )}>
                    <Link to='/' className='flex items-center gap-2 transition-opacity hover:opacity-80 md:gap-2.5'>
                        <div className='bg-primary flex size-7 items-center justify-center rounded-lg md:size-8'>
                            <Fan className='text-primary-foreground size-3.5 md:size-4' />
                        </div>
                        <span className='text-base font-semibold tracking-tight md:text-lg'>Money-Pal</span>
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
                                <Button size='sm' asChild className='text-xs md:text-sm'>
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
                                <Button size='sm' asChild className='text-xs md:text-sm'>
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
                    {/* Background Pattern */}
                    <div className='absolute inset-0 -z-10'>
                        <div className='from-secondary/30 via-background to-primary/5 absolute inset-0 bg-linear-to-br' />
                        <div className='bg-primary/10 absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-3xl' />
                        <div className='bg-secondary/40 absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full blur-3xl' />
                        {/* Grid Pattern */}
                        <div
                            className='absolute inset-0 opacity-[0.015] dark:opacity-[0.03]'
                            style={{
                                backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                                backgroundSize: '64px 64px',
                            }}
                        />
                    </div>

                    <div className='container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center md:py-24'>
                        <Badge
                            variant='secondary'
                            className='animate-fade-in mb-6 gap-2 px-4 py-1.5 text-sm font-medium'
                            style={{ animationDelay: '0ms', animationFillMode: 'backwards' }}>
                            <span className='relative flex size-2'>
                                <span className='bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75' />
                                <span className='bg-primary relative inline-flex size-2 rounded-full' />
                            </span>
                            Real-time wallet synchronization
                        </Badge>

                        <h1
                            className='animate-fade-in mb-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl xl:text-7xl'
                            style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
                            Your personal <span className='from-primary via-primary to-secondary bg-linear-to-r bg-clip-text text-transparent'>finance</span>{' '}
                            companion
                        </h1>

                        <p
                            className='animate-fade-in text-muted-foreground mb-6 max-w-2xl text-sm sm:text-base md:mb-10 md:text-lg'
                            style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
                            Manage multiple wallets, track expenses, set budgets, and gain insights into your spending habits. Take control of your money with
                            real-time synchronization.
                        </p>

                        <div
                            className='animate-fade-in flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4'
                            style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
                            <Button size='lg' asChild className='w-full gap-2 px-6 sm:w-auto md:px-8'>
                                <Link to={isAuthenticated ? '/dashboard' : '/sign-up'}>
                                    {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                                    <ArrowRight className='size-4' />
                                </Link>
                            </Button>
                            <Button size='lg' variant='outline' asChild className='w-full sm:w-auto'>
                                <a href='https://github.com/bakrmatlab/MoneyPal' target='_blank' rel='noopener noreferrer' aria-label='View on GitHub'>
                                    View on GitHub
                                </a>
                            </Button>
                        </div>

                        {/* Floating Elements */}
                        <div className='animate-fade-in mt-10 w-full md:mt-16' style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
                            <div className='relative mx-auto max-w-3xl px-4'>
                                <div className='from-primary/20 via-secondary/20 to-primary/20 absolute -inset-2 rounded-2xl bg-linear-to-r blur-2xl md:-inset-4' />
                                <Card className='bg-card/80 relative border-2 backdrop-blur-sm'>
                                    <CardContent className='p-4 md:p-6'>
                                        <pre className='overflow-x-auto text-left text-xs sm:text-sm'>
                                            <code className='text-muted-foreground'>
                                                <span className='text-primary'>$</span> Create your first wallet
                                                <br />
                                                <span className='text-primary'>$</span> Track deposits & withdrawals
                                                <br />
                                                <span className='text-green-600 dark:text-green-400'>✓ Real-time balance updates</span>
                                            </code>
                                        </pre>
                                    </CardContent>
                                </Card>
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
                            <h2 className='mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:mb-4 md:text-4xl'>Everything you need to manage your money</h2>
                            <p className='text-muted-foreground mx-auto max-w-2xl text-sm md:text-base'>
                                Powerful features designed to give you complete control over your finances, from simple tracking to advanced budgeting.
                            </p>
                        </div>

                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                            {features.map((feature, index) => (
                                <Card
                                    key={feature.title}
                                    className='group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                    }}>
                                    <div className='from-primary/5 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                                    <CardHeader>
                                        <div className='bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-2 flex size-12 items-center justify-center rounded-lg transition-colors'>
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
                                    <div className='text-primary mb-1 text-2xl font-bold sm:text-3xl md:mb-2 md:text-4xl lg:text-5xl'>{stat.value}</div>
                                    <div className='text-muted-foreground text-xs md:text-sm'>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className='bg-muted/30 border-t py-12 md:py-24'>
                    <div className='container mx-auto px-4 text-center'>
                        <h2 className='mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:mb-4 md:text-4xl'>Ready to take control of your finances?</h2>
                        <p className='text-muted-foreground mx-auto mb-6 max-w-xl text-sm md:mb-8 md:text-base'>
                            Join Money-Pal today and start managing your money smarter. Create unlimited wallets, track every transaction, and achieve your
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
                            <Fan className='size-4' />
                            <span className='text-sm font-medium'>Money-Pal</span>
                        </div>
                        <p className='text-muted-foreground text-sm'>© {new Date().getFullYear()} Money-Pal. All rights reserved.</p>
                    </div>
                </footer>
            </Main>
        </>
    );
}
