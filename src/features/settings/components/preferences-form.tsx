import { useState, useEffect } from 'react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const TIMEZONES = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'America/New York (EST/EDT)' },
    { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
    { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
    { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT)' },
    { value: 'America/Toronto', label: 'America/Toronto' },
    { value: 'America/Mexico_City', label: 'America/Mexico City' },
    { value: 'America/Sao_Paulo', label: 'America/São Paulo' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
    { value: 'Europe/Rome', label: 'Europe/Rome (CET/CEST)' },
    { value: 'Europe/Madrid', label: 'Europe/Madrid (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
    { value: 'Asia/Hong_Kong', label: 'Asia/Hong Kong (HKT)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
    { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST/AEDT)' },
    { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT)' },
];

const LOCALES = [
    { value: 'en-US', label: 'English (United States)' },
    { value: 'en-GB', label: 'English (United Kingdom)' },
    { value: 'en-CA', label: 'English (Canada)' },
    { value: 'en-AU', label: 'English (Australia)' },
    { value: 'es-ES', label: 'Spanish (Spain)' },
    { value: 'es-MX', label: 'Spanish (Mexico)' },
    { value: 'fr-FR', label: 'French (France)' },
    { value: 'de-DE', label: 'German (Germany)' },
    { value: 'it-IT', label: 'Italian (Italy)' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)' },
    { value: 'ja-JP', label: 'Japanese (Japan)' },
    { value: 'zh-CN', label: 'Chinese (Simplified)' },
    { value: 'ko-KR', label: 'Korean (Korea)' },
    { value: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
    { value: 'hi-IN', label: 'Hindi (India)' },
];

export const PreferencesForm = () => {
    const preferences = useQuery(api.userPreferences.getMyPreferences, {});
    const wallets = useQuery(api.wallets.getMyWallets, {});
    const updatePreferences = useMutation(api.userPreferences.updatePreferences);

    const [isPending, setIsPending] = useState(false);
    const [formData, setFormData] = useState({
        timezone: 'UTC',
        defaultWalletId: undefined as Id<'wallets'> | undefined,
        locale: 'en-US',
        dailySpendingLimit: undefined as number | undefined,
        transactionConfirmThreshold: undefined as number | undefined,
        emailNotifications: true,
        pushNotifications: true,
    });

    // Initialize form data when preferences load
    useEffect(() => {
        if (preferences) {
            setFormData({
                timezone: preferences.timezone,
                defaultWalletId: preferences.defaultWalletId,
                locale: preferences.locale || 'en-US',
                dailySpendingLimit: preferences.dailySpendingLimit,
                transactionConfirmThreshold: preferences.transactionConfirmThreshold,
                emailNotifications: preferences.emailNotifications,
                pushNotifications: preferences.pushNotifications,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preferences?._id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        try {
            await updatePreferences({
                timezone: formData.timezone,
                defaultWalletId: formData.defaultWalletId || null,
                locale: formData.locale,
                dailySpendingLimit: formData.dailySpendingLimit || null,
                transactionConfirmThreshold: formData.transactionConfirmThreshold || null,
                emailNotifications: formData.emailNotifications,
                pushNotifications: formData.pushNotifications,
            });
            toast.success('Preferences updated successfully');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update preferences');
        } finally {
            setIsPending(false);
        }
    };

    const activeWallets = wallets?.filter((w) => !w.isArchived) ?? [];

    return (
        <form onSubmit={handleSubmit}>
            <div className='space-y-6'>
                {/* Regional Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Regional Settings</CardTitle>
                        <CardDescription>Configure timezone and locale preferences</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {/* Timezone */}
                        <div className='space-y-2'>
                            <Label htmlFor='timezone'>Timezone</Label>
                            <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                                <SelectTrigger id='timezone'>
                                    <SelectValue placeholder='Select timezone' />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIMEZONES.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value}>
                                            {tz.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className='text-muted-foreground text-sm'>Used for accurate transaction timestamps</p>
                        </div>

                        {/* Locale */}
                        <div className='space-y-2'>
                            <Label htmlFor='locale'>Locale</Label>
                            <Select value={formData.locale} onValueChange={(value) => setFormData({ ...formData, locale: value })}>
                                <SelectTrigger id='locale'>
                                    <SelectValue placeholder='Select locale' />
                                </SelectTrigger>
                                <SelectContent>
                                    {LOCALES.map((loc) => (
                                        <SelectItem key={loc.value} value={loc.value}>
                                            {loc.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className='text-muted-foreground text-sm'>For date and number formatting</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Wallet Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Wallet Settings</CardTitle>
                        <CardDescription>Configure default wallet for new transactions</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {/* Default Wallet */}
                        <div className='space-y-2'>
                            <Label htmlFor='defaultWallet'>Default Wallet</Label>
                            <Select
                                value={formData.defaultWalletId || 'none'}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        defaultWalletId: value === 'none' ? undefined : (value as Id<'wallets'>),
                                    })
                                }>
                                <SelectTrigger id='defaultWallet'>
                                    <SelectValue placeholder='Select default wallet' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='none'>None</SelectItem>
                                    {activeWallets.map((wallet) => (
                                        <SelectItem key={wallet._id} value={wallet._id}>
                                            {wallet.icon} {wallet.name || 'Unnamed Wallet'} ({wallet.currency || 'USD'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {activeWallets.length === 0 && <p className='text-muted-foreground text-sm'>No active wallets available. Create a wallet first.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Set spending limits and confirmation thresholds (Phase 4)</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {/* Daily Spending Limit */}
                        <div className='space-y-2'>
                            <Label htmlFor='dailySpendingLimit'>Daily Spending Limit</Label>
                            <Input
                                id='dailySpendingLimit'
                                type='number'
                                min='0'
                                step='0.01'
                                placeholder='e.g., 500'
                                value={formData.dailySpendingLimit ?? ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        dailySpendingLimit: e.target.value ? parseFloat(e.target.value) : undefined,
                                    })
                                }
                            />
                            <p className='text-muted-foreground text-sm'>Optional: Maximum daily spending amount</p>
                        </div>

                        {/* Transaction Confirmation Threshold */}
                        <div className='space-y-2'>
                            <Label htmlFor='transactionConfirmThreshold'>Transaction Confirmation Threshold</Label>
                            <Input
                                id='transactionConfirmThreshold'
                                type='number'
                                min='0'
                                step='0.01'
                                placeholder='e.g., 1000'
                                value={formData.transactionConfirmThreshold ?? ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        transactionConfirmThreshold: e.target.value ? parseFloat(e.target.value) : undefined,
                                    })
                                }
                            />
                            <p className='text-muted-foreground text-sm'>Optional: Confirm transactions above this amount</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {/* Email Notifications */}
                        <div className='flex items-center justify-between'>
                            <div className='space-y-0.5'>
                                <Label htmlFor='emailNotifications'>Email Notifications</Label>
                                <p className='text-muted-foreground text-sm'>Receive notifications via email</p>
                            </div>
                            <Switch
                                id='emailNotifications'
                                checked={formData.emailNotifications}
                                onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                            />
                        </div>

                        {/* Push Notifications */}
                        <div className='flex items-center justify-between'>
                            <div className='space-y-0.5'>
                                <Label htmlFor='pushNotifications'>Push Notifications</Label>
                                <p className='text-muted-foreground text-sm'>Receive push notifications in-app</p>
                            </div>
                            <Switch
                                id='pushNotifications'
                                checked={formData.pushNotifications}
                                onCheckedChange={(checked) => setFormData({ ...formData, pushNotifications: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className='mt-6 flex justify-end'>
                <Button type='submit' disabled={isPending || preferences === undefined}>
                    {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    <Save className='mr-2 h-4 w-4' />
                    Save Preferences
                </Button>
            </div>
        </form>
    );
};
