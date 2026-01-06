/**
 * Extracts a user-friendly error message from a Convex error.
 * Handles ConvexError format, standard Error objects, and unknown error types.
 */
export const getConvexErrorMessage = (error: unknown): string => {
    // Handle ConvexError format (error.data contains the message)
    if (error && typeof error === 'object' && 'data' in error) {
        const convexError = error as { data: unknown };
        if (typeof convexError.data === 'string') {
            return convexError.data;
        }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        return error.message;
    }

    // Fallback for unknown error types
    return 'An unexpected error occurred. Please try again.';
};
