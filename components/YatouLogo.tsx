import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AppColors } from '@/app/constants/colors';
import { LogoVariants, LogoVariant } from '@/app/constants/logos';

interface YatouLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: LogoVariant;
  style?: any;
}

const YatouLogo: React.FC<YatouLogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  variant = '01',
  style 
}) => {
  const getLogoSource = () => {
    return LogoVariants[variant || '01'];
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24, fontSize: 14 };
      case 'large':
        return { width: 80, height: 80, fontSize: 20 };
      default:
        return { width: 40, height: 40, fontSize: 16 };
    }
  };

  const { width, height, fontSize } = getSize();

  return (
    <View style={[styles.container, style]}>
      <Image
        source={getLogoSource()}
        style={[styles.logo, { width, height }]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.text, { fontSize }]}>
          Yatou
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    // Les dimensions sont définies dynamiquement
  },
  text: {
    fontWeight: 'bold',
    color: AppColors.text,
    letterSpacing: 0.5,
  },
});

export default YatouLogo;
