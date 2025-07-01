import React, { useEffect, useState } from 'react';
import MTN from '../../../../assets/MTN.png';
import Airtel from '../../../../assets/Airtel.png';
import Glo from '../../../../assets/Glo.png';
import NineMobile from '../../../../assets/9mobile.png';
import axios from 'axios';
import { useModal } from '../../../ModalContext';
import { MdCancel } from "react-icons/md";
import { BeatLoader } from 'react-spinners';
import AirSubCard from "../Cards/SubCard";

const MoreDataCard = ({ activeNetwork, closeModal, mobileNetworkId }) => {
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { openModal } = useModal();

    const networkInfo = {
        1: { name: "MTN", logo: MTN },
        2: { name: "GLO", logo: Glo },
        3: { name: "AIRTEL", logo: Airtel },
        4: { name: "9MOBILE", logo: NineMobile }
    };

    useEffect(() => {
        const fetchDataList = async () => {
            try {
                const response = await axios.get("/api/data-plans");
                setDataList(response.data?.mobile_networks || []);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load data plans");
                console.error("Data plans error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDataList();
    }, []);

    const currentNetwork = dataList.find(network => network.id === mobileNetworkId);

    const networkPlans = currentNetwork?.plan_types
        ?.flatMap(planType =>
            planType.data_plans.map(plan => ({
                ...plan,
                planTypeName: planType.name
            }))
        ) || [];

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handleBuyDataForm = (plan) => {
        openModal(<AirSubCard plan={plan} />);
    };

    return (
        <div className='w-[500px] p-4 rounded-lg bg-white shadow-lg'>
            <div className='flex justify-between items-center'>
                <div className='flex gap-4 items-center'>
                    <img
                        src={networkInfo[mobileNetworkId]?.logo}
                        className='w-[50px] h-[50px] object-contain'
                        alt={activeNetwork}
                    />
                    <h2 className='text-xl font-medium'>{activeNetwork} Data Plans</h2>
                </div>
                <button
                    onClick={closeModal}
                    className="text-xl text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                >
                    <MdCancel />
                </button>
            </div>

            <div className="mt-4">
                {loading ? (
                    <div className="text-center py-4 text-sm text-gray-400 italic">
                        <BeatLoader size={10} color="#4CACF0" />
                        <div>Loading Data plans...</div>
                    </div>
                ) : error ? (
                    <p className="text-red-500 py-4 text-center">{error}</p>
                ) : networkPlans.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">
                        No data plans found for {activeNetwork}
                    </p>
                ) : (
                    <ul className='flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-2'>
                        {networkPlans.map((plan) => (
                            <li
                                key={`${plan.id}-${plan.size}-${plan.validity}`}
                                className="hover:bg-gray-100 text-sm text-gray-400 p-2 rounded-md flex justify-between w-full cursor-pointer border border-gray-200 mb-1"
                                onClick={() => handleBuyDataForm(plan)}
                            >
                                <div className="w-full flex justify-between items-start">
                                    <div className='flex items-center gap-2'>
                                        <span>
                                            {plan.size} {plan.volume}
                                        </span>
                                        <span className="text-xs text-gray-500 block">
                                            {plan.validity} • {plan.planTypeName}
                                        </span>
                                    </div>
                                    <span>{formatPrice(plan.amount)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MoreDataCard;
