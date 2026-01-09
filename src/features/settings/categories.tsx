import { useState } from 'react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const CategoriesSettings = () => {
    const categories = useQuery(api.categories.getCategories);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'expense' as 'income' | 'expense',
        icon: '📁',
        color: '#6366f1',
    });

    // TODO: Implement this function using useMutation
    const handleCreateCategory = async () => {
        // TODO: Call createCategory mutation
        // TODO: Show success toast
        // TODO: Close dialog and reset form
        console.log('Create category:', newCategory);
    };

    // TODO: Implement this function using useMutation
    const handleDeleteCategory = async (categoryId: Id<'categories'>) => {
        // TODO: Call deleteCategory mutation
        // TODO: Show success toast
        console.log('Delete category:', categoryId);
    };

    // TODO: Implement this function using useMutation
    const handleToggleVisibility = async (categoryId: Id<'categories'>, isHidden: boolean) => {
        // TODO: Call toggleCategoryVisibility mutation
        // TODO: Show success toast
        console.log('Toggle visibility:', categoryId, isHidden);
    };

    const incomeCategories = categories?.filter((cat) => cat.type === 'income') ?? [];
    const expenseCategories = categories?.filter((cat) => cat.type === 'expense') ?? [];

    return (
        <div className='space-y-6'>
            {/* Header Section */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-bold'>Categories</h2>
                    <p className='text-muted-foreground'>Manage your income and expense categories</p>
                </div>

                {/* Create Category Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
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
                                <Input
                                    id='icon'
                                    value={newCategory.icon}
                                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                                    placeholder='📁'
                                    maxLength={2}
                                />
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
            <div className='grid gap-6 md:grid-cols-2'>
                {/* Income Categories Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Income Categories</CardTitle>
                        <CardDescription>Categories for income transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2'>
                            {incomeCategories.length === 0 ? (
                                <p className='text-muted-foreground text-center text-sm'>No income categories</p>
                            ) : (
                                incomeCategories.map((category) => (
                                    <div key={category._id} className='flex items-center justify-between rounded-lg border p-3'>
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
                    <CardHeader>
                        <CardTitle>Expense Categories</CardTitle>
                        <CardDescription>Categories for expense transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2'>
                            {expenseCategories.length === 0 ? (
                                <p className='text-muted-foreground text-center text-sm'>No expense categories</p>
                            ) : (
                                expenseCategories.map((category) => (
                                    <div key={category._id} className='flex items-center justify-between rounded-lg border p-3'>
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
