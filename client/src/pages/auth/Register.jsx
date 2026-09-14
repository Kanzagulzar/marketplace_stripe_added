import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const registeredUser = await register(form);
      navigate(registeredUser.role === 'vendor' ? '/vendor/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: '3rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '1rem' }}>Create an account</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ padding: 10, fontSize: 14 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ padding: 10, fontSize: 14 }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
          style={{ padding: 10, fontSize: 14 }}
        />

        <label style={{ fontSize: 13, color: '#666' }}>Account type</label>
        <select name="role" value={form.role} onChange={handleChange} style={{ padding: 10, fontSize: 14 }}>
          <option value="buyer">Buyer</option>
          <option value="vendor">Vendor</option>
        </select>

        {error && <p style={{ fontSize: 13, color: '#c0392b' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ padding: 12, fontSize: 14, marginTop: 8 }}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ fontSize: 13, color: '#666', marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
