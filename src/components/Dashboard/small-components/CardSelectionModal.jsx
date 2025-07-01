import { useState } from 'react';
import { CiCircleCheck } from "react-icons/ci";

const CardSelectionModal = ({ cards, onSelect, onClose }) => {
    const [selectedCard, setSelectedCard] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        if (!selectedCard) return;

        setIsLoading(true);
        try {
            await onSelect(selectedCard);
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Select Card Type</h2>
            <p className="text-gray-600 mb-6">Choose the type of virtual card you want to create</p>

            <div className="space-y-3 h-[270px] overflow-y-scroll">
                {cards.filter(card => card.status === 'active').map(card => (
                    <div
                        key={card.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedCard?.id === card.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        onClick={() => setSelectedCard(card)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">{card.name}</h3>
                                <div className='flex justify-between w-full gap-2'>
                                    <p className='text-sm'>Currency: {card.currency}</p>
                                    <p className='text-sm'>Limit: {card.limit}</p>
                                    <p className='text-sm'>Creation Fee: {card.fee}</p>
                                </div>
                            </div>
                            {selectedCard?.id === card.id && (
                                <CiCircleCheck className="h-5 w-5 text-blue-500" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-70"
                >
                    Cancel
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!selectedCard || isLoading}
                    className={`px-4 py-2 rounded-lg text-white ${selectedCard && !isLoading
                        ? 'bg-[#4CACF0] hover:bg-[#3a8bc8]'
                        : 'bg-gray-400 cursor-not-allowed'
                        } transition-colors ${isLoading ? 'opacity-70' : ''}`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        'Continue'
                    )}
                </button>
            </div>
        </div>
    );
};

export default CardSelectionModal;
