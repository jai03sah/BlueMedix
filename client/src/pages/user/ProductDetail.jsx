import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedFranchise, setSelectedFranchise] = useState('');
  const [franchises, setFranchises] = useState([]);
  const navigate = useNavigate();

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products/${productId}`
        );

        if (response.data.success) {
          setProduct(response.data.product);
          setSelectedImage(0); // Reset selected image when product changes
        } else {
          setError('Failed to fetch product details');
          toast.error('Failed to fetch product details');
        }
      } catch (error) {
        console.error('Fetch product details error:', error);
        setError('An error occurred while fetching product details');
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    const fetchFranchises = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/franchises`
        );

        if (response.data.success) {
          setFranchises(response.data.franchises);
        }
      } catch (error) {
        console.error('Fetch franchises error:', error);
      }
    };

    fetchProductDetails();
    fetchFranchises();
  }, [productId]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product || !product.category) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products?category=${product.category._id}&limit=4`
        );

        if (response.data.success) {
          // Filter out the current product
          const filtered = response.data.products.filter(p => p._id !== productId);
          setRelatedProducts(filtered.slice(0, 3)); // Limit to 3 related products
        }
      } catch (error) {
        console.error('Fetch related products error:', error);
      }
    };

    fetchRelatedProducts();
  }, [product, productId]);

  // Add to cart
  const addToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart/add`,
        { 
          productId: product._id, 
          quantity: quantity,
          franchiseId: selectedFranchise || undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Item added to cart');
      } else {
        toast.error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Product not found'}</p>
          <button 
            onClick={() => navigate('/products')} 
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Calculate discounted price
  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex text-sm text-gray-600">
          <li className="flex items-center">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li className="flex items-center">
            <Link to="/products" className="hover:text-blue-600">Products</Link>
            <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </li>
          {product.category && (
            <li className="flex items-center">
              <Link 
                to={`/products?category=${product.category._id}`} 
                className="hover:text-blue-600"
              >
                {product.category.name}
              </Link>
              <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </li>
          )}
          <li className="text-gray-800 font-medium truncate">{product.name}</li>
        </ol>
      </nav>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Images */}
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden h-80 mb-4">
              {product.image && product.image.length > 0 ? (
                <img 
                  src={product.image[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.image && product.image.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.image.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            {product.category && (
              <div className="mb-4">
                <Link 
                  to={`/products?category=${product.category._id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {product.category.name}
                </Link>
              </div>
            )}
            
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-gray-800">
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            {/* Stock Information */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Availability: 
                <span className={`ml-1 font-medium ${product.warehouseStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.warehouseStock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </p>
              {product.manufacturer && (
                <p className="text-sm text-gray-600 mt-1">
                  Manufacturer: <span className="font-medium">{product.manufacturer}</span>
                </p>
              )}
            </div>
            
            {/* Franchise Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Franchise (Optional)
              </label>
              <select
                value={selectedFranchise}
                onChange={(e) => setSelectedFranchise(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a franchise</option>
                {franchises.map((franchise) => (
                  <option key={franchise._id} value={franchise._id}>
                    {franchise.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <label className="block text-gray-700 text-sm font-medium mr-4">
                Quantity:
              </label>
              <div className="flex items-center border rounded">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-3 py-1 border-x">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              disabled={product.warehouseStock <= 0}
              className={`w-full py-3 px-4 rounded font-medium ${
                product.warehouseStock > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              {product.warehouseStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div 
                key={relatedProduct._id} 
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/products/${relatedProduct._id}`}>
                  <div className="h-48 bg-gray-200 relative">
                    {relatedProduct.image && relatedProduct.image.length > 0 ? (
                      <img 
                        src={relatedProduct.image[0]} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {relatedProduct.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {relatedProduct.discount}% OFF
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link to={`/products/${relatedProduct._id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600">{relatedProduct.name}</h3>
                  </Link>
                  
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-bold text-gray-800">
                      ${((relatedProduct.price * (1 - relatedProduct.discount / 100)).toFixed(2))}
                    </span>
                    {relatedProduct.discount > 0 && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;