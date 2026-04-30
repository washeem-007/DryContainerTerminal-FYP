import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/axiosConfig';
import SmartContainerInput from '../components/SmartContainerInput';
import TopNavbar from '../components/TopNavbar';

const WeighingForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        receiptNumber: '',
        containerId: '',
        weight: '',
        productType: ''
    });
    const [isContainerIdValid, setIsContainerIdValid] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSummaryModal(true);
    };

    // Actual API call triggered by the modal's "Confirm" button
    const handleConfirm = async () => {
        const locationState = location.state || {};
        const payload = {
            containerId: formData.containerId,
            weight: 0,
            productType: formData.productType,
            shipper: formData.shipper || "Self",
            receiptNumber: formData.receiptNumber,
            vehicleNumber: "TRUCK-001",
            CurrentStatus: 'Entry',
            IsCleared: false,
            HasWeightSlip: true,
            Size: 20,
            PreferredBayNumber: locationState.bayNumber ? parseInt(locationState.bayNumber) : null
        };

        try {
            await api.post('/Containers', payload);
            setShowSummaryModal(false);
            navigate('/dashboard');
        } catch (error) {
            alert("Failed to submit. Please try again.");
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TopNavbar>
                <button onClick={() => navigate('/dashboard')} className="hover:text-gray-900">Dashboard</button>
                <button onClick={() => navigate('/weigh-bays')} className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 -mb-1">Container Registration</button>
            </TopNavbar>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 mt-8">
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

                    <SmartContainerInput
                        onChange={(rawValue, valid) => {
                            setFormData(prev => ({ ...prev, containerId: rawValue }));
                            setIsContainerIdValid(valid);
                        }}
                    />

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
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isContainerIdValid}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Weighing
                        </button>
                    </div>
                </form>
            </div>

            {/* Summary Confirmation Modal */}
            {showSummaryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Confirm Submission</h2>
                        <p className="text-sm text-gray-500 mb-6">Please review the details before submitting.</p>

                        <div className="space-y-3 bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-500">Receipt Number</span>
                                <span className="font-bold text-gray-900">{formData.receiptNumber || '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-500">Container ID</span>
                                <span className="font-bold text-gray-900 font-mono">{formData.containerId || '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-500">Product Type</span>
                                <span className="font-bold text-gray-900">{formData.productType || '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-500">Bay Slot</span>
                                <span className="font-bold text-gray-900">{location.state?.bayNumber ? `Bay ${location.state.bayNumber}` : 'Auto-assigned'}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-colors"
                            >
                                Confirm &amp; Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeighingForm;
