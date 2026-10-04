import { Button } from '@/components/ui/button';

export function MaintenanceError() {
    return (
        <div className='min-h-svh'>
            <div className='m-auto flex min-h-svh w-full flex-col items-center justify-center gap-3 px-4 py-10'>
                <h1 className='text-primary font-mono text-7xl leading-tight font-medium sm:text-9xl'>503</h1>
                <span className='font-medium'>Website is under maintenance!</span>
                <p className='text-muted-foreground text-center'>
                    The site is not available at the moment. <br />
                    We'll be back online shortly.
                </p>
                <div className='mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center'>
                    <Button className='min-h-11 rounded-sm' variant='outline'>
                        Learn more
                    </Button>
                </div>
            </div>
        </div>
    );
}
