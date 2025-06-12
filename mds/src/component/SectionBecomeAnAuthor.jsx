import React from 'react'
import Image from 'next/image'
import logo from "../../public/assets/mds.png";
import rightImg from "../../public/assets/BecomeAnAuthorImg.png"
import Link from 'next/link'



const SectionBecomeAnAuthor = ({ }) => {
	return (
		<div
			className={`nc-SectionBecomeAnAuthor bg-[#f3f4f6] px-4 max-w-8xl  `}
		>
			<div className='relative max-w-7xl py-14  mx-auto flex flex-col items-center lg:flex-row'>
				<div className="mb-16 flex-shrink-0 lg:mb-0 lg:me-10 lg:w-5/5">
					<Link
						href="/"
					>
						{/* <img src={logo.src} className="w-40" /> */}
					</Link>
					<h2 className="mt-3 text-3xl font-semibold sm:mt-11 sm:text-4xl">
						Why Choose My Divine Stay for Your Spiritual Journey?
					</h2>
					<span className="mt-6 block   ">
						At My Divine Stay, we recognize the significance of a peaceful and fulfilling spiritual journey. Here's why we are the preferred choice for devotees:

					</span>
					<div className='flex justify-between items-start'>
						<ul className="mt-6 block me-12 space-y list-disc ">
							<li className='text-lg font-bold'>Tailored for Spiritual Journeys</li>

							<p>We offer a curated selection of stays designed to provide comfort and tranquility during your spiritual travels. Each stay is chosen to cater to the needs of pilgrims, ensuring an enriching experience.</p>

							<li className='text-lg font-bold'>Trusted Partnerships</li>

							<p>We work with established temples and spiritual centers, ensuring that every stay meets high standards of devotion and comfort, trusted by countless devotees.</p>
						</ul>

						<ul className="mt-6 block  list-disc ">
							<li className='text-lg font-bold'>Seamless Booking Experience</li>

							<p>Booking your stay is as simple as a click. Our easy-to-use platform ensures a smooth, secure, and hassle-free reservation process, so you can focus on your journey.</p>

							<li className='text-lg font-bold'>24/7 Support</li>

							<p>Whether you need assistance with bookings, directions, or other queries, our dedicated team is available around the clock to support you.</p>

							<li className='text-lg font-bold'>Respect for Tradition</li>

							<p>While we embrace modern technology to improve your booking experience, we remain deeply committed to preserving the traditional values and spirit of your spiritual journey.</p>

						</ul>
					</div>

				</div>
				{/* <div className="flex-grow">
				<img className='w-full' alt="" src={rightImg.src} />
			</div> */}
			</div>
		</div>
	)
}

export default SectionBecomeAnAuthor
