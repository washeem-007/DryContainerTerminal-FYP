import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, X } from 'lucide-react';
import api from '../utils/axiosConfig';

const WeighBaySelection = () => {
    const navigate = useNavigate();
    const [bays, setBays] = useState([]);

    useEffect(() => {
        const fetchBays = async () => {
            try {
                const response = await api.get('/yard/bays?type=Weigh');
                const mappedBays = response.data.map(b => ({
                    id: b.bayNumber,
                    status: b.isOccupied ? 'Occupied' : 'Available',
                    isOccupied: b.isOccupied
                }));
                // We trust the database mapping exclusively and do not mock
                setBays(mappedBays);
            } catch (error) {
                console.error("Failed to fetch weigh bays:", error);
            }
        };
        fetchBays();
    }, []);

    const handleBayClick = async (bay) => {
        if (bay.status === 'Available') {
            navigate('/weighing-form', { state: { bayNumber: bay.id } });
        } else {
            if (window.confirm(`Bay ${bay.id} is occupied. Do you want to free this slot?`)) {
                try {
                    await api.post(`/yard/release/${bay.id}`);
                    setBays(bays.map(b => b.id === bay.id ? { ...b, status: 'Available', isOccupied: false } : b));
                } catch (error) {
                    console.error("Failed to release bay", error);
                    alert("Failed to release bay.");
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Weigh Bay Status Overview</h1>
            <p className="text-gray-500 mb-12 text-center max-w-lg">
                Select an available (green) weigh bay to begin the container weighing process and record details.
            </p>

            <div className="grid grid-cols-3 gap-6">
                {bays.map((bay) => (
                    <div
                        key={bay.id}
                        onClick={() => handleBayClick(bay)}
                        className={`w-64 h-48 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-sm
              ${bay.status === 'Available'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        <span className="text-5xl font-bold mb-2">{bay.id}</span>
                        <div className="bg-white/20 px-4 py-1 rounded-full text-sm font-medium mb-4">
                            {bay.status}
                        </div>
                        {bay.status === 'Available' ? (
                            <Truck className="w-10 h-10" />
                        ) : (
                            <X className="w-10 h-10" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeighBaySelection;
