/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - Core Brand Identity
        brand: {
          primary: '#4A1A4F',     // Deep Purple
          secondary: '#1A1F3A',   // Midnight Blue  
          accent: '#D4AF37',      // Gold
          white: '#FFFFFF',       // Pure White
        },
        
        // Light Mode Colors
        light: {
          bg: {
            primary: '#FFFFFF',
            secondary: '#FAFAFA',
            elevated: '#FFFFFF',
          },
          text: {
            primary: '#1A1F3A',
            secondary: '#4A1A4F',
            tertiary: '#6B6B7D',
          },
          border: {
            default: '#E8E1E8',
            focus: '#4A1A4F',
          },
          divider: '#E8E1E8',
        },

        // Dark Mode Colors
        dark: {
          bg: {
            primary: '#0F0F1A',
            secondary: '#1A1F3A',
            elevated: '#1A1F3A',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#C8B8D4',
            tertiary: '#8A8A9A',
          },
          border: {
            default: '#2A2F4A',
            focus: '#7A5A7F',
          },
          divider: '#2A2F4A',
        },

        // State Colors
        state: {
          success: '#28A745',
          'success-dark': '#34CE57',
          warning: '#FFC107',
          'warning-dark': '#FFD60A',
          error: '#DC3545',
          'error-dark': '#FF453A',
          info: '#17A2B8',
          'info-dark': '#64D2FF',
        },
      },
      
      spacing: {
        // 8pt Grid Base System
        'xxs': '2px',   // 0.25x
        'xs': '4px',    // 0.5x
        's': '8px',     // 1x - base unit
        'm': '16px',    // 2x
        'l': '24px',    // 3x
        'xl': '32px',   // 4x
        'xxl': '40px',  // 5x
        'xxxl': '48px', // 6x
        
        // Component-specific
        'card-padding': '16px',
        'button-horizontal': '24px',
        'button-vertical': '8px',
        'section-margin': '24px',
        'list-item': '56px',
        'safe-margin': '16px',
      },

      fontSize: {
        // Typography Scale
        'display-large': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'display-medium': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'title-large': ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        'title-medium': ['20px', { lineHeight: '1.3', fontWeight: '500' }],
        'title-small': ['18px', { lineHeight: '1.3', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-small': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'overline': ['10px', { lineHeight: '1.4', fontWeight: '500' }],
      },

      fontFamily: {
        'sans': ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },

      fontWeight: {
        'regular': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },

      borderRadius: {
        'small': '4px',
        'medium': '8px',
        'large': '16px',
        'full': '9999px',
      },

      boxShadow: {
        'card': '0 2px 8px rgba(74, 26, 79, 0.12)',
        'elevated': '0 4px 16px rgba(74, 26, 79, 0.16)',
        'modal': '0 8px 32px rgba(74, 26, 79, 0.24)',
      },

      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #1a1f3a 0%, #4a1a4f 50%, #1a1f3a 100%)',
        'aurum-glow': 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #e6c547 100%)',
      },
      
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gentle-float': 'gentleFloat 3s ease-in-out infinite',
        'mystical-pulse': 'mysticalPulse 2s ease-in-out infinite',
        'cosmic-float': 'cosmicFloat 3s ease-in-out infinite',
        'aurum-glow': 'aurumGlow 2s ease-in-out infinite',
      },
      
      keyframes: {
        pulseGlow: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': { 
            transform: 'scale(1.05)',
            opacity: '0.8',
          },
        },
        gentleFloat: {
          '0%, 100%': { 
            transform: 'translateY(0px)',
          },
          '50%': { 
            transform: 'translateY(-10px)',
          },
        },
        mysticalPulse: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        cosmicFloat: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '33%': {
            transform: 'translateY(-10px) rotate(1deg)',
          },
          '66%': {
            transform: 'translateY(-5px) rotate(-1deg)',
          },
        },
        aurumGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}