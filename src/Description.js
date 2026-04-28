import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Description = ({ proId,userId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch("http://localhost:8000/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pro_id: proId })
        });
        
        const data = await response.json();
        if (data.product) {
          setProduct(data);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Failed to fetch product details");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (proId) {
      fetchProduct();
    } else {
      setError("No product ID provided");
      setLoading(false);
    }
  }, [proId]);

  const handleSizeSelect = (spec) => {
    setSelectedSize(spec.size);
    setSelectedSpec(spec);
    // Reset quantity when size changes
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please login to add items to cart");
      navigate('/login');
      return;
    }

    if (!selectedSpec) {
      alert("Please select a size first");
      return;
    }

    setIsAddingToCart(true);
    setCartMessage('');

    try {
      const response = await fetch("http://localhost:8000/cart/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          pro_id: product.product.pro_id,
          spec_id: selectedSpec.spec_id,
          quantity: quantity,
          price: product.product.price
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCartMessage(data.message || "Item added to cart successfully!");
      } else {
        throw new Error(data.message || "Failed to add to cart");
      }
    } catch (err) {
      setCartMessage(err.message);
      console.error("Add to cart error:", err);
    } finally {
      setIsAddingToCart(false);
      // Clear message after 3 seconds
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="description-loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="description-error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="description-not-found">
        <p>Product not found</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="product-description">
      <div className="product-image-container">
        <img 
          src={product.product.image_link} 
          alt={product.product.pro_name} 
          className="product-main-image"
        />
      </div>
      
      <div className="product-details">
        <h1 className="product-title">{product.product.pro_name}</h1>
        <div className="product-rating">
          <span className="stars">{"⭐".repeat(Math.floor(product.product.rating))}</span>
          <span>({product.product.total_rating} ratings)</span>
        </div>
        
        <div className="product-price">₹{product.product.price}</div>
        
        <div className="product-meta">
          <div className="meta-item">
            <span className="meta-label">Category:</span>
            <span className="meta-value">{product.product.category}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Fit:</span>
            <span className="meta-value">{product.product.fit}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Material:</span>
            <span className="meta-value">{product.product.material}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Gender:</span>
            <span className="meta-value">{product.product.sex === 'M' ? 'Male' : 'Female'}</span>
          </div>
        </div>
        
        {/* Size Selection */}
        <div className="size-selection">
          <h3>Select Size</h3>
          <div className="size-buttons">
            {product.spec.map((spec) => (
              <button
                key={spec.spec_id}
                className={`size-button ${selectedSize === spec.size ? 'selected' : ''} ${spec.quantity === 0 ? 'out-of-stock' : ''}`}
                onClick={() => spec.quantity > 0 && handleSizeSelect(spec)}
                disabled={spec.quantity === 0}
              >
                {spec.size}
                {spec.quantity === 0 && <span className="stock-label">(Out of stock)</span>}
                {spec.quantity > 0 && spec.quantity < 10 && <span className="stock-label">(Only {spec.quantity} left)</span>}
              </button>
            ))}
          </div>
        </div>
        
        {/* Quantity Selector */}
        {selectedSize && (
          <div className="quantity-selector">
            <h3>Quantity</h3>
            <div className="quantity-controls">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= selectedSpec.quantity}
              >
                +
              </button>
            </div>
          </div>
        )}
        
        <div className="product-description-text">
          <h3>Description</h3>
          <p>{product.product.pro_description}</p>
        </div>
        
        {/* Cart Message */}
        {cartMessage && (
          <div className={`cart-message ${cartMessage.includes('success') ? 'success' : 'error'}`}>
            {cartMessage}
          </div>
        )}
        
        <div className="product-actions">
          <button 
            className="add-to-cart"
            onClick={handleAddToCart}
            disabled={!selectedSize || isAddingToCart}
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          <button 
            className="buy-now"
            disabled={!selectedSize || isAddingToCart}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Description;
