import React from 'react'
import Image from 'next/image'
import logo from "../../public/assets/mds.png";
import rightImg from "../../public/assets/BecomeAnAuthorImg.png"
import Link from 'next/link'



const SectionBecomeAnAuthor = ({}) => {
	return (
		<div
			className={`nc-SectionBecomeAnAuthor bg-[#f3f4f6] px-4 max-w-8xl  `}
		>
			<div className='relative max-w-7xl py-14  mx-auto flex flex-col items-center lg:flex-row'>
            <div className="mb-16 flex-shrink-0 lg:mb-0 lg:me-10 lg:w-2/5">
            <Link
            href="/"
          >
            <img src={logo.src} className="w-40" />
          </Link>
				<h2 className="mt-3 text-3xl font-semibold sm:mt-11 sm:text-4xl">
				Why Do Devotees Trust Us?
				</h2>
				<span className="mt-6 block text-neutral-500  ">
				Across every sacred path and spiritual journey, finding the right place to stay should feel just as peaceful as the destination itself. MyDivineStay brings you thoughtfully selected spiritual stays — trusted by travelers, rooted in tradition, and designed to support your devotion, peace of mind, and comfort, no matter where your faith leads you.

				</span>
			
			</div>
			<div className="flex-grow">
				<img className='w-full' alt="" src={rightImg.src} />
			</div>
            </div>
		</div>
	)
}

export default SectionBecomeAnAuthor
