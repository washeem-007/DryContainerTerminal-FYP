import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const InspectionSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Defaulting to empty object to prevent crashes if navigated directly
    const { containerId, inspectionType, customOfficer, additionalCharges, status } = location.state || {};

    if (!containerId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="text-red-600 text-xl font-bold mb-4">Error: No Inspection Data Found.</div>
                    <button onClick={() => navigate('/inspection-dashboard')} className="text-blue-600 underline">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    const getStatusColor = (s) => {
        if (s === 'Passed') return 'text-green-600';
        if (s === 'Failed') return 'text-red-600';
        return 'text-yellow-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="max-w-xl w-full">
                <div className="text-gray-500 text-sm mb-4">
                    Port Authority Services - Wharf Clerk Inspection Summary
                </div>
                
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Inspection Summary</h1>
                    
                    <div className="w-full border border-gray-100 shadow-sm rounded-xl p-8 mb-8">
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-400 capitalize mb-1">Container ID</label>
                            <div className="text-2xl font-bold text-gray-900">{containerId}</div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-400 capitalize mb-1">Inspection Type</label>
                            <div className="text-base font-medium text-gray-900">{inspectionType}</div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-400 capitalize mb-1">Customs Officer</label>
                            <div className="text-base font-medium text-gray-900">{customOfficer}</div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-xs font-semibold text-gray-400 capitalize mb-1">Additional Charges</label>
                            <div className="text-base font-medium text-gray-900">USD {parseFloat(additionalCharges || 0).toFixed(2)}</div>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-100 pt-6 font-bold">
                            <span className="text-gray-800">Inspection Status</span>
                            <span className={`${getStatusColor(status)} uppercase`}>INSPECTION {status}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/inspection-dashboard')}
                        className="w-full bg-blue-600 text-white font-bold text-lg py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                        Done
                    </button>

                    {status === 'Failed' && (
                        <button className="mt-6 px-4 py-2 border border-blue-200 text-blue-600 text-sm font-medium rounded hover:bg-blue-50 transition">
                            Show Failed Inspection
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InspectionSummary;
