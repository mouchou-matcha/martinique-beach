// Initialisation de la carte avec un zoom plus large pour voir toute l'île
const map = L.map('map').setView([14.6415, -61.0242], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

async function chargerAffluence() {
    try {
        console.log("Appel au serveur pour récupérer les données...");
        const response = await fetch('/api/affluence');
        
        if (!response.ok) throw new Error("Le serveur ne répond pas");

        const plages = await response.json();

        // Nettoyage des anciens marqueurs si nécessaire
        // (Utile si tu appelles cette fonction plusieurs fois)

        plages.forEach(plage => {
            // Construction du design du Popup
            let popupHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-width: 180px;">
                    <h3 style="margin:0 0 5px 0; font-size:16px; border-bottom:2px solid ${plage.couleur}; padding-bottom:3px;">${plage.nom}</h3>
                    <div style="margin: 10px 0;">
                        <span style="background:${plage.couleur}; color:white; padding:2px 8px; border-radius:10px; font-weight:bold; font-size:12px;">
                            ${plage.statut}
                        </span>
                        <span style="float:right; font-weight:bold; color:#666;">${plage.score}/100</span>
                    </div>
                    <div style="font-size:13px; color:#444; line-height:1.6;">
                        <div>🌡️ <b>Météo :</b> ${plage.meteo}</div>
                        <div>🚗 <b>Trafic :</b> ${plage.trafic}</div>
            `;

            // Si c'est Sainte-Anne, on affiche les bateaux détectés par l'IA
            if (plage.id === 'ste-anne') {
                popupHtml += `<div>⛵ <b>Bateaux (IA) :</b> ${plage.bateaux} détectés</div>`;
            }

            popupHtml += `
                    </div>
                </div>
            `;

            // Création du marqueur cercle
            L.circleMarker([plage.lat, plage.lon], {
                radius: 12,
                fillColor: plage.couleur,
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            })
            .addTo(map)
            .bindPopup(popupHtml);
        });

        console.log("Carte mise à jour avec succès.");

    } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        alert("Impossible de charger les données d'affluence. Vérifiez que le serveur est lancé.");
    }
}

// Lancement de la fonction
chargerAffluence();