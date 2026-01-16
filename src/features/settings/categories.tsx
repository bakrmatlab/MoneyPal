import { useState } from 'react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CategoriesSettings = () => {
    const categories = useQuery(api.categories.getCategories, {});

    const createCategory = useMutation(api.categories.createCategory);
    const deleteCategory = useMutation(api.categories.deleteCategory);
    const toggleCategoryVisibility = useMutation(api.categories.toggleCategoryVisibility);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'expense' as 'income' | 'expense',
        icon: '📁',
        color: '#6366f1',
    });

    const handleCreateCategory = async () => {
        try {
            await createCategory(newCategory);
            toast.success('Category created successfully');
            setIsCreateDialogOpen(false);
            setIsEmojiPickerOpen(false);
            setNewCategory({
                name: '',
                type: 'expense',
                icon: '📁',
                color: '#6366f1',
            });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create category');
        }
    };

    const handleEmojiSelect = (emojiData: EmojiClickData) => {
        setNewCategory({ ...newCategory, icon: emojiData.emoji });
        setIsEmojiPickerOpen(false);
    };

    const handleDeleteCategory = async (categoryId: Id<'categories'>) => {
        try {
            await deleteCategory({ categoryId });
            toast.success('Category deleted successfully');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete category');
        }
    };

    const handleToggleVisibility = async (categoryId: Id<'categories'>, isHidden: boolean) => {
        try {
            await toggleCategoryVisibility({ categoryId, isHidden });
            toast.success(isHidden ? 'Category hidden' : 'Category shown');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update category');
        }
    };

    const incomeCategories = categories?.filter((cat) => cat.type === 'income') ?? [];
    const expenseCategories = categories?.filter((cat) => cat.type === 'expense') ?? [];

    return (
        <div className='space-y-6 sm:space-y-8'>
            {/* Header Section */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight sm:text-3xl'>Categories</h2>
                    <p className='text-muted-foreground mt-1 text-sm sm:text-base'>Manage your income and expense categories</p>
                </div>

                {/* Create Category Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className='self-start sm:self-auto'>
                            <Plus className='mr-2 h-4 w-4' />
                            Create Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Custom Category</DialogTitle>
                            <DialogDescription>Add a new category to organize your transactions</DialogDescription>
                        </DialogHeader>

                        {/* Form Fields */}
                        <div className='space-y-4'>
                            {/* Category Name */}
                            <div className='space-y-2'>
                                <Label htmlFor='name'>Name</Label>
                                <Input
                                    id='name'
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    placeholder='Category name'
                                />
                            </div>

                            {/* Category Type */}
                            <div className='space-y-2'>
                                <Label htmlFor='type'>Type</Label>
                                <Select
                                    value={newCategory.type}
                                    onValueChange={(value: 'income' | 'expense') => setNewCategory({ ...newCategory, type: value })}>
                                    <SelectTrigger id='type'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='income'>Income</SelectItem>
                                        <SelectItem value='expense'>Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Icon Emoji */}
                            <div className='space-y-2'>
                                <Label htmlFor='icon'>Icon (Emoji)</Label>
                                <div className='flex gap-2'>
                                    <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant='outline' className='h-10 w-full justify-start text-left font-normal'>
                                                <span className='text-2xl'>{newCategory.icon}</span>
                                                <span className='text-muted-foreground ml-2'>Click to select emoji</span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-full p-0' align='start'>
                                            <EmojiPicker onEmojiClick={handleEmojiSelect} width='100%' height={400} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div className='space-y-2'>
                                <Label htmlFor='color'>Color</Label>
                                <div className='flex gap-2'>
                                    <Input
                                        id='color'
                                        type='color'
                                        value={newCategory.color}
                                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                        className='h-10 w-20'
                                    />
                                    <Input value={newCategory.color} readOnly className='flex-1' />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateCategory} disabled={!newCategory.name.trim()}>
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Categories Grid */}
            <div className='grid gap-6 lg:grid-cols-2'>
                {/* Income Categories Card */}
                <Card>
                    <CardHeader className='space-y-1.5'>
                        <CardTitle className='text-lg sm:text-xl'>Income Categories</CardTitle>
                        <CardDescription className='text-sm'>Categories for income transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            {incomeCategories.length === 0 ? (
                                <p className='text-muted-foreground py-8 text-center text-sm'>No income categories</p>
                            ) : (
                                incomeCategories.map((category) => (
                                    <div
                                        key={category._id}
                                        className={`flex items-center justify-between rounded-lg border p-4 transition-opacity ${category.isHidden ? 'opacity-50' : ''}`}>
                                        {/* Category Info */}
                                        <div className='flex items-center gap-3'>
                                            <span className='text-2xl'>{category.icon}</span>
                                            <div>
                                                <p className='font-medium'>{category.name}</p>
                                                {category.isDefault && <p className='text-muted-foreground text-xs'>Default</p>}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className='flex items-center gap-2'>
                                            {/* Hide/Show button for default categories */}
                                            {category.isDefault && (
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => handleToggleVisibility(category._id, !category.isHidden)}
                                                    title={category.isHidden ? 'Show category' : 'Hide category'}>
                                                    {category.isHidden ? <Eye className='h-4 w-4' /> : <EyeOff className='h-4 w-4' />}
                                                </Button>
                                            )}

                                            {/* Delete button for custom categories */}
                                            {!category.isDefault && (
                                                <Button variant='ghost' size='sm' onClick={() => handleDeleteCategory(category._id)} title='Delete category'>
                                                    <Trash2 className='text-destructive h-4 w-4' />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Expense Categories Card */}
                <Card>
                    <CardHeader className='space-y-1.5'>
                        <CardTitle className='text-lg sm:text-xl'>Expense Categories</CardTitle>
                        <CardDescription className='text-sm'>Categories for expense transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-3'>
                            {expenseCategories.length === 0 ? (
                                <p className='text-muted-foreground py-8 text-center text-sm'>No expense categories</p>
                            ) : (
                                expenseCategories.map((category) => (
                                    <div
                                        key={category._id}
                                        className={`flex items-center justify-between rounded-lg border p-4 transition-opacity ${category.isHidden ? 'opacity-50' : ''}`}>
                                        {/* Category Info */}
                                        <div className='flex items-center gap-3'>
                                            <span className='text-2xl'>{category.icon}</span>
                                            <div>
                                                <p className='font-medium'>{category.name}</p>
                                                {category.isDefault && <p className='text-muted-foreground text-xs'>Default</p>}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className='flex items-center gap-2'>
                                            {/* Hide/Show button for default categories */}
                                            {category.isDefault && (
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => handleToggleVisibility(category._id, !category.isHidden)}
                                                    title={category.isHidden ? 'Show category' : 'Hide category'}>
                                                    {category.isHidden ? <Eye className='h-4 w-4' /> : <EyeOff className='h-4 w-4' />}
                                                </Button>
                                            )}

                                            {/* Delete button for custom categories */}
                                            {!category.isDefault && (
                                                <Button variant='ghost' size='sm' onClick={() => handleDeleteCategory(category._id)} title='Delete category'>
                                                    <Trash2 className='text-destructive h-4 w-4' />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
