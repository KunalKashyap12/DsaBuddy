import React from 'react';

interface AvatarProps {
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ size = 32 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(168, 85, 247, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
        </defs>

        {/* Background */}
        <circle cx="18" cy="18" r="18" fill="url(#avatarBg)" />

        {/* Hair back */}
        <path d="M10 16C10 11.5 13.5 8 18 8C22.5 8 26 11.5 26 16C26 19 25 22 25 22H11C11 22 10 19 10 16Z" fill="url(#hairGrad)" />

        {/* Face */}
        <ellipse cx="18" cy="19" rx="6.5" ry="7.5" fill="#fde68a" />

        {/* Hair front / bangs */}
        <path d="M11.5 14C12 11 15 10 18 10C21.5 10 24 12 24.5 14.5C22.5 13 20 13 18 13.5C15 14 13 14.5 11.5 14Z" fill="#581c87" />

        {/* Glasses - Dark frames with bluish reflection */}
        {/* Left lens */}
        <rect x="12" y="16.5" width="5" height="4.5" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
        <rect x="12.5" y="17" width="4" height="3.5" rx="1" fill="#38bdf8" fillOpacity="0.4" />
        <line x1="13.2" y1="17.6" x2="15.8" y2="17.6" stroke="#ffffff" strokeWidth="0.6" strokeLinecap="round" strokeOpacity="0.8" />

        {/* Right lens */}
        <rect x="19" y="16.5" width="5" height="4.5" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
        <rect x="19.5" y="17" width="4" height="3.5" rx="1" fill="#38bdf8" fillOpacity="0.4" />
        <line x1="20.2" y1="17.6" x2="22.8" y2="17.6" stroke="#ffffff" strokeWidth="0.6" strokeLinecap="round" strokeOpacity="0.8" />

        {/* Glasses bridge */}
        <path d="M17 18.5H19" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />

        {/* Smile */}
        <path d="M16 23C16.8 24 19.2 24 20 23" stroke="#b45309" strokeWidth="0.8" strokeLinecap="round" />

        {/* Collar / Shirt */}
        <path d="M12 28.5C13.5 26.5 15.5 25.5 18 25.5C20.5 25.5 22.5 26.5 24 28.5V36H12V28.5Z" fill="#ffffff" />
        <path d="M15 26L18 29L21 26" stroke="#e2e8f0" strokeWidth="0.8" />
      </svg>
    </div>
  );
};
