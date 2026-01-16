import { createFileRoute } from '@tanstack/react-router';
import { PreferencesSettings } from '@/features/settings';

export const Route = createFileRoute('/_authenticated/preferences')({
    component: PreferencesPage,
});

function PreferencesPage() {
    return <PreferencesSettings />;
}
