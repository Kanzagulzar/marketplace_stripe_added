// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { createProduct, updateProduct, getProductById } from '../../api/product.api';

// export default function ProductForm() {
//   const { id } = useParams(); // present only when editing
//   const navigate = useNavigate();
//   const isEditing = Boolean(id);

//   const [form, setForm] = useState({
//     title: '', description: '', price: '', stock: '', category: '', status: 'draft'
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(isEditing);

//   useEffect(() => {
//     if (!isEditing) return;
//     getProductById(id).then((res) => {
//       const p = res.data;
//       setForm({
//         title: p.title,
//         description: p.description || '',
//         price: (p.price / 100).toString(), // display as dollars
//         stock: p.stock.toString(),
//         category: p.category || '',
//         status: p.status
//       });
//       setLoading(false);
//     });
//   }, [id, isEditing]);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     const payload = {
//       title: form.title,
//       description: form.description,
//       price: Math.round(parseFloat(form.price) * 100), // dollars -> cents
//       stock: parseInt(form.stock, 10),
//       category: form.category,
//       status: form.status
//     };

//     try {
//       if (isEditing) {
//         await updateProduct(id, payload);
//       } else {
//         await createProduct(payload);
//       }
//       navigate('/vendor/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to save product');
//     }
//   };

//   if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

//   return (
//     <div style={{ maxWidth: 400, margin: '2rem auto', padding: '0 1rem' }}>
//       <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '1rem' }}>
//         {isEditing ? 'Edit product' : 'New product'}
//       </h1>

//       <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//         <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required style={{ padding: 10, fontSize: 14 }} />
//         <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} style={{ padding: 10, fontSize: 14 }} />
//         <input name="price" type="number" step="0.01" min="0" placeholder="Price (USD)" value={form.price} onChange={handleChange} required style={{ padding: 10, fontSize: 14 }} />
//         <input name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={handleChange} required style={{ padding: 10, fontSize: 14 }} />
//         <input name="category" placeholder="Category" value={form.category} onChange={handleChange} style={{ padding: 10, fontSize: 14 }} />

//         <label style={{ fontSize: 13, color: '#666' }}>Status</label>
//         <select name="status" value={form.status} onChange={handleChange} style={{ padding: 10, fontSize: 14 }}>
//           <option value="draft">Draft</option>
//           <option value="active">Active</option>
//         </select>

//         {error && <p style={{ fontSize: 13, color: '#c0392b' }}>{error}</p>}

//         <button type="submit" style={{ padding: 12, fontSize: 14, marginTop: 8 }}>
//           {isEditing ? 'Save changes' : 'Create product'}
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, getProductById, uploadProductImage } from '../../api/product.api';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '', description: '', price: '', stock: '', category: '', status: 'draft'
  });
  const [images, setImages] = useState([]); // array of Cloudinary URLs
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    getProductById(id).then((res) => {
      const p = res.data;
      setForm({
        title: p.title,
        description: p.description || '',
        price: (p.price / 100).toString(),
        stock: p.stock.toString(),
        category: p.category || '',
        status: p.status
      });
      setImages(p.images || []);
      setLoading(false);
    });
  }, [id, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const res = await uploadProductImage(file);
      setImages((prev) => [...prev, res.data.url]);
    } catch (err) {
      setError(err.response?.data?.error || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset input so the same file can be re-selected if needed
    }
  };

  const handleRemoveImage = (urlToRemove) => {
    setImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      title: form.title,
      description: form.description,
      price: Math.round(parseFloat(form.price) * 100),
      stock: parseInt(form.stock, 10),
      category: form.category,
      status: form.status,
      images
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
      <Link className="back-link" to="/vendor/dashboard" style={{ fontSize: 13, color: '#185fa5' }}>← Back to dashboard</Link>
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

        <label style={{ fontSize: 13, color: '#666', marginTop: 8 }}>Images</label>
        {images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {images.map((url) => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e5e5' }} />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  className="icon-button"
                  style={{
                    position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
                    background: '#c0392b', color: 'white', fontSize: 11, border: 'none', lineHeight: '18px', padding: 0
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} style={{ fontSize: 13 }} />
        {uploading && <p style={{ fontSize: 12, color: '#666' }}>Uploading...</p>}

        {error && <p style={{ fontSize: 13, color: '#c0392b' }}>{error}</p>}

        <button type="submit" style={{ padding: 12, fontSize: 14, marginTop: 8 }}>
          {isEditing ? 'Save changes' : 'Create product'}
        </button>
      </form>
    </div>
  );
}
