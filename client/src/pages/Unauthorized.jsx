import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Access denied</h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: '1.5rem' }}>
        You don't have permission to view this page.
      </p>
      <Link to="/" style={{ fontSize: 14, color: '#185fa5' }}>
        Back to home
      </Link>
    </div>
  );
}