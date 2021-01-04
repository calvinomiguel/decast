const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const ns = require('node-sketch');
const port = process.env.PORT || 3060;
const cors = require('cors');
const sketchtool = require('sketchtool-cli');
const {
    json
} = require("body-parser");
const dir = process.argv[2] || process.cwd() + "/uploads";
const upload = multer({
    dest: "./uploads/"
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

//Store original and current file names in array
function storeFileNames(requestData) {
    return new Promise((resolve, reject) => {
        let fileNames = [];
        requestData.forEach(file => {
            fileNames.push({
                oName: file.originalname,
                tmpName: file.filename
            });
        });
        if (fileNames.length > 0) {
            resolve(fileNames);
        } else {
            reject('Failed storing original and current file names in an array.');
        }
    });
}

//Function for changing the names of the uploaded files to original name
function changeFileNames(fileNames) {
    return new Promise((resolve, reject) => {
        fileNames.forEach(nameGroup => {
            let tmpPath = `${dir}/${nameGroup.tmpName}`;
            let oPath = `${dir}/${nameGroup.oName}`;

            fs.renameSync(tmpPath, oPath, () => {
                console.log(`${nameGroup.tmpName} was renamed to ${nameGroup.oName}!`);
            });
        });
        if (fileNames) {
            resolve(fileNames);
        } else {
            reject("Failed in changing tmp file names to original file names.");
        }
    });
}

//Get all files in upload directory
function getFiles() {
    return new Promise((resolve, reject) => {
        let fileNames = [];
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
            } else {
                files.forEach(file => {
                    if (file.includes('.sketch')) {
                        fileNames.push(file);
                    }
                });
                resolve(fileNames);
            }
        });
    });
}

//Get all symbols
async function getSymbols(files) {
    let symbols = [];
    for (let file of files) {
        const sketch = await ns.read(dir + '/' + file);
        symbols = symbols.concat(...sketch.symbols);
    };
    return symbols;
}

async function getForeignSymbols(files) {
    let foreignSymbols = [];
    for (let file of files) {
        const sketch = await ns.read(dir + '/' + file);
        foreignSymbols = foreignSymbols.concat(...sketch.document.foreignSymbols);
    };
    return foreignSymbols;
}

function getOriginalSymbols(arr_1, arr_2) {
    return new Promise((resolve, reject) => {
        let arr = [];
        arr = arr.concat(...arr_1);
        arr = arr.concat(...arr_2);
        if (arr.length == arr_1.length + arr_2.length) {
            resolve(arr);
        } else {
            console.error("Couldn't unite all symbols.");
        }
    });
}

function getAllSymbols(foreignSymbols, symbols) {
    return new Promise((resolve, reject) => {
        let foreignArray = [];
        let localArray = [];
        foreignSymbols.forEach(symbol => {
            foreignArray.push({
                _class: symbol._class,
                library: {
                    id: symbol.libraryID,
                    name: symbol.sourceLibraryName
                },
                originalMaster: {
                    id: symbol.originalMaster.symbolID,
                    _class: symbol.originalMaster._class,
                    name: symbol.originalMaster.name
                },
                symbolMaster: {
                    id: symbol.symbolMaster.symbolID,
                    _class: symbol.symbolMaster._class,
                    name: symbol.symbolMaster.name,
                },
                used: false,
                usage: 0
            });
        });
        symbols.forEach(symbol => {
            localArray.push({
                _class: symbol._class,
                library: {
                    id: false,
                    name: false,
                },
                originalMaster: {
                    id: symbol.symbolID,
                    _class: symbol._class,
                    name: symbol.name
                },
                symbolMaster: {
                    id: false,
                    _class: false,
                    name: false
                },
                used: false,
                usage: 0
            });
        });

        let allSymbols = foreignArray.concat(...localArray);

        if (allSymbols.length > 0) {
            resolve(allSymbols);
        } else {
            reject("Couldn't unite all symbols.");
        }
    });
}

function getSymbolCount(symbols, foreignSymbols) {
    return new Promise((resolve, reject) => {
        let count_1 = [...new Set([...symbols.map(symbol => symbol.symbolID)])];
        let count_2 = [...new Set([...foreignSymbols.map(symbol => symbol.originalMaster.symbolID)])];
        let count = count_1.concat(...count_2);
        count = [...new Set([...count.map(id => id)])].length;
        if (count) {
            resolve(count);
        } else {
            reject("No symbols");
        }
    });
}

async function getPages(files) {
    let pages = [];
    for (let file of files) {
        const sketch = await ns.read(dir + '/' + file);
        pages = pages.concat(...sketch.pages);
    };
    return pages;
}

function getLayers(pages) {
    return new Promise((resolve, reject) => {
        let layers = [];
        pages.forEach(page => {
            layers = layers.concat(...page.layers);
        });

        if (layers.length > 0) {
            resolve(layers);
        } else {
            reject("Couldn't create layers.");
        }
    });
}

function getArtboards(layers) {
    return new Promise((resolve, reject) => {
        let artboards = [];
        layers.forEach(layer => {
            if (layer._class == "artboard")
                artboards.push(layer);
        });

        if (artboards.length > 0) {
            resolve(artboards);
        } else {
            reject("Couldn't create artboards.");
        }
    });
}

function getArtboardLayers(artboards) {
    return new Promise((resolve, reject) => {
        let artboardLayers = [];
        artboards.forEach(artboard => {
            artboardLayers = artboardLayers.concat(...artboard.layers);
        });
        if (artboardLayers.length > 0) {
            resolve(artboardLayers);
        } else {
            reject('Couldn\'t get artboards layers.');
        }
    });
}

function getSymbolInstances(artboardLayers) {
    return new Promise((resolve, reject) => {
        let symbolInstances = [];
        artboardLayers.forEach(layer => {
            if (layer._class == "symbolInstance") {
                symbolInstances.push(layer);
            }
        });
        if (symbolInstances.length > 0) {
            resolve(symbolInstances);
        } else {
            reject("Wasn't able to get symbol instances.");
        }
    });
}

function getSymbolsUsage(allSymbols, symbolInstances) {
    return new Promise((resolve, reject) => {
        allSymbols.forEach(symbol => {
            symbolInstances.forEach(instance => {
                if (symbol.originalMaster.id == instance.symbolID || symbol.symbolMaster.id == instance.symbolID) {
                    symbol.usage = symbol.usage + 1;
                    if (symbol.used == false) {
                        symbol.used = true;
                    }
                }
            });
        });
        if (allSymbols.length > 0) {
            resolve(allSymbols);
        } else {
            reject("Couldn't get the symbols usage details.");
        }
    });
}

function getUniqueSymbols(allSymbols) {
    return new Promise((resolve, reject) => {
        let unique = allSymbols.reduce((acc, v, index, arr) => {
            if (acc[v.originalMaster.id]) {
                return acc
            }
            acc[v.originalMaster.id] = v
            return acc
        }, {});

        //PUT ALL OBJECTS IN AN ARRAY
        let uniqueArray = [];
        for (let symbol in unique) {
            uniqueArray.push(unique[symbol]);
        }
        if (uniqueArray) {
            resolve(uniqueArray);
        } else {
            reject('False');
        }

    });
}

function getUniqueSymbolsUsage(uniqueSymbols, allSymbols) {
    return new Promise((resolve, reject) => {
        let uniques = [...uniqueSymbols];


        //Fetch usage count from All Symbols array
        uniques.forEach(unique => {
            let symbolUsage = 0;
            let uniqueID = unique.originalMaster.id;
            allSymbols.forEach(symbol => {
                let symbolID = symbol.originalMaster.id;

                if (symbolID == uniqueID) {
                    symbolUsage = symbolUsage + symbol.usage;
                }
            });
            unique.usage = symbolUsage;
            symbolUsage != 0 ? unique.used = true : false;
        });

        if (uniques) {
            resolve(uniques);
        } else {
            reject('Couldn\'t get');
        }
    });

}

function getDeadComponentsCount(uniqueSymbols) {
    return new Promise((resolve, reject) => {
        let count = 0;
        uniqueSymbols.forEach(symbol => {
            if (symbol.used == false) {
                count += 1;
            }
        });
        if (uniqueSymbols.length > 0) {
            resolve(count);
        } else {
            reject("Something went wrong while retrieving deadsymbols count");
        }
    });
}

function sendInfos(count, uniqueSymbols, deadSymbolsCount) {
    return new Promise((resolve, reject) => {

        let obj = {
            symbols: uniqueSymbols,
            count: count,
            deadCount: deadSymbolsCount
        };

        //Check if object has properties
        if (Object.keys(obj).length > 0) {
            resolve(obj);
        } else {
            reject("Send infos error.");
        }
    });
}

//Handle POST Request from Client Form to upload files
app.post("/uploads", upload.array("files"), async (req, res) => {
    let reqData = req.files;
    let fileNames = await storeFileNames(reqData);
    fileNames = await changeFileNames(fileNames);
    let files = await getFiles();
    let foreignSymbols = await getForeignSymbols(files);
    let symbols = await getSymbols(files);
    let allSymbols = await getAllSymbols(foreignSymbols, symbols);
    let count = await getSymbolCount(symbols, foreignSymbols);
    let pages = await getPages(files);
    let layers = await getLayers(pages);
    let artboards = await getArtboards(layers);
    let artboardLayers = await getArtboardLayers(artboards);
    let symbolInstances = await getSymbolInstances(artboardLayers);
    allSymbols = await getSymbolsUsage(allSymbols, symbolInstances);
    let uniqueSymbols = await getUniqueSymbols(allSymbols);
    uniqueSymbols = await getUniqueSymbolsUsage(uniqueSymbols, allSymbols);
    let deadCount = await getDeadComponentsCount(uniqueSymbols);
    let infos = await sendInfos(count, uniqueSymbols, deadCount);
    console.log(sketchtool.check());
    res.status(200).send(infos);
});
let pages = sketchtool.list('layers', '/Users/calvino/Documents/Dev/decast/api/uploads/S.sketch').pages;
let layers = [];
pages.forEach(page => {
    console.log(page);
    //layers = layers.concat(...page.layers);
})

console.log(layers);
sketchtool.run('export layers /Users/calvino/Documents/Dev/decast/api/uploads/S.sketch --formats=jpg --scales=2 --item=41045A3B-9ECC-418E-B8CC-3B50814A0B31 --output=/Users/calvino/Documents/Dev/decast/api/exports');

//Handle GET Request from Client Form
router.get("/dashboard", async (req, res) => {

    res.status(200).send('Hi');
});

router.post("/submit", (req, res) => {
    res.status(200).send('hi');
});
//Handle GET Request from Client Form
router.get("/components", (req, res) => {
    res.status(200).send('hi');
});

//Add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});