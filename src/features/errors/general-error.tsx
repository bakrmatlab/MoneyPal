import { useNavigate, useRouter } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
    minimal?: boolean;
};

export function GeneralError({ className, minimal = false }: GeneralErrorProps) {
    const navigate = useNavigate();
    const { history } = useRouter();
    return (
        <div className={cn('min-h-svh w-full', className)}>
            <div className='m-auto flex min-h-svh w-full flex-col items-center justify-center gap-3 px-4 py-10'>
                {!minimal && <h1 className='text-primary font-mono text-7xl leading-tight font-medium sm:text-9xl'>500</h1>}
                <span className='font-medium'>Oops! Something went wrong {`:')`}</span>
                <p className='text-muted-foreground text-center'>
                    We apologize for the inconvenience. <br /> Please try again later.
                </p>
                {!minimal && (
                    <div className='mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center'>
                        <Button className='min-h-11 rounded-sm' variant='outline' onClick={() => history.go(-1)}>
                            Go Back
                        </Button>
                        <Button className='min-h-11 rounded-sm' onClick={() => navigate({ to: '/' })}>
                            Back to Home
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
