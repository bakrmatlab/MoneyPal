import { Loader2 } from 'lucide-react';

export const LoadingPage = () => {
    return (
        <div className='h-svh'>
            <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
                <Loader2 className='text-primary size-10 animate-spin' />
            </div>
        </div>
    );
};
