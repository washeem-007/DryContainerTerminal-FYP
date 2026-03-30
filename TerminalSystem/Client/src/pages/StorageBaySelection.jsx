import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, X, Check } from 'lucide-react';
import api from '../utils/axiosConfig';

const StorageBaySelection = () => {
    const navigate = useNavigate();
    const [bays, setBays] = useState([]);
    const [selectedBay, setSelectedBay] = useState(null);

    // Mocking 10 Storage Bays for now, or fetching if API supports it.
    // Since we don't have a specific API for "Storage Bays" separate from "Weigh Bays" yet,
    // we'll mock the structure as requested (Bays 1-10).
    // In a real scenario, we'd fetch from /api/Yard/bays and filter by type or range.
    useEffect(() => {
        const fetchBays = async () => {
            try {
                const response = await api.get('/yard/bays?type=Inspection');
                const mappedBays = response.data.map(b => ({
                    id: b.bayNumber,
                    status: b.isOccupied ? 'Unavailable' : 'Available',
                    isOccupied: b.isOccupied
                }));
                setBays(mappedBays);
            } catch (error) {
                console.error('Failed to fetch bays:', error);
            }
        };

        fetchBays();
    }, []);

    const handleBayClick = (bay) => {
        if (bay.status === 'Available') {
            setSelectedBay(bay.id === selectedBay ? null : bay.id);
        }
    };

    const handleNext = () => {
        if (selectedBay) {
            navigate('/container-details', { state: { bayId: selectedBay } });
        }
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Inspection Bay Slot Selection</h1>
                    <p className="text-gray-500">
                        Select an available bay slot for the container. Green bays are available, red bays are unavailable. Your selected bay will turn blue.
                    </p>
                </header>

                <div className="grid grid-cols-5 gap-6 mb-12">
                    {bays.map((bay) => (
                        <div
                            key={bay.id}
                            onClick={() => handleBayClick(bay)}
                            className={`
                                h-48 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2
                                ${bay.status === 'Unavailable'
                                    ? 'bg-gray-500 border-gray-600 text-white cursor-not-allowed opacity-80'
                                    : selectedBay === bay.id
                                        ? 'bg-blue-600 border-blue-700 text-white shadow-lg scale-105'
                                        : 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                                }
                            `}
                        >
                            <span className="text-3xl font-bold mb-2">Bay {bay.id}</span>
                            <span className="text-sm font-medium opacity-90">
                                {bay.status === 'Unavailable' ? 'Unavailable' : selectedBay === bay.id ? 'Selected' : 'Available'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={!selectedBay}
                        className={`
                            px-8 py-3 rounded-lg font-semibold text-white transition-all
                            ${selectedBay
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-md'
                                : 'bg-gray-300 cursor-not-allowed'
                            }
                        `}
                    >
                        Next (Summary)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StorageBaySelection;
