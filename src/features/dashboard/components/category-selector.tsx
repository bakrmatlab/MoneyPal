import { useState } from 'react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type CategorySelectorProps = {
    id?: string;
    type: 'income' | 'expense';
    value?: Id<'categories'>;
    onChange: (value: Id<'categories'> | undefined) => void;
    placeholder?: string;
};

export const CategorySelector = ({ id, type, value, onChange, placeholder }: CategorySelectorProps) => {
    const [open, setOpen] = useState(false);
    const categories = useQuery(api.categories.getCategories, { type });

    const selectedCategory = categories?.find((cat) => cat._id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='h-auto min-h-11 w-full min-w-0 justify-between rounded-sm py-2'>
                    {selectedCategory ? (
                        <span className='flex min-w-0 items-center gap-2 break-words whitespace-normal'>
                            <span>{selectedCategory.icon}</span>
                            <span>{selectedCategory.name}</span>
                        </span>
                    ) : (
                        <span className='text-muted-foreground'>{placeholder ?? 'Select category...'}</span>
                    )}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] rounded-sm p-0'>
                <Command>
                    <CommandInput placeholder='Search categories...' />
                    <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value='no-category'
                                onSelect={() => {
                                    onChange(undefined);
                                    setOpen(false);
                                }}>
                                <Check className={cn('mr-2 h-4 w-4', value === undefined ? 'opacity-100' : 'opacity-0')} />
                                <span className='text-muted-foreground'>No category</span>
                            </CommandItem>
                            {categories?.map((category) => (
                                <CommandItem
                                    key={category._id}
                                    value={category.name}
                                    onSelect={() => {
                                        onChange(category._id);
                                        setOpen(false);
                                    }}>
                                    <Check className={cn('mr-2 h-4 w-4', value === category._id ? 'opacity-100' : 'opacity-0')} />
                                    <span className='flex min-w-0 items-center gap-2 break-words whitespace-normal'>
                                        <span>{category.icon}</span>
                                        <span>{category.name}</span>
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
