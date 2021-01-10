const express = require('express');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const fsp = fs.promises;
const ns = require('node-sketch');
const port = process.env.PORT || 3060;
const cors = require('cors');
const sketchtool = require('sketchtool-cli');
const {
    json
} = require('body-parser');
const {
    file
} = require('jszip');
const dir = process.argv[2] || process.cwd() + '/uploads';
const outputDir = process.cwd() + '/exports';
const dataDir = process.cwd() + '/data';
const upload = multer({
    dest: './uploads/'
});
let artboardsList = [];
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
            let oPath = `${dir}/${nameGroup.oName.replace(/[- )(]/g,'')}`;
            fs.renameSync(tmpPath, oPath, () => {
                console.log(`${nameGroup.tmpName} was renamed to ${nameGroup.oName}!`);
            });
        });
        if (fileNames) {
            resolve(fileNames);
        } else {
            reject('Failed in changing tmp file names to original file names.');
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
                    reject('No files found.');
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
            //layers: page.layers
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
            let symbols = file.symbols;
            for (let symbol of symbols) {
                if (symbol._class == 'MSImmutableForeignSymbol') {
                    //let _libraryID = symbol.libraryID;
                    //let _sourceLibraryName = symbol.sourceLibraryName;
                    let _name = symbol.originalMaster.name;
                    let _symbolClass = symbol.originalMaster._class;
                    let _originalMasterID = symbol.originalMaster.symbolID;
                    let _symbolMasterID = symbol.symbolMaster.symbolID;
                    let _originFile = symbol.sourceLibraryName + '.sketch';
                    let _objectID = symbol.symbolMaster.do_objectID;
                    symbolArr.push({
                        //libraryID: _libraryID,
                        //sourceLibraryName: _sourceLibraryName,
                        name: _name,
                        _class: _symbolClass,
                        originalMasterId: _originalMasterID,
                        symbolMasterID: _symbolMasterID,
                        originFile: _originFile,
                        do_objectID: _objectID
                    });
                }
                if (symbol._class == 'symbolMaster') {
                    //let _libraryID = false;
                    //let _sourceLibraryName = false;
                    let _name = symbol.name;
                    let _symbolClass = symbol._class;
                    let _originalMasterID = symbol.symbolID;
                    let _symbolMasterID = false;
                    let _originFile = file.name;
                    let _objectID = symbol.do_objectID;
                    symbolArr.push({
                        //libraryID: _libraryID,
                        //sourceLibraryName: _sourceLibraryName,
                        name: _name,
                        _class: _symbolClass,
                        originalMasterId: _originalMasterID,
                        do_objectID: _objectID,
                        symbolMasterID: _symbolMasterID,
                        originFile: _originFile
                    })
                }
            };
            file.symbols = symbolArr;
        }
        if (objSchema) {
            resolve(objSchema);
        } else {
            reject('Something went wrong.');
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
    let outOfBoard;

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
        return layer._class == 'artboard';
    });

    //Save artboards in global variable
    artboardsList.push(...artboardsFilter);

    //Filter all symbol instances outside of artboards
    outOfBoard = artboards.filter(layer => {
        return layer._class == 'symbolInstance';
    });

    //Get all layers from the artboards
    for (let artboard of artboardsFilter) {
        symbolInstances.push(...artboard.layers)
    }

    //Filter all symbolInstances from the layers
    instancesFilter = symbolInstances.filter(layer => layer._class == 'symbolInstance');

    //Push symbols out of artboards into instancesFilter array
    for (let instance of outOfBoard) {
        instancesFilter.push(instance);
    }
    //Create a file with all artboards
    await fsp.writeFile(dataDir + '/artboards.json', JSON.stringify(artboardsFilter), () => {
        console.log('File created');
    });
    objSchema.symbolInstances = instancesFilter;
    return objSchema;
}

function getGlobalSymbolsCount(objSchema) {
    return new Promise((resolve, reject) => {
        const files = objSchema.files;
        let symbols = objSchema.symbols;
        let symbolInstances = objSchema.symbolInstances;

        symbols.forEach(symbol => {
            let count = 0;
            let symbolIds = symbol.symbolIDs;
            let originalMasterId = symbol.originalMasterId;
            symbolInstances.forEach(instance => {
                if (instance.symbolID == originalMasterId) {
                    count = count + 1;
                }
            });
            if (symbolIds != false) {
                symbolIds.forEach(symbolID => {
                    symbolInstances.forEach(instance => {
                        if (symbolID == instance.symbolID) {
                            count = count + 1
                        }
                    });
                });
            }
            symbol.count = count;
        });

        delete objSchema.symbolInstances;

        if (files) {
            resolve(objSchema);
        } else {
            reject('Could not get symbol counts');
        }
    });
}

//Export symbol
function exportComponent(sketchFile, symbolId) {
    sketchtool.run('export layers ' + dir + '/' + sketchFile + ' --item=' + symbolId + ' --formats=png --scales=2 --use-id-for-name --output=' + outputDir);
}

//Export artboards
function exportComponentArtboards(sketchFile) {
    sketchtool.run('export artboards ' + dir + '/' + sketchFile + ' --formats=jpg --scales=2 --output=' + outputDir);
}

//console.log(sketchtool.run("help export layers"));
//console.log(sketchtool.run("help export artboards"));

//Upload files, process data, create json file
app.post('/uploads', upload.array('files'), async (req, res) => {
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
    files = Buffer.from(JSON.stringify(files));
    await fsp.writeFile(dataDir + '/data.json', files, () => {
        console.log('File created');
    })
    res.status(200).send(files);
});

//Send json file to client
router.get('/data', async (req, res, next) => {
    let fileName = 'data.json';
    res.sendFile(dataDir + '/' + fileName, (err) => {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });
});

//Export symbol and send to client
router.get('/component/', async (req, res, next) => {
    let symbolId = req.query.id;
    let fileName = req.query.origin;
    let imgPath = outputDir + '/' + symbolId + '@2x.png';
    let sketchFilePath = dir + '/' + fileName;
    console.log(symbolId, fileName);
    try {
        //If rootfile doesn't exist send message to client
        if (!fs.existsSync(sketchFilePath)) {
            res.status(200).send({
                message: false,
                file: fileName
            });
        } else {

            //Else check if img of the file to be export already exists
            //If not export and send to client
            if (!fs.existsSync(imgPath)) {
                exportComponent(fileName, symbolId);
            }
            res.set({
                'Content-Type': 'image/png'
            });

            res.sendFile(imgPath, (err) => {
                if (err) {
                    next(err);
                } else {
                    //console.log('Sent:', symbolId);
                }
            });
        }

    } catch (err) {
        console.error(err);
    }
});

//Export symbol and send to client
router.get('/stats/', async (req, res) => {
    let originalMasterId = req.query.originalMasterId;
    let symbolIds = req.query.symbolIds;

    //await fsp.readFile(dir)
    console.log(symbolIds, originalMasterId);
    res.send(artboardsList);
});

//Add router in the Express app.
app.use('/', router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});