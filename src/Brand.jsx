import { Link } from 'react-router-dom'

export function Brand({ cream = false }) {
  return <Link to="/" className="brand brand-logo" data-cream={cream} aria-label="Kinetra, início">
    <img src={cream ? '/kinetra-logo-creme.png' : '/kinetra-logo.png'} alt="" width="2025" height="777" />
  </Link>
}
