/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns:[
            {
				protocol: 'http',
				hostname: 'localhost',
				port: '5000',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'my-divine-stay.onrender.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'mds-backend-bweu.onrender.com',
				port: '',
				pathname: '/**',
			},
        ]
    }
};

export default nextConfig;
