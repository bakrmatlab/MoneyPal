import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// On the 1st of every month at midnight UTC, roll budgets over to the new month
crons.monthly(
    'roll over monthly budgets',
    { day: 1, hourUTC: 0, minuteUTC: 0 },
    internal.budgets.createNextMonthBudgets,
    {}
);

export default crons;
