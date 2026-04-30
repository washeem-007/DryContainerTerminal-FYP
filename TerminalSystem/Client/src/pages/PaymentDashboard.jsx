import React, { useState, useEffect, useContext } from 'react';
import { AlertCircle, Clock, CheckCircle2, LayoutGrid, Box, ArrowRight, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import GatePassSuccess from '../components/GatePassSuccess';
import { AuthContext } from '../context/AuthContext';
import TopNavbar from '../components/TopNavbar';

const PaymentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const role = user?.role;

    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successPass, setSuccessPass] = useState(null);
    const [activeTab, setActiveTab] = useState('Pending Inspection');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/containers/wharf-dashboard');
                const data = response.data;
                setContainers(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derived Status Counts
    const totalAmountDue = containers
        .filter(c => c.status === 'Passed')
        .reduce((sum, c) => {
            const val = parseFloat((c.totalDue || '').toString().replace(/[^0-9.]/g, '')) || 0;
            return sum + val;
        }, 0);
    const awaitingInspectionCount = containers.filter(c => c.status === 'Pending' || c.status === 'Awaiting Inspection').length;
    const readyForPickupCount = containers.filter(c => c.status === 'Passed').length;

    // Filter displayed array based on tabs
    const displayedContainers = containers.filter(c => {
        if (activeTab === 'Pending Inspection') return c.status === 'Pending' || c.status === 'Awaiting Inspection';
        if (activeTab === 'Ready for Pickup') return c.status === 'Passed';
        return true;
    });

    const handleProcessPayment = async (container) => {
        try {
            // Actual API call locking clearance in database natively
            await api.post(`/containers/${container.containerId}/pay`);

            // Remove the container from the dashboard locally for immediate UI update
            setContainers(prev => prev.filter(c => c.containerId !== container.containerId));

            // Trigger the success full screen 
            setSuccessPass(container);
        } catch (error) {
            console.error("Failed to process payment:", error);
            alert("Payment simulation failed.");
        }
    };

    if (successPass) {
        return (
            <div className="min-h-screen bg-white">
                <GatePassSuccess
                    container={successPass}
                    onClose={() => setSuccessPass(null)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <TopNavbar>
                <button onClick={() => navigate('/payments')} className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 -mb-1">Shipments &amp; Payments</button>
            </TopNavbar>

            <main className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Shipments Overview</h1>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                            <AlertCircle className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-500">Total Amount Due</div>
                            <div className="text-2xl font-bold text-blue-600">${totalAmountDue.toFixed(2)}</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mr-4">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-500">Awaiting Inspection</div>
                            <div className="text-2xl font-bold text-gray-900">{awaitingInspectionCount.toString().padStart(2, '0')}</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mr-4">
                            <CheckCircle2 className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-500">Ready for Pickup</div>
                            <div className="text-2xl font-bold text-gray-900">{readyForPickupCount.toString().padStart(2, '0')}</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex justify-between items-center border-b border-gray-200 mb-8 pb-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('Pending Inspection')}
                            className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors border ${activeTab === 'Pending Inspection' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Pending Inspection
                        </button>
                        <button
                            onClick={() => setActiveTab('Ready for Pickup')}
                            className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors border ${activeTab === 'Ready for Pickup' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Ready for Pickup
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 italic font-medium">
                        Showing {displayedContainers.length} containers arriving this week
                        <LayoutGrid className="w-4 h-4 ml-1 text-gray-400" />
                    </div>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div className="flex justify-center p-12 text-gray-500">Loading containers...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedContainers.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                No containers found in this status.
                            </div>
                        ) : (
                            displayedContainers.map((container, index) => {
                                const isHighTime = container.daysInTerminal >= 7;
                                return (
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Container ID</div>
                                                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                                    <Box className="w-5 h-5 text-blue-500" />
                                                    {container.containerId}
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold font-sans ${container.status === 'Passed' ? 'bg-teal-600 text-white' :
                                                    container.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                                                        'bg-red-500 text-white'
                                                }`}>
                                                {container.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                    <span className="tracking-wide">Location</span>
                                                </div>
                                                <div className="text-sm font-extrabold text-gray-800">{container.location}</div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                    <span className="tracking-wide">Terminal Time</span>
                                                </div>
                                                <div className={`text-sm font-extrabold ${isHighTime ? 'text-red-500' : 'text-gray-800'}`}>{container.daysInTerminal} Days</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                <Truck className="w-3 h-3 inline-block mr-1 opacity-75" />
                                                Shipper
                                            </div>
                                            <div className="text-sm font-bold text-gray-800">{container.shipper}</div>
                                        </div>

                                        <div className="mt-auto flex items-end justify-between">
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Due</div>
                                                <div className="text-2xl font-black text-blue-600 tracking-tight">
                                                    {(container.status === 'Passed' || container.status === 'Failed') ? container.totalDue : 'TBD'}
                                                </div>
                                            </div>

                                            {container.status === 'Passed' ? (
                                                <button
                                                    onClick={() => handleProcessPayment(container)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                                                >
                                                    Process Payment <ArrowRight className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button disabled className="bg-gray-50 border border-gray-200 text-gray-400 px-4 py-2.5 rounded-lg text-sm font-bold cursor-not-allowed">
                                                    {container.status === 'Failed' ? 'On Hold' : 'Awaiting Inspection'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PaymentDashboard;
