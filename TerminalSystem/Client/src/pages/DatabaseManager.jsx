import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, ClipboardList, Users, MapPin, Download, Archive, Trash2, MoreVertical, Search, Bell, Activity } from 'lucide-react';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const DatabaseManager = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const role = user?.role;

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const [activeTab, setActiveTab] = useState('Containers');
    const [showArchived, setShowArchived] = useState(false);

    const [containers, setContainers] = useState([]);
    const [inspections, setInspections] = useState([]);
    const [users, setUsers] = useState([]);
    const [yardLocations, setYardLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'Containers') {
                    const res = await api.get('/admin/containers');
                    setContainers(res.data);
                } else if (activeTab === 'Inspections') {
                    const res = await api.get('/admin/inspections');
                    setInspections(res.data);
                } else if (activeTab === 'Users') {
                    const res = await api.get('/admin/users');
                    setUsers(res.data);
                } else if (activeTab === 'Yard Locations') {
                    const res = await api.get('/admin/yardlocations');
                    setYardLocations(res.data);
                }
            } catch (error) {
                console.error(`Failed to fetch ${activeTab}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleArchive = async (id) => {
        if (window.confirm(`Are you sure you want to archive container ${id}?`)) {
            try {
                await api.put(`/admin/containers/${id}/archive`);
                // Update local state dynamically to match UI
                setContainers(prev => prev.map(c => c.id === id ? { ...c, isArchived: true, inspection: 'Archived' } : c));
            } catch (err) {
                console.error("Failed to archive container:", err);
                alert("Archive operation failed. Check console.");
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this record? This cannot be undone.")) return;
        
        try {
            await api.delete(`/admin/containers/${id}`);
            // Update local state by stripping the erased container without refreshing
            setContainers(prev => prev.filter(c => c.id !== id));
            alert(`Container ${id} has been permanently deleted.`);
        } catch (err) {
            console.error("Failed to delete container:", err);
            alert("Delete operation failed. It may be constrained by related records.");
        }
    };

    const filteredContainers = containers.filter(container => {
        return showArchived ? container.isArchived === true : container.isArchived === false;
    });

    const getInspectionBadgeStyle = (status) => {
        if (status === 'Active') return 'bg-teal-50 text-teal-700 border border-teal-200';
        if (status === 'Archived') return 'bg-gray-100 text-gray-600 border border-gray-200';
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    const getPaymentBadgeStyle = (status) => {
        if (status === 'Paid') return 'text-green-600 font-medium';
        if (status === 'Pending') return 'bg-rose-50 text-rose-600 font-medium px-2 py-0.5 rounded border border-rose-100';
        if (status === 'Processing') return 'bg-rose-50 text-rose-600 font-medium px-2 py-0.5 rounded border border-rose-100';
        if (status === 'Overdue') return 'bg-rose-50 text-rose-600 font-medium px-2 py-0.5 rounded border border-rose-100';
        return 'text-gray-600';
    };

    const renderHeader = () => (
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Master Database</h1>
                <p className="text-gray-500 text-sm">Real-time oversight of global container movements. Monitor inspections, manage payment clearances, and maintain audit trails.</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-3 border border-gray-200 px-4 py-2 rounded-lg bg-gray-50">
                    <button 
                        onClick={() => setShowArchived(!showArchived)}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none ${showArchived ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${showArchived ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>
                    <span className="text-sm font-semibold text-gray-700">Show Archived Only</span>
                </div>
                <button className="flex items-center gap-2 border border-gray-200 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors bg-white">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>
        </div>
    );

    const renderTabs = () => {
        const tabs = [
            { id: 'Containers', icon: Box },
            { id: 'Inspections', icon: ClipboardList },
            { id: 'Users', icon: Users },
            { id: 'Yard Locations', icon: MapPin },
        ];

        return (
            <div className="flex items-center border-b border-gray-200 mb-6 font-semibold space-x-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm transition-colors border-b-2 ${
                                isActive 
                                    ? 'border-blue-600 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.id}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderContainersTable = () => (
        <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Container ID</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Current Location</th>
                        <th className="px-6 py-4">Inspection</th>
                        <th className="px-6 py-4">Payment</th>
                        <th className="px-6 py-4">Exit Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredContainers.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-blue-700">{row.id}</td>
                            <td className="px-6 py-4 font-semibold text-gray-800">{row.type}</td>
                            <td className="px-6 py-4 font-medium text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${row.isArchived ? 'bg-gray-400' : 'bg-teal-500'}`}></span>
                                    {row.location}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${getInspectionBadgeStyle(row.inspection)}`}>
                                    {row.inspection}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={getPaymentBadgeStyle(row.payment)}>{row.payment}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 italic text-xs font-medium">
                                {row.exitStatus}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3 text-gray-400">
                                    {!row.isArchived && (
                                        <button onClick={() => handleArchive(row.id)} className="flex items-center gap-1.5 px-3 py-1 border border-rose-200 text-rose-500 rounded text-xs font-semibold hover:bg-rose-50 transition-colors">
                                            <Archive className="w-3.5 h-3.5" />
                                            Archive
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(row.id)} className="hover:text-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button className="hover:text-gray-600 transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {!loading && filteredContainers.length === 0 && (
                        <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                No containers found matching the current filters.
                            </td>
                        </tr>
                    )}
                    {loading && (
                        <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                Loading data...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderDynamicTable = (columns, dataArray, keys) => (
        <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <tr>
                        {columns.map(col => <th key={col} className="px-6 py-4">{col}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {dataArray.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                            {keys.map((key, i) => (
                                <td key={key} className={i === 0 ? "px-6 py-4 font-bold text-blue-700" : "px-6 py-4 font-semibold text-gray-800"}>
                                    {item[key]}
                                </td>
                            ))}
                            <td className="px-6 py-4 text-right">
                                <button className="hover:text-gray-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                    {!loading && dataArray.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                No records found.
                            </td>
                        </tr>
                    )}
                    {loading && (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                Loading data...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderActiveTable = () => {
        switch (activeTab) {
            case 'Containers':
                return renderContainersTable();
            case 'Inspections':
                return renderDynamicTable(['Inspection ID', 'Container ID', 'Inspector', 'Status', 'Date', 'Actions'], inspections, ['id', 'containerId', 'inspector', 'status', 'date']);
            case 'Users':
                return renderDynamicTable(['User ID', 'Name', 'Role', 'Status', 'Actions'], users, ['id', 'name', 'role', 'status']);
            case 'Yard Locations':
                return renderDynamicTable(['Location ID', 'Name', 'Type', 'Status', 'Actions'], yardLocations, ['id', 'name', 'type', 'status']);
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center mb-8">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <img src="https://i.ibb.co/8L2fs8MT/worldwide-shipping.png" alt="PortZen" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold text-gray-900">PortZen</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-gray-900">Dashboard</button>
                        {role === 'Admin' && (
                            <button onClick={() => navigate('/database')} className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 -mb-1">Database</button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search database..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Bell className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user?.username?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900">{user?.username}</span>
                            <span className="text-[10px] text-gray-400">{role}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>


            <div className="max-w-7xl mx-auto border border-gray-100 shadow-sm rounded-xl p-8 pb-4 mb-20 relative">
                {renderHeader()}
                {renderTabs()}
                {renderActiveTable()}
                
                <div className="flex items-center justify-between mt-6 py-4 text-sm font-medium text-gray-500">
                    <div>
                        Showing <span className="font-bold text-gray-900">
                            {filteredContainers.length > 0 || inspections.length > 0 || users.length > 0 || yardLocations.length > 0 ? 1 : 0}
                        </span>-
                        <span className="font-bold text-gray-900">
                            {activeTab === 'Containers' ? filteredContainers.length : 
                             activeTab === 'Inspections' ? inspections.length : 
                             activeTab === 'Users' ? users.length : yardLocations.length}
                        </span> of <span className="font-bold text-gray-900">
                            {activeTab === 'Containers' ? containers.length : 
                             activeTab === 'Inspections' ? inspections.length : 
                             activeTab === 'Users' ? users.length : yardLocations.length}
                        </span> records in {activeTab.toLowerCase()}
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white shadow-sm disabled:opacity-50 transition-colors">&lt; Previous</button>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 rounded bg-blue-600 text-white font-bold flex items-center justify-center">1</button>
                        </div>
                        <button className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition-colors">Next &gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseManager;
