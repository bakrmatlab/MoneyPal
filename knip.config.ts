import type { KnipConfig } from 'knip';

const config: KnipConfig = {
    ignore: ['src/components/ui/**', 'src/routeTree.gen.ts', 'convex/_generated'],
    ignoreDependencies: ['tailwindcss', 'tw-animate-css'],
};

export default config;
