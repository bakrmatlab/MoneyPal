import { PreferencesForm } from './components/preferences-form';

export const PreferencesSettings = () => {
    return (
        <div className='container mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
            {/* Header Section */}
            <div className='mb-8'>
                <h2 className='text-2xl font-bold tracking-tight sm:text-3xl'>Preferences</h2>
                <p className='text-muted-foreground mt-2 text-sm sm:text-base'>Customize your Money-Pal experience</p>
            </div>

            {/* Preferences Form */}
            <PreferencesForm />
        </div>
    );
};
