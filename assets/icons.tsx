import React from 'react';
import { AntDesign, Feather } from '@expo/vector-icons';

interface IconProps {
  color: string;
}

export const icons: { [key: string]: (props: IconProps) => React.ReactNode } = {
  'index': ({ color }: IconProps) => <AntDesign name="home" size={20} color={color} />,
  'create': ({ color }: IconProps) => <AntDesign name="plus" size={20} color={color} />,
  'deliveries': ({ color }: IconProps) => <Feather name="package" size={20} color={color} />,
  'track': ({ color }: IconProps) => <Feather name="map-pin" size={20} color={color} />,
  'profile': ({ color }: IconProps) => <AntDesign name="user" size={20} color={color} />,
};
