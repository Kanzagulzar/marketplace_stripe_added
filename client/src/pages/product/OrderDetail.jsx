// import { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { getOrderById, confirmDelivery, raiseDispute } from '../../api/order.api';

// const STEPS = ['paid', 'processing', 'shipped', 'delivered'];

// export default function OrderDetail() {
//   const { orderId } = useParams();
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [error, setError] = useState('');

//   const loadOrder = () => {
//     getOrderById(orderId)
//       .then((res) => setOrder(res.data))
//       .catch(() => setError('Order not found'))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     loadOrder();
//   }, [orderId]);

//   const handleConfirmDelivery = async () => {
//     setActionLoading(true);
//     try {
//       await confirmDelivery(orderId);
//       loadOrder();
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to confirm delivery');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleDispute = async () => {
//     const reason = prompt('What went wrong?');
//     if (!reason) return;
//     setActionLoading(true);
//     try {
//       await raiseDispute(orderId, reason);
//       loadOrder();
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to report problem');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
//   if (error && !order) return <p style={{ padding: '2rem', color: '#c0392b' }}>{error}</p>;

//   const currentStepIndex = STEPS.indexOf(order.status);
//   const isDisputedOrRefunded = ['disputed', 'refunded'].includes(order.status);

//   return (
//     <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
//       <Link to="/orders" style={{ fontSize: 13, color: '#185fa5' }}>← Back to orders</Link>

//       <div style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginTop: '1rem' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
//           <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>Order #{order._id.slice(-6).toUpperCase()}</p>
//           <span style={{
//             fontSize: 12,
//             background: isDisputedOrRefunded ? '#fdecea' : '#eaf1fb',
//             color: isDisputedOrRefunded ? '#c0392b' : '#185fa5',
//             padding: '3px 10px',
//             borderRadius: 6
//           }}>
//             {order.status}
//           </span>
//         </div>
//         <p style={{ fontSize: 13, color: '#666', margin: '0 0 1.5rem' }}>
//           {order.items.map((i) => `${i.title} x${i.qty}`).join(', ')} · ${(order.subtotal / 100).toFixed(2)}
//         </p>

//         {!isDisputedOrRefunded && (
//           <div style={{ position: 'relative', paddingLeft: 28 }}>
//             <div style={{ position: 'absolute', left: 9, top: 6, bottom: 20, width: 2, background: '#ccc' }} />
//             {STEPS.map((step, idx) => {
//               const done = idx < currentStepIndex || order.status === 'delivered';
//               const current = idx === currentStepIndex;
//               const historyEntry = order.statusHistory?.find((h) => h.status === step);

//               return (
//                 <div key={step} style={{ position: 'relative', marginBottom: 20, opacity: idx > currentStepIndex ? 0.5 : 1 }}>
//                   <div style={{
//                     position: 'absolute', left: -28, top: 2, width: 20, height: 20, borderRadius: '50%',
//                     background: done || current ? '#0f6e56' : 'transparent',
//                     border: done || current ? 'none' : '2px solid #ccc'
//                   }} />
//                   <p style={{ fontSize: 14, fontWeight: current ? 500 : 400, margin: 0 }}>
//                     {step[0].toUpperCase() + step.slice(1)}
//                   </p>
//                   <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
//                     {historyEntry ? new Date(historyEntry.timestamp).toLocaleString() : 'Pending'}
//                   </p>
//                   {step === 'shipped' && order.status === 'shipped' && order.escrowReleaseDate && (
//                     <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>
//                       Payment held until {new Date(order.escrowReleaseDate).toLocaleDateString()}
//                     </p>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {isDisputedOrRefunded && (
//           <p style={{ fontSize: 13, color: '#666' }}>
//             {order.status === 'disputed' ? 'This order is under dispute review.' : 'This order was refunded.'}
//           </p>
//         )}

//         {error && <p style={{ fontSize: 13, color: '#c0392b', marginTop: 12 }}>{error}</p>}

//         {order.status === 'shipped' && (
//           <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
//             <button onClick={handleConfirmDelivery} disabled={actionLoading} style={{ flex: 1, padding: 10, fontSize: 13 }}>
//               {actionLoading ? 'Please wait...' : 'Confirm delivery'}
//             </button>
//             <button onClick={handleDispute} disabled={actionLoading} style={{ flex: 1, padding: 10, fontSize: 13 }}>
//               Report a problem
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, confirmDelivery, raiseDispute } from '../../api/order.api';
import { createReview, getReviewedProductIds } from '../../api/review.api';

const STEPS = ['paid', 'processing', 'shipped', 'delivered'];

function ReviewForm({ orderId, productId, title, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await createReview({ orderId, productId, rating, comment });
      onSubmitted(productId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
      <p style={{ fontSize: 13, margin: '0 0 6px' }}>Review: {title}</p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: n <= rating ? '#f5a623' : '#ccc', padding: 0 }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        style={{ width: '100%', fontSize: 13, padding: 6, boxSizing: 'border-box' }}
      />
      {error && <p style={{ fontSize: 12, color: '#c0392b', margin: '4px 0' }}>{error}</p>}
      <button onClick={handleSubmit} disabled={submitting} style={{ fontSize: 12, padding: '5px 10px', marginTop: 4 }}>
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </div>
  );
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [reviewedIds, setReviewedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOrder = () => {
    getOrderById(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  };

  const loadReviewedIds = () => {
    getReviewedProductIds(orderId).then((res) => setReviewedIds(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadOrder();
    loadReviewedIds();
  }, [orderId]);

  const handleConfirmDelivery = async () => {
    setActionLoading(true);
    try {
      await confirmDelivery(orderId);
      loadOrder();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to confirm delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    const reason = prompt('What went wrong?');
    if (!reason) return;
    setActionLoading(true);
    try {
      await raiseDispute(orderId, reason);
      loadOrder();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to report problem');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  if (error && !order) return <p style={{ padding: '2rem', color: '#c0392b' }}>{error}</p>;

  const currentStepIndex = STEPS.indexOf(order.status);
  const isDisputedOrRefunded = ['disputed', 'refunded'].includes(order.status);

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <Link className="back-link" to="/orders" style={{ fontSize: 13, color: '#185fa5' }}>← Back to orders</Link>

      <div style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.25rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>Order #{order._id.slice(-6).toUpperCase()}</p>
          <span style={{
            fontSize: 12,
            background: isDisputedOrRefunded ? '#fdecea' : '#eaf1fb',
            color: isDisputedOrRefunded ? '#c0392b' : '#185fa5',
            padding: '3px 10px',
            borderRadius: 6
          }}>
            {order.status}
          </span>
        </div>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 1.5rem' }}>
          {order.items.map((i) => `${i.title} x${i.qty}`).join(', ')} · ${(order.subtotal / 100).toFixed(2)}
        </p>

        {!isDisputedOrRefunded && (
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 9, top: 6, bottom: 20, width: 2, background: '#ccc' }} />
            {STEPS.map((step, idx) => {
              const done = idx < currentStepIndex || order.status === 'delivered';
              const current = idx === currentStepIndex;
              const historyEntry = order.statusHistory?.find((h) => h.status === step);

              return (
                <div key={step} style={{ position: 'relative', marginBottom: 20, opacity: idx > currentStepIndex ? 0.5 : 1 }}>
                  <div style={{
                    position: 'absolute', left: -28, top: 2, width: 20, height: 20, borderRadius: '50%',
                    background: done || current ? '#0f6e56' : 'transparent',
                    border: done || current ? 'none' : '2px solid #ccc'
                  }} />
                  <p style={{ fontSize: 14, fontWeight: current ? 500 : 400, margin: 0 }}>
                    {step[0].toUpperCase() + step.slice(1)}
                  </p>
                  <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                    {historyEntry ? new Date(historyEntry.timestamp).toLocaleString() : 'Pending'}
                  </p>
                  {step === 'shipped' && order.status === 'shipped' && order.escrowReleaseDate && (
                    <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>
                      Payment held until {new Date(order.escrowReleaseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isDisputedOrRefunded && (
          <p style={{ fontSize: 13, color: '#666' }}>
            {order.status === 'disputed' ? 'This order is under dispute review.' : 'This order was refunded.'}
          </p>
        )}

        {error && <p style={{ fontSize: 13, color: '#c0392b', marginTop: 12 }}>{error}</p>}

        {order.status === 'shipped' && (
          <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
            <button onClick={handleConfirmDelivery} disabled={actionLoading} style={{ flex: 1, padding: 10, fontSize: 13 }}>
              {actionLoading ? 'Please wait...' : 'Confirm delivery'}
            </button>
            <button className="button-danger" onClick={handleDispute} disabled={actionLoading} style={{ flex: 1, padding: 10, fontSize: 13 }}>
              Report a problem
            </button>
          </div>
        )}

        {order.status === 'delivered' && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Leave a review</p>
            {order.items.map((item) => (
              reviewedIds.includes(item.productId.toString()) ? (
                <p key={item.productId} style={{ fontSize: 13, color: '#1e7e34', margin: '4px 0' }}>
                  {item.title} — Reviewed ✓
                </p>
              ) : (
                <ReviewForm
                  key={item.productId}
                  orderId={order._id}
                  productId={item.productId}
                  title={item.title}
                  onSubmitted={(id) => setReviewedIds((prev) => [...prev, id])}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
