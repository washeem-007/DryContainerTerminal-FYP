import React, { useContext } from 'react';
import QRCode from 'react-qr-code';
import { CheckCircle2, ShieldCheck, Printer, ArrowLeft, Anchor, UserRound } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const GatePassSuccess = ({ container, onClose }) => {
    const { user } = useContext(AuthContext);
    // Generate a random pass ID for display
    const passId = `G-PASS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 w-full bg-white animate-in fade-in duration-300">
            {/* Header Success Section */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 mb-6 border-8 border-green-100">
                    <CheckCircle2 className="w-12 h-12 text-teal-600" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Payment Successful</h1>
            </div>

            {/* Official Gate Pass Ticket Card */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 w-full max-w-md overflow-hidden mb-8">
                {/* Ticket Header */}
                <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-sm tracking-wide">
                        <ShieldCheck className="w-5 h-5" />
                        OFFICIAL GATE PASS
                    </div>
                    <span className="text-xs font-semibold text-gray-400">{passId}</span>
                </div>

                {/* Ticket Body (QR) */}
                <div className="p-8 pb-4 flex flex-col items-center">
                    <div className="bg-white p-4 border border-dashed border-gray-200 rounded-xl shadow-sm mb-6">
                        <QRCode value={container.containerId} size={150} level="H" />
                    </div>
                    <h3 className="font-extrabold text-gray-900 tracking-wider">EXIT GATE QR CODE</h3>
                </div>

                {/* Details Grid */}
                <div className="px-8 pb-6 pt-4 border-t border-dashed border-gray-200">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Container ID</div>
                            <div className="font-bold text-gray-900">{container.containerId}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Shipper</div>
                            <div className="font-bold text-gray-900 truncate">{container.shipper || 'Oceanic Horizon / V204'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Wharf Clerk</div>
                            <div className="font-medium text-gray-800 flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5 text-gray-400"/> {user?.username || '—'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Terminal Location</div>
                            <div className="font-medium text-gray-800 flex items-center gap-1.5"><Anchor className="w-3.5 h-3.5 text-gray-400"/> {container.location || 'Pier 44 North'}</div>
                        </div>
                    </div>
                </div>

                {/* Ticket Footer */}
                <div className="bg-gray-50 border-t border-gray-100 p-3 text-center">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Valid for single exit only • Expires in 24 hours</span>
                </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-md mb-6">
                <button
                    onClick={() => window.print()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm"
                >
                    <Printer className="w-5 h-5" /> Print Receipt
                </button>
            </div>

            {/* Back Nav */}
            <div className="w-full max-w-md border-t border-gray-200"></div>
            <button 
                onClick={onClose}
                className="mt-8 flex items-center gap-2 text-sm font-bold text-[#2b75b9] hover:text-blue-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Return to Shipment Dashboard
            </button>

        </div>
    );
};

export default GatePassSuccess;
