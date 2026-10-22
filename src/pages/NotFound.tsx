import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="py-32 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-3 text-muted">This page could not be found.</p>
      <Button asChild className="mt-6"><Link to="/">Browse workshops</Link></Button>
    </div>
  )
}
