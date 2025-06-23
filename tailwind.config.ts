
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#2563eb',
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: '#10b981',
					foreground: '#ffffff'
				},
				accent: {
					DEFAULT: '#f59e0b',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f3f4f6',
					foreground: '#6b7280'
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff'
				},
				card: {
					DEFAULT: '#ffffff',
					foreground: '#1f2937'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#1f2937'
				},
				yoldosh: {
					blue: '#2563eb',
					green: '#10b981',
					orange: '#f59e0b',
					gray: '#6b7280'
				}
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
				'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
			},
			borderRadius: {
				lg: '0.75rem',
				md: '0.5rem',
				sm: '0.25rem'
			},
			animation: {
				'fade-in': 'fadeIn 0.3s ease-out',
				'slide-up': 'slideUp 0.3s ease-out',
				'bounce-soft': 'bounceSoft 0.6s ease-out'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				bounceSoft: {
					'0%': { transform: 'scale(0.95)' },
					'50%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' }
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
