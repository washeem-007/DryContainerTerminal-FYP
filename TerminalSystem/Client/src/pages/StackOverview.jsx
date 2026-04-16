import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { Layers, Activity, AlertTriangle, ArrowLeft, CheckCircle2, Box } from 'lucide-react';
import TopNavbar from '../components/TopNavbar';

const StackOverview = () => {
    const navigate = useNavigate();
    const [stacks, setStacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStacks = async () => {
            try {
                // Using the api interceptor which attaches the bearer token
                const response = await api.get('/yard/stacks');
                setStacks(response.data);
            } catch (error) {
                console.error("Error fetching stacks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStacks();
    }, []);

    const handleStackClick = async (stack) => {
        if (stack.isOccupied) {
            if (window.confirm(`Stack ${stack.stackLetter} is occupied. Do you want to free this stack?`)) {
                try {
                    await api.post(`/yard/release-stack/${stack.locationId}`);
                    setStacks(stacks.map(s => s.locationId === stack.locationId ? { ...s, isOccupied: false, currentTier: 0 } : s));
                } catch (error) {
                    console.error("Failed to release stack", error);
                    alert("Failed to release stack.");
                }
            }
        } else {
            alert(`Stack ${stack.stackLetter} is already available.`);
        }
    };

    // Derived statistics based on the 1-slot-per-stack backend constraint
    const totalCapacity = stacks.length; // 5
    const occupiedStacks = stacks.filter(s => s.isOccupied).length;
    const availableStacks = totalCapacity - occupiedStacks;
    const avgUtilization = totalCapacity > 0 ? ((occupiedStacks / totalCapacity) * 100).toFixed(1) : 0;
    const criticalStacks = occupiedStacks; // Since 1 occupied slot = 100% full (critical) in this mock mode

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            <TopNavbar>
                <button onClick={() => navigate('/dashboard')} className="hover:text-gray-900">Dashboard</button>
                <button onClick={() => navigate('/stacks')} className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 -mb-1">Stack Overview</button>
            </TopNavbar>
            <div className="max-w-7xl mx-auto w-full flex-grow p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Stack Availability Overview</h1>
                        <p className="text-gray-500">Select a stack to view container allocations or monitor capacity across terminal sectors.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-200 bg-white text-gray-700 font-medium rounded-lg text-sm shadow-sm hover:bg-gray-50 transition">Real-time Feed</button>
                        <button className="px-4 py-2 border border-transparent bg-gray-100 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-200 transition">Historical Logs</button>
                    </div>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {/* Total Active TEU */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Active TEU</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{occupiedStacks} / {totalCapacity}</span>
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Live</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Box className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Avg. Utilization */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. Utilization</p>
                            <p className="text-2xl font-bold">{avgUtilization}%</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Slots Remaining */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Slots Remaining</p>
                            <p className="text-2xl font-bold">{availableStacks}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Box className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Critical Stacks */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Critical Stacks</p>
                            <p className="text-2xl font-bold">{criticalStacks.toString().padStart(2, '0')}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Main Grid Header */}
                <div className="flex justify-between items-end border-b border-gray-200 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Primary Yard Stacks</h2>
                    </div>
                    <div className="flex gap-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Healthy</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Full</span>
                    </div>
                </div>

                {/* Stacks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {stacks.map((stack) => {
                        const isFull = stack.isOccupied;
                        const statusColor = isFull ? 'text-red-500' : 'text-green-500';
                        const barColor = isFull ? 'bg-red-500' : 'bg-green-500';
                        const statusText = isFull ? 'Full' : 'Healthy';
                        const Icon = isFull ? AlertTriangle : CheckCircle2;
                        const utilizationString = isFull ? "100%" : "0%";
                        const barWidth = isFull ? "w-full" : "w-0";

                        return (
                            <div key={stack.locationId} onClick={() => handleStackClick(stack)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow">
                                {/* Stack Headers */}
                                <div className="w-full flex justify-between items-start mb-1">
                                    <h3 className="text-xl font-bold text-gray-900">Stack {stack.stackLetter}</h3>
                                    <Layers className="w-5 h-5 text-gray-400" />
                                </div>
                                
                                <div className={`w-full flex items-center gap-1.5 ${statusColor} mb-8`}>
                                    <Icon className="w-4 h-4" />
                                    <span className="text-xs font-semibold">{statusText}</span>
                                </div>
                                
                                {/* Progress Bar Area */}
                                <div className="w-full mb-8">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Utilization</span>
                                        <span className={`text-xl font-extrabold ${statusColor}`}>{utilizationString}</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${barColor} ${barWidth}`}></div>
                                    </div>
                                </div>

                                {/* Footer Data */}
                                <div className="w-full flex justify-between border-t border-gray-100 pt-4 mt-auto">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Capacity</p>
                                        <p className="font-bold text-gray-900">1 <span className="font-normal text-xs text-gray-500">TEU</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Available</p>
                                        <p className="font-bold text-gray-900">{isFull ? 0 : 1} <span className="font-normal text-xs text-gray-500">Slots</span></p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Back Button */}
            <div className="max-w-7xl mx-auto w-full flex justify-end mt-8 border-t border-gray-200 pt-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Layers className="w-5 h-5" />
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default StackOverview;
