import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getProducts } from '../../api/product.api';

export default function BuyerLanding() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data.slice(0, 3))).catch(() => setProducts([]));
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <main className="buyer-landing">
      <header className="landing-nav">
        <Link className="brand" to="/">ESTORE</Link>
        <nav>
          <Link to="/products">Shop</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/cart">Cart{cartCount > 0 ? ` (${cartCount})` : ''}</Link>
          <button onClick={logout}>Log out</button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow">Thoughtfully chosen</span>
          <p className="landing-greeting">Hello, {user.name}</p>
          <h1>Find pieces that make every day feel special.</h1>
          <p className="landing-description">
            Discover independent stores, practical favourites, and beautiful finds in one calm place.
          </p>
          <div className="landing-actions">
            <Link className="landing-cta" to="/products">Explore products <span>→</span></Link>
            <Link className="landing-text-link" to="/orders">View my orders</Link>
          </div>
        </div>

        <div className="landing-visual" aria-label="Featured marketplace products">
          <div className="visual-label">New arrivals</div>
          {products[0]?.images?.[0] ? (
            <img className="visual-main" src={products[0].images[0]} alt={products[0].title} />
          ) : (
            <div className="visual-placeholder visual-main" />
          )}
          {products[1]?.images?.[0] ? (
            <img className="visual-small visual-small-top" src={products[1].images[0]} alt={products[1].title} />
          ) : (
            <div className="visual-placeholder visual-small visual-small-top" />
          )}
          {products[2]?.images?.[0] ? (
            <img className="visual-small visual-small-bottom" src={products[2].images[0]} alt={products[2].title} />
          ) : (
            <div className="visual-placeholder visual-small visual-small-bottom" />
          )}
          <div className="visual-note">Curated for your space</div>
        </div>
      </section>

      <section className="landing-feature-row">
        <div><span>01</span><p>Independent sellers</p></div>
        <div><span>02</span><p>Secure checkout</p></div>
        <div><span>03</span><p>Tracked orders</p></div>
      </section>

      <section className="landing-featured-section">
        <div className="landing-section-heading">
          <div>
            <span className="eyebrow">A little inspiration</span>
            <h2>Fresh finds from our sellers</h2>
          </div>
          <Link to="/products">See all products →</Link>
        </div>
        <div className="landing-product-row">
          {products.length > 0 ? products.map((product, index) => (
            <Link className={`landing-product-card landing-product-${index + 1}`} to={`/products/${product._id}`} key={product._id}>
              <div className="landing-product-image">
                {product.images?.[0] ? <img src={product.images[0]} alt={product.title} /> : <div className="visual-placeholder" />}
              </div>
              <p>{product.title}</p>
              <span>${(product.price / 100).toFixed(2)}</span>
            </Link>
          )) : (
            <p className="landing-empty-state">New products from our sellers will appear here soon.</p>
          )}
        </div>
      </section>

      <section className="landing-assurance">
        <div>
          <span className="eyebrow">Made for easy shopping</span>
          <h2>Good finds, without the guesswork.</h2>
        </div>
        <div className="assurance-points">
          <p><strong>Trusted sellers</strong>Shop directly from approved marketplace stores.</p>
          <p><strong>Simple checkout</strong>Keep purchases organised in one secure place.</p>
          <p><strong>Order updates</strong>Follow each order from payment to delivery.</p>
        </div>
      </section>

      <section className="landing-closing">
        <span className="eyebrow">Your next favourite is waiting</span>
        <h2>Take a look around.</h2>
        <Link className="landing-cta" to="/products">Start shopping <span>→</span></Link>
      </section>
    </main>
  );
}
