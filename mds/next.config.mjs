/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '65.1.45.115',  // Add your EC2 IP here
                port: '',
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
    },
    experimental: {
        optimizeCss: true,
    }
};

export default nextConfig;