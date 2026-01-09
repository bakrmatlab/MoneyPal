import { v } from 'convex/values';
import { query, mutation, internalMutation } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const getCategories = query({
    args: {
        type: v.optional(v.union(v.literal('income'), v.literal('expense'))),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        if (args.type) {
            return await ctx.db
                .query('categories')
                .withIndex('by_userId_type', (q) => q.eq('userId', user._id).eq('type', args.type as 'income' | 'expense'))
                .filter((q) => q.eq(q.field('isHidden'), false))
                .collect();
        }

        // Get all categories
        return await ctx.db
            .query('categories')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .filter((q) => q.eq(q.field('isHidden'), false))
            .collect();
    },
});

export const getCategoryById = query({
    args: {
        categoryId: v.id('categories'),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const category = await ctx.db.get(args.categoryId);

        if (!category) {
            throw new Error('Category not found');
        }
        if (category.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        return category;
    },
});

export const createCategory = mutation({
    args: {
        name: v.string(),
        type: v.union(v.literal('income'), v.literal('expense')),
        color: v.string(),
        icon: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        if (!args.name.trim()) {
            throw new Error('Category name cannot be empty');
        }

        const categoryId = await ctx.db.insert('categories', {
            userId: user._id,
            name: args.name.trim(),
            type: args.type,
            color: args.color ?? '#6366f1',
            icon: args.icon ?? '📁',
            isDefault: false,
            isHidden: false,
        });

        return categoryId;
    },
});

export const updateCategory = mutation({
    args: {
        categoryId: v.id('categories'),
        name: v.optional(v.string()),
        color: v.optional(v.string()),
        icon: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const category = await ctx.db.get(args.categoryId);

        if (!category) {
            throw new Error('Category not found');
        }
        if (category.userId !== user._id) {
            throw new Error('Unauthorized');
        }
        if (category.isDefault) {
            throw new Error('Cannot update default category');
        }

        const updates: any = {};

        if (args.name) {
            updates.name = args.name.trim();
        }

        if (args.color) {
            updates.color = args.color;
        }

        if (args.icon) {
            updates.icon = args.icon;
        }

        await ctx.db.patch(args.categoryId, updates);
    },
});

export const deleteCategory = mutation({
    args: {
        categoryId: v.id('categories'),
    },

    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const category = await ctx.db.get(args.categoryId);

        if (!category) {
            throw new Error('Category not found');
        }

        if (category.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        if (category.isDefault) {
            throw new Error('Cannot delete default category');
        }
        // TODO: Check if category is used in transactions
        // Once transactions are implemented, uncomment this:
        // const transactionsWithCategory = await ctx.db
        //     .query('transactions')
        //     .withIndex('by_categoryId', (q) => q.eq('categoryId', args.categoryId))
        //     .first();
        // if (transactionsWithCategory) {
        //     throw new Error('Cannot delete category that is used in transactions');
        // }
        await ctx.db.delete(args.categoryId);
    },
});

export const toggleCategoryVisibility = mutation({
    args: {
        categoryId: v.id('categories'),
        isHidden: v.boolean(),
    },

    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const category = await ctx.db.get(args.categoryId);

        if (!category) {
            throw new Error('Category not found');
        }

        if (category.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        await ctx.db.patch(args.categoryId, { isHidden: args.isHidden });
    },
});

export const seedDefaultCategories = internalMutation({
    args: {},

    handler: async (ctx) => {
        const user = await getCurrentUserOrThrow(ctx);

        const existingCategories = await ctx.db
            .query('categories')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .first();

        if (existingCategories) {
            return { message: 'Categories already exist', count: 0 };
        }

        const incomeCategories = [
            { name: 'Salary', icon: '💼', color: '#10b981' },
            { name: 'Freelance', icon: '💻', color: '#3b82f6' },
            { name: 'Gifts', icon: '🎁', color: '#ec4899' },
            { name: 'Investments', icon: '📈', color: '#8b5cf6' },
            { name: 'Other', icon: '💰', color: '#6b7280' },
        ];

        const expenseCategories = [
            { name: 'Food', icon: '🍔', color: '#f59e0b' },
            { name: 'Transport', icon: '🚗', color: '#06b6d4' },
            { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
            { name: 'Bills', icon: '📄', color: '#ef4444' },
            { name: 'Entertainment', icon: '🎮', color: '#a855f7' },
            { name: 'Healthcare', icon: '🏥', color: '#14b8a6' },
            { name: 'Housing', icon: '🏠', color: '#f97316' },
            { name: 'Other', icon: '📦', color: '#6b7280' },
        ];

        let count = 0;

        for (const cat of incomeCategories) {
            await ctx.db.insert('categories', {
                userId: user._id,
                name: cat.name,
                type: 'income',
                color: cat.color,
                icon: cat.icon,
                isDefault: true,
                isHidden: false,
            });
            count++;
        }

        for (const cat of expenseCategories) {
            await ctx.db.insert('categories', {
                userId: user._id,
                name: cat.name,
                type: 'expense',
                color: cat.color,
                icon: cat.icon,
                isDefault: true,
                isHidden: false,
            });
            count++;
        }

        return { message: 'Categories seeded successfully', count };
    },
});
