const axios = require('axios');
require('dotenv').config();

async function getTrafficData() {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;

        // Sécurité : Si la clé est vide ou par défaut
        if (!apiKey || apiKey === 'ta_cle_google_ici') {
            console.log("⚠️ Google Traffic : Clé API manquante dans le fichier .env");
            return {};
        }

        // Origine : Aéroport Aimé Césaire (Point central Martinique)
        const origin = '14.5944,-61.0018'; 
        
        // Destinations (8 points correspondant exactement à la liste des plages)
        const destinations = [
            '14.434,-60.880', // ste-anne
            '14.492,-61.080', // arlet
            '14.406,-60.875', // salines
            '14.481,-61.025', // diamant
            '14.555,-61.052', // pt-bout
            '14.771,-60.916', // tartane
            '14.613,-61.101', // madiana
            '14.448,-60.881'  // pt-marin
        ].join('|');

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&departure_time=now&key=${apiKey}`;
        
        const reponse = await axios.get(url);
        
        if (reponse.data.status !== 'OK') {
            console.error("❌ Erreur API Google :", reponse.data.error_message || reponse.data.status);
            return {};
        }

        const elements = reponse.data.rows[0].elements;
        
        // Fonction pour extraire le retard en minutes
        const calculerRetard = (el) => {
            if (el.status === 'OK' && el.duration_in_traffic && el.duration) {
                const secondesRetard = el.duration_in_traffic.value - el.duration.value;
                return Math.max(0, Math.round(secondesRetard / 60));
            }
            return 0;
        };

        // On construit l'objet de réponse avec les IDs exacts utilisés dans algorithm.js
        const resultatsTrafic = {
            'ste-anne': calculerRetard(elements[0]),
            'arlet': calculerRetard(elements[1]),
            'salines': calculerRetard(elements[2]),
            'diamant': calculerRetard(elements[3]),
            'pt-bout': calculerRetard(elements[4]),
            'tartane': calculerRetard(elements[5]),
            'madiana': calculerRetard(elements[6]),
            'pt-marin': calculerRetard(elements[7])
        };

        console.log("🚗 Données trafic Google récupérées avec succès.");
        return resultatsTrafic;

    } catch (erreur) {
        console.error("❌ Erreur connexion Google Traffic :", erreur.message);
        return {};
    }
}

module.exports = { getTrafficData };