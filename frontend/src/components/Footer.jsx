import React from 'react'
import { assets } from '../assets/assets'
function Footer() {
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
            <div>
                <img className='mb-5 w-40' src={assets.logo} alt="" />
                <p className='w-full md:2/3 text-gray-600 leading-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas quas pariatur nulla eveniet libero laborum vel quidem! Iste doloribus velit adipisci quas? Asperiores corporis deleniti doloribus officiis fuga ea corrupti accusamus ullam, ipsa earum at obcaecati itaque aliquam omnis architecto, sed hic quasi, quo dolore rerum temporibus! Quas, sed facere.</p>
            </div>
                
            <div>
                <p className='text-xl font-medium mb-5'>COMPANY</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Contact us</li>
                    <li>Privacy policy</li>
                </ul>
            </div>

            <div>
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-2 text-gray-600'>
                    <li>+1-212-456-7890</li>
                    <li>dwivediaman2006@gmail.com</li>
                </ul>
            </div>
        </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2026@ Prescripto -All Right Reserved</p>
        </div>
    </div>
  )
}

export default Footer