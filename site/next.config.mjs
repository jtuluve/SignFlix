/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	experimental:{
		serverActions: {
			bodySizeLimit: '2000mb'
		}
	}
};

export default nextConfig;
