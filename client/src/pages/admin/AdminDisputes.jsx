// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { getAllOrders, resolveDispute } from '../../api/order.api';

// export default function AdminDisputes() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [resolvingId, setResolvingId] = useState(null);

//   const loadOrders = () => {
//     setLoading(true);
//     getAllOrders()
//       .then((res) => setOrders(res.data.filter((o) => o.status === 'disputed')))
//       .catch(() => setOrders([]))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     loadOrders();
//   }, []);

//   const handleResolve = async (orderId, resolution) => {
//     if (!confirm(`${resolution === 'refund' ? 'Refund the buyer' : 'Release payment to vendor'}? This can't be undone.`)) return;
//     setResolvingId(orderId);
//     try {
//       await resolveDispute(orderId, resolution);
//       loadOrders();
//     } catch (err) {
//       alert(err.response?.data?.error || 'Failed to resolve dispute');
//     } finally {
//       setResolvingId(null);
//     }
//   };

//   if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

//   return (
//     <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
//         <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Disputes</h1>
//         <Link to="/admin" style={{ fontSize: 13, color: '#185fa5' }}>← Back to admin</Link>
//       </div>

//       {orders.length === 0 && <p style={{ fontSize: 14, color: '#666' }}>No open disputes.</p>}

//       <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
//         {orders.map((o) => {
//           const disputeNote = o.statusHistory?.filter((h) => h.status === 'disputed').pop();
//           return (
//             <div key={o._id} style={{ padding: '14px', borderBottom: '1px solid #eee' }}>
//               <p style={{ fontSize: 14, margin: '0 0 2px' }}>{o.items.map((i) => `${i.title} x${i.qty}`).join(', ')}</p>
//               <p style={{ fontSize: 12, color: '#999', margin: '0 0 6px' }}>
//                 Order #{o._id.slice(-6).toUpperCase()} · ${(o.subtotal / 100).toFixed(2)}
//               </p>
//               {disputeNote?.note && (
//                 <p style={{ fontSize: 13, color: '#c0392b', margin: '0 0 10px', fontStyle: 'italic' }}>
//                   "{disputeNote.note}"
//                 </p>
//               )}
//               <div style={{ display: 'flex', gap: 8 }}>
//                 <button
//                   onClick={() => handleResolve(o._id, 'refund')}
//                   disabled={resolvingId === o._id}
//                   style={{ fontSize: 13, padding: '6px 12px' }}
//                 >
//                   Refund buyer
//                 </button>
//                 <button
//                   onClick={() => handleResolve(o._id, 'release')}
//                   disabled={resolvingId === o._id}
//                   style={{ fontSize: 13, padding: '6px 12px' }}
//                 >
//                   Release to vendor
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, resolveDispute, runEscrowRelease } from '../../api/order.api';

export default function AdminDisputes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [runningJob, setRunningJob] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    getAllOrders()
      .then((res) => setOrders(res.data.filter((o) => o.status === 'disputed')))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleResolve = async (orderId, resolution) => {
    if (!confirm(`${resolution === 'refund' ? 'Refund the buyer' : 'Release payment to vendor'}? This can't be undone.`)) return;
    setResolvingId(orderId);
    try {
      await resolveDispute(orderId, resolution);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resolve dispute');
    } finally {
      setResolvingId(null);
    }
  };

  const handleRunEscrowJob = async () => {
    setRunningJob(true);
    try {
      await runEscrowRelease();
      alert('Escrow release job ran — check backend terminal for details.');
    } catch (err) {
      alert('Failed to run job');
    } finally {
      setRunningJob(false);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Disputes</h1>
        <Link className="back-link" to="/admin" style={{ fontSize: 13, color: '#185fa5' }}>← Back to admin</Link>
      </div>

      {/* <button
        onClick={handleRunEscrowJob}
        disabled={runningJob}
        style={{ fontSize: 13, padding: '8px 14px', marginBottom: '1.5rem', border: '1px dashed #999' }}
      >
        {runningJob ? 'Running...' : '⚙ Run escrow release job (testing only)'}
      </button> */}

      {orders.length === 0 && <p style={{ fontSize: 14, color: '#666' }}>No open disputes.</p>}

      <div style={{ border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
        {orders.map((o) => {
          const disputeNote = o.statusHistory?.filter((h) => h.status === 'disputed').pop();
          return (
            <div key={o._id} style={{ padding: '14px', borderBottom: '1px solid #eee' }}>
              <p style={{ fontSize: 14, margin: '0 0 2px' }}>{o.items.map((i) => `${i.title} x${i.qty}`).join(', ')}</p>
              <p style={{ fontSize: 12, color: '#999', margin: '0 0 6px' }}>
                Order #{o._id.slice(-6).toUpperCase()} · ${(o.subtotal / 100).toFixed(2)}
              </p>
              {disputeNote?.note && (
                <p style={{ fontSize: 13, color: '#c0392b', margin: '0 0 10px', fontStyle: 'italic' }}>
                  "{disputeNote.note}"
                </p>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button-danger" onClick={() => handleResolve(o._id, 'refund')} disabled={resolvingId === o._id} style={{ fontSize: 13, padding: '6px 12px' }}>
                  Refund buyer
                </button>
                <button onClick={() => handleResolve(o._id, 'release')} disabled={resolvingId === o._id} style={{ fontSize: 13, padding: '6px 12px' }}>
                  Release to vendor
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
