// Throwaway loopback-only static server; no production application code runs.
const root = new URL('./', import.meta.url);
const allowed = new Set(['/index.html', '/']);
Bun.serve({
    hostname: '127.0.0.1',
    port: 4174,
    async fetch(request) {
        const path = new URL(request.url).pathname;
        if (!allowed.has(path)) return new Response('Not found', { status: 404 });
        return new Response(Bun.file(new URL('index.html', root)), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    },
});
