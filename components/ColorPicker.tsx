import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppColors } from '@/app/constants/colors';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  title?: string;
}

// Palette de couleurs prédéfinies
const COLOR_PALETTE = [
  // Couleurs de base
  { name: 'Rouge', value: '#FF0000', category: 'base' },
  { name: 'Vert', value: '#00FF00', category: 'base' },
  { name: 'Bleu', value: '#0000FF', category: 'base' },
  { name: 'Jaune', value: '#FFFF00', category: 'base' },
  { name: 'Cyan', value: '#00FFFF', category: 'base' },
  { name: 'Magenta', value: '#FF00FF', category: 'base' },
  
  // Couleurs de livraison
  { name: 'Orange', value: '#FFA500', category: 'delivery' },
  { name: 'Violet', value: '#800080', category: 'delivery' },
  { name: 'Rose', value: '#FF1493', category: 'delivery' },
  { name: 'Turquoise', value: '#00CED1', category: 'delivery' },
  { name: 'Lime', value: '#32CD32', category: 'delivery' },
  { name: 'Or', value: '#FFD700', category: 'delivery' },
  
  // Couleurs professionnelles
  { name: 'Gris', value: '#808080', category: 'professional' },
  { name: 'Marron', value: '#8B4513', category: 'professional' },
  { name: 'Noir', value: '#000000', category: 'professional' },
  { name: 'Blanc', value: '#FFFFFF', category: 'professional' },
  
  // Couleurs avec transparence
  { name: 'Rouge Transparent', value: 'rgba(255, 0, 0, 0.7)', category: 'transparent' },
  { name: 'Bleu Transparent', value: 'rgba(0, 0, 255, 0.7)', category: 'transparent' },
  { name: 'Vert Transparent', value: 'rgba(0, 255, 0, 0.7)', category: 'transparent' },
];

// Couleurs thématiques pour différents types de livraison
export const DELIVERY_COLORS = {
  express: '#FF1493',    // Rose vif
  standard: '#4169E1',   // Bleu royal
  economy: '#32CD32',    // Vert lime
  premium: '#FFD700',    // Or
  urgent: '#FF0000',     // Rouge
  normal: '#00FF00',     // Vert
  delayed: '#FFA500',    // Orange
};

// Couleurs selon le statut
export const STATUS_COLORS = {
  pending: '#FFA500',      // Orange (en attente)
  confirmed: '#4169E1',   // Bleu (confirmé)
  picked_up: '#32CD32',   // Vert (ramassé)
  in_transit: '#FFD700',  // Or (en transit)
  delivered: '#00FF00',   // Vert (livré)
  cancelled: '#FF0000',   // Rouge (annulé)
  default: '#808080',     // Gris (par défaut)
};

// Couleurs selon la priorité
export const PRIORITY_COLORS = {
  high: '#FF0000',        // Rouge (haute)
  medium: '#FFA500',      // Orange (moyenne)
  low: '#00FF00',         // Vert (basse)
  default: '#808080',     // Gris (par défaut)
};

export default function ColorPicker({ selectedColor, onColorChange, title = "Sélectionner une Couleur" }: ColorPickerProps) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'base': return 'Couleurs de Base';
      case 'delivery': return 'Couleurs de Livraison';
      case 'professional': return 'Couleurs Professionnelles';
      case 'transparent': return 'Couleurs Transparentes';
      default: return 'Autres';
    }
  };

  const groupedColors = COLOR_PALETTE.reduce((acc, color) => {
    if (!acc[color.category]) {
      acc[color.category] = [];
    }
    acc[color.category].push(color);
    return acc;
  }, {} as Record<string, typeof COLOR_PALETTE>);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Couleur sélectionnée */}
      <View style={styles.selectedColorContainer}>
        <Text style={styles.selectedColorLabel}>Couleur actuelle :</Text>
        <View style={[styles.selectedColorPreview, { backgroundColor: selectedColor }]} />
        <Text style={styles.selectedColorValue}>{selectedColor}</Text>
      </View>

      {/* Palette de couleurs */}
      <ScrollView style={styles.colorList}>
        {Object.entries(groupedColors).map(([category, colors]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{getCategoryLabel(category)}</Text>
            <View style={styles.colorGrid}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color.value },
                    selectedColor === color.value && styles.selectedColorItem
                  ]}
                  onPress={() => onColorChange(color.value)}
                >
                  {selectedColor === color.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Couleurs thématiques rapides */}
      <View style={styles.themeSection}>
        <Text style={styles.themeTitle}>Couleurs Thématiques</Text>
        
        <View style={styles.themeRow}>
          <Text style={styles.themeLabel}>Livraison :</Text>
          <View style={styles.themeColors}>
            {Object.entries(DELIVERY_COLORS).map(([type, color]) => (
              <TouchableOpacity
                key={type}
                style={[styles.themeColor, { backgroundColor: color }]}
                onPress={() => onColorChange(color)}
              >
                <Text style={styles.themeColorText}>{type.charAt(0).toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.themeRow}>
          <Text style={styles.themeLabel}>Statut :</Text>
          <View style={styles.themeColors}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <TouchableOpacity
                key={status}
                style={[styles.themeColor, { backgroundColor: color }]}
                onPress={() => onColorChange(color)}
              >
                <Text style={styles.themeColorText}>{status.charAt(0).toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.themeRow}>
          <Text style={styles.themeLabel}>Priorité :</Text>
          <View style={styles.themeColors}>
            {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
              <TouchableOpacity
                key={priority}
                style={[styles.themeColor, { backgroundColor: color }]}
                onPress={() => onColorChange(color)}
              >
                <Text style={styles.themeColorText}>{priority.charAt(0).toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: AppColors.surface,
    borderRadius: 8,
  },
  selectedColorLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginRight: 8,
  },
  selectedColorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.border,
    marginRight: 8,
  },
  selectedColorValue: {
    fontSize: 12,
    color: AppColors.text,
    fontFamily: 'monospace',
  },
  colorList: {
    maxHeight: 300,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorItem: {
    borderColor: AppColors.primary,
    borderWidth: 3,
  },
  checkmark: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  themeSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    width: 80,
  },
  themeColors: {
    flexDirection: 'row',
    gap: 8,
  },
  themeColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  themeColorText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
