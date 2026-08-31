import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, getProductById } from '../../api/product.api';

export default function ProductForm() {
  const { id } = useParams(); // present only when editing
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '', description: '', price: '', stock: '', category: '', status: 'draft'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    getProductById(id).then((res) => {
      const p = res.data;
      setForm({
        title: p.title,
        description: p.description || '',
        price: (p.price / 100).toString(), // display as dollars
        stock: p.stock.toString(),
        category: p.category || '',
        status: p.status
      });
      setLoading(false);
    });
  }, [id, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      title: form.title,
      description: form.description,
      price: Math.round(parseFloat(form.price) * 100), // dollars -> cents
      stock: parseInt(form.stock, 10),
      category: form.category,
      status: form.status
    };

    try {
      if (isEditing) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '1rem' }}>
        {isEditing ? 'Edit product' : 'New product'}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required style={{ padding: 10, fontSize: 14 }} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} style={{ padding: 10, fontSize: 14 }} />
        <input name="price" type="number" step="0.01" min="0" placeholder="Price (USD)" value={form.price} onChange={handleChange} required style={{ padding: 10, fontSize: 14 }} />
        <input name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={handleChange} required style={{ padding: 10, fontSize: 14 }} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} style={{ padding: 10, fontSize: 14 }} />

        <label style={{ fontSize: 13, color: '#666' }}>Status</label>
        <select name="status" value={form.status} onChange={handleChange} style={{ padding: 10, fontSize: 14 }}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
        </select>

        {error && <p style={{ fontSize: 13, color: '#c0392b' }}>{error}</p>}

        <button type="submit" style={{ padding: 12, fontSize: 14, marginTop: 8 }}>
          {isEditing ? 'Save changes' : 'Create product'}
        </button>
      </form>
    </div>
  );
}