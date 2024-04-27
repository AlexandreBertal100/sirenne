const fs = require('fs');
const readline = require('readline');

class CsvTools {
    constructor() {
    }

    async decomposeCsv(inputFilePath, outputFolderPath, chunkSize){
        const inputStream = fs.createReadStream(inputFilePath);
        const lineReader = readline.createInterface({
            input: inputStream,
            crlfDelay: Infinity
        });

        let fileCount = 1; // Initialise le compteur de fichiers à 1
        let lineCount = 0;
        let headerLine = null;
        let outputFileStream = fs.createWriteStream(`${outputFolderPath}/chunk_${fileCount}.csv`);
        
        for await (const line of lineReader) {
            // Si c'est la première ligne, la considérer comme l'en-tête
            if (!headerLine) {
                headerLine = line;
                outputFileStream.write(`${line}\n`); // Écrire l'en-tête dans chaque fichier de sortie
            } else {
                // Écrire chaque ligne dans le fichier de sortie actuel
                outputFileStream.write(`${line}\n`);
                lineCount++;
            }
    
            // Si le nombre de lignes (hors en-tête) dépasse la taille de morceau spécifiée, passer au fichier suivant
            if (lineCount >= chunkSize) {
                outputFileStream.end(); // Fermer le fichier de sortie actuel
                fileCount++; // Augmente le compteur de fichiers
                lineCount = 0;
                outputFileStream = fs.createWriteStream(`${outputFolderPath}/chunk_${fileCount}.csv`);
                outputFileStream.write(`${headerLine}\n`); // Réécrire l'en-tête dans le nouveau fichier de sortie
            }
        }

        outputFileStream.end();
        console.log('Splitting complete.');

        return fileCount;
    }

    async readCSVFile(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
        
            // Créer un flux de lecture du fichier CSV
            const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        
            // Écouter les événements de lecture de données et d'erreur
            stream.on('data', (chunk) => {
              // Diviser les données en lignes
              const lines = chunk.split('\n');
        
              // Parcourir chaque ligne
              lines.forEach((line) => {
                // Ignorer les lignes vides
                if (line.trim() !== '') {
                  // Diviser la ligne en colonnes (séparées par des virgules dans un CSV)
                  const columns = line.split(',');
        
                  // Ajouter les colonnes à la liste des résultats
                  results.push(columns);
                }
              });
            });
        
            // Gérer les erreurs de lecture du fichier
            stream.on('error', (error) => {
              reject(new Error('Error while reading CSV file: ' + error.message));
            });
        
            // Lorsque la lecture du fichier est terminée, résoudre la promesse avec les résultats
            stream.on('end', () => {
              resolve(results);
            });
          });
        }
      

}

module.exports = CsvTools;
