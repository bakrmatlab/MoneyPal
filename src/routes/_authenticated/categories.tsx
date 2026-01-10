import { createFileRoute } from '@tanstack/react-router';
import { CategoriesSettings } from '@/features/settings/categories';

export const Route = createFileRoute('/_authenticated/categories')({
    component: CategoriesPage,
});

function CategoriesPage() {
    return (
        <div className='container mx-auto py-8'>
            <CategoriesSettings />
        </div>
    );
}
