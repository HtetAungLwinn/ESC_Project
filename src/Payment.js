import React, { useState } from 'react';


function PaymentPage() {
    const [name, setName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!name || !cardNumber || !expiryDate || !cvv) {
            setError('All fields are required');
            return;
        }

        if (!/^\d{16}$/.test(cardNumber)) {
            setError('Card number must be 16 digits');
            return;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            setError('CVV must be 3 or 4 digits');
            return;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
            setError('Expiry date must be in MM/YY format');
            return;
        }

        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/payment/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cardNumber,
                    cvv,
                    expiryDate
                })
            });

            const data = await res.json();

            if (res.ok && data.success) { 
                    window.location.href = '/confirmation';
                } else {
                    setError(data.error || 'Payment failed');
                };
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error('Payment error:', err);
        }
    };

    return (
        <div>
            <h2>Payment Details</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name on Card:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label>Card Number:</label>
                    <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111111111111111"
                    />
                </div>

                <div>
                    <label>Expiry Date (MM/YY):</label>
                    <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="12/25"
                    />
                </div>

                <div>
                    <label>CVV:</label>
                    <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                    />
                </div>

                <button type="submit">Pay Now</button>
            </form>
        </div>
    );
}

export default PaymentPage;