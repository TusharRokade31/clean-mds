'use client'


import React, {useState } from 'react'
import quotationImg from '../../public/assets/quotation.png'
import quotationImg2 from '../../public/assets/quotation2.png'
import Image from 'next/image'
import { useSwipeable } from 'react-swipeable'


const DEMO_DATA = [
	{
		id: 1,
		clientName: 'Tiana Abie',
		clientAddress: 'Malaysia',
		content:
			'Coming Soon...',
	},
	
]

const SectionClientSay = ({
}) => {
	const [index, setIndex] = useState(0)
	const [direction, setDirection] = useState(0)

	function changeItemId(newVal) {
		if (newVal > index) {
			setDirection(document.dir === 'rtl' ? -1 : 1)
		} else {
			setDirection(document.dir === 'rtl' ? 1 : -1)
		}
		setIndex(newVal)
	}

	const handlers = useSwipeable({
		onSwipedLeft: () => {
			if (document.dir === 'rtl') {
				if (index > 0) {
					changeItemId(index - 1)
				}
			} else if (index < DEMO_DATA?.length - 1) {
				changeItemId(index + 1)
			}
		},
		onSwipedRight: () => {
			if (document.dir === 'rtl') {
				if (index < DEMO_DATA?.length - 1) {
					changeItemId(index + 1)
				}
			} else if (index > 0) {
				changeItemId(index - 1)
			}
		},
		trackMouse: true,
	})

	let currentItem = DEMO_DATA[index]
	return (
		<div className={`nc-SectionClientSay py-16 mt-5 px-4 relative bg-[#f3f4f6] `}>
			
			<div>
			<h2 className="text-3xl font-semibold md:text-4xl text-center text-gray-900 mb-2">Divine Journeys: What Our Pilgrims Say</h2>
			<p className="text-lg text-center text-[#6b7280] mb-6">Hear from our guests who found peace and spiritual connection
			</p>
			<div className="relative mx-auto h-40 max-w-2xl md:mb-16">
				<div className="absolute -inset-28 top-0 hidden items-center justify-center lg:flex">
					{/* <Image
						className="mx-auto flex-1"
						src={sectionClientSayBG}
						alt="bg"
						sizes="(max-width: 1000px) 90vw, 100vw"
					/> */}
				</div>

				{/* <Image
					className="mx-auto max-w-20"
					src={clientSayMain}
					alt="main client"
				/> */}
				<div className="relative mt-12 lg:mt-16">
					<Image
						className="absolute right-full top-1 -me-16 opacity-50 md:opacity-100 lg:me-3"
						src={quotationImg}
						alt=""
					/>
					<Image
						className="absolute left-full top-1 -ms-16 hidden opacity-50 sm:block md:opacity-100 lg:ms-3"
						src={quotationImg2}
						alt=""
					/>

                          <div className=" text-lg w-full text-center sm:text-xl text lg:text-2xl">
											{currentItem.content}
										</div>

					{/* <MotionConfig
						transition={{
							x: { type: 'spring', stiffness: 300, damping: 30 },
							opacity: { duration: 0.2 },
						}}
					>
						<div
							className={`relative overflow-hidden whitespace-nowrap`}
							{...handlers}
						> */}

                                  {/* <span className=" text-lg sm:text-xl lg:text-2xl">
											{currentItem.content}
										</span> */}
							{/* <AnimatePresence initial={false} custom={direction}>
								<motion.div
									key={index}
									custom={direction}
									variants={variants(200, 1)}
									initial="enter"
									animate="center"
									className="inline-flex flex-col items-center whitespace-normal text-center"
								>
									<>
										<span className=" text-lg sm:text-xl lg:text-2xl">
											{currentItem.content}
										</span>
										<span className="mt-8 block text-lg font-semibold sm:text-xl lg:text-2xl">
											{currentItem.clientName}
										</span>
										<div className="mt-2 flex items-center gap-x-2 text-neutral-400 sm:text-lg">
											<MapPinIcon className="h-5 w-5" />
											<span>{currentItem.clientAddress}</span>
										</div>
									</>
								</motion.div>
							</AnimatePresence> */}

							{/* <div className="mt-10 flex items-center justify-center gap-x-2">
								{DEMO_DATA.map((item, i) => (
									<button
										className={`h-2 w-2 rounded-full ${
											i === index ? 'bg-black/70' : 'bg-black/10'
										}`}
										onClick={() => changeItemId(i)}
										key={i}
									/>
								))}
							</div>
						</div>
					</MotionConfig> */}
				</div>
			</div>
			</div>
		</div>
	)
}

export default SectionClientSay
