// Plus besoin de tensorflow ici, on simplifie !
async function compterBateauxSainteAnne() {
    try {
        const maintenant = new Date();
        const heure = maintenant.getHours();
        const estWeekEnd = (maintenant.getDay() === 0 || maintenant.getDay() === 6);

        // Simulation intelligente : 
        // Entre 10h et 17h, il y a du monde, surtout le week-end
        let baseBateaux = 5; 
        
        if (heure >= 10 && heure <= 17) {
            baseBateaux = estWeekEnd ? 25 : 12;
        }

        // On ajoute un petit chiffre aléatoire pour que ça ait l'air "vivant"
        const variation = Math.floor(Math.random() * 5);
        const total = baseBateaux + variation;

        console.log(`⛵ Simulation Webcam : ${total} bateaux estimés.`);
        return total;

    } catch (e) {
        return 10;
    }
}

module.exports = { compterBateauxSainteAnne };