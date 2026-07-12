import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/bk')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/bk"!</div>
}
