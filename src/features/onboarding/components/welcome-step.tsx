import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

type WelcomeStepProps = {
    onNext: () => void;
    onSkip: () => void;
    isSkipping: boolean;
};

export function WelcomeStep({ onNext, onSkip, isSkipping }: WelcomeStepProps) {
    return (
        <div className='flex flex-col items-center text-center'>
            <div className='bg-primary/10 ring-primary/20 mb-6 flex size-20 items-center justify-center rounded-2xl ring-4'>
                <Wallet className='text-primary size-10' />
            </div>
            <h1 className='mb-3 text-3xl font-bold tracking-tight'>Welcome to MoneyPal</h1>
            <p className='text-muted-foreground mb-8 max-w-sm text-base'>
                Your personal finance companion. Let's get you set up so you can start tracking your money.
            </p>
            <div className='flex w-full flex-col gap-3'>
                <Button size='lg' className='w-full' onClick={onNext}>
                    Get Started
                </Button>
                <Button variant='ghost' size='sm' onClick={onSkip} disabled={isSkipping}>
                    Skip setup
                </Button>
            </div>
        </div>
    );
}
