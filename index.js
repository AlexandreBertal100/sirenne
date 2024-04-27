const CsvTools = require("./tools/csvTools.js");
const pm2 = require("pm2");
const getAllFilePaths = require("./tools/getAllFilePaths.js");
const fs = require("fs");
const envSetup = require("./env.json");

const filePath =envSetup.PATH_OF_FILE;
const pathToResult = envSetup.PATH_OF_REPOSITORY_RESULT;
const numberOfLineByCsvFile = envSetup.NUMBER_OF_LINE_BY_FILE;
const numberOfPathToProcess = envSetup.NUMBER_OF_PACKAGE_OF_FILE_TO_PROCESS;
const numberOfLineRead = envSetup.NUMBER_OF_LINE_TO_PROCESS;
const numberOfWorker = envSetup.NUMBER_OF_WORKER_TO_USE;

const csvTools = new CsvTools();

function createJsonObject(keys, values) {
  const jsonObject = {};
  for (let i = 0; i < keys.length; i++) {
    if (i < values.length && values[i] != undefined && values[i] != "") {
      jsonObject[keys[i]] = values[i];
    }
  }
  return jsonObject;
}

function convertCSVToJson(header, data) {
  const result = [];
  data.forEach((element) => {
    result.push(createJsonObject(header, element));
  });
  return result;
}

function readCsvInChunks(filePath, chunkSize, callback) {
  const readStream = fs.createReadStream(filePath, { encoding: "utf-8" });
  let buffer = "";
  let isFirstChunk = true;
  let header = "";
  let linesBuffer = [];
  readStream.on("data", (chunk) => {
    if (isFirstChunk) {
      const lines = chunk.split("\n");
      if (lines[0] !== undefined) {
        header = lines[0].split(",");
        chunk = lines.slice(1).join("\n");
        isFirstChunk = false;
      }
    }
    linesBuffer = linesBuffer.concat(chunk.split("\n"));
    while (linesBuffer.length >= chunkSize) {
      const packet = linesBuffer.splice(0, chunkSize);
      callback({ data: packet.map((line) => line.split(",")), header: header });
    }
  });
  readStream.on("error", (err) => {
    console.error("Error reading CSV file:", err);
  });
  readStream.on("end", () => {
    if (buffer.length > 0) {
      callback({ data: buffer, header: header });
    }
    console.log("Chunk reading completed.");
  });
}

function divideTaskToWorker() {
  let counter = 0;
  pm2.list((err, list) => {
    getAllFilePaths(pathToResult, numberOfPathToProcess, (paths) => {
      paths.forEach((path) => {
        readCsvInChunks(path, numberOfLineRead, (value) => {
          if (counter <= list.length - 1) {
            const pm_id = list[counter].pm_id;
            const message = {
              id: pm_id,
              type: "process:msg",
              data: convertCSVToJson(value.header, value.data),
              topic: "worker:message",
            };
            sendMessageToWorker(message);
            counter++;
          } else {
            counter = 0;
          }
        });
      });
    });
  });
}

function sendMessageToWorker(message) {
  pm2.sendDataToProcessId(message, function (err, res) {
    if (err) {
      console.error("Error sending message to worker:", err);
    } else {
      console.log("Message sent to worker:", res.data.id);
    }
  });
}

// =============================


async function generateFile(filePath, pathToResult, numberOfLineByCsvFile) {
  try {
    const numFiles = await csvTools.decomposeCsv(filePath, pathToResult, numberOfLineByCsvFile);
    console.log(`Files split successfully. Total number of files created: ${numFiles}`);
    return numFiles;
  } catch (err) {
    console.error('Error splitting files:', err);
    throw err; // Re-throw the error to handle it at a higher level
  }
}

async function startProcess() {
  return new Promise((resolve, reject) => {
    // Start worker
    pm2.connect(function (err) {
      if (err) {
        console.error(err);
        reject(err);
      }

      pm2.start(
        {
          script: "./worker.js",
          name: `worker`,
          exec_mode: "cluster",
          instances: numberOfWorker,
        },
        function (err, apps) {
          if (err) {
            console.error("Error starting application:", err);
            reject(err);
          }
          console.log("Application started successfully.");
          divideTaskToWorker();
          resolve();
        }
      );
    });
  });
}
async function main() {
  try {
    // Check if directory exists
    const isDirExists = await fs.promises.stat(pathToResult).then(stats => stats.isDirectory()).catch(() => false);
    
    // If directory doesn't exists, create it
    if (!isDirExists) {
      console.log('Destination directory does not exist. Creating directory...');
      await fs.promises.mkdir(pathToResult, { recursive: true });
      console.log('Destination directory created.');
    }

    // Read content of directory
    const files = await fs.promises.readdir(pathToResult);

    if (files.length <= 0) {
      console.log('No File detected, Start generate');
      await generateFile(filePath, pathToResult, numberOfLineByCsvFile);
    } else {
      console.log('File detected');
    }

    // Start the process regardless of file existence
    await startProcess();
  } catch (err) {
    console.error('Error in main function:', err);
    process.exit(1); // Exit with non-zero code to indicate error
  }
}

main();
