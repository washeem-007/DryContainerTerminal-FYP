import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const InspectionCard = ({ bay, submitInspection, wharfClerks }) => {
    const isOccupied = bay.isOccupied;
    const [formData, setFormData] = useState({
        customOfficer: 'John Doe',
        inspectionType: 'Full Inspection',
        additionalCharges: '',
        assignedWharfClerk: '' 
    });

    useEffect(() => {
        if (wharfClerks && wharfClerks.length > 0 && !formData.assignedWharfClerk) {
            setFormData(prev => ({ ...prev, assignedWharfClerk: wharfClerks[0].name }));
        }
    }, [wharfClerks]);

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
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Assign to Wharf Clerk</label>
                    <select
                        name="assignedWharfClerk"
                        value={formData.assignedWharfClerk}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Select a clerk...</option>
                        {wharfClerks && wharfClerks.map(clerk => (
                            <option key={clerk.id} value={clerk.name}>
                                {clerk.name}
                            </option>
                        ))}
                    </select>
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
    const [wharfClerks, setWharfClerks] = useState([]);

    useEffect(() => {
        const fetchBaysAndUsers = async () => {
            try {
                const response = await api.get('/yard/bays?type=Inspection');
                const data = response.data;

                const mapped = data.map(b => ({
                    locationId: b.locationId,
                    bayNumber: b.bayNumber,
                    isOccupied: b.isOccupied,
                    containerId: b.containerId || null
                }));

                setBays(mapped);
            } catch (err) {
                console.error(err);
                // Don't auto generate 10 mock slots, just fallback gracefully to what we can.
            }

            try {
                const usersResponse = await api.get('/admin/users');
                const clerks = usersResponse.data.filter(u => u.role === 'Wharf Clerk');
                setWharfClerks(clerks);
            } catch (err) {
                console.error("Failed to fetch wharf clerks", err);
            }
        };

        fetchBaysAndUsers();
    }, []);

    const submitInspection = async (bay, formData, status) => {
        const payload = {
            ContainerId: bay.containerId,
            BayId: bay.locationId,
            Status: status === 'Passed' ? 'Pass' : status,
            CustomOfficerName: formData.customOfficer,
            InspectionType: formData.inspectionType,
            AdditionalCharges: formData.additionalCharges ? parseFloat(formData.additionalCharges) : 0,
            AssignedWharfClerk: formData.assignedWharfClerk
        };

        try {
            await api.post('/inspections/submit', payload);
        } catch (e) {
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
                            wharfClerks={wharfClerks}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default InspectionDashboard;
