import React from 'react';

const StatCard = ({ title, value, change, changeType, icon: Icon }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                </div>
                {change && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${changeType === 'positive' ? 'bg-green-50 text-green-600' :
                            changeType === 'negative' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                        }`}>
                        {change}
                    </span>
                )}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
};

export default StatCard;
