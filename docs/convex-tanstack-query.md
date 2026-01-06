# Convex with TanStack Query Integration

This project uses **TanStack Query** (React Query) for data fetching and mutations, integrated with **Convex** backend functions.

## Example Imports

Always import the following when using Convex with TanStack Query:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
```

## Query Pattern

### Using `useQuery` with Convex Queries

Use `convexQuery` helper to wrap Convex query functions when using `useQuery`:

```typescript
// ✅ Correct: Using convexQuery helper
const { data: currentProject } = useQuery(convexQuery(api.projects.getCurrentProject, {}));

// ✅ With arguments
const { data: project } = useQuery(convexQuery(api.projects.getProject, { projectId: 'xxx' }));

// ❌ Wrong: Don't use Convex hooks directly
// const currentProject = useQuery(api.projects.getCurrentProject, {});
```

### Query Options

You can destructure standard TanStack Query properties:

```typescript
const { data, isPending, isError, error } = useQuery(convexQuery(api.projects.getCurrentProject, {}));
```

## Mutation Pattern

### Using `useMutation` with Convex Mutations

Use `useConvexMutation` as the `mutationFn` when using `useMutation`:

```typescript
// ✅ Correct: Using useConvexMutation as mutationFn
const { mutate: updateCurrentProject } = useMutation({
    mutationFn: useConvexMutation(api.projects.updateCurrentProject),
});

// ❌ Wrong: Don't use Convex hooks directly
// const updateProject = useMutation(api.projects.updateCurrentProject);
```

### Calling Mutations

Mutations are called using the `mutate` function with arguments and optional callbacks:

```typescript
updateCurrentProject(
    {
        projectId: currentProject._id,
        fields: {
            name: data.name,
            url: data.url,
        },
    }
);
```

### Mutation Options

You can destructure standard TanStack Query mutation properties:

```typescript
const { mutate, mutateAsync, isPending, isError, error, isSuccess } = useMutation({
    mutationFn: useConvexMutation(api.projects.updateCurrentProject),
});
```

## Best Practices

1. **Always use `convexQuery` for queries**: Wrap Convex query functions with `convexQuery()` when using `useQuery`
2. **Always use `useConvexMutation` for mutations**: Use `useConvexMutation()` as the `mutationFn` in `useMutation`
3. **Handle loading and error states**: Use `isLoading`, `isError`, and `error` from query/mutation results
4. **Provide user feedback**: Use toast notifications in `onSuccess` and `onError` callbacks
5. **Type safety**: Ensure Convex function arguments and return types match your TypeScript types
6. **Form integration**: When using with forms, reset forms in `onSuccess` callbacks after successful mutations

## Example: Complete Component Pattern

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

function MyComponent() {
  // Query pattern
  const { data: project, isPending:isProjectPending } = useQuery(
    convexQuery(api.projects.getCurrentProject, {})
  );

  // Mutation pattern
  const { mutate: updateProject, isPending } = useMutation({
    mutationFn: useConvexMutation(api.projects.updateCurrentProject),
        {
            onSuccess: () => {
            toast.success('Updated successfully');
            },
            onError: (error) => {
            toast.error('Update failed');
            console.error(error);
            },
        }
  });

  const handleUpdate = (data: UpdateData) => {
    if (!project) return;

    updateProject(
      {
        projectId: project._id,
        fields: data,
      }
    );
  };

  if (isProjectPending) return <div>Loading...</div>;

  return (
    // Component JSX
  );
}
```

## Important Notes

- **Never mix Convex hooks with TanStack Query**: Don't use `useQuery` from Convex directly when using TanStack Query
- **API import path**: Always import `api` from `@repo/backend/convex/_generated/api`
- **Function references**: Use the `api` object to reference Convex functions (e.g., `api.projects.getCurrentProject`)
- **Error handling**: Always provide error handling in mutation callbacks
- **Loading states**: Use `isPending` instead of `isLoading`
