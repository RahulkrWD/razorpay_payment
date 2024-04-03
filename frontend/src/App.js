// src/App.js
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const createOrder = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/orders`,
        {
          amount,
        }
      );
      const { orderId } = response.data;
      setOrderId(orderId);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const handlePaymentSuccess = async (paymentId) => {
    try {
      await axios.post(`${process.env.REACT_APP_URL}/api/payment/success`, {
        order_id: orderId,
        payment_id: paymentId,
      });
      console.log("successfull payment");
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  return (
    <div className="App">
      <h1>Razorpay Payment Gateway</h1>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={createOrder}>Place Order</button>
      {orderId && (
        <div>
          <p>Order ID: {orderId}</p>
          <div className="razorpay-container">
            <button
              onClick={() => {
                const options = {
                  key: `${process.env.REACT_APP_KEY}`,
                  amount: amount * 100,
                  currency: "INR",
                  name: "Your Company Name",
                  description: "Payment for your order",
                  image: "https://via.placeholder.com/150",
                  order_id: orderId,
                  handler: function (response) {
                    handlePaymentSuccess(response.razorpay_payment_id);
                  },
                  prefill: {
                    name: "John Doe",
                    email: "john@example.com",
                    contact: "9999999999",
                  },
                  notes: {
                    address: "Razorpay Corporate Office",
                  },
                  theme: {
                    color: "#3399cc",
                  },
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
              }}
            >
              Pay Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
