import React, { useState } from "react";
import { MdMenu } from "react-icons/md";
import { FaBell, FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";

const Profile = ({ setIsSidebarOpen, toggleIconsOnly }) => {
    const [isCardVisible, setIsCardVisible] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="w-full flex items-center justify-between py-4 px-3 bg-white dark:bg-gray-800 rounded-lg relative"
        >
            {/* Menu Icon */}
            <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="block lg:hidden text-[#434343] px-4 py-2 rounded-lg dark:text-white"
            >
                <MdMenu size={24} />
            </button>
            <div className="flex gap-1 items-center">
                <button
                    onClick={toggleIconsOnly}
                    className="block max-lg:hidden text-[#434343] px-4 py-2 rounded-lg dark:text-white"
                >
                    <MdMenu size={24} />
                </button>
                <h2 className="text-lg font-semibold text-[#434343] dark:text-white">
                    Dashboard
                </h2>
            </div>
            <div className="flex gap-2 items-center">
                <div className="icon w-[40px] h-[40px] rounded-full bg-blue-300 flex items-center justify-center cursor-pointer max-lg:hidden">
                    <FaBell />
                </div>
                <div
                    className="flex gap-1 items-center relative cursor-pointer"
                >
                    <h1 className="w-[40px] h-[40px] rounded-full bg-blue-300 dark:text-white flex items-center justify-center">
                        J
                    </h1>
                    <div className="max-lg:hidden">
                        <h4 className="text-sm dark:text-white">Jeff Grimes</h4>
                        <button
                            className="flex items-center justify-between w-[70px] text-[#A1A1A1] dark:text-white cursor-pointer text-sm"
                        >
                            Admin
                            <FaChevronDown />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
