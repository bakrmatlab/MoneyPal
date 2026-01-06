import { cn } from '@/lib/utils';
import { Main } from '@/components/layout/main';
import { AppHeader } from './app-header';

interface PageTemplateProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    className?: string;
    fixed?: boolean;
}

export function PageTemplate({ children, className, fixed }: PageTemplateProps) {
    return (
        <>
            <AppHeader fixed={fixed} />
            <Main className={cn('h-[calc(100vh-64px)]', className)}>{children}</Main>
        </>
    );
}
