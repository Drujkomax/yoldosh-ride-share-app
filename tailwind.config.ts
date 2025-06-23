
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
					DEFAULT: '#6366f1',
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: '#8b5cf6',
					foreground: '#ffffff'
				},
				accent: {
					DEFAULT: '#f59e0b',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f8fafc',
					foreground: '#64748b'
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff'
				},
				card: {
					DEFAULT: '#ffffff',
					foreground: '#1e293b'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#1e293b'
				},
				yoldosh: {
					primary: '#6366f1',
					secondary: '#8b5cf6',
					accent: '#06b6d4',
					dark: '#1e293b',
					light: '#f1f5f9',
					success: '#10b981',
					warning: '#f59e0b',
					error: '#ef4444'
				}
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
				'gradient-secondary': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
				'gradient-dark': 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
				'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
			},
			borderRadius: {
				lg: '1rem',
				md: '0.75rem',
				sm: '0.5rem'
			},
			animation: {
				'fade-in': 'fadeIn 0.6s ease-out',
				'slide-up': 'slideUp 0.4s ease-out',
				'slide-down': 'slideDown 0.4s ease-out',
				'bounce-soft': 'bounceSoft 0.8s ease-out',
				'scale-in': 'scaleIn 0.3s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'input-focus': 'inputFocus 0.3s ease-out',
				'button-press': 'buttonPress 0.1s ease-out'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				slideUp: {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				slideDown: {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				bounceSoft: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'50%': { transform: 'scale(1.02)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				scaleIn: {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				inputFocus: {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.02)' },
					'100%': { transform: 'scale(1)' }
				},
				buttonPress: {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(0.98)' },
					'100%': { transform: 'scale(1)' }
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
