import { PreferencesForm } from './components/preferences-form';

export const PreferencesSettings = () => {
    return (
        <div className='container mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
            {/* Header Section */}
            <div className='mb-8'>
                <h1 className='text-3xl font-semibold tracking-tight'>Preferences</h1>
                <p className='text-muted-foreground mt-2 text-sm sm:text-base'>Set up MoneyPal to suit your routine.</p>
            </div>

            {/* Preferences Form */}
            <PreferencesForm />
        </div>
    );
};
