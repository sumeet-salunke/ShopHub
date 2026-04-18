import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, privateApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import { ArrowRight, PackageCheck, Pencil, ShieldCheck, ShoppingCart, Trash2, Truck } from 'lucide-react';
import { FALLBACK_IMAGE, resolveImageUrl } from '../utils/imageUrl';
import './Home.css';

const initialProductForm = {
  name: '',
  price: '',
  stock: '',
  category: '',
  description: '',
  images: '',
};

const getProductsFromResponse = (payload) => {
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [page, setPage] = useState(1);
  const [productMeta, setProductMeta] = useState({ total: 0, totalPages: 1 });
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { page, limit: 12, ts: Date.now() },
      });
      console.log('Products response:', res.data);
      setProducts(getProductsFromResponse(res.data));
      setProductMeta({
        total: Number(res.data?.total || res.data?.data?.total || 0),
        totalPages: Math.max(1, Number(res.data?.totalPages || res.data?.data?.totalPages || 1)),
      });
    } catch (err) {
      if (err.response?.status === 304) {
        console.log('Products returned 304 with no response body.');
      }
      addToast(err.response?.data?.message || 'Failed to load products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const addToCart = async (productId) => {
    if (!user) {
      addToast('Please login to add items to your cart', 'error');
      navigate('/login');
      return;
    }

    try {
      await privateApi.post('/auth/cart', { productId, quantity: 1 });
      addToast('Added to cart', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    }
  };

  const handleProductFormChange = (event) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetProductForm = () => {
    setProductForm(initialProductForm);
    setEditingProductId(null);
  };

  const buildProductPayload = () => ({
    name: productForm.name.trim(),
    price: Number(productForm.price),
    stock: Number(productForm.stock),
    category: productForm.category.trim(),
    description: productForm.description.trim(),
    images: productForm.images
      .split(',')
      .map((image) => image.trim())
      .filter(Boolean),
  });

  const submitProduct = async (event) => {
    event.preventDefault();
    setSavingProduct(true);
    try {
      const payload = buildProductPayload();
      if (editingProductId) {
        await privateApi.patch(`/products/${editingProductId}`, payload);
        addToast('Product updated', 'success');
      } else {
        await privateApi.post('/products', payload);
        addToast('Product added', 'success');
      }
      resetProductForm();
      await fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const startEditProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      category: product.category || '',
      description: product.description || '',
      images: product.images?.join(', ') || '',
    });
    document.getElementById('admin-products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteProduct = async (productId) => {
    try {
      await privateApi.delete(`/products/${productId}`);
      addToast('Product deleted', 'success');
      await fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading products...</div>;
  }

  const visibleProducts = products;

  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">Fresh picks, fast checkout</span>
          <h1>Build your cart with products worth coming back for.</h1>
          <p>Browse handpicked essentials, keep your cart synced, and place orders with a clean checkout flow.</p>
          <div className="hero-actions">
            <a href="#products" className="hero-primary">
              Shop products <ArrowRight size={18} />
            </a>
            <Link to="/orders" className="hero-secondary">View orders</Link>
          </div>
        </div>
      </section>

      <section className="features-section" aria-label="Shopping benefits">
        <div className="feature-item">
          <PackageCheck size={22} />
          <h3>Curated stock</h3>
          <p>Products stay organized with clear pricing and availability.</p>
        </div>
        <div className="feature-item">
          <ShoppingCart size={22} />
          <h3>Smooth cart</h3>
          <p>Add, update, and review items without losing your place.</p>
        </div>
        <div className="feature-item">
          <ShieldCheck size={22} />
          <h3>Protected sessions</h3>
          <p>Secure refresh cookies keep sessions steady across visits.</p>
        </div>
        <div className="feature-item">
          <Truck size={22} />
          <h3>Order tracking</h3>
          <p>Review your orders and follow the confirmation flow.</p>
        </div>
      </section>

      <section id="products" className="product-preview-section">
        <div className="section-heading">
          <span className="eyebrow">Product preview</span>
          <h2>Featured Products</h2>
          <p>Discover the latest items ready for your cart.</p>
        </div>
      
        {visibleProducts.length === 0 ? (
          <div className="no-products">No products found.</div>
        ) : (
          <div className="products-grid">
            {visibleProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={resolveImageUrl(product.images?.[0])}
                    alt={product.name || 'Product image'}
                    className="product-image"
                    onError={(event) => {
                      console.warn('Product image failed to load:', event.currentTarget.src);
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="product-details">
                  <div className="product-header">
                    <h3 className="product-title">{product.name}</h3>
                    <span className="product-price">₹{Number(product.price || 0).toFixed(2)}</span>
                  </div>
                  <p className="product-desc">{product.description || 'A practical pick for your cart.'}</p>
                  <div className="product-footer">
                    <span className="product-stock">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                    <Button
                      onClick={() => addToCart(product._id)}
                      disabled={product.stock === 0}
                      className="add-cart-btn"
                    >
                      <ShoppingCart size={16} /> Add
                    </Button>
                  </div>
                  {isAdmin && (
                    <div className="admin-card-actions">
                      <button type="button" onClick={() => startEditProduct(product)}>
                        <Pencil size={15} /> Update
                      </button>
                      <button type="button" className="danger-action" onClick={() => deleteProduct(product._id)}>
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {productMeta.totalPages > 1 && (
          <div className="pagination-row">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
              Previous
            </button>
            <span>
              Page {page} of {productMeta.totalPages}
            </span>
            <button type="button" onClick={() => setPage((current) => Math.min(productMeta.totalPages, current + 1))} disabled={page >= productMeta.totalPages}>
              Next
            </button>
          </div>
        )}
      </section>

      {isAdmin && (
        <section id="admin-products" className="admin-dashboard">
          <div className="section-heading">
            <span className="eyebrow">Admin dashboard</span>
            <h2>{editingProductId ? 'Update product' : 'Add product'}</h2>
            <p>Manage catalog items without leaving the product page.</p>
          </div>
          <form className="admin-product-form" onSubmit={submitProduct}>
            <input name="name" value={productForm.name} onChange={handleProductFormChange} placeholder="Product name" required />
            <input name="price" value={productForm.price} onChange={handleProductFormChange} placeholder="Price" type="number" min="1" required />
            <input name="stock" value={productForm.stock} onChange={handleProductFormChange} placeholder="Stock" type="number" min="0" required />
            <input name="category" value={productForm.category} onChange={handleProductFormChange} placeholder="Category" required />
            <input name="images" value={productForm.images} onChange={handleProductFormChange} placeholder="Image URLs, comma separated" />
            <textarea name="description" value={productForm.description} onChange={handleProductFormChange} placeholder="Description" rows="3" />
            <div className="admin-form-actions">
              <Button type="submit" disabled={savingProduct}>
                {savingProduct ? 'Saving...' : editingProductId ? 'Update product' : 'Add product'}
              </Button>
              {editingProductId && (
                <button type="button" className="cancel-edit-btn" onClick={resetProductForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <footer className="home-footer">
        <strong>ShopHub</strong>
        <span>Simple carts, secure sessions, confirmed orders.</span>
      </footer>
    </div>
  );
};
