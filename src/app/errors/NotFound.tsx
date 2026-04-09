import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main style={{ padding: 24 }}>
      <h1>404</h1>
      <p>ページが見つかりませんでした。</p>
      <Link to="/">トップへ戻る</Link>
    </main>
  )
}