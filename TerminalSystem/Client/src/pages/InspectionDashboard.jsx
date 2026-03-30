import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const InspectionCard = ({ bay, submitInspection }) => {
    const isOccupied = bay.isOccupied;
    const [formData, setFormData] = useState({
        customOfficer: 'John Doe',
        inspectionType: 'Full Inspection',
        additionalCharges: '',
        wharfClerkId: '',
        wharfClerkName: 'Selected clerk name'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col h-full">
            <div className="text-sm font-bold text-gray-800 mb-2">Bay {bay.bayNumber}</div>
            
            {isOccupied ? (
                <div className="text-2xl font-bold text-gray-900 text-center mb-6">
                    {bay.containerId}
                </div>
            ) : (
                <div className="text-xl font-bold text-gray-400 text-center mb-6 flex-1 flex items-center justify-center">
                    No Container Assigned
                </div>
            )}

            <div className={`space-y-4 flex-1 ${!isOccupied ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Custom Officer Name</label>
                    <select 
                        name="customOfficer"
                        value={formData.customOfficer}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option>John Doe</option>
                        <option>Jane Smith</option>
                        <option>Mike Johnson</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Inspection Type</label>
                    <select 
                        name="inspectionType"
                        value={formData.inspectionType}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option>Full Inspection</option>
                        <option>Partial Inspection</option>
                        <option>Document Check</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Additional Charges</label>
                    <input 
                        type="number"
                        name="additionalCharges"
                        value={formData.additionalCharges}
                        onChange={handleChange}
                        placeholder="Enter Amount"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Wharf Clerk ID</label>
                    <select 
                        name="wharfClerkId"
                        value={formData.wharfClerkId}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Search ID...</option>
                        <option value="WC001">WC001</option>
                        <option value="WC002">WC002</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Wharf Clerk Name</label>
                    <input 
                        type="text"
                        name="wharfClerkName"
                        value={formData.wharfClerkName}
                        onChange={handleChange}
                        placeholder="Selected clerk name"
                        className="w-full p-2 border border-gray-200 rounded-md text-sm bg-gray-100 text-gray-500"
                        readOnly
                    />
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <button 
                    disabled={!isOccupied}
                    onClick={() => submitInspection(bay, formData, 'Passed')}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white py-2.5 rounded-md font-bold text-sm transition-colors shadow-sm"
                >
                    Pass
                </button>
                <button 
                    disabled={!isOccupied}
                    onClick={() => submitInspection(bay, formData, 'Failed')}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 text-white py-2.5 rounded-md font-bold text-sm transition-colors shadow-sm"
                >
                    Failed
                </button>
                <button 
                    disabled={!isOccupied}
                    onClick={() => submitInspection(bay, formData, 'Pending')}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:text-gray-500 text-white py-2.5 rounded-md font-bold text-sm transition-colors shadow-sm"
                >
                    Pending
                </button>
            </div>
        </div>
    );
};

const InspectionDashboard = () => {
    const navigate = useNavigate();
    const [bays, setBays] = useState([]);

    useEffect(() => {
        const fetchBays = async () => {
            try {
                const response = await api.get('/yard/bays');
                const data = response.data;
                
                const mapped = data.map(b => ({
                    locationId: b.locationId,
                    bayNumber: b.bayNumber,
                    isOccupied: b.isOccupied,
                    // Provide a realistic dummy ID if occupied, since our actual DB might not link containers correctly yet
                    containerId: b.isOccupied ? `CNTR${b.bayNumber * 1000 + Date.now().toString().slice(-3)}` : null 
                }));

                setBays(mapped);
            } catch (err) {
                 // Fallback mock if API is down
                 console.error(err);
                 const mock = [];
                 for (let i = 1; i <= 10; i++) {
                     const isOccupied = i % 2 !== 0;
                     mock.push({
                         locationId: i,
                         bayNumber: i + 6,
                         isOccupied,
                         containerId: isOccupied ? `MSKU${1234567 + i}` : null
                     });
                 }
                 setBays(mock);
            }
        };

        fetchBays();
    }, []);

    const submitInspection = async (bay, formData, status) => {
        const payload = {
            ContainerId: bay.containerId,
            BayId: bay.locationId,
            Status: status === 'Passed' ? 'Pass' : status,
            CustomOfficerName: formData.customOfficer,
            InspectionType: formData.inspectionType,
            AdditionalCharges: formData.additionalCharges ? parseFloat(formData.additionalCharges) : 0,
            WharfClerkId: formData.wharfClerkId || 'WC000',
            WharfClerkName: formData.wharfClerkName || 'Default Clerk'
        };

        try {
            await api.post('/inspections/submit', payload);
        } catch(e) {
            console.error("Failed to submit inspection to API.", e);
        }

        navigate('/inspection-summary', { 
            state: { 
                containerId: bay.containerId,
                inspectionType: formData.inspectionType,
                customOfficer: formData.customOfficer,
                additionalCharges: formData.additionalCharges || '0',
                status: status
            }
        });
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="px-8 py-6 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Inspection Form</h1>
                <p className="text-gray-600 font-medium text-sm">Supervisor: Alex Chen</p>
                <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline mt-2 block">Back to Dashboard</button>
            </header>
            
            <main className="p-8 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bays.map(bay => (
                        <InspectionCard 
                            key={bay.bayNumber} 
                            bay={bay} 
                            submitInspection={submitInspection} 
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default InspectionDashboard;
