import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type WalletStepProps = {
    onNext: (data: { name?: string; currency: string }) => void;
    onSkip: () => void;
    isPending: boolean;
};

function buildCurrencyList() {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
    return Intl.supportedValuesOf('currency').map((code) => ({
        code,
        name: displayNames.of(code) ?? code,
    }));
}

export function WalletStep({ onNext, onSkip, isPending }: WalletStepProps) {
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [comboOpen, setComboOpen] = useState(false);

    const currencies = useMemo(() => buildCurrencyList(), []);

    const selectedCurrency = currencies.find((c) => c.code === currency);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext({ name: name.trim() || undefined, currency });
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='text-center'>
                <h2 className='mb-1 text-2xl font-semibold tracking-tight'>Create your first wallet</h2>
                <p className='text-muted-foreground text-sm'>Give it a name and choose a currency.</p>
            </div>

            <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <Label htmlFor='wallet-name'>Wallet name (optional)</Label>
                    <Input
                        id='wallet-name'
                        placeholder='e.g., My Wallet, Savings, Cash'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        className='h-11 min-w-0 rounded-sm text-base'
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label htmlFor='onboarding-currency'>Currency</Label>
                    <Popover open={comboOpen} onOpenChange={setComboOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id='onboarding-currency'
                                variant='outline'
                                role='combobox'
                                aria-expanded={comboOpen}
                                className='h-auto min-h-11 w-full min-w-0 justify-between rounded-sm py-2 text-left font-normal whitespace-normal'>
                                {selectedCurrency ? `${selectedCurrency.code} — ${selectedCurrency.name}` : 'Select currency'}
                                <ChevronsUpDown className='text-muted-foreground ml-2 size-4 shrink-0' />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] rounded-sm p-0' align='start'>
                            <Command>
                                <CommandInput placeholder='Search currencies...' />
                                <CommandList>
                                    <CommandEmpty>No currency found.</CommandEmpty>
                                    <CommandGroup>
                                        {currencies.map((c) => (
                                            <CommandItem
                                                key={c.code}
                                                value={`${c.code} ${c.name}`}
                                                onSelect={() => {
                                                    setCurrency(c.code);
                                                    setComboOpen(false);
                                                }}>
                                                <Check className={cn('mr-2 size-4', currency === c.code ? 'opacity-100' : 'opacity-0')} />
                                                <span className='font-mono text-sm'>{c.code}</span>
                                                <span className='text-muted-foreground ml-2 truncate text-sm'>{c.name}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className='flex flex-col gap-3'>
                <Button type='submit' size='lg' className='min-h-11 w-full rounded-sm' disabled={isPending}>
                    {isPending && <Loader2 className='size-4 animate-spin' />}
                    Create Wallet & Continue
                </Button>
                <Button type='button' variant='ghost' size='sm' onClick={onSkip} disabled={isPending} className='min-h-11 rounded-sm'>
                    Skip for now
                </Button>
            </div>
        </form>
    );
}
