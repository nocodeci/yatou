import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User, Phone, Car, FileText } from 'lucide-react-native';
import { AppColors } from '@/app/constants/colors';
import YatouLogo from '@/components/YatouLogo';
import { UserRole } from '@/app/types/auth';
import { authService } from '@/app/services/api';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client' as UserRole,
    // Champs spécifiques aux livreurs
    vehicleType: 'moto' as 'moto' | 'fourgon' | 'camion',
    licenseNumber: '',
    vehicleRegistration: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.password || !formData.confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.role === 'driver') {
      if (!formData.licenseNumber || !formData.vehicleRegistration) {
        Alert.alert('Erreur', 'Veuillez remplir les informations du véhicule');
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await authService.register(formData);
      
      Alert.alert(
        'Succès', 
        'Votre compte a été créé avec succès !',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <YatouLogo size={100} />
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Créez votre compte YATOU</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Sélection du rôle */}
          <View style={styles.roleContainer}>
            <Text style={styles.sectionTitle}>Je veux être :</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'client' && styles.roleButtonActive
                ]}
                onPress={() => handleRoleChange('client')}
              >
                <Text style={[
                  styles.roleButtonText,
                  formData.role === 'client' && styles.roleButtonTextActive
                ]}>
                  Client
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'driver' && styles.roleButtonActive
                ]}
                onPress={() => handleRoleChange('driver')}
              >
                <Text style={[
                  styles.roleButtonText,
                  formData.role === 'driver' && styles.roleButtonTextActive
                ]}>
                  Livreur
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Informations personnelles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <User size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Prénom"
                  placeholderTextColor="#9CA3AF"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <User size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nom"
                  placeholderTextColor="#9CA3AF"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Téléphone"
                placeholderTextColor="#9CA3AF"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Informations véhicule (pour les livreurs) */}
          {formData.role === 'driver' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations véhicule</Text>
              
              {/* Sélecteur de type de véhicule */}
              <View style={styles.vehicleTypeContainer}>
                <Text style={styles.vehicleTypeLabel}>Type de véhicule</Text>
                <View style={styles.vehicleTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.vehicleTypeButton,
                      formData.vehicleType === 'moto' && styles.vehicleTypeButtonActive
                    ]}
                    onPress={() => handleInputChange('vehicleType', 'moto')}
                  >
                    <Text style={[
                      styles.vehicleTypeButtonText,
                      formData.vehicleType === 'moto' && styles.vehicleTypeButtonTextActive
                    ]}>
                      🏍️ Moto
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.vehicleTypeButton,
                      formData.vehicleType === 'fourgon' && styles.vehicleTypeButtonActive
                    ]}
                    onPress={() => handleInputChange('vehicleType', 'fourgon')}
                  >
                    <Text style={[
                      styles.vehicleTypeButtonText,
                      formData.vehicleType === 'fourgon' && styles.vehicleTypeButtonTextActive
                    ]}>
                      🚐 Fourgon
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.vehicleTypeButton,
                      formData.vehicleType === 'camion' && styles.vehicleTypeButtonActive
                    ]}
                    onPress={() => handleInputChange('vehicleType', 'camion')}
                  >
                    <Text style={[
                      styles.vehicleTypeButtonText,
                      formData.vehicleType === 'camion' && styles.vehicleTypeButtonTextActive
                    ]}>
                      🚛 Camion
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <FileText size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de permis"
                  placeholderTextColor="#9CA3AF"
                  value={formData.licenseNumber}
                  onChangeText={(value) => handleInputChange('licenseNumber', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <FileText size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Immatriculation véhicule"
                  placeholderTextColor="#9CA3AF"
                  value={formData.vehicleRegistration}
                  onChangeText={(value) => handleInputChange('vehicleRegistration', value)}
                />
              </View>
            </View>
          )}

          {/* Mot de passe */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sécurité</Text>
            
            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginLinkText}>
              Déjà un compte ? Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  roleContainer: {
    marginBottom: 32,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: '#FEF3C7',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  roleButtonTextActive: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  halfWidth: {
    flex: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '500',
  },
  // Styles pour le sélecteur de type de véhicule
  vehicleTypeContainer: {
    marginBottom: 16,
  },
  vehicleTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.text,
    marginBottom: 12,
  },
  vehicleTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  vehicleTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  vehicleTypeButtonActive: {
    borderColor: AppColors.primary,
    backgroundColor: '#FEF3C7',
  },
  vehicleTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  vehicleTypeButtonTextActive: {
    color: AppColors.primary,
    fontWeight: '600',
  },
});
