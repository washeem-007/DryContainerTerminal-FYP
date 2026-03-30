import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import StatCard from '../components/StatCard';
import { Box, Layers, Activity, Truck, Search, Bell, Settings } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        weighBays: { total: 0, occupied: 0, available: 0 },
        inspectionBays: { total: 0, occupied: 0, available: 0 },
        stacks: { total: 0, occupied: 0, available: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch dashboard stats
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5047/api/Yard/dashboard');
                if (response.ok) {
                    const data = await response.json();

                    // The API returns PascalCase properties (WeighBays, InspectionBays, Stacks)
                    // We need to map them to our lowercase state keys if we use lowercase, 
                    // or just use them directly if we assume case-insensitive or map exactly.
                    // Assuming the API returns lowercase or we map it:
                    setStats({
                        weighBays: data.weighBays || data.WeighBays,
                        inspectionBays: data.inspectionBays || data.InspectionBays,
                        stacks: data.stacks || data.Stacks
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const totalContainers = stats.weighBays.occupied + stats.inspectionBays.occupied + stats.stacks.occupied;
    const bayOccupancy = stats.inspectionBays.total > 0 ? Math.round((stats.inspectionBays.occupied / stats.inspectionBays.total) * 100) : 0;
    const stackUtilization = stats.stacks.total > 0 ? Math.round((stats.stacks.occupied / stats.stacks.total) * 100) : 0;
    const availableSlots = stats.inspectionBays.available + stats.stacks.available;

    // Charts Data (Using Inspection Bays for the chart as they are the primary storage bays)
    const bayData = [
        { name: 'Occupied', value: stats.inspectionBays.occupied },
        { name: 'Available', value: stats.inspectionBays.available }
    ];
    const COLORS = ['#2563EB', '#E5E7EB']; // Blue-600, Gray-200

    const [showOnboardingModal, setShowOnboardingModal] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 relative">
            {/* Onboarding Decision Modal */}
            {showOnboardingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Container Onboarding</h2>
                            <p className="text-gray-600">Does the container already have a valid weight slip?</p>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setShowOnboardingModal(false);
                                    navigate('/weigh-bays');
                                }}
                                className="flex-1 py-3 px-4 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors"
                            >
                                No (Needs Weighing)
                            </button>
                            <button
                                onClick={() => {
                                    setShowOnboardingModal(false);
                                    navigate('/storage-bays');
                                }}
                                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                Yes (Already Weighed)
                            </button>
                        </div>
                        <button
                            onClick={() => setShowOnboardingModal(false)}
                            className="mt-6 text-gray-400 hover:text-gray-600 text-sm block mx-auto"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">logo</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
                        <a href="#" className="text-blue-600">Dashboard</a>
                        <a href="#" className="hover:text-gray-900">Operations</a>
                        <a href="#" className="hover:text-gray-900">Reports</a>
                        <a href="#" className="hover:text-gray-900">Settings</a>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search containers..."
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Bell className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Profile" />
                    </div>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Terminal Overview Dashboard</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/inspection-dashboard')}
                            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
                        >
                            Go to Inspection Dashboard
                        </button>
                        <button
                            onClick={() => setShowOnboardingModal(true)}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Start On Boarding Process
                        </button>
                    </div>
                </header>

                {/* Quick Links */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => navigate('/weigh-bays')}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        Weigh Bay Availability
                    </button>
                    <button
                        onClick={() => navigate('/storage-bays')}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        Inspection Bay Availability
                    </button>
                    <button
                        onClick={() => navigate('/stacks')}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        Stack Availability
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Containers"
                        value={totalContainers.toLocaleString()}
                        change="+5% last month"
                        changeType="positive"
                        icon={Box}
                    />
                    <StatCard
                        title="Inspection Bays Occupied"
                        value={`${bayOccupancy}%`}
                        change="+2% last week"
                        changeType="positive"
                        icon={Layers}
                    />
                    <StatCard
                        title="Stacks Utilized"
                        value={`${stackUtilization}%`}
                        change="Steady"
                        changeType="neutral"
                        icon={Activity}
                    />
                    <StatCard
                        title="Empty Containers (Slots)"
                        value={availableSlots.toLocaleString()}
                        change="+10% available"
                        changeType="positive"
                        icon={Truck}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bay Utilization Chart */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Inspection Bay Utilization</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={bayData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {bayData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                                <span className="text-sm text-gray-600">Occupied</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-gray-200"></span>
                                <span className="text-sm text-gray-600">Available</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Operations Table */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Operations</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                                        <th className="pb-3 font-medium">ID</th>
                                        <th className="pb-3 font-medium">Type</th>
                                        <th className="pb-3 font-medium">Container</th>
                                        <th className="pb-3 font-medium">Bay</th>
                                        <th className="pb-3 font-medium">Time</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {[1, 2, 3, 4].map((i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                            <td className="py-4 font-medium text-gray-900">OP-00{i}</td>
                                            <td className="py-4 text-gray-600">{i % 2 === 0 ? 'Departure' : 'Arrival'}</td>
                                            <td className="py-4 text-gray-600">CNTR-{100 * i}</td>
                                            <td className="py-4 text-gray-600">A1-0{i}</td>
                                            <td className="py-4 text-gray-600">09:30 AM</td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${i === 2 ? 'bg-yellow-100 text-yellow-700' :
                                                    i === 4 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {i === 2 ? 'In Progress' : i === 4 ? 'Delayed' : 'Completed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
