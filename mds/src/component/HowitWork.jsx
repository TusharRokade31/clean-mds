import React, { FC } from 'react'
import HIW1img from '../../public/assets/HIW1.png'
import HIW2img from '../../public/assets/HIW2.png'
import HIW3img from '../../public/assets/HIW3.png'
import VectorImg from '../../public/assets/VectorHIW.svg'
import Image from 'next/image'


const DEMO_DATA = [
	{
		id: 1,
		img: HIW1img,
		title: 'Book Your Stay',
		desc: 'Each booking is a step closer to inner peace',
	},
	{
		id: 2,
		img: HIW2img,
		title: 'Plan Mindfully',
		desc: 'Everything you need for a worry-free sacred journey.',
	},
	{
		id: 3,
		img: HIW3img,
		title: 'Travel with Purpose, Save More',
		desc: 'Experience the divine without stretching your budget',
	},
]

const SectionHowItWork = ({}) => {
	return (
		<div className='max-w-7xl mx-auto sm:px-6 py-20'>
            <h2 className="text-3xl font-semibold md:text-4xl text-center text-gray-900 mb-2">How it works</h2>
			<div className="relative mt-20 grid gap-20 md:grid-cols-3">
				<Image
					className="absolute inset-x-0 top-10 hidden md:block"
					src={VectorImg}
					alt=""
				/>
				{DEMO_DATA.map((item) => (
					<div
						key={item.id}
						className="relative mx-auto flex max-w-xs flex-col items-center"
					>
						
							<Image
								alt=""
								className="mx-auto mb-8 max-w-[180px]"
								src={item.img}
							/>
						<div className="mt-auto text-center">
							<h3 className="text-xl font-semibold">{item.title}</h3>
							<span className="mt-5 block text-neutral-500  ">
								{item.desc}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default SectionHowItWork
