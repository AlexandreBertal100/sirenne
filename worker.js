const mongoose = require('mongoose');
const envSetup = require("./env.json");

const EstablishmentSchema = new mongoose.Schema({
    siren: { type: String, required: false },
    nic: { type: String, required: false },
    siret: { type: String, required: false },
    dateCreationEtablissement: { type: Date, required: false },
    dateDernierTraitementEtablissement: { type: Date, required: false },
    typeVoieEtablissement: { type: String, required: false },
    libelleVoieEtablissement: { type: String, required: false },
    codePostalEtablissement: { type: String, required: false },
    libelleCommuneEtablissement: { type: String, required: false },
    codeCommuneEtablissement: { type: String, required: false },
    dateDebut: { type: Date, required: false },
    etatAdministratifEtablissement: { type: String, required: false }
});
const Establishment = mongoose.model('Establishment', EstablishmentSchema);

save().catch(err => console.log(err));

function formatEstablishment(data){
    // Initialisez un objet vide
    let extractedData = {};

    // Vérifiez chaque champ et ajoutez-le à l'objet s'il existe dans les données
    if (data.siren) extractedData.siren = data.siren;
    if (data.nic) extractedData.nic = data.nic;
    if (data.siret) extractedData.siret = data.siret;
    if (data.dateCreationEtablissement) extractedData.dateCreationEtablissement = data.dateCreationEtablissement;
    if (data.dateDernierTraitementEtablissement) extractedData.dateDernierTraitementEtablissement = data.dateDernierTraitementEtablissement;
    if (data.typeVoieEtablissement) extractedData.typeVoieEtablissement = data.typeVoieEtablissement;
    if (data.libelleVoieEtablissement) extractedData.libelleVoieEtablissement = data.libelleVoieEtablissement;
    if (data.codePostalEtablissement) extractedData.codePostalEtablissement = data.codePostalEtablissement;
    if (data.libelleCommuneEtablissement) extractedData.libelleCommuneEtablissement = data.libelleCommuneEtablissement;
    if (data.codeCommuneEtablissement) extractedData.codeCommuneEtablissement = data.codeCommuneEtablissement;
    if (data.dateDebut) extractedData.dateDebut = data.dateDebut;
    if (data.etatAdministratifEtablissement) extractedData.etatAdministratifEtablissement = data.etatAdministratifEtablissement;

    // Retournez l'objet extrait
    return extractedData;
}

async function save(data) {
    try {
        await mongoose.connect(`${envSetup.MONGO_URI}/${envSetup.MONGO_DATABASE}`);

        for (const establishment of data) {
            const dataFormat = formatEstablishment(establishment);
            if (Object.keys(dataFormat).length > 0) {
                const objectData = new Establishment(dataFormat, { versionKey: false });
                await objectData.save();
                console.log(dataFormat);
            }
        }

        console.log("Save completed successfully.");
    } catch (error) {
        console.error("Error occurred while saving:", error);
    } finally {
        // Déconnectez-vous de la base de données une fois que vous avez terminé.
        await mongoose.disconnect();
    }
}

process.on('message', async function(packet) {
    await save(packet.data)
});
