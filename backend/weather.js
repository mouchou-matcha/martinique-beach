const axios = require('axios');
require('dotenv').config();

async function getWeatherData() {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        // Coordonnées de la Martinique
        const lat = 14.6415;
        const lon = -61.0242;
        
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        
        const reponse = await axios.get(url);
        const data = reponse.data;

        // On extrait exactement ce dont l'algorithme a besoin
        const meteoFormatee = {
            temp: data.main.temp,
            vent: data.wind.speed * 3.6, // Conversion de m/s en km/h
            pluie: data.weather.some(w => w.main.toLowerCase().includes('rain'))
        };

        console.log(`🌤️ Météo Martinique récupérée : ${meteoFormatee.temp}°C`);
        return meteoFormatee;

    } catch (erreur) {
        console.error("❌ Erreur API Météo :", erreur.message);
        // En cas de problème (clé invalide, etc.), on renvoie des données par défaut
        return { temp: 28, vent: 15, pluie: false };
    }
}

module.exports = { getWeatherData };