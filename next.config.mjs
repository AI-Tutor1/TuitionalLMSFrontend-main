/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-date-pickers",
      "@mui/x-charts",
      "lucide-react",
      "recharts",
      "emoji-picker-react",
      "react-icons",
      "lodash",
      "date-fns",
      "rsuite",
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "91.108.112.253",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dev.tuitionaledu.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Production optimizations only
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          defaultVendors: false,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: -10,
            chunks: "all",
            reuseExistingChunk: true,
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: "mui",
            chunks: "all",
            priority: 20,
            reuseExistingChunk: true,
          },
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs|react-redux|redux-persist)[\\/]/,
            name: "redux",
            chunks: "all",
            priority: 20,
            reuseExistingChunk: true,
          },
          charts: {
            test: /[\\/]node_modules[\\/](recharts|chart\.js|d3-scale)[\\/]/,
            name: "charts",
            chunks: "all",
            priority: 20,
            reuseExistingChunk: true,
          },
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: "firebase",
            chunks: "all",
            priority: 20,
            reuseExistingChunk: true,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
                { name: "removeDimensions" },
              ],
            },
          },
        },
      ],
    });

    // Production tree shaking
    if (!dev) {
      config.optimization.usedExports = true;
    }

    return config;
  },

  // Performance settings
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  trailingSlash: false,

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache fonts
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache images
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      // Cache static files
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ✅ Noindex signin and forgot-password
      {
        source: "/signin",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        source: "/forgot-password",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/view/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
