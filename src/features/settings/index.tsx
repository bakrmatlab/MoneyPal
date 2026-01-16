import { PreferencesForm } from './components/preferences-form';

export const PreferencesSettings = () => {
    return (
        <div className='container mx-auto px-4 py-6 pb-6'>
            {/* Header Section */}
            <div className='mb-6'>
                <h2 className='text-2xl font-bold'>Preferences</h2>
                <p className='text-muted-foreground'>Customize your Money-Pal experience</p>
            </div>

            {/* Preferences Form */}
            <PreferencesForm />
        </div>
    );
};
