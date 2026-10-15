import React from 'react';

export type OsDistro = 
  | 'ubuntu' 
  | 'debian' 
  | 'almalinux' 
  | 'rocky' 
  | 'centos' 
  | 'fedora' 
  | 'windows' 
  | 'alpine'
  | 'arch'
  | 'opensuse'
  | 'freebsd'
  | 'linux'
  | string;

interface OsIconProps {
  distro: OsDistro;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16'
};

export const OsIcon: React.FC<OsIconProps> = ({
  distro,
  size = 'md',
  className = ''
}) => {
  const normDistro = (distro || '').toLowerCase().trim();
  const dimensionClass = sizeMap[size] || sizeMap.md;

  // 1. UBUNTU (Official Circle of Friends)
  if (normDistro.includes('ubuntu')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#77216F" />
        {/* Top Friend dot */}
        <circle cx="16" cy="6.8" r="2.1" fill="white" />
        {/* Bottom-right Friend dot */}
        <circle cx="23.9" cy="20.6" r="2.1" fill="white" />
        {/* Bottom-left Friend dot */}
        <circle cx="8.1" cy="20.6" r="2.1" fill="white" />
        {/* Arc segments (Arms) */}
        <path
          d="M13.2 8.2A8.6 8.6 0 0 0 8.5 13.8M18.8 8.2a8.6 8.6 0 0 1 4.7 5.6M24.2 17.5a8.6 8.6 0 0 1-4.2 5.8M7.8 17.5a8.6 8.6 0 0 0 4.2 5.8M12.4 24.2a8.6 8.6 0 0 0 7.2 0"
          stroke="white"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        {/* Center circle cutout */}
        <circle cx="16" cy="16" r="4.2" stroke="white" strokeWidth="2.1" fill="none" />
      </svg>
    );
  }

  // 2. DEBIAN (Official Ruby Swirl)
  if (normDistro.includes('debian')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="16" fill="#A81D33" fillOpacity="0.12" />
        <path
          d="M16 4C14.1 4 12.3 4.6 10.8 5.7c-2 1.4-3.4 3.7-3.8 6.2-.4 2.5.2 5.1 1.6 7.2 1.4 2.1 3.7 3.5 6.2 3.9 2.5.4 5.1-.2 7.2-1.6 1.8-1.2 3-3 3.6-5.1.5-2.1.2-4.3-.8-6.1-.9-1.6-2.4-2.8-4.2-3.4-1.7-.6-3.6-.4-5.2.4-1.5.8-2.6 2.2-3 3.8-.4 1.6-.1 3.3.8 4.7.8 1.3 2.1 2.2 3.6 2.5 1.5.3 3.1-.1 4.3-.9 1.1-.8 1.8-2 1.9-3.4.1-1.3-.4-2.7-1.5-3.5-1-.8-2.4-1-3.6-.5-1.1.5-1.9 1.6-1.9 2.8 0 1.2.8 2.2 2 2.3 1.1.1 2.2-.6 2.4-1.7"
          stroke="#D70A53"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="1.5" fill="#D70A53" />
      </svg>
    );
  }

  // 3. CENTOS / CENTOS STREAM (Official 4-Color Gem/Arrows)
  if (normDistro.includes('centos')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="16" fill="#1E293B" />
        {/* Top wing - Yellow/Orange */}
        <path d="M16 6.5L20.8 11.3H16v4.7h-4.7V11.3L16 6.5z" fill="#FFA600" />
        {/* Right wing - Purple/Magenta */}
        <path d="M25.5 16L20.7 20.8V16H16v-4.7h4.7L25.5 16z" fill="#93227F" />
        {/* Bottom wing - Green */}
        <path d="M16 25.5L11.2 20.7H16V16h4.7v4.7L16 25.5z" fill="#9CCA3B" />
        {/* Left wing - Blue */}
        <path d="M6.5 16L11.3 11.2V16H16v4.7h-4.7L6.5 16z" fill="#2255AA" />
        {/* Center white separator lines */}
        <rect x="15.5" y="11" width="1" height="10" fill="white" opacity="0.9" />
        <rect x="11" y="15.5" width="10" height="1" fill="white" opacity="0.9" />
      </svg>
    );
  }

  // 4. ALMALINUX (Official Colorful Ribbons)
  if (normDistro.includes('alma') || normDistro.includes('almalinux')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="16" fill="#0A192F" />
        {/* Top-Right Light Blue Ribbon */}
        <path
          d="M16 6c3.2 0 6 1.8 7.5 4.5l-3.8 2.2C18.8 11.2 17.5 10.4 16 10.4V6z"
          fill="#00B4D8"
        />
        {/* Bottom-Right Amber/Yellow Ribbon */}
        <path
          d="M26 16c0 3.2-1.8 6-4.5 7.5l-2.2-3.8c1.5-.9 2.3-2.2 2.3-3.7H26z"
          fill="#F59E0B"
        />
        {/* Bottom-Left Red Ribbon */}
        <path
          d="M16 26c-3.2 0-6-1.8-7.5-4.5l3.8-2.2c.9 1.5 2.2 2.3 3.7 2.3V26z"
          fill="#EF4444"
        />
        {/* Top-Left Deep Blue Ribbon */}
        <path
          d="M6 16c0-3.2 1.8-6 4.5-7.5l2.2 3.8C11.2 13.2 10.4 14.5 10.4 16H6z"
          fill="#3B82F6"
        />
        {/* Central connecting loop */}
        <circle cx="16" cy="16" r="3" fill="#FFFFFF" fillOpacity="0.85" />
      </svg>
    );
  }

  // 5. ROCKY LINUX (Official Emerald Geometric Mountain)
  if (normDistro.includes('rocky')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="16" fill="#064E3B" fillOpacity="0.3" />
        {/* Facet 1: Main peak left */}
        <path d="M16 6L7 22h7l2-5 2 5h7L16 6z" fill="#10B981" />
        {/* Facet 2: Center inner cleft */}
        <path d="M16 6l-2 11h4L16 6z" fill="#047857" />
        {/* Facet 3: Right slope highlight */}
        <path d="M16 6l9 16h-5l-4-9V6z" fill="#34D399" />
        {/* Base polygon */}
        <path d="M12 22l4 4 4-4H12z" fill="#059669" />
      </svg>
    );
  }

  // 6. FEDORA (Official Infinity / Blue Logo)
  if (normDistro.includes('fedora')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#294172" />
        {/* Fedora Infinity loop */}
        <path
          d="M12 11.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5c2.3 0 4.1-1.7 4.4-3.9h-3.4c-.2.7-.8 1.2-1.5 1.2-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8c.7 0 1.3.5 1.5 1.2H20c-.3-2.2-2.1-3.9-4.4-3.9-1.4 0-2.6.6-3.6 1.6z"
          fill="#51A2DA"
        />
        <path
          d="M20 11.5c-1.4 0-2.6.6-3.6 1.6l1.9 1.9c.5-.7 1-1 1.7-1 1 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8c-.7 0-1.3-.5-1.5-1.2h-3.6c.3 2.2 2.1 3.9 4.4 3.9 2.5 0 4.5-2 4.5-4.5s-2-4.3-3.8-4.3z"
          fill="#FFFFFF"
        />
        {/* Distinctive 'f' crossbar */}
        <rect x="17" y="13.5" width="2" height="7" rx="1" fill="#FFFFFF" />
        <rect x="15" y="15" width="6" height="2" rx="1" fill="#FFFFFF" />
      </svg>
    );
  }

  // 7. WINDOWS SERVER (Official Microsoft 4-Pane Blue Logo)
  if (normDistro.includes('windows')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="16" fill="#0078D4" fillOpacity="0.15" />
        {/* Top Left Pane */}
        <path d="M6 8.5L14.5 7.3V15H6V8.5z" fill="#00A4EF" />
        {/* Top Right Pane */}
        <path d="M16 7.1L26 5.7V15H16V7.1z" fill="#00A4EF" />
        {/* Bottom Left Pane */}
        <path d="M6 17H14.5V24.7L6 23.5V17z" fill="#00A4EF" />
        {/* Bottom Right Pane */}
        <path d="M16 17H26V26.3L16 24.9V17z" fill="#00A4EF" />
      </svg>
    );
  }

  // 8. ALPINE LINUX (Triple Mountain Peaks)
  if (normDistro.includes('alpine')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="16" fill="#0D597F" />
        <path
          d="M16 8L7 24h18L16 8z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
        <path
          d="M16 8l-4.5 8 3.5 8h10L16 8z"
          fill="#3B82A6"
        />
        <path
          d="M16 8v16"
          stroke="#0D597F"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 9. ARCH LINUX (Iconic Arch Chevron)
  if (normDistro.includes('arch')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#1793D1" fillOpacity="0.18" />
        <path
          d="M16 5.5L7 25c3-1.5 6-2.5 9-2.5s6 1 9 2.5L16 5.5z"
          fill="#1793D1"
        />
        <path
          d="M16 11l-3 7.5c2 .5 4 .5 6 0L16 11z"
          fill="#38BDF8"
        />
        <circle cx="16" cy="15" r="1.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // 10. OPENSUSE (Chameleon Geeko)
  if (normDistro.includes('suse') || normDistro.includes('opensuse')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#73BA25" />
        <path
          d="M8 20c0-5.5 3.5-10 10-10 3.5 0 5.5 1.5 6.5 3.5-1.2-.5-2.5-.7-4-.4-2.2.4-4 2.2-4 4.5 0 2.5 2 4.5 4.5 4.5 2 0 3.8-1.3 4.3-3.2.1 1-.2 2.3-1.2 3.5-1.8 2.2-4.5 3.1-7.6 3.1-4.8 0-8.5-2.8-8.5-5.5z"
          fill="#FFFFFF"
        />
        <circle cx="16" cy="14" r="2" fill="#73BA25" />
        <circle cx="16.5" cy="13.5" r="0.7" fill="#FFFFFF" />
      </svg>
    );
  }

  // 11. FREEBSD (Red Sphere with Beastie Horns)
  if (normDistro.includes('freebsd') || normDistro.includes('bsd')) {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`${dimensionClass} ${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="16" fill="#AB2B28" fillOpacity="0.18" />
        <circle cx="16" cy="16.5" r="9" fill="#C8102E" />
        <path
          d="M9.5 12c-1-2.5-.5-5 1.5-6.5.5 2.5 2 4.5 4 5-2.5.5-4.5 1-5.5 1.5z"
          fill="#C8102E"
        />
        <path
          d="M22.5 12c1-2.5.5-5-1.5-6.5-.5 2.5-2 4.5-4 5 2.5.5 4.5 1 5.5 1.5z"
          fill="#C8102E"
        />
        <ellipse cx="14" cy="13" rx="3.5" ry="1.8" fill="#FFFFFF" fillOpacity="0.35" />
      </svg>
    );
  }

  // 12. DEFAULT / LINUX TUX (SVG from svgrepo vectors/linux)
  return (
    <svg
      viewBox="0 0 32 32"
      className={`${dimensionClass} ${className} shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="16" fill="#1E293B" />
      {/* Tux Body */}
      <ellipse cx="16" cy="18" rx="8" ry="9" fill="#0F172A" />
      {/* Tux White Belly */}
      <ellipse cx="16" cy="19.5" rx="5.5" ry="6.5" fill="#F8FAFC" />
      {/* Tux Head */}
      <circle cx="16" cy="11.5" r="5.5" fill="#0F172A" />
      {/* Left Eye */}
      <ellipse cx="14" cy="10.5" rx="1.2" ry="1.6" fill="#FFFFFF" />
      <circle cx="14.3" cy="10.5" r="0.6" fill="#0F172A" />
      {/* Right Eye */}
      <ellipse cx="18" cy="10.5" rx="1.2" ry="1.6" fill="#FFFFFF" />
      <circle cx="17.7" cy="10.5" r="0.6" fill="#0F172A" />
      {/* Tux Beak */}
      <path d="M14 12.5h4l-2 2.5-2-2.5z" fill="#F59E0B" />
      {/* Left Foot */}
      <ellipse cx="12" cy="27" rx="3" ry="1.4" fill="#F59E0B" />
      {/* Right Foot */}
      <ellipse cx="20" cy="27" rx="3" ry="1.4" fill="#F59E0B" />
      {/* Wings / Flippers */}
      <path d="M8 17c0 3 1.5 5 2 6l-1-4-1-2z" fill="#0F172A" />
      <path d="M24 17c0 3-1.5 5-2 6l1-4 1-2z" fill="#0F172A" />
    </svg>
  );
};
