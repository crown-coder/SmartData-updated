import { motion } from "framer-motion";

import Waec from '../../assets/home/waec2.png'
import Nabtab from '../../assets/home/nabtab2.png'
import Neco from '../../assets/home/neco2.png'
import Gotv from '../../assets/home/gotv2.png'
import DSTV from '../../assets/home/dstv2.png'
import Startimes from '../../assets/home/startimes2.png'
import Jed from '../../assets/home/JED2.png'
import AEDC from '../../assets/home/AEDC2.png'
import Ikeja from '../../assets/home/ikeja2.png'

const ScrollingLogos = () => {
    return (
        <div className="w-[95%] overflow-hidden flex justify-between mt-6 max-lg:mt-12 relative">

            <div className="w-[300px] max-lg:w-[80px] h-full absolute left-0 top-0 bg-gradient-to-r from-white to-transparent z-40"></div>

            <motion.div
                className="flex gap-12 min-w-max"
                animate={{ x: ["0%", "-100%"] }}
                transition={{ ease: "linear", duration: 20, repeat: Infinity }}
            >
                {/* Logos - Duplicated for Infinite Effect */}
                {[Waec, Nabtab, Neco, Gotv, DSTV, Startimes, Jed, AEDC, Ikeja, Waec, Nabtab, Neco, Gotv, DSTV, Startimes, Jed, AEDC, Ikeja].map((logo, index) => (
                    <img key={index} src={logo} alt="logo" className="w-auto h-16 max-lg:w-[45px] max-lg:object-contain" />
                ))}
            </motion.div>

            <div className="w-[300px] max-lg:w-[80px] h-full absolute right-0 top-0 bg-gradient-to-r from-transparent to-white"></div>

        </div>
    );
};

export default ScrollingLogos;
