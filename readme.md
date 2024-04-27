# Readme du TP Sirenne

## Introduction

Cette solution est un script lisant un fichier CSV du type **Sirene : Fichier StockEtablissement** et le décompose en de multiple fichier avant de lire chaque fichier et d'insert leurs données dans une base de donné MongoDb. 

## Configurations

Exécuter la commande suivante dans un terminal
```
npm i
```

Remplissez le ficher env.json :
```
{
    "PATH_OF_FILE" : "/le/chemain/du/fichier/"Sirene"",
    "PATH_OF_REPOSITORY_RESULT" : "./data/result", 
    "NUMBER_OF_LINE_BY_FILE" : 50000,
    "NUMBER_OF_PACKAGE_OF_FILE_TO_PROCESS" : 100,
    "NUMBER_OF_LINE_TO_PROCESS" : 1000,
    "NUMBER_OF_WORKER_TO_USE" : "11",
    "MONGO_URI":"mongodb://127.0.0.1:27017",
    "MONGO_DATABASE":"test"
}
```

- PATH_OF_FILE : Chemin du fichier Sirene.
- PATH_OF_REPOSITORY_RESULT : Chemin du répertoire où seront stockés les fichiers générer.
- NUMBER_OF_LINE_BY_FILE : Nombre de lignes par fichier générer.
- NUMBER_OF_PACKAGE_OF_FILE_TO_PROCESS : Nombre de paquets de fichiers à traiter.
- NUMBER_OF_LINE_TO_PROCESS : Nombre de lignes à traiter par packet à traiter.
- NUMBER_OF_WORKER_TO_USE : Nombre de workers à utiliser.
- MONGO_URI : Votre URI mongo.
- MONGO_DATABASE : Base de donnée à utiliser.

## Description du script
- Vérification des chemins et Décomposition du CSV:
- Exécution du fichier principal index.js et de la fonction main.
- Vérification de l'existence du dossier de décomposition des fichiers. S'il n'existe pas, le dossier est créé.
- Vérification de l'existence de fichiers dans le dossier de décomposition. Si aucun fichier n'est présent, le script décompose le fichier CSV spécifié dans le chemin PATH_OF_FILE. Sinon, le processus démarre les workers.

## Démarrage des Workers:
- Connexion à pm2 et démarrage des workers.
- Une fois que tous les workers sont lancés avec succès, la division des tâches est initiée.
## Lecture des fichiers et Division des tâches:
- Récupération de la liste des workers en cours.
- Parcours des fichiers dans le dossier de décomposition et création d'un tableau contenant les chemins de chaque fichier. Ensuite, exécution de la fonction callback readCsvInChunks.
- La fonction readCsvInChunks extrait l'en-tête du fichier et les X premières lignes (définies par NUMBER_OF_LINE_TO_PROCESS) puis exécute la fonction de callback avant de passer aux lignes suivantes jusqu'à la fin du fichier.
- La fonction de callback de readCsvInChunks distribue ensuite les données à chaque worker et les convertit en JSON.
## Indexation et Worker:
- Un schéma Mongoose est créé pour la base de données.
- À chaque message reçu, le worker tente de se connecter à la base de données MongoDB.
- Il parcourt ensuite les données contenues dans le message, les formate et les envoie à la base de données.

## Lancement

Exécutez la commande suivante dans un terminal pour démarrer le script :

```
npm start
```

Pour surveiller le processus en cours, utilisez la commande suivante :

```
pm2 monit
```