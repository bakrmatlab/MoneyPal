import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/preferences')({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Hello "/_authenticated/preferences"!</div>;
}
