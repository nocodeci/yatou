const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Créer une nouvelle livraison
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      pickup_address,
      pickup_coordinates,
      delivery_address,
      delivery_coordinates,
      description,
      weight,
      dimensions,
      special_instructions
    } = req.body;

    const userId = req.user.id;

    // Validation des données
    if (!delivery_address || !delivery_coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Adresse de livraison et coordonnées sont requis'
      });
    }

    // Créer la livraison
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .insert([
        {
          user_id: userId,
          pickup_address: pickup_address || 'Position actuelle',
          pickup_coordinates: pickup_coordinates || null,
          delivery_address,
          delivery_coordinates,
          description: description || null,
          weight: weight || null,
          dimensions: dimensions || null,
          special_instructions: special_instructions || null,
          status: 'pending',
          estimated_price: calculateEstimatedPrice(weight, delivery_coordinates),
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erreur création livraison:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la livraison'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Livraison créée avec succès',
      data: {
        delivery
      }
    });
  } catch (error) {
    console.error('Erreur création livraison:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Récupérer toutes les livraisons de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from('deliveries')
      .select(`
        *,
        driver:drivers(name, phone, vehicle_info)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Filtrer par statut si spécifié
    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: deliveries, error, count } = await query;

    if (error) {
      console.error('Erreur récupération livraisons:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des livraisons'
      });
    }

    res.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || deliveries.length
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération livraisons:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Récupérer une livraison spécifique
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: delivery, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        driver:drivers(name, phone, vehicle_info)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    res.json({
      success: true,
      data: {
        delivery
      }
    });
  } catch (error) {
    console.error('Erreur récupération livraison:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Mettre à jour le statut d'une livraison
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validation du statut
    const validStatuses = ['pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    // Vérifier que la livraison appartient à l'utilisateur
    const { data: existingDelivery } = await supabase
      .from('deliveries')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingDelivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    // Mettre à jour le statut
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour statut:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du statut'
      });
    }

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: {
        delivery
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Annuler une livraison
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que la livraison appartient à l'utilisateur et peut être annulée
    const { data: delivery } = await supabase
      .from('deliveries')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Livraison non trouvée'
      });
    }

    if (delivery.status !== 'pending' && delivery.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cette livraison ne peut plus être annulée'
      });
    }

    // Annuler la livraison
    const { error } = await supabase
      .from('deliveries')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erreur annulation livraison:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'annulation de la livraison'
      });
    }

    res.json({
      success: true,
      message: 'Livraison annulée avec succès'
    });
  } catch (error) {
    console.error('Erreur annulation livraison:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Fonction pour calculer le prix estimé
function calculateEstimatedPrice(weight, deliveryCoordinates) {
  // Logique simple de calcul de prix basée sur la distance et le poids
  // À adapter selon vos besoins
  const basePrice = 1000; // Prix de base en FCFA
  const weightMultiplier = weight ? Math.max(1, weight / 5) : 1;
  
  return Math.round(basePrice * weightMultiplier);
}

module.exports = router;
