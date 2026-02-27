"use client"
import Link from "next/link";
import Logo from "../../public/assets/mds.png";
import { usePathname } from 'next/navigation';

const navigation = {
	support: [
		{ name: 'Submit ticket', href: '#' },
	],
	quickLinks: [
		{ name: 'List Your property', href: '/host' },
		{ name: 'About', href: '/about-us' },
		{ name: 'Blogs', href: '/blogs' },
		// { name: 'Press', href: '#' },
		// { name: 'Customer Support', href: '#' },
	],
	legal: [
		{ name: 'Payment Security', href: '/payment-security' },
		{ name: 'Privacy policy', href: '/privacy-policy' },
		{ name: 'User Agreement', href: '/user-agreement' },
		{ name: 'Terms of service', href: '/terms-service' },
	],
	social: [
		{
			name: 'Facebook',
			href: 'https://www.facebook.com/people/My-Divine-Stays/61583088092730/',
			icon: (props) => (
				<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
					<path
						fillRule="evenodd"
						d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		{
			name: 'Instagram',
			href: 'https://www.instagram.com/mydivinestays/',
			icon: (props) => (
				<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
					<path
						fillRule="evenodd"
						d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		// {
		// 	name: 'X',
		// 	href: 'https://x.com/MyDivineStays',
		// 	icon: (props) => (
		// 		<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
		// 			<path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
		// 		</svg>
		// 	),
		// },

		{
			name: 'YouTube',
			href: 'https://www.youtube.com/channel/UCz634rRkL8gWBZ1qF3OrI7A',
			icon: (props) => (
				<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
					<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
				</svg>
			),
		},
		{
			name: 'Pinterest',
			href: 'https://in.pinterest.com/mydivinestays/',
			icon: (props) => (
				<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
					<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592 0 11.985 0" />
				</svg>
			),
		},
		{
			name: 'LinkedIn',
			href: 'https://www.linkedin.com/authwall?trk=bf&trkInfo=AQGyDBzk2lcBBAAAAZo_dzeoAr0Hr5fB_Xpd-6QuUveoL0QgCt634my4ZFZpFfSrYfbcaoj3VmDeGK-_TdgcbeEvmBDzoYYnqxLt6TOEevc-UiTPw2-ZUqcugSTlqvZ_eDnDwOM=&original_referer=&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fcompany%2Fmydivinestays%2F%3FviewAsMember%3Dtrue',
			icon: (props) => (
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
					<path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
				</svg>
			),
		},
	],
}

export default function Footer() {
	const pathname = usePathname()

	if (pathname.startsWith("/admin") || pathname.startsWith("/host")) {
		return null
	}

	return (
		<footer className="border-t border-neutral-200">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 pt-12 sm:pt-16 lg:pt-20">
				{/* Main Footer Content */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
					{/* Brand Section */}
					<div className="space-y-6 md:col-span-2 lg:col-span-1">
						<Link href="/">
							<img src={Logo.src} alt="My Divine Stays" className="w-32 h-auto" />
						</Link>
						<p className="text-sm leading-6 mt-5 text-gray-600 max-w-xs">
							Making spiritual journeys more accessible through seamless accommodation solutions.
						</p>
						<div className="flex gap-x-4">
							{navigation.social.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									target='_blank'
									rel="noopener noreferrer"
									className="text-gray-600 hover:text-gray-800 transition-colors"
								>
									<span className="sr-only">{item.name}</span>
									<item.icon aria-hidden="true" className="h-6 w-6" />
								</Link>
							))}
						</div>
					</div>

					{/* Support Section */}
					{/* <div>
						<h3 className="text-sm font-semibold text-gray-900 mb-4">
							Support
						</h3>
						<ul role="list" className="space-y-3">
							{navigation.support.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div> */}

					{/* Quick Links Section */}
					<div>
						<h3 className="text-sm font-semibold text-gray-900 mb-4">
							Quick Links
						</h3>
						<ul role="list" className="space-y-3">
							{navigation.quickLinks.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Legal Section */}
					<div>
						<h3 className="text-sm font-semibold text-gray-900 mb-4">
							About the Site
						</h3>
						<ul role="list" className="space-y-3">
							{navigation.legal.map((item) => (
								<li key={item.name}>
									<Link
										href={item.href}
										className="text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
									>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Copyright Section */}
				<div className="mt-12 pt-8 border-t border-gray-900/10">
					<p className="text-sm text-gray-600">
						&copy; 2025 PILGRIM CONNECT PVT. LTD
					</p>
				</div>
			</div>
		</footer>
	)
}