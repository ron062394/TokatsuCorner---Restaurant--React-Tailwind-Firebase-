import React, { useState, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaSave } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthContext } from '../../hooks/useAuthContext';
import { CartContext } from '../../context/cartContext';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';

const Cart = () => {
  const { cart, dispatch } = useContext(CartContext);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const { user } = useAuthContext();
  const [menuItems, setMenuItems] = useState({});
  const navigate = useNavigate();

  const fetchMenuItems = useCallback(async () => {
    try {
      const menuSnapshot = await getDocs(collection(db, 'Menu'));
      const menuData = {};
      menuSnapshot.forEach((doc) => {
        menuData[doc.id] = doc.data();
      });
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    if (Object.keys(menuItems).length > 0) {
      setLoading(false);
    }
  }, [menuItems]);

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal - discount);
  }, [cart, discount]);

  useEffect(() => {
    if (user && cart.length === 0) {
      dispatch({ type: 'FETCH_CART' });
    }
  }, [user, cart.length, dispatch]);

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id: itemId } });
    toast.success('Item removed from cart');
  };

  const incrementQuantity = (itemId) => {
    dispatch({ type: 'INCREMENT_ITEM', payload: { id: itemId } });
    toast.success('Cart updated');
  };

  const decrementQuantity = (itemId) => {
    dispatch({ type: 'DECREMENT_ITEM', payload: { id: itemId } });
    toast.success('Cart updated');
  };

  const applyCoupon = () => {
    // Mock coupon application
    if (couponCode === 'DISCOUNT10') {
      setDiscount(total * 0.1);
      toast.success('Coupon applied successfully!');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const saveForLater = () => {
    // Implement save for later functionality
    toast.info('Items saved for later');
  };

  const handleCheckout = () => {
    dispatch({ type: 'CLEAR_CART' });
    navigate('/checkout');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black flex justify-center items-center">
        <motion.div
          className="text-white text-3xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black py-16 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-white mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          Your Cart
        </motion.h1>
        {cart.length === 0 ? (
          <motion.div
            className="bg-white bg-opacity-10 rounded-lg shadow-lg p-8 backdrop-filter backdrop-blur-lg text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <p className="text-2xl text-gray-300 mb-6">Your cart is empty.</p>
            <Link 
              to="/menu" 
              className="bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-700 transition duration-300 shadow-lg inline-flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Menu
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="bg-white bg-opacity-10 rounded-lg shadow-lg overflow-hidden mb-8 backdrop-filter backdrop-blur-lg"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className={`flex items-center justify-between p-6 ${index !== cart.length - 1 ? 'border-b border-gray-700' : ''}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <div className="flex items-center flex-1">
                      <img src={menuItems[item.itemId]?.imageURL || ''} alt={item.name} className="w-20 h-20 object-cover rounded-lg mr-6" />
                      <div>
                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                        <p className="text-gray-400">${item.price.toFixed(2)}</p>
                        <p className="text-gray-500">{menuItems[item.itemId]?.category || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-gray-800 text-white rounded-l hover:bg-gray-700 transition duration-300"
                        onClick={() => decrementQuantity(item.id)}
                      >
                        -
                      </motion.button>
                      <span className="px-4 py-1 bg-gray-700 text-white">{item.quantity}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-gray-800 text-white rounded-r hover:bg-gray-700 transition duration-300"
                        onClick={() => incrementQuantity(item.id)}
                      >
                        +
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="ml-6 text-red-500 hover:text-red-400 transition duration-300"
                        onClick={() => removeItem(item.id)}
                      >
                        <FaTrash size={20} />
                      </motion.button>
                      <span className="ml-6 text-white font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            <motion.div
              className="bg-white bg-opacity-10 rounded-lg shadow-lg p-6 mb-8 backdrop-filter backdrop-blur-lg"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-grow px-4 py-2 rounded-l-lg focus:outline-none"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  onClick={applyCoupon}
                  className="bg-gray-800 text-white px-6 py-2 rounded-r-lg hover:bg-gray-700 transition duration-300"
                >
                  Apply
                </button>
              </div>
              <button
                onClick={saveForLater}
                className="w-full bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center"
              >
                <FaSave className="mr-2" />
                Save for Later
              </button>
            </motion.div>
            <motion.div
              className="flex justify-between items-center"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div>
                <h2 className="text-3xl font-bold text-white">Total: ${total.toFixed(2)}</h2>
                {discount > 0 && (
                  <p className="text-green-400 mt-2">Discount applied: ${discount.toFixed(2)}</p>
                )}
              </div>
              <button
                onClick={handleCheckout}
                className="bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-700 transition duration-300 shadow-lg inline-flex items-center"
              >
                <FaShoppingCart className="mr-2" />
                Proceed to Checkout
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
