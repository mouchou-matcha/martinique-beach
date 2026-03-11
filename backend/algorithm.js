const plages = [
    { id: 'ste-anne', nom: 'Baie de Sainte-Anne', lat: 14.434, lon: -60.880 },
    { id: 'arlet', nom: 'Anse d\'Arlet', lat: 14.492, lon: -61.080 },
    { id: 'salines', nom: 'Les Salines', lat: 14.406, lon: -60.875 },
    { id: 'diamant', nom: 'Le Diamant', lat: 14.481, lon: -61.025 },
    { id: 'pt-bout', nom: 'Pointe du Bout', lat: 14.555, lon: -61.052 },
    { id: 'tartane', nom: 'Tartane (Presqu\'île)', lat: 14.771, lon: -60.916 },
    { id: 'madiana', nom: 'Plage de Madiana', lat: 14.613, lon: -61.101 },
    { id: 'pt-marin', nom: 'Pointe Marin', lat: 14.448, lon: -60.881 }
];

function calculerAffluence(donneesVols, donneesMeteo, dateActuelle, donneesWebcam = {}, donneesTrafic = {}) {
    let resultats = [];
    const heure = dateActuelle.getHours();
    const estWeekEnd = (dateActuelle.getDay() === 0 || dateActuelle.getDay() === 6);

    plages.forEach(plage => {
        let score = 20; // Score de base

        // 1. Influence des Vols & Période
        if (donneesVols.hauteSaison) score += 20;
        if (estWeekEnd) score += 20;
        if (heure >= 10 && heure <= 16) score += 15;

        // 2. Influence Météo
        if (donneesMeteo.pluie) score -= 40;
        else if (donneesMeteo.temp > 30) score += 10;

        // 3. Influence IA (Bateaux) - Uniquement Sainte-Anne
        if (plage.id === 'ste-anne' && donneesWebcam.bateauxSainteAnne !== undefined) {
            const nbBateaux = donneesWebcam.bateauxSainteAnne;
            if (nbBateaux > 20) score += 30;
            else if (nbBateaux > 10) score += 15;
        }

        // 4. Influence Trafic Google (Lien crucial avec googleTraffic.js)
        let infoTraficHtml = "Non mesuré";
        
        // On vérifie si l'ID de la plage existe dans les données reçues de Google
        if (donneesTrafic && donneesTrafic[plage.id] !== undefined) {
            const retard = donneesTrafic[plage.id];
            
            if (retard >= 15) {
                score += 25;
                infoTraficHtml = `<span style="color:#dc3545; font-weight:bold;">+${retard} min (Bouchons)</span>`;
            } else if (retard > 0) {
                score += 10;
                infoTraficHtml = `<span style="color:#ffc107; font-weight:bold;">+${retard} min (Ralenti)</span>`;
            } else {
                infoTraficHtml = `<span style="color:#28a745; font-weight:bold;">Fluide (0 min)</span>`;
            }
        }

        // Garder le score entre 0 et 100
        score = Math.max(0, Math.min(100, score));

        // Définition visuelle
        let couleur = '#28a745'; 
        let statut = 'Calme';
        if (score >= 75) { couleur = '#dc3545'; statut = 'Saturé'; }
        else if (score >= 45) { couleur = '#ffc107'; statut = 'Animé'; }

        resultats.push({
            id: plage.id,
            nom: plage.nom,
            lat: plage.lat,
            lon: plage.lon,
            score: Math.round(score),
            couleur: couleur,
            statut: statut,
            meteo: (donneesMeteo && donneesMeteo.temp) ? `${Math.round(donneesMeteo.temp)}°C` : "28°C",
            bateaux: (plage.id === 'ste-anne') ? (donneesWebcam.bateauxSainteAnne || 0) : null,
            trafic: infoTraficHtml
        });
    });

    return resultats;
}

module.exports = { calculerAffluence };