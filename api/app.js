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
const util = require('util');
const readFile = util.promisify(fs.readFile);
const exec = util.promisify(require('child_process').exec);
const {
    json
} = require('body-parser');
const {
    file
} = require('jszip');
const dir = process.argv[2] || process.cwd() + '/uploads';
const outputDir = process.cwd() + '/exports';
const unzippedOutput = process.cwd() + '/sketch'
const dataDir = process.cwd() + '/data';
const upload = multer({
    dest: './uploads/'
});
const flatten = require('flat');
const unflatten = require('flat').unflatten;
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
                    let _sourceLibraryName = symbol.sourceLibraryName;
                    let _originalFileName = symbol.sourceLibraryName + '.sketch';
                    let _currentFileName = file.name;
                    let _name = symbol.originalMaster.name;
                    let _symbolClass = symbol.originalMaster._class;
                    let _originalMasterID = symbol.originalMaster.symbolID;
                    let _symbolMasterID = symbol.symbolMaster.symbolID;
                    let _objectID = symbol.symbolMaster.do_objectID;
                    symbolArr.push({
                        //libraryID: _libraryID,
                        sourceLibraryName: _sourceLibraryName,
                        originalFileName: _originalFileName,
                        currentFileName: _currentFileName,
                        name: _name,
                        _class: _symbolClass,
                        originalMasterId: _originalMasterID,
                        symbolMasterID: _symbolMasterID,
                        do_objectID: _objectID
                    });
                }
                if (symbol._class == 'symbolMaster') {
                    //let _libraryID = false;
                    let _sourceLibraryName = false;
                    let _currentFileName = file.name;
                    let _originalFileName = file.name;
                    let _name = symbol.name;
                    let _symbolClass = symbol._class;
                    let _originalMasterID = symbol.symbolID;
                    let _symbolMasterID = false;
                    let _objectID = symbol.do_objectID;
                    symbolArr.push({
                        //libraryID: _libraryID,
                        sourceLibraryName: _sourceLibraryName,
                        name: _name,
                        currentFileName: _currentFileName,
                        originalFileName: _originalFileName,
                        _class: _symbolClass,
                        originalMasterId: _originalMasterID,
                        do_objectID: _objectID,
                        symbolMasterID: _symbolMasterID,
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

//Recursive function to get symbols nested in groups
function getSymbolsInGroups(groupsArr, symbolsArr) {
    let groupLayers = groupsArr.filter(group => group.hasOwnProperty("layers"));
    let layers = [];
    let symbols;
    let subGroups;
    for (let group of groupLayers) {
        layers.push(...group.layers);
    }

    if (layers.length > 0) {
        symbols = layers.filter(layer => layer._class == 'symbolInstance');
        subGroups = layers.filter(layer => layer._class == 'group');
        symbolsArr.push(...symbols);
        return getSymbolsInGroups(subGroups, symbolsArr);
    } else {
        return symbolsArr;
    }
}

async function getArtboards(objSchema) {
    let files = objSchema.files;
    let obj = [];
    let artboards = [];
    let totalArtboards = 0;
    for (let file of files) {
        const sketch = await ns.read(file.path);
        let pages = sketch.pages;
        let layers = [];
        let boards;

        //Push all layers of the file pages into layers array
        for (let page of pages) {
            layers.push(...page.layers);
        }

        //Filter layers array for layers of the class artboard
        boards = layers.filter(layer => layer._class == 'artboard');

        for (let board of boards) {
            //Push the artboards layers into the layers array
            artboards.push({
                file: {
                    name: file.name,
                    path: file.path
                },
                name: board.name,
                //_class: board._class,
                do_objectID: board.do_objectID,
                layers: [...board.layers]
            });
        }

        for (let artboard of artboards) {
            let boardLayers = [...artboard.layers];

            let groups = boardLayers.filter(layer => layer._class == "group");
            let symbols = boardLayers.filter(layer => layer._class == "symbolInstance");
            symbols = getSymbolsInGroups(groups, symbols);

            let symbolInstances = [];
            for (let symbol of symbols) {
                symbolInstances.push(symbol.symbolID);
            }
            artboard.symbolInstances = symbolInstances;
            //Get total count of artboards
            //totalArtboards += 1;

        }
    }
    for (let artboard of artboards) {
        delete artboard.layers;
    }

    obj = {
        //totalArtboards: totalArtboards,
        artboards: [...artboards]
    };
    return obj;
}

async function getGlobalSymbolInstances(objSchema) {
    const files = objSchema.files;
    let pages = [];
    let layers = [];
    let symbolInstances;
    let artboards;
    let artboardLayers = [];
    let artboardSymbolInstances;
    //Get pages of all files
    for (let file of files) {
        const sketch = await ns.read(file.path);
        pages.push(...sketch.pages);
    }

    //Get layers of all pages
    for (let page of pages) {
        layers.push(...page.layers)
    }

    //Filter all artboards from the layers
    artboards = layers.filter(layer => {
        return layer._class == 'artboard';
    });

    //Filter all symbol instances outside of artboards
    symbolInstances = artboards.filter(layer => {
        return layer._class == 'symbolInstance';
    });

    //Filter all group layers outside of artboards
    groups = artboards.filter(layer => {
        return layer._class == 'group'
    });

    //Get all symbols inside of groups
    symbolInstances = getSymbolsInGroups(groups, symbolInstances);


    //Get all layers from the artboards
    for (let artboard of artboards) {
        artboardLayers.push(...artboard.layers);
    }

    //Filter all symbolInstances from the layers
    artboardSymbolInstances = artboardLayers.filter(layer => layer._class == 'symbolInstance');
    groups = artboardLayers.filter(layer => layer._class == 'group');
    artboardSymbolInstances = getSymbolsInGroups(groups, artboardSymbolInstances);
    symbolInstances.push(...artboardSymbolInstances);

    objSchema.symbolInstances = symbolInstances;
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
    sketchtool.run('export layers ' + dir + '/' + sketchFile + ' --item=' + symbolId + ' --formats=png --scales=2 --use-id-for-name --output=' + outputDir + '/symbols');
}

//Export artboards
function exportArtboards(sketchFile) {
    sketchtool.run('export artboards ' + dir + '/' + sketchFile + ' --formats=jpg --scales=2 --use-id-for-name --output=' + outputDir + '/artboards');
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
    let artboards = await getArtboards(files);

    files = await getSymbols(files);
    files = await restructureSymbolsObj(files);
    files = await uniteIdenticalSymbols(files);
    files = await getGlobalSymbolInstances(files);
    files = await getGlobalSymbolsCount(files);

    let totalSymbols = 0;
    let symbolsArr = [...files.symbols];
    for (let symbol of symbolsArr) {
        totalSymbols += 1;
    }
    files.totalSymbols = totalSymbols;
    files = Buffer.from(JSON.stringify(files));
    await fsp.writeFile(dataDir + '/data.json', files, () => {
        console.log('Data file created');
    });

    //Loop through array in artboards object
    //to get total number of artboards
    let totalArtboards = 0;
    for (let artboard of artboards.artboards) {
        totalArtboards += 1;
    }
    //Push number into object
    artboards.totalArtboards = totalArtboards;

    //Stringify object
    artboards = Buffer.from(JSON.stringify(artboards));

    //Create json file
    await fsp.writeFile(dataDir + '/artboards.json', artboards, () => {
        console.log('Artboards file created');
    });
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

//Send json file to client
router.get('/artboards/data', async (req, res, next) => {
    let fileName = 'artboards.json';
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
    let imgPath = outputDir + '/symbols/' + symbolId + '@2x.png';
    let sketchFilePath = dir + '/' + fileName;

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

//Export all symbols
router.get('/components/', async (req, res, next) => {
    try {
        let do_objectID = req.query.do_objectID;
        let fileName = req.query.originalFileName;
        let imgPath = outputDir + '/symbols/' + do_objectID + '@2x.png';
        let sketchFilePath = dir + '/' + fileName;
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
                exportComponent(fileName, do_objectID);
            }
            res.status(200).send();
        }

    } catch (err) {
        console.error(err);
    }
});

//Export all artboards
router.get('/artboards/', async (req, res, next) => {
    try {
        let filePath = req.query.filePath;
        let fileName = req.query.fileName;
        let lastFile = req.query.lastFile;

        //If start the process only if axf.json file doesn't exist
        if (!fs.existsSync(dataDir + '/axf.json')) {
            //If file doesn't exist send message to client
            if (!fs.existsSync(filePath)) {
                res.status(200).send('While trying to export artboards decast couldn\'t find ' + fileName);
            } else {
                //Export all artboards of the files
                exportArtboards(fileName);

                //Check if this was the last file
                //If true, create an axf.json file for controlling purposes later
                if (lastFile.includes("true")) {
                    let fileContent = {
                        work: "finished"
                    };
                    fileContent = JSON.stringify(fileContent);
                    await fsp.writeFile(dataDir + '/axf.json', fileContent, () => {
                        console.log('Data file created');
                    });
                }
                res.send(fileName + ' was exported');
            }
        }
    } catch (err) {
        next(err);
    }
});

//Send artboard img to client
router.get('/component/artboards', async (req, res, next) => {
    let do_objectID = req.query.do_objectID;
    let imgPath = outputDir + '/artboards/' + do_objectID + '@2x.jpg';
    try {
        if (do_objectID != undefined) {
            if (fs.existsSync(imgPath)) {
                res.set({
                    'Content-Type': 'image/jpeg'
                });

                res.sendFile(imgPath, (err) => {
                    if (err) {
                        next(err);
                    } else {
                        //console.log('Sent:', symbolId);
                    }
                });
            }
        }
    } catch (err) {
        console.error(err);
    }

});

//Send artboards data to client
router.get('/stats/', async (req, res) => {
    let data = await readFile(dataDir + '/artboards.json', 'utf8'); //Get data.json file content
    let originalMasterId = req.query.originalMasterId;
    let symbolIds = req.query.symbolIds;
    data = JSON.parse(data);
    let artboards = data.artboards; //Parse data
    let totalArtboards = data.totalArtboards;
    let artboardsCount = 0;

    for (let artboard of artboards) {
        let instancesIDs = artboard.symbolInstances;

        let originalIdExists = instancesIDs.some((id) => id == originalMasterId);
        let symbolIdExists = false;

        if (symbolIds != undefined) {
            symbolIdExists = instancesIDs.some(id => symbolIds.includes(id));
        }

        if (originalIdExists == true || symbolIdExists == true) {
            artboardsCount += 1;
        }
        //console.log(originalIdExists, symbolIdExists);
    }

    let deliverable = {
        artboardsUsing: artboardsCount,
        totalArtboards: totalArtboards
    }

    res.send(deliverable);
});

async function getSketchFileNames() {
    let filenames = [];
    let files = await getFileNames()
    files.forEach(file => {
        filenames.push(file.name);
    });
    return filenames;
}

async function unzipFiles() {
    let filenames = await getSketchFileNames();
    let paths = [];
    for (let filename of filenames) {
        let path = dir + "/" + filename;
        filename = filename.replace('.sketch', '');
        const {
            stdout,
            stderr
        } = await exec('unzip ' + path + ` -d ${unzippedOutput}/${filename}`);
        paths.push(`${unzippedOutput}/${filename}`);
    }
    return paths;
}

async function readJsonFile(path, filename) {
    let data = await readFile(path + '/' + filename, 'utf8');
    return data;
}

async function removeSymbolFromDocument(paths, originalMasterId) {

    for (let path of paths) {

        //Read document.json
        let data = await readJsonFile(path, 'document.json');
        data = JSON.parse(data);

        const newForeignSymbols = data.foreignSymbols.filter((foreignSymbol) => {
            const fOriginalMasterId = foreignSymbol.originalMaster.symbolID;
            return fOriginalMasterId !== originalMasterId;
        });

        console.log(`Looking in ${path}`)
        console.log(`${data.foreignSymbols.length - newForeignSymbols.length} foreignSymbols with ID ${originalMasterId} found. Removing...`)
        data.foreignSymbols = newForeignSymbols;


        try {
            await fsp.writeFile(path + '/document.json', JSON.stringify(data))
        } catch (error) {
            console.error('Error writing document.json', error)
        }

    }
}

async function removeSymbolFromPages(paths, originalMasterId, symbolIds) {
    for (let sketchFilePath of paths) {
        console.log(`Looking in ${sketchFilePath}`)

        const files = await fsp.readdir(`${sketchFilePath}/pages`);
        const pages = files.filter(i => i.endsWith('.json'))

        for (const pageName of pages) {
            console.log(`Reading page ${pageName}`)

            //Read page json
            let data = await readJsonFile(`${sketchFilePath}/pages`, pageName);
            data = JSON.parse(data);

            // if symbols page, remove master and shortcircuit
            const isSymbolsPage = data.layers.some(i => i._class === 'symbolMaster')
            if (isSymbolsPage) {
                const newLayers = data.layers.filter(i => originalMasterId !== i.symbolID)

                console.log(`Removed ${data.layers.length - newLayers.length} symbols from Symbols page`)
                data.layers = newLayers

                try {
                    await fsp.writeFile(`${sketchFilePath}/pages/${pageName}`, JSON.stringify(data))
                } catch (error) {
                    console.error(`Error writing ${pageName}`, error)
                }

                continue;
            }

            const flattened = flatten(data.layers)

            const cleaned = Object.entries(flattened).reduce((acc, [k, v]) => {
                if (/\d+\.symbolID/.test(k)) {
                    if (symbolIds.includes(v)) {
                        acc[k] = v
                    }
                }
                return acc
            }, {})

            console.log(cleaned)

            const pathsToDelete = Object.keys(cleaned)
            const newFlattened = {
                ...flattened
            }

            Object.keys(flattened).forEach(path => {
                if (pathsToDelete.some(i => path.startsWith(i.replace('.symbolID', '')))) {
                    delete newFlattened[path]
                }
            })

            const unflattened = unflatten(newFlattened)

            // we could loop through the layers that were affected and quickly do a `filter(Boolean)` to filter out the nulls
            // we know which layers are affected (cleaned) but how do we access them bcuz of arrays :((((((

            const prehack = JSON.stringify(unflattened)
            console.log(prehack)
            const hack = prehack.replace(/null,/g, '')
            const hack2 = hack.replace(/null/g, '')

            data.layers = Object.values(JSON.parse(hack2))

            try {
                await fsp.writeFile(`${sketchFilePath}/pages/${pageName}`, JSON.stringify(data))
            } catch (error) {
                console.error(`Error writing ${pageName}`, error)
            }
        }

    }
}


async function deleteSymbol(originalMasterId, symbolIds) {
    let unzippedPaths = await unzipFiles();

    // remove from non-master files
    // await removeSymbolFromDocument(unzippedPaths, originalMasterId);

    // remove from all artboards across all pages
    await removeSymbolFromPages(unzippedPaths, originalMasterId, symbolIds);
}


//Delete symbol
router.post('/delete/symbol', async (req, res) => {
    let originalMasterId = req.body.params.originalMasterId;
    let symbolIds = req.body.params.symbolIds;
    await deleteSymbol(originalMasterId, symbolIds);
    res.send('Symbol deleted successfully.')
});

//Add router in the Express app.
app.use('/', router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});