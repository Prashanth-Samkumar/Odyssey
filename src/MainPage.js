import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';
import { CiShoppingCart } from 'react-icons/ci';
import "./MainPage.css"
const MainPage = ({ search, userId, setProId }) => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch('http://localhost:8000/home');
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          setHomeData(data);
        } else {
          setError(data.message || 'Failed to fetch home data');
        }
      } catch (err) {
        setError('Error fetching home data');
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleProductClick = (productId) => {
    setProId(productId);
    navigate(`/${productId}/description`);
  };

  const uniqueCategories = homeData?.category_products?.reduce((acc, item) => {
    const category = item.category;
    if (!acc.find(c => c.category === category)) {
      acc.push(item);
    }
    return acc;
  }, []) || [];

  const topBrands = homeData?.trending_products?.slice(0, 6) || [];

  return (
    <main className="mainpage">
      {search && search.length > 0 ? (
        <section className="search-results">
          <h3>Search Results</h3>
          <div className="products-grid">
            {search.map((product) => (
              <div
                key={product.pro_id}
                className="product-card"
                onClick={() => handleProductClick(product.pro_id)}
              >
                <img
                  src={product.image_link}
                  alt={product.pro_name}
                  className="product-image"
                />
                <div className="product-info">
                  <h4 className="product-name">{product.pro_name}</h4>
                  <p className="product-price">₹{product.price}</p>
                  <p className="product-rating">⭐ {product.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className="part2">
            <h3>Top Categories</h3>
            <div className="categories">
              {uniqueCategories.slice(0, 6).map((item, index) => (
                <div key={index} className="cat-card">
                  <img
                    src={item.product.image_link}
                    alt={item.category}
                    className="category-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300?text=Category+Image";
                    }}
                  />
                  <p>{item.category}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="part3">
            <h3>Top Brands</h3>
            <div className="categories">
              {topBrands.map((brand, index) => (
                <div key={index} className="cat-card">
                  <img
                    src={brand.image_link}
                    alt={brand.pro_name}
                    className="category-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300?text=Brand+Image";
                    }}
                  />
                  <p>{brand.pro_name}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default MainPage;
