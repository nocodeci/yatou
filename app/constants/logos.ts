export const YatouLogos = {
  primary: require('../../assets/logos/Logo-yatou-01.png'),
  secondary: require('../../assets/logos/Logo-yatou-02.png'),
  tertiary: require('../../assets/logos/Logo-yatou-03.png'),
  quaternary: require('../../assets/logos/Logo-yatou-04.png'),
  quinary: require('../../assets/logos/Logo-yatou-06.png'),
} as const;

export const LogoVariants = {
  '01': YatouLogos.primary,
  '02': YatouLogos.secondary,
  '03': YatouLogos.tertiary,
  '04': YatouLogos.quaternary,
  '06': YatouLogos.quinary,
} as const;

export type LogoVariant = keyof typeof LogoVariants;



