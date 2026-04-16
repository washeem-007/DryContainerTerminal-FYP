import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SmartContainerInput from '../components/SmartContainerInput';
import TopNavbar from '../components/TopNavbar';

const ContainerDetailsForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bayId } = location.state || {};

    const [formData, setFormData] = useState({
        containerId: '',
        weight: '',
        originPort: '',
        shipper: '',
        containerType: '40ft High Cube Dry',
        productType: ''
    });
    const [isContainerIdValid, setIsContainerIdValid] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/container-summary', {
            state: {
                formData,
                bayId
            }
        });
    };

    if (!bayId) {
        return <div className="p-8 text-center text-red-600">Error: No Bay Selected. Please go back.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TopNavbar />
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200 mt-8">
                <header className="mb-8 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Container Details</h2>
                    <p className="text-gray-500">Enter the details for the container in Bay {bayId}.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <SmartContainerInput
                            onChange={(rawValue, valid) => {
                                setFormData(prev => ({ ...prev, containerId: rawValue }));
                                setIsContainerIdValid(valid);
                            }}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="30500"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Origin Port</label>
                            <input
                                type="text"
                                name="originPort"
                                value={formData.originPort}
                                onChange={handleChange}
                                placeholder="Shanghai, China"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shipper</label>
                            <input
                                type="text"
                                name="shipper"
                                value={formData.shipper}
                                onChange={handleChange}
                                placeholder="Global Logistics Corp."
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Container Type</label>
                            <select
                                name="containerType"
                                value={formData.containerType}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option>40ft High Cube Dry</option>
                                <option>20ft Standard Dry</option>
                                <option>45ft High Cube Dry</option>
                                <option>Reefer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                            <input
                                type="text"
                                name="productType"
                                value={formData.productType}
                                onChange={handleChange}
                                placeholder="Mixed Goods"
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={!isContainerIdValid}
                            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContainerDetailsForm;
