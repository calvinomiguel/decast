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

//Get pages globally
async function getGlobalPages(files) {
    let globalPages = [];
    let globalPagesRestructured = [];

    for (let file of files) {
        const sketch = await ns.read(file.path);
        globalPages.push(...sketch.pages);
    }

    for (let page of globalPages) {
        globalPagesRestructured.push({
            name: page.name,
            _class: page._class,
            do_objectID: page.do_objectID,
            layers: page.layers
        });
    }
    let objSchema = {
        files: files,
        pages: [...globalPagesRestructured]
    };
    return objSchema;
};

//Get pages locally
async function getPages(objSchema) {
    let files = objSchema.files;
    for (let file of files) {
        const sketch = await ns.read(file.path);
        let pages = sketch.pages;
        let pageList = [];
        for (let page of pages) {
            pageList.push({
                name: page.name,
                _class: page._class,
                do_objectID: page.do_objectID,
            })
        }
        file.pages = [...pageList];
    }
    return objSchema;
}

//Get all symbols locally
async function getSymbols(objSchema) {
    let files = objSchema.files;
    //Get all foreign and local symbols and push them in file object
    for (let file of files) {
        let symbols = [];
        let sketch = await ns.read(file.path);
        let masterSymbols = sketch.symbols;
        let foreignSymbols = sketch.foreignSymbols;
        symbols.push(...masterSymbols);
        symbols.push(...foreignSymbols);
        file.symbols = symbols;
    }
    return objSchema;
}

//Restructure symbols objects
function restructureSymbolsObj(objSchema) {
    return new Promise((resolve, reject) => {
        let files = objSchema.files;
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
        if (objSchema) {
            resolve(objSchema);
        } else {
            reject("Something went wrong.");
        }
    });
}

//Restructure symbols objects and set them globally
function uniteIdenticalSymbols(objSchema) {

    return new Promise((resolve, reject) => {
        let files = objSchema.files;
        let array = [];
        let symbolList = []
        let data;

        //Set all symbols in one array
        for (let file of files) {
            symbolList.push(...file.symbols);
        }

        //Reduce symbols to unique IDs
        for (let file of files) {
            data = symbolList.reduce((acc, v) => {
                const exists = acc[v.originalMasterId];
                if (exists) {
                    // if current obj is an instance of master
                    if (v.symbolMasterID) {
                        // push to id to master's symbols array
                        acc[v.originalMasterId].symbolIDs.push(v.symbolMasterID);
                    }
                    return acc;
                }

                // if doesnt exist, make a new entry in accumulator
                const entry = {
                    ...v,
                    symbolIDs: []
                }
                const symbolMasterID = v.symbolMasterID;

                // since symbolMasterID is false, we can just remove it from object
                // it gets replaced by symbols array anyways
                delete entry.symbolMasterID;

                // if we're iterating over an instance of a symbol and not a master component
                // (because the array isnt sorted to have symbolMasterID:false first)
                if (symbolMasterID) {
                    // then push into symbols
                    entry.symbolIDs.push(symbolMasterID);
                }

                // push entry into accumulator, unique by originalMasterId
                acc[v.originalMasterId] = entry;
                return acc;
            }, {});
        }

        //Remove symbol ID as property
        for (const [key, value] of Object.entries(data)) {
            array.push(value);
        }

        objSchema.symbols = [...array];

        if (objSchema.hasOwnProperty('files', 'symbols')) {
            resolve(objSchema);
        } else {
            reject('Could not get list of unique symbols.');
        }
    });
}

async function getGlobalSymbolInstances(objSchema) {
    const files = objSchema.files;
    let pages = [];
    let artboards = [];
    let symbolInstances = [];
    let artboardsFilter;
    let instancesFilter;

    //Get pages of all files
    for (let file of files) {
        const sketch = await ns.read(file.path);
        pages.push(...sketch.pages);
    }

    //Get layers of all pages
    for (let page of pages) {
        artboards.push(...page.layers)
    }

    //Filter all artboards from the layers
    artboardsFilter = artboards.filter(layer => {
        return layer._class == "artboard";
    });

    //Get all layers from the artboards
    for (let artboard of artboardsFilter) {
        symbolInstances.push(...artboard.layers)
    }

    //Filter all symbolInstances from the layers
    instancesFilter = symbolInstances.filter(layer => layer._class == "symbolInstance");
    objSchema.symbolInstances = instancesFilter;
    return objSchema;
}

function getGlobalSymbolsCount(objSchema) {
    return new Promise((resolve, reject) => {
        const files = objSchema.files;
        let symbols = objSchema.symbols;
        let symbolInstances = objSchema.symbolInstances;

        for (let symbol of symbols) {
            let count = 0;
            let symbolIDs = symbol.symbolIDs.length > 0 ? symbol.symbolIDs : false;

            for (let instance of symbolInstances) {
                instance.symbolID == symbol.originalMasterId ? count += 1 : count += 0;
                if (symbolIDs != false) {
                    for (let id of symbolIDs) {
                        id == instance.symbolID ? count += 1 : count += 0;
                    }
                }
            }
            symbol.count = count;
        }

        if (files) {
            resolve(objSchema);
        } else {
            reject("Could not get symbol counts");
        }
    });
}

/*
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
    files = await getGlobalPages(files);
    files = await getSymbols(files);
    files = await restructureSymbolsObj(files);
    files = await uniteIdenticalSymbols(files);
    files = await getGlobalSymbolInstances(files);
    files = await getGlobalSymbolsCount(files);
    res.status(200).send(Buffer.from(JSON.stringify(files),'utf8'));
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