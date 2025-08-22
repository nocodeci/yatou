import { View, StyleSheet } from 'react-native'
import React from 'react'
import TabBarButton from './TabBarButton';

interface TabBarProps {
    state: any;
    descriptors: any;
    navigation: any;
}

const TabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
    const primaryColor = '#dc2626'; // Rouge au lieu de bleu
    const greyColor = '#737373';

    return (
        <View style={styles.tabbar}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                
                // Logique spéciale pour l'onglet create
                let label;
                if (route.name === 'create') {
                    label = 'Créer';
                } else {
                    label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                            ? options.title
                            : route.name;
                }

                // Debug temporaire
                console.log('Route:', route.name, 'Options:', options, 'Label:', label);

                if (['_sitemap', '+not-found'].includes(route.name)) return null;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TabBarButton
                        key={route.name}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        isFocused={isFocused}
                        routeName={route.name}
                        color={isFocused ? primaryColor : greyColor}
                        label={label}
                    />
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    tabbar: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 25,
        borderCurve: 'continuous',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
        shadowOpacity: 0.1,
        elevation: 5, // Pour Android
    }
})

export default TabBar
