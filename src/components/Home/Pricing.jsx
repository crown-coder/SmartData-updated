import React from 'react'
import PricingCard from './PricingCard'
import Cat from '../../assets/home/cat.png'
import FirstStartFish from '../../assets/home/star-fish.png'
import SecondStartFish from '../../assets/home/star-fish2.png'
import ThirdStartFish from '../../assets/home/star-fish3.png'
import FourthStartFish from '../../assets/home/star-fish4.png'

import MtnIcon from '../../assets/home/MTN.png'
import AirtelIcon from '../../assets/home/Airtel.png'
import GloIcon from '../../assets/home/Glo.png'
import NineMobileIcon from '../../assets/home/9mobile.png'

const Pricing = () => {
    return (
        <section className='w-full min-h-dvh bg-[#F8FBF8] flex flex-col gap-14 items-center p-20 max-lg:px-2 relative'>
            <h1 className='text-black text-4xl'>Pricings and Plans</h1>
            <img src={Cat} className='absolute top-0 w-[500px] opacity-20' />
            <img src={FirstStartFish} className='absolute w-[150px] top-24 left-0' />
            <img src={FourthStartFish} className='absolute w-[200px] top-0 right-0' />
            <img src={ThirdStartFish} className='absolute w-[200px] bottom-0 left-28' />
            <img src={SecondStartFish} className='absolute w-[150px] bottom-20 right-0' />
            <div className='max-lg:w-[90%] grid grid-cols-4 max-lg:grid-cols-1 gap-4'>
                <PricingCard icon={MtnIcon} />
                <PricingCard icon={AirtelIcon} />
                <PricingCard icon={GloIcon} />
                <PricingCard icon={NineMobileIcon} />
            </div>
        </section>
    )
}

export default Pricing
