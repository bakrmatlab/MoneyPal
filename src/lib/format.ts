/**
 * Format a number as USD currency
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format a timestamp as a readable date
 */
export const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(timestamp));
};

/**
 * Format a timestamp as a readable date and time
 */
export const formatDateTime = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(timestamp));
};

/**
 * Format a timestamp as a readable time ago
 */
export const formatTimeAgo = (timestamp?: number): string => {
    if (!timestamp) return 'Never';

    const timeSince = Date.now() - timestamp;
    const minutes = Math.floor(timeSince / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
};

/**
 * Format a timestamp as a readable time eg. 9:15 AM
 */
export const formatTime = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(timestamp));
};

/**
 * Format a number with compact notation (1k, 2M, 1.5B, etc.)
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(num);
};
