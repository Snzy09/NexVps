import React from 'react';

export const resolveCountryCode = (zoneCode?: string, countryName?: string): string => {
  if (!zoneCode && !countryName) return 'un';

  const prefix = zoneCode ? zoneCode.split('-')[0].toLowerCase() : '';
  if (prefix === 'sg') return 'sg';
  if (prefix === 'de') return 'de';
  if (prefix === 'fi') return 'fi';
  if (prefix === 'uk' || prefix === 'gb') return 'gb';
  if (prefix === 'us') return 'us';
  if (prefix === 'au') return 'au';
  if (prefix === 'nl') return 'nl';
  if (prefix === 'es') return 'es';
  if (prefix === 'pl') return 'pl';
  if (prefix === 'se') return 'se';
  if (prefix === 'fr') return 'fr';
  if (prefix === 'jp') return 'jp';
  if (prefix === 'id') return 'id';

  const c = (countryName || '').toLowerCase();
  if (c.includes('singapore') || c.includes('singapura')) return 'sg';
  if (c.includes('germany') || c.includes('jerman') || c.includes('deutschland')) return 'de';
  if (c.includes('finland') || c.includes('finlandia')) return 'fi';
  if (c.includes('united kingdom') || c.includes('inggris') || c.includes('britain') || c.includes('london')) return 'gb';
  if (c.includes('united states') || c.includes('amerika') || c.includes('usa')) return 'us';
  if (c.includes('australia')) return 'au';
  if (c.includes('netherlands') || c.includes('belanda')) return 'nl';
  if (c.includes('spain') || c.includes('spanyol')) return 'es';
  if (c.includes('poland') || c.includes('polandia')) return 'pl';
  if (c.includes('sweden') || c.includes('swedia')) return 'se';
  if (c.includes('france') || c.includes('prancis')) return 'fr';
  if (c.includes('japan') || c.includes('jepang')) return 'jp';
  if (c.includes('indonesia')) return 'id';

  return prefix || 'un';
};

interface CountryFlagProps {
  zoneCode?: string;
  countryName?: string;
  countryCode?: string;
  squared?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  zoneCode,
  countryName,
  countryCode: directCode,
  squared = false,
  className = '',
  size = 'md'
}) => {
  const code = (directCode || resolveCountryCode(zoneCode, countryName)).toLowerCase();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl'
  }[size];

  return (
    <span 
      className={`fi fi-${code} ${squared ? 'fis' : ''} ${sizeClasses} rounded-[3px] shadow-sm inline-block shrink-0 align-middle ${className}`}
      title={countryName || code.toUpperCase()}
    />
  );
};

export default CountryFlag;
