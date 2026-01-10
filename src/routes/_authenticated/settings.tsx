import { createFileRoute } from '@tanstack/react-router';
import { CategoriesSettings } from '@/features/settings/categories';

export const Route = createFileRoute('/_authenticated/settings')({
    component: SettingsPage,
});

function SettingsPage() {
    return (
        <div className='container mx-auto py-8'>
            <CategoriesSettings />
        </div>
    );
}
