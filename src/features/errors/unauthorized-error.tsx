import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export function UnauthorisedError() {
    const navigate = useNavigate();
    const { history } = useRouter();
    return (
        <div className='min-h-svh'>
            <div className='m-auto flex min-h-svh w-full flex-col items-center justify-center gap-3 px-4 py-10'>
                <h1 className='text-primary font-mono text-7xl leading-tight font-medium sm:text-9xl'>401</h1>
                <span className='font-medium'>Unauthorized Access</span>
                <p className='text-muted-foreground text-center'>
                    Please log in with the appropriate credentials <br /> to access this resource.
                </p>
                <div className='mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center'>
                    <Button className='min-h-11 rounded-sm' variant='outline' onClick={() => history.go(-1)}>
                        Go Back
                    </Button>
                    <Button className='min-h-11 rounded-sm' onClick={() => navigate({ to: '/' })}>
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
