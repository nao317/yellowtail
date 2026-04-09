import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

export default function AppErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <main style={{ padding: 24 }}>
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>エラーが発生しました</h1>
      <p>時間をおいて再試行してください。</p>
    </main>
  )
}