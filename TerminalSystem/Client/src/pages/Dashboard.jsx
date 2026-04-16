import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import StatCard from '../components/StatCard';
import { Box, Layers, Activity, Truck, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import TopNavbar from '../components/TopNavbar';
const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const role = user?.role;

    const [stats, setStats] = useState({
        weighBays: { total: 0, occupied: 0, available: 0 },
        inspectionBays: { total: 0, occupied: 0, available: 0 },
        stacks: { total: 0, occupied: 0, available: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [recentContainers, setRecentContainers] = useState([]);

    useEffect(() => {
        // Fetch dashboard stats
        const fetchStats = async () => {
            try {
                const [statsRes, recentRes] = await Promise.all([
                    api.get('/Yard/dashboard'),
                    api.get('/Yard/recent-containers')
                ]);

                const data = statsRes.data;
                setStats({
                    weighBays: data.weighBays || data.WeighBays,
                    inspectionBays: data.inspectionBays || data.InspectionBays,
                    stacks: data.stacks || data.Stacks
                });

                setRecentContainers(recentRes.data);
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
            <TopNavbar>
                <button onClick={() => navigate('/dashboard')} className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 -mb-1">Dashboard</button>
                {role === 'Admin' && (
                    <button onClick={() => navigate('/database')} className="hover:text-gray-900">Database</button>
                )}
            </TopNavbar>

            <main className="px-8 py-6 max-w-7xl mx-auto">

                {/* Action Buttons Panel */}
                <div className="mb-4">
                    {/* Top row: 3 action buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            {['Wharf Clerk', 'Admin'].includes(role) ? (
                                <button
                                    onClick={() => navigate('/payments')}
                                    className="w-full py-2.5 px-4 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
                                >
                                    Shipments &amp; Payments
                                </button>
                            ) : <div className="h-10" />}
                        </div>
                        <div>
                            {['Gate Clerk', 'Admin'].includes(role) ? (
                                <button
                                    onClick={() => setShowOnboardingModal(true)}
                                    className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Start On Boarding Process
                                </button>
                            ) : <div className="h-10" />}
                        </div>
                        <div>
                            {['Yard Supervisor', 'Admin'].includes(role) ? (
                                <button
                                    onClick={() => navigate('/inspection-dashboard')}
                                    className="w-full py-2.5 px-4 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
                                >
                                    Inspection Dashboard
                                </button>
                            ) : <div className="h-10" />}
                        </div>
                    </div>

                    {/* Bottom row: quick links */}
                    <div className="grid grid-cols-3 gap-3 mt-2">
                        <div>
                            {['Gate Clerk', 'Admin'].includes(role) ? (
                                <button
                                    onClick={() => navigate('/weigh-bays')}
                                    className="w-full py-3 px-4 text-sm text-gray-600 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                >
                                    Weigh Bay Availability
                                </button>
                            ) : <div className="py-3 px-4" />}
                        </div>
                        <div>
                            {['Gate Clerk', 'Admin'].includes(role) ? (
                                <button
                                    onClick={() => navigate('/storage-bays')}
                                    className="w-full py-3 px-4 text-sm text-gray-600 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                >
                                    Inspection Bay Availability
                                </button>
                            ) : <div className="py-3 px-4" />}
                        </div>
                        <div>
                            {['Gate Clerk', 'Yard Supervisor', 'Admin'].includes(role) ? (
                                <button
                                    onClick={() => navigate('/stacks')}
                                    className="w-full py-3 px-4 text-sm text-gray-600 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                >
                                    Stack Availability
                                </button>
                            ) : <div className="py-3 px-4" />}
                        </div>
                    </div>
                </div>


                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Containers"
                        value={totalContainers.toLocaleString()}
                        icon={Box}
                    />
                    <StatCard
                        title="Inspection Bays Occupied"
                        value={`${bayOccupancy}%`}
                        icon={Layers}
                    />
                    <StatCard
                        title="Stacks Utilized"
                        value={`${stackUtilization}%`}
                        icon={Activity}
                    />
                    <StatCard
                        title="Empty Containers (Slots)"
                        value={availableSlots.toLocaleString()}
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
                                        <th className="pb-3 font-medium">Container ID</th>
                                        <th className="pb-3 font-medium">Type</th>
                                        <th className="pb-3 font-medium">Current Location</th>
                                        <th className="pb-3 font-medium">Inspection</th>
                                        <th className="pb-3 font-medium">Payment</th>
                                        <th className="pb-3 font-medium">Exit Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {recentContainers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">No containers on record.</td>
                                        </tr>
                                    ) : recentContainers.map((row) => (
                                        <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                            <td className="py-4 font-semibold text-blue-600">{row.id}</td>
                                            <td className="py-4 font-medium text-gray-800">{row.type}</td>
                                            <td className="py-4 text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>
                                                    {row.location}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                                    row.inspection === 'Active'  ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                                    row.inspection === 'Passed'  ? 'bg-green-50 text-green-700 border-green-200' :
                                                    row.inspection === 'Failed'  ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                    {row.inspection}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                                    row.payment === 'Paid'    ? 'bg-green-50 text-green-700 border-green-200' :
                                                    row.payment === 'Pending' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                    'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                    {row.payment}
                                                </span>
                                            </td>
                                            <td className="py-4 text-gray-500 text-xs italic">{row.exitStatus}</td>
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
