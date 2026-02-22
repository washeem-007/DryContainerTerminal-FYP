import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const WeighingForm = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to access state
    const [formData, setFormData] = useState({
        receiptNumber: '',
        containerId: '',
        weight: '',
        productType: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Read bayNumber from navigation state if available
        const locationState = location.state || {}; // Rename to avoid conflict with 'location'

        // Construct payload with user data + hardcoded requirement fields
        // Construct payload with user data + hardcoded requirement fields
        const payload = {
            containerId: formData.containerId,
            weight: 0, // Placeholder as it is not weighed yet
            productType: formData.productType,
            receiptNumber: formData.receiptNumber,
            vehicleNumber: "TRUCK-001",
            originPort: "Pending",
            isCleared: false, // Not cleared, needs weighing
            hasWeightSlip: false, // No weight slip
            Size: 20,
            PreferredBayNumber: locationState.bayNumber ? parseInt(locationState.bayNumber) : null
        };

        try {
            const response = await fetch('http://localhost:5047/api/Containers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Weighing Complete!");
                navigate('/');
            } else {
                alert("Failed to submit weighing. Please try again.");
                console.error("Submit failed", response.status, await response.text());
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Network error. Check backend connection.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-12">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <header className="mb-8 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Container Registration (Needs Weighing)</h2>
                    <p className="text-gray-500">Input the essential information. Verification will be done at the weigh bridge.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                        <input
                            type="text"
                            name="receiptNumber"
                            value={formData.receiptNumber}
                            onChange={handleChange}
                            placeholder="Enter receipt number"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Container Number</label>
                        <input
                            type="text"
                            name="containerId"
                            value={formData.containerId}
                            onChange={handleChange}
                            placeholder="Enter container number (e.g., ABCU1234567)"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Weight input removed for "Needs Weighing" workflow */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                            <select
                                name="productType"
                                value={formData.productType}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            >
                                <option value="">Select product type</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Textiles">Textiles</option>
                                <option value="Automotive">Automotive</option>
                                <option value="Chemicals">Chemicals</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Submit Weighing
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WeighingForm;
