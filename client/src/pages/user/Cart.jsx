import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedFranchise, setSelectedFranchise] = useState('');
  const [franchises, setFranchises] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setCartItems(response.data.cartItems);
          setTotalPrice(response.data.totalPrice);
        } else {
          setError('Failed to fetch cart items');
          toast.error('Failed to fetch cart items');
        }
      } catch (error) {
        console.error('Fetch cart error:', error);
        setError('An error occurred while fetching your cart');
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    const fetchFranchises = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/franchises`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setFranchises(response.data.franchises);
        }
      } catch (error) {
        console.error('Fetch franchises error:', error);
      }
    };

    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/addresses`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setAddresses(response.data.addresses);
        }
      } catch (error) {
        console.error('Fetch addresses error:', error);
      }
    };

    fetchCart();
    fetchFranchises();
    fetchAddresses();
  }, []);

  // Update cart item quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/cart/item/${cartItemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update the cart items state
        setCartItems(prevItems => 
          prevItems.map(item => 
            item._id === cartItemId 
              ? { ...item, quantity: newQuantity } 
              : item
          )
        );
        
        // Recalculate total price
        const updatedCart = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setTotalPrice(updatedCart.data.totalPrice);
        toast.success('Cart updated');
      } else {
        toast.error('Failed to update cart');
      }
    } catch (error) {
      console.error('Update cart error:', error);
      toast.error('Failed to update cart');
    }
  };

  // Remove item from cart
  const removeItem = async (cartItemId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/cart/item/${cartItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Remove the item from state
        setCartItems(prevItems => prevItems.filter(item => item._id !== cartItemId));
        
        // Recalculate total price
        const updatedCart = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setTotalPrice(updatedCart.data.totalPrice);
        toast.success('Item removed from cart');
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/cart/clear`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCartItems([]);
        setTotalPrice(0);
        toast.success('Cart cleared');
      } else {
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Proceed to checkout
  const checkout = async () => {
    if (!selectedFranchise) {
      toast.error('Please select a franchise');
      return;
    }

    if (!deliveryAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create an order for each product in the cart
      for (const item of cartItems) {
        const orderData = {
          product_id: item.productid._id,
          deliveryAddress: deliveryAddress,
          franchise: selectedFranchise,
          subtotalAmount: item.productid.price * (1 - item.productid.discount / 100) * item.quantity,
          totalAmount: (item.productid.price * (1 - item.productid.discount / 100) * item.quantity) + 10, // Adding $10 delivery charge
          deliveryCharge: 10
        };
        
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/orders`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      // Clear the cart after successful checkout
      await clearCart();
      
      toast.success('Order placed successfully');
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-xl font-semibold mt-4">Your cart is empty</h2>
          <p className="text-gray-600 mt-2">Looks like you haven't added any products to your cart yet.</p>
          <Link 
            to="/products" 
            className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Cart Items ({cartItems.length})</h2>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item._id} className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={item.productid.image[0] || 'https://via.placeholder.com/80'} 
                        alt={item.productid.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 ml-0 sm:ml-4 mt-2 sm:mt-0">
                      <h3 className="text-base font-medium">{item.productid.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-600">
                          ${((item.productid.price * (1 - item.productid.discount / 100)).toFixed(2))}
                        </span>
                        {item.productid.discount > 0 && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ${item.productid.price.toFixed(2)}
                          </span>
                        )}
                        {item.productid.discount > 0 && (
                          <span className="ml-2 text-sm text-green-600">
                            {item.productid.discount}% off
                          </span>
                        )}
                      </div>
                      
                      {item.franchise && (
                        <p className="text-sm text-gray-500 mt-1">
                          Franchise: {item.franchise.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-4 sm:mt-0">
                      <div className="flex items-center border rounded">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item._id)}
                        className="ml-4 text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="p-4 border-t">
              <button 
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Order Summary</h2>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">$10.00</span>
              </div>
              <div className="border-t my-4"></div>
              <div className="flex justify-between mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-semibold">${(totalPrice + 10).toFixed(2)}</span>
              </div>
              
              {/* Franchise Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Select Franchise
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
              
              {/* Address Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Delivery Address
                </label>
                <select
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an address</option>
                  {addresses.map((address) => (
                    <option key={address._id} value={address._id}>
                      {address.Street}, {address.city}, {address.state}, {address.pincode}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <Link 
                    to="/addresses/add" 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add a new address
                  </Link>
                </div>
              </div>
              
              <button 
                onClick={checkout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;