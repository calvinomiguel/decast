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
const {
    file
} = require("jszip");
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

//Get all file names in upload directory
function getFileNames() {
    return new Promise((resolve, reject) => {
        let fileNames = [];
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
            } else {
                files.forEach(file => {
                    if (file.includes('.sketch')) {
                        fileNames.push({
                            name: file,
                            path: dir + '/' + file
                        });
                    }
                });
                if (fileNames.length > 0) {
                    resolve(fileNames);
                } else {
                    reject("No files found.");
                }

            }
        });
    });
}

async function getPages(files) {
    let pages = [];
    let filePages;
    for (let file of files) {
        filePages = await sketchtool.list('layers', file.path).pages;
        pages.push(...filePages);
        file.pages = pages;
    }
    for (let page of pages) {
        delete page.layers;
        delete page.bounds;
    }
    return files;
};

//Get all symbols
async function getSymbols(files) {
    let symbols = [];

    //Get all foreign and local symbols and push them in file object
    for (let file of files) {
        let sketch = await ns.read(file.path);
        let masterSymbols = sketch.symbols;
        let foreignSymbols = sketch.foreignSymbols;
        symbols.push(...masterSymbols);
        symbols.push(...foreignSymbols);
        file.symbols = symbols;
    }
    return files;
}

function restructureSymbolsObj(files) {
    return new Promise((resolve, reject) => {
        //Restructure symbol objects
        for (let file of files) {
            let symbolArr = [];
            file.symbols.forEach(symbol => {
                if (symbol._class == "MSImmutableForeignSymbol") {
                    let _libraryID = symbol.libraryID;
                    let _sourceLibraryName = symbol.sourceLibraryName;
                    let _name = symbol.originalMaster.name;
                    let _symbolClass = symbol.originalMaster._class;
                    let _originalMasterID = symbol.originalMaster.symbolID;
                    let _symbolMasterID = symbol.originalMaster.symbolID;
                    symbolArr.push({
                        libraryID: _libraryID,
                        sourceLibraryName: _sourceLibraryName,
                        name: _name,
                        _class: _symbolClass,
                        originalMasterId: _originalMasterID,
                        symbolMasterID: _symbolMasterID
                    });
                } else {
                    let _libraryID = false;
                    let _sourceLibraryName = false;
                    let _name = symbol.name;
                    let _symbolClass = symbol._class;
                    let _originalMasterID = symbol.symbolID;
                    let _symbolMasterID = false;
                    symbolArr.push({
                        libraryID: _libraryID,
                        sourceLibraryName: _sourceLibraryName,
                        name: _name,
                        _class: _symbolClass,
                        originalMasterId: _originalMasterID,
                        symbolMasterID: _symbolMasterID
                    })
                }
            });
            file.symbols = symbolArr;
        }
        if (files) {
            resolve(files);
        } else {
            reject("Something went wrong.");
        }
    });
}

function uniteIdenticalSymbols(files) {
    return new Promise((resolve, reject) => {
        files.forEach(file => {

            //Set new array
            let symbols = [...new Set(file.symbols)];
            let array = [];
            const data = symbols.reduce((acc, v) => {
                const exists = acc[v.originalMasterId];
                if (exists) {
                    // if current obj is an instance of master
                    if (v.symbolMasterID) {
                        // push to id to master's symbols array
                        acc[v.originalMasterId].symbolMasterIDs.push(v.symbolMasterID);
                    }
                    return acc;
                }

                // if doesnt exist, make a new entry in accumulator
                const entry = {
                    ...v,
                    symbolMasterIDs: []
                };
                const symbolMasterID = v.symbolMasterID;

                // since symbolMasterID is false, we can just remove it from object
                // it gets replaced by symbols array anyways
                delete entry.symbolMasterID;

                // if we're iterating over an instance of a symbol and not a master component
                // (because the array isnt sorted to have symbolMasterID:false first)
                if (symbolMasterID) {
                    // then push into symbols
                    entry.symbolMasterIDs.push(symbolMasterID);
                }

                // push entry into accumulator, unique by originalMasterId
                acc[v.originalMasterId] = entry;
                return acc;
            }, {});
            //Create array of symbol objects
            for (let obj in data) {
                array.push(data[obj]);
            }
            file.symbols = array;
        });
        if (files) {
            resolve(files);
        }
    });
}


/*
async function getForeignSymbols(files) {
    let foreignSymbols = [];
    for (let file of files) {
        const sketch = await ns.read(dir + '/' + file);
        foreignSymbols = foreignSymbols.concat(...sketch.document.foreignSymbols);
    };
    return foreignSymbols;
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

function exportComponent(componentID, sketchFile) {
    sketchtool.run('export layers' + process.cwd() + '/uploads/' + sketchFile + ' --formats=png --scales=2 --item=' + componentID + ' --output=/Users/calvino/Documents/Dev/decast/api/exports');
}

function exportComponentArtboards(sketchFile) {
    sketchtool.run('export layers' + process.cwd() + '/uploads/' + sketchFile + ' --formats=jpg --scales=2 --output=/Users/calvino/Documents/Dev/decast/api/exports');
}
*/
//Handle POST Request from Client Form to upload files
app.post("/uploads", upload.array("files"), async (req, res) => {
    let reqData = req.files;
    let fileNames = await storeFileNames(reqData);
    fileNames = await changeFileNames(fileNames);
    let files = await getFileNames();
    // let foreignSymbols = await getForeignSymbols(files);
    let pages = await getPages(files);
    pages = await getSymbols(pages);
    pages = await restructureSymbolsObj(pages)
    await uniteIdenticalSymbols(pages)
    //let symbols = await getSymbols(files, pages);
    /*let allSymbols = await getAllSymbols(foreignSymbols, symbols);
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
    let infos = await sendInfos(count, uniqueSymbols, deadCount);*/
    res.status(200).send(pages);
});


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