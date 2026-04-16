import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Printer } from 'lucide-react';
import api from '../utils/axiosConfig';

const ContainerSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { formData, bayId } = location.state || {}; // Expecting formData & bayId

    const handleDone = async () => {
        // Construct Payload
        // Note: 'Shipper' and 'ContainerType' fields are not in the backend 'Container' model yet.
        // We will map what we can and maybe omit or repurpose others, or send them if backend ignores extras.
        const payload = {
            containerId: formData.containerId,
            weight: parseFloat(formData.weight),
            // Mapping frontend 'containerType' to model 'Type'
            type: formData.containerType,
            originPort: formData.originPort,
            productType: formData.productType,
            shipper: formData.shipper || "Unknown",

            // Workflow specific:
            hasWeightSlip: true,
            isCleared: false, // Wait for inspection & payment
            preferredBayNumber: bayId,

            // Required by backend but not in this form:
            vehicleNumber: "TRUCK-DEFAULT", // Hardcoded for this workflow as per previous pattern
            arrivalTime: new Date().toISOString()
        };

        try {
            await api.post('/Containers', payload);
            alert("Container Registered Successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error("Network error:", error);
            alert("Failed to register. Please try again.");
        }
    };

    if (!formData || !bayId) {
        return <div className="p-8 text-center text-red-600">Error: Missing Data.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-12">
            <div className="max-w-5xl mx-auto">
                <div className="hidden print:block text-center text-2xl font-bold mb-8">Terminal Gate Pass</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8 print:hidden">Summary of Container Details</h1>

                <div className="grid grid-cols-3 gap-8 mb-8 print:block print:space-y-8">
                    {/* Container Details Card */}
                    <div className="col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Container Details</h2>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Container ID</label>
                                <div className="text-lg font-medium text-gray-900">{formData.containerId}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                                <div className="text-lg font-medium text-gray-900">{formData.containerType}</div>
                            </div>

                            {/* Tare/Net Weight are calculated/mocked for display if user only entered Gross? 
                                User entered 'Weight', let's assume it's Gross Weight. 
                                We can display it as Gross.
                            */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gross Weight</label>
                                <div className="text-lg font-bold text-gray-900">{Number(formData.weight).toLocaleString()} kg</div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Contents</label>
                                <div className="text-lg font-medium text-gray-900">{formData.productType}</div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Origin Port</label>
                                <div className="text-lg font-medium text-gray-900">{formData.originPort}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shipper</label>
                                <div className="text-lg font-medium text-gray-900">{formData.shipper}</div>
                            </div>
                        </div>
                    </div>

                    {/* Bay Slot Card */}
                    <div className="col-span-1 bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Selected Bay Slot</h2>
                        <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-5xl font-bold text-white">{String(bayId).padStart(2, '0')}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Selected
                        </div>
                    </div>
                </div>

                {/* Transaction Summary */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Summary</h2>
                    <p className="text-gray-600 leading-relaxed">
                        All container weighing details and the selected bay slot have been successfully captured and are ready for finalization. Please review the information carefully before proceeding.
                    </p>
                </div>

                <div className="flex justify-center gap-4 mb-12 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Printer className="w-5 h-5" />
                        Print Ticket
                    </button>
                    <button
                        onClick={handleDone}
                        className="bg-blue-600 text-white px-12 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Done
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ContainerSummary;
