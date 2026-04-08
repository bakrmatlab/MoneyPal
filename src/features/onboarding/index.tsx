import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { api } from '@convex/_generated/api';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { getConvexErrorMessage } from '@/lib/convex-errors';
import { SpendingLimitStep } from './components/spending-limit-step';
import { WalletStep } from './components/wallet-step';
import { WelcomeStep } from './components/welcome-step';

const STEPS = ['welcome', 'wallet', 'spending-limit'] as const;
type Step = (typeof STEPS)[number];

function StepDots({ current }: { current: number }) {
    return (
        <div className='flex items-center gap-2'>
            {STEPS.map((_, i) => (
                <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-primary w-6' : i < current ? 'bg-primary/40 w-2' : 'bg-muted w-2'}`}
                />
            ))}
        </div>
    );
}

export function Onboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('welcome');
    const [isPending, setIsPending] = useState(false);

    const createWallet = useMutation(api.wallets.createWallet);
    const setBudget = useMutation(api.budgets.setBudget);
    const markOnboardingComplete = useMutation(api.users.markOnboardingComplete);

    const currentIndex = STEPS.indexOf(step);

    const finish = async (budget?: number) => {
        setIsPending(true);
        try {
            if (budget !== undefined) {
                await setBudget({ amount: budget });
            }
            await markOnboardingComplete();
            await navigate({ to: '/dashboard' });
        } catch (err) {
            toast.error(getConvexErrorMessage(err));
        } finally {
            setIsPending(false);
        }
    };

    const skip = async () => {
        setIsPending(true);
        try {
            await markOnboardingComplete();
            await navigate({ to: '/dashboard' });
        } catch (err) {
            toast.error(getConvexErrorMessage(err));
        } finally {
            setIsPending(false);
        }
    };

    const handleWalletNext = async ({ name, currency }: { name?: string; currency: string }) => {
        setIsPending(true);
        try {
            await createWallet({ name, currency });
            setStep('spending-limit');
        } catch (err) {
            toast.error(getConvexErrorMessage(err));
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className='bg-background flex min-h-screen items-center justify-center px-4 py-12'>
            <div className='w-full max-w-md'>
                <div className='mb-8 flex justify-center'>
                    <StepDots current={currentIndex} />
                </div>

                <div className='bg-card border-border rounded-2xl border p-8 shadow-sm'>
                    {step === 'welcome' && (
                        <WelcomeStep onNext={() => setStep('wallet')} onSkip={skip} isSkipping={isPending} />
                    )}
                    {step === 'wallet' && (
                        <WalletStep onNext={handleWalletNext} onSkip={() => setStep('spending-limit')} isPending={isPending} />
                    )}
                    {step === 'spending-limit' && (
                        <SpendingLimitStep onFinish={finish} isPending={isPending} />
                    )}
                </div>

                <p className='text-muted-foreground mt-6 text-center text-xs'>You can update all of this later in Settings.</p>
            </div>
        </div>
    );
}
