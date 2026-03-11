const express = require('express');
const cors = require('cors');
const path = require('path');

// Importation de tes modules simplifiés et fonctionnels
const { calculerAffluence } = require('./algorithm');
const { getTouristsBaseLoad } = require('./amadeus');
const { getWeatherData } = require('./weather');
const { compterBateauxSainteAnne } = require('./webcam');
const { getTrafficData } = require('./googleTraffic');

const app = express();
app.use(cors());
const PORT = 3000;

// On rend le dossier frontend accessible pour afficher la carte
app.use(express.static(path.join(__dirname, '../frontend')));

// --- SYSTÈME DE CACHE ---
// On garde les données en mémoire pour éviter de payer trop d'API
let cacheVols = { hauteSaison: false };
let cacheMeteo = { temp: 28, vent: 10, pluie: false };
let cacheTrafic = {};
let cacheBateaux = 0;

// Chronomètres pour les mises à jour
let derniereMiseAJourTrafic = 0;
const DELAI_30_MINUTES = 30 * 60 * 1000; 

// --- ROUTE PRINCIPALE ---
app.get('/api/affluence', async (req, res) => {
    console.log("👋 Requête reçue : Mise à jour des données en cours...");
    
    try {
        // 1. Mise à jour de la Météo (Gratuit, on le fait à chaque fois)
        const nouvelleMeteo = await getWeatherData();
        if (nouvelleMeteo) cacheMeteo = nouvelleMeteo;
        
        // 2. Mise à jour des Bateaux (Simulation propre sans bug IA)
        cacheBateaux = await compterBateauxSainteAnne();
        
        // 3. Mise à jour du Trafic Google (Sécurisé toutes les 30 min)
        const maintenant = Date.now();
        if (maintenant - derniereMiseAJourTrafic > DELAI_30_MINUTES) {
            console.log("🚗 Interrogation de Google Maps pour le trafic réel...");
            const nouveauTrafic = await getTrafficData();
            
            if (nouveauTrafic && Object.keys(nouveauTrafic).length > 0) {
                cacheTrafic = nouveauTrafic;
                derniereMiseAJourTrafic = maintenant;
                console.log("✅ Cache Trafic mis à jour.");
            }
        } else {
            const minutesRestantes = Math.round((DELAI_30_MINUTES - (maintenant - derniereMiseAJourTrafic)) / 60000);
            console.log(`ℹ️ Trafic : Utilisation du cache (Prochaine requête dans ${minutesRestantes} min)`);
        }

        // 4. Calcul final de l'affluence via l'algorithme
        const resultats = calculerAffluence(
            cacheVols, 
            cacheMeteo, 
            new Date(), 
            { bateauxSainteAnne: cacheBateaux }, 
            cacheTrafic
        );

        // Envoi de la réponse à la carte
        res.json(resultats);

    } catch (erreur) {
        console.error("❌ Erreur lors du traitement de la requête :", erreur.message);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

// --- LANCEMENT ---
app.listen(PORT, '0.0.0.0', () => {
    console.log("================================================");
    console.log(`🚀 SERVEUR MARTINIQUE BEACH ACTIF SUR LE PORT ${PORT}`);
    console.log(`🔗 Accès carte : http://localhost:${PORT}`);
    console.log("================================================");
});