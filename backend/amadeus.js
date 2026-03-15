const axios = require('axios');
require('dotenv').config();

async function getTouristsBaseLoad() {
    try {
        const clientId = process.env.AMADEUS_CLIENT_ID;
        const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

        // 1. Demander le jeton d'accès (Token) à Amadeus
        const tokenResponse = await axios.post(
            'https://test.api.amadeus.com/v1/security/oauth2/token',
            `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const token = tokenResponse.data.access_token;

        // Pour ce Proof of Concept, on simule une logique de haute saison 
        // basée sur le mois actuel (la haute saison en Martinique est de Décembre à Avril)
        const moisActuel = new Date().getMonth() + 1; 
        const estHauteSaison = (moisActuel >= 12 || moisActuel <= 4);

        console.log(`✈️ Amadeus connecté. Haute saison : ${estHauteSaison ? 'OUI' : 'NON'}`);

        return {
            hauteSaison: estHauteSaison,
            volumeVols: estHauteSaison ? 1500 : 500 // Donnée simulée pour l'algorithme
        };

    } catch (erreur) {
        console.error("❌ Erreur API Amadeus :", erreur.message);
        // En cas d'erreur de clé, on renvoie une valeur par défaut pour ne pas bloquer l'app
        return { hauteSaison: false, volumeVols: 500 };
    }
}

module.exports = { getTouristsBaseLoad };