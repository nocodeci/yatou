import { View, Text, Pressable, StyleSheet, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { icons } from '../assets/icons';

interface TabBarButtonProps {
  isFocused: boolean;
  label: string;
  routeName: string;
  color: string;
  onPress: () => void;
  onLongPress: () => void;
}

const TabBarButton: React.FC<TabBarButtonProps> = (props) => {
    const {isFocused, label, routeName, color} = props;

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const topAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const targetScale = isFocused ? 1 : 0;
        const targetTop = isFocused ? 8 : 0;
        const targetOpacity = isFocused ? 0 : 1;

                Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: targetScale,
                useNativeDriver: true,
            }),
            Animated.spring(topAnim, {
                toValue: targetTop,
                useNativeDriver: false,
            }),
            Animated.timing(opacityAnim, {
                toValue: targetOpacity,
                useNativeDriver: true,
                duration: 350,
            })
        ]).start();
    }, [isFocused, scaleAnim, topAnim, opacityAnim]);

    const iconScale = scaleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.4]
    });

    return (
        <Pressable {...props} style={styles.container}>
            <Animated.View style={{
                transform: [{ scale: iconScale }],
                top: topAnim
            }}>
                {
                    icons[routeName]({
                        color
                    })
                }
            </Animated.View>
            
            <Animated.Text style={{ 
                color,
                fontSize: 11,
                opacity: opacityAnim
            }}>
                {label}
            </Animated.Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4
    }
})

export default TabBarButton
