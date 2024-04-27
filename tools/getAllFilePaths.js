const fs = require('fs');
const path = require('path');

function getAllFilePaths(directoryPath, batchSize, callback) {
  fs.readdir(directoryPath, (err, files) => {

    const filePaths = [];
    let currentIndex = 0;

    function processBatch() {
      const batch = files.slice(currentIndex, currentIndex + batchSize);
      currentIndex += batchSize;

      // Fonction récursive pour traiter chaque fichier dans le batch
      function processFile(index) {
        if (index >= batch.length) {
          // Tous les fichiers du batch ont été traités, passer au batch suivant ou terminer
          if (currentIndex < files.length) {
            processBatch();
          } else {
            callback(filePaths); // Appeler le callback avec les chemins des fichiers
          }
          return;
        }

        const file = batch[index];
        const filePath = path.join(directoryPath, file);
        fs.stat(filePath, (err, stats) => {
          if (stats.isFile()) {
            filePaths.push(filePath); // Ajouter le chemin du fichier à la liste
          }
          processFile(index + 1); // Passer au fichier suivant dans le batch
        });
      }

      processFile(0); // Commencer le traitement du batch
    }

    processBatch(); // Commencer le traitement des fichiers
  });
}

module.exports = getAllFilePaths;
