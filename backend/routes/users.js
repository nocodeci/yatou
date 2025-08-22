const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer les statistiques de l'utilisateur
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer les statistiques des livraisons
    const { data: deliveries, error } = await supabase
      .from('deliveries')
      .select('status, created_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur récupération statistiques:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }

    // Calculer les statistiques
    const stats = {
      total: deliveries.length,
      pending: deliveries.filter(d => d.status === 'pending').length,
      in_transit: deliveries.filter(d => ['confirmed', 'picked_up', 'in_transit'].includes(d.status)).length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      cancelled: deliveries.filter(d => d.status === 'cancelled').length
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Récupérer l'historique des livraisons
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { data: deliveries, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        driver:drivers(name, phone, vehicle_info)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur récupération historique:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }

    res.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: deliveries.length
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Mettre à jour les préférences utilisateur
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      default_pickup_address,
      default_pickup_coordinates,
      notification_preferences,
      language
    } = req.body;

    const updateData = {};
    if (default_pickup_address) updateData.default_pickup_address = default_pickup_address;
    if (default_pickup_coordinates) updateData.default_pickup_coordinates = default_pickup_coordinates;
    if (notification_preferences) updateData.notification_preferences = notification_preferences;
    if (language) updateData.language = language;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour préférences:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour des préférences'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour préférences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Changer le mot de passe
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Ancien et nouveau mot de passe sont requis'
      });
    }

    // Récupérer l'utilisateur avec le mot de passe actuel
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier l'ancien mot de passe
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Ancien mot de passe incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedNewPassword })
      .eq('id', userId);

    if (updateError) {
      console.error('Erreur changement mot de passe:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du changement de mot de passe'
      });
    }

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
