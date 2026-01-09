import { useState } from 'react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type CategorySelectorProps = {
    type: 'income' | 'expense';
    value?: Id<'categories'>;
    onChange: (value: Id<'categories'> | undefined) => void;
    placeholder?: string;
};

export const CategorySelector = ({ type, value, onChange, placeholder }: CategorySelectorProps) => {
    const [open, setOpen] = useState(false);
    const categories = useQuery(api.categories.getCategories, { type });

    const selectedCategory = categories?.find((cat) => cat._id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant='outline' role='combobox' aria-expanded={open} className='w-full justify-between'>
                    {selectedCategory ? (
                        <span className='flex items-center gap-2'>
                            <span>{selectedCategory.icon}</span>
                            <span>{selectedCategory.name}</span>
                        </span>
                    ) : (
                        <span className='text-muted-foreground'>{placeholder ?? 'Select category...'}</span>
                    )}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-full p-0'>
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
                                    <span className='flex items-center gap-2'>
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
