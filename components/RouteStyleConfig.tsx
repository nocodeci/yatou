import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppColors } from '@/app/constants/colors';

export interface RouteStyle {
  name: string;
  strokeColor: string;
  strokeWidth: number;
  animated: boolean;
  gradient: boolean;
  startColor?: string;
  endColor?: string;
  showDirectionArrows: boolean;
  lineDashPattern?: number[];
  description: string;
}

interface RouteStyleConfigProps {
  selectedStyle: RouteStyle;
  onStyleChange: (style: RouteStyle) => void;
}

// Styles d'itinéraire prédéfinis
export const PREDEFINED_ROUTE_STYLES: RouteStyle[] = [
  {
    name: 'Classique',
    strokeColor: AppColors.primary,
    strokeWidth: 6,
    animated: false,
    gradient: false,
    showDirectionArrows: false,
    description: 'Style simple et élégant'
  },
  {
    name: 'Animé',
    strokeColor: '#00BFFF',
    strokeWidth: 5,
    animated: true,
    gradient: false,
    showDirectionArrows: true,
    description: 'Itinéraire qui se dessine progressivement'
  },
  {
    name: 'Gradient',
    strokeColor: '#FF6B6B',
    strokeWidth: 8,
    animated: false,
    gradient: true,
    startColor: '#FF6B6B',
    endColor: '#4ECDC4',
    showDirectionArrows: true,
    description: 'Dégradé de couleur du début à la fin'
  },
  {
    name: 'Pointillés',
    strokeColor: '#FF6347',
    strokeWidth: 4,
    animated: false,
    gradient: false,
    showDirectionArrows: false,
    lineDashPattern: [10, 5],
    description: 'Ligne en pointillés avec espacement'
  },
  {
    name: 'Épais',
    strokeColor: '#8A2BE2',
    strokeWidth: 12,
    animated: false,
    gradient: false,
    showDirectionArrows: true,
    description: 'Ligne épaisse et visible'
  },
  {
    name: 'Minimaliste',
    strokeColor: '#2F4F4F',
    strokeWidth: 3,
    animated: false,
    gradient: false,
    showDirectionArrows: false,
    description: 'Style discret et professionnel'
  },
  {
    name: 'Arc-en-ciel',
    strokeColor: '#FF1493',
    strokeWidth: 6,
    animated: true,
    gradient: true,
    startColor: '#FF1493',
    endColor: '#00CED1',
    showDirectionArrows: true,
    description: 'Gradient animé avec couleurs vives'
  },
  {
    name: 'Trafic',
    strokeColor: '#FF4500',
    strokeWidth: 7,
    animated: false,
    gradient: false,
    showDirectionArrows: true,
    lineDashPattern: [15, 10],
    description: 'Style adapté pour les informations de trafic'
  }
];

export default function RouteStyleConfig({ selectedStyle, onStyleChange }: RouteStyleConfigProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Style de l'Itinéraire</Text>
      <Text style={styles.subtitle}>Choisissez un style prédéfini ou personnalisez</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stylesContainer}
      >
        {PREDEFINED_ROUTE_STYLES.map((style) => (
          <TouchableOpacity
            key={style.name}
            style={[
              styles.styleCard,
              selectedStyle.name === style.name && styles.selectedStyleCard
            ]}
            onPress={() => onStyleChange(style)}
          >
            {/* Aperçu du style */}
            <View style={styles.stylePreview}>
              <View 
                style={[
                  styles.previewLine,
                  {
                    backgroundColor: style.strokeColor,
                    height: style.strokeWidth,
                    borderStyle: style.lineDashPattern ? 'dashed' : 'solid',
                    borderWidth: style.lineDashPattern ? 1 : 0,
                    borderColor: style.strokeColor,
                  }
                ]} 
              />
              {style.gradient && (
                <View style={styles.gradientPreview}>
                  <View style={[styles.gradientDot, { backgroundColor: style.startColor }]} />
                  <View style={[styles.gradientDot, { backgroundColor: style.endColor }]} />
                </View>
              )}
              {style.animated && (
                <View style={styles.animationIndicator}>
                  <Text style={styles.animationText}>▶</Text>
                </View>
              )}
            </View>
            
            <Text style={[
              styles.styleName,
              selectedStyle.name === style.name && styles.selectedStyleName
            ]}>
              {style.name}
            </Text>
            
            <Text style={styles.styleDescription}>
              {style.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Informations sur le style sélectionné */}
      <View style={styles.selectedStyleInfo}>
        <Text style={styles.infoTitle}>Style actuel : {selectedStyle.name}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Couleur</Text>
            <View style={[styles.colorPreview, { backgroundColor: selectedStyle.strokeColor }]} />
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Épaisseur</Text>
            <Text style={styles.infoValue}>{selectedStyle.strokeWidth}px</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Animé</Text>
            <Text style={styles.infoValue}>{selectedStyle.animated ? 'Oui' : 'Non'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Gradient</Text>
            <Text style={styles.infoValue}>{selectedStyle.gradient ? 'Oui' : 'Non'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    padding: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 20,
  },
  stylesContainer: {
    paddingRight: 16,
  },
  styleCard: {
    width: 120,
    backgroundColor: AppColors.surface,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStyleCard: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + '10',
  },
  stylePreview: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewLine: {
    width: '100%',
    borderRadius: 2,
  },
  gradientPreview: {
    flexDirection: 'row',
    marginTop: 4,
  },
  gradientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  animationIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  animationText: {
    fontSize: 12,
    color: AppColors.primary,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedStyleName: {
    color: AppColors.primary,
  },
  styleDescription: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  selectedStyleInfo: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 12,
    color: AppColors.text,
    fontWeight: '500',
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
});
