const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const fsPromises = require('fs').promises;
const decompress = require('decompress');
const port = process.env.PORT || 3060;
const cors = require('cors');
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

function getRequestData(request) {
    let reqData = request.files;
    return reqData;
}

//Store original and current file names in array
function storeFileNames(reqData) {
    let fileNames = [];
    reqData.forEach(file => {
        fileNames.push({
            oName: file.originalname.replace(".sketch", ".zip"),
            tmpName: file.filename
        });
    });
    return fileNames;
}

//Function for changing the name of the uploaded file to original name
function changeFileNames(fileNames) {
    fileNames.forEach(nameGroup => {
        console.log(nameGroup);
        let tmpPath = `${dir}/${nameGroup.tmpName}`;
        let oPath = `${dir}/${nameGroup.oName}`;

        fs.renameSync(tmpPath, oPath, () => {
            console.log(`${nameGroup.tmpName} was renamed to ${nameGroup.oName}!`);
        });
    });

    console.log('Names successfully changed...')
    return fileNames;
}

//Function for creating names for directories for files to be unzipped
function createDirNames(reqData) {
    dirNames = [];
    reqData.forEach(file => {
        dirNames.push(file.originalname.replace(".sketch", ""));
    });
    console.log("Currently here")
    console.log(dirNames);
    return dirNames;
}

//Create directories
function createDirs(dirNames) {
    dirNames.forEach(name => {
        fs.mkdirSync(`${dir}/${name}`, {
            recursive: true,
        })
        console.log("Directory for " + name + " created!");
    });
}

//Function for unzipping uploaded files
function unzipFiles() {
    console.log("Start unzipping files...");
    fs.readdirSync(dir).forEach(file => {
        let dirName = `${dir}/${file}`;
        let newDir = `${dir}/${file.replace(".zip", "")}`;
        if (file.includes('.zip')) {
            decompress(dirName, newDir).then(files => {
                console.log(file + " successfully unzipped!");
            });
        }
    });
}

function createObjSchema() {
    let PATH__L1 = [];
    let sketchFiles = [];

    //Get all folders inside of uploads folder
    fs.readdirSync(dir).forEach(file => {
        //Save folder names into array
        if (!file.includes('.DS_Store')) {
            PATH__L1.push({
                name: file,
                path: dir + "/" + file
            });
        }
    });

    PATH__L1.forEach(folder => {
        folder.json = [];
        folder.dir = {
            pages: {
                files: "",
                path: ""
            },
            images: {
                files: "",
                path: false
            },
            previews: {
                files: "",
                path: ""
            },
            textPreviews: {
                files: "",
                path: false
            }
        };
        console.log("WHERE THE ERROR HAPPENS");
        console.log(folder.path);
        fs.readdirSync(folder.path).forEach(file => {
            if (file.includes("pages")) {
                folder.dir.pages.path = dir + "/" + folder.name + "/" + file;
            }
            if (file.includes("images")) {
                folder.dir.pages.path = dir + "/" + folder.name + "/" + file;
            }
            if (file.includes("previews")) {
                folder.dir.previews.path = dir + "/" + folder.name + "/" + file;
            }
            if (file.includes("text-previews")) {
                folder.dir.textPreviews.path = dir + "/" + folder.name + "/" + file;
            }
            if (file.includes("document") || file.includes("meta") || file.includes("user")) {
                folder.json.push({
                    name: file,
                    path: folder.path + "/" + file,
                    content: ""
                });
            }
        });
    });

    PATH__L1.forEach(folder => {
        let pages = folder.dir.pages;
        let previews = folder.dir.previews;
        let textPreviews = folder.dir.textPreviews;
        let images = folder.dir.images;
        pages.files = [];
        previews.files = [];
        textPreviews.files = [];
        images.files = [];
        fs.readdirSync(pages.path).forEach(file => {
            pages.files.push({
                name: file,
                path: pages.path + "/" + file,
                content: ""
            });
        });

        fs.readdirSync(previews.path).forEach(file => {
            previews.files.push({
                name: file,
                path: previews.path + "/" + file,
                content: ""
            });
        });

        if (textPreviews.path != false) {
            fs.readdirSync(textPreviews.path).forEach(file => {
                textPreviews.files.push({
                    name: file,
                    path: previews.path + "/" + file,
                    content: ""
                });
            });
        }

        if (images.path != false) {
            fs.readdirSync(images.path).forEach(file => {
                images.files.push({
                    name: file,
                    path: previews.path + "/" + file,
                    content: ""
                });
            });
        }
    });

    //META, DOC & USER JSON FILES
    PATH__L1.forEach(folder => {
        let jsonFiles = folder.json;

        jsonFiles.forEach(file => {
            let data = fs.readFileSync(file.path, "utf8")
            file.content = JSON.parse(data);
        });
    });

    //PAGE FILES
    PATH__L1.forEach(folder => {
        let pageFiles = folder.dir.pages.files;

        pageFiles.forEach(file => {
            let data = fs.readFileSync(file.path, "utf8")
            file.content = JSON.parse(data);
        });
    });

    //IMAGES FILES
    PATH__L1.forEach(folder => {
        let imageFiles = folder.dir.images.files;

        imageFiles.forEach(file => {
            let data = fs.readFileSync(file.path, "base64")
            file.content = data;
        });
    });

    //Previews FILES
    PATH__L1.forEach(folder => {
        let previewFiles = folder.dir.previews.files;

        previewFiles.forEach(file => {
            let data = fs.readFileSync(file.path, "base64")
            file.content = data;
        });
    });

    //Text Previews FILES
    PATH__L1.forEach(folder => {
        let textPreviewFiles = folder.dir.textPreviews.files;

        textPreviewFiles.forEach(file => {
            if (folder.dir.textPreviews.path != false) {
                let encoding = file.name.includes('.pdf') ? "base64" : "utf8";
                let data = fs.readFileSync(file.path, "utf8")
                file.content = file.name.includes('.pdf') ? data : JSON.parse(data);
            }
        });
    });

    return PATH__L1;
}

function getPages() {
    let pages = [];
    createObjSchema().forEach(obj => {
        pages.push(obj.dir.pages);
    })
    return pages;
}

function getDocFiles() {
    let schema = createObjSchema();
    let docFiles = [];
    schema.forEach(obj => {
        let jsonList = obj.json;
        jsonList.forEach(list => {
            if (list.name.includes("document")) {
                docFiles.push(list.content);
            }
        });
    });
    return docFiles;
}

function getPageFiles() {
    let filesGroups = [];
    let files = [];
    let deliverable = [];
    getPages().forEach(obj => {
        filesGroups.push(obj);
    });
    filesGroups.forEach(group => {
        files.push(group.files);
    });
    files.forEach(fileArr => {
        fileArr.forEach(file => {
            deliverable.push(file);
        })
    });

    return deliverable;
}

function getSymbolInstances() {
    let symbolInstances = [];
    getPageFiles().forEach(file => {
        let fileLayers = file.content.layers;

        fileLayers.forEach(fileLayer => {
            if (fileLayer._class == "artboard") {
                let subLayers = fileLayer.layers;
                subLayers.forEach(layer => {
                    if (layer._class == "symbolInstance") {
                        symbolInstances.push(layer);
                    }
                });
            }
        });
    });

    return symbolInstances;
}

function getForeignSymbols() {
    let docs = getDocFiles();
    let foreignSymbols = [];
    docs.forEach(doc => {
        let symbolsList = doc.foreignSymbols;
        if (symbolsList != undefined && symbolsList != null && symbolsList.length > 0) {
            symbolsList.forEach(list => {
                foreignSymbols.push({
                    _class: list._class,
                    library: {
                        id: list.libraryID,
                        name: list.sourceLibraryName
                    },
                    originalMaster: {
                        id: list.originalMaster.symbolID,
                        _class: list.originalMaster._class,
                        name: list.originalMaster.name
                    },
                    symbolMaster: {
                        id: list.symbolMaster.symbolID,
                        _class: list.symbolMaster._class,
                        name: list.symbolMaster.name,
                    }
                });
            })
        }
    });

    console.log(foreignSymbols);
}


function getMasterSymbols() {
    let masterSymbols = [];
    let symbolsCount = 0;
    let deliverable = {};
    let objSchema = createObjSchema();

    //Get all Master Symbols
    objSchema.forEach(folder => {
        let pages = folder.dir.pages.files;
        pages.forEach(file => {
            let layers = file.content.layers;
            layers.forEach(layer => {
                if (layer._class == "symbolMaster") {
                    masterSymbols.push({
                        type: layer._class,
                        name: layer.name,
                        symbolID: layer.symbolID,
                        page: file.content.name,
                        pagePath: file.path,
                        used: false
                    });
                }
            });
        });
    });

    //Get count of unique IDs
    symbolsCount = [...new Set([...masterSymbols.map(symbol => symbol.symbolID)])].length;

    //Check if if symbol is used
    masterSymbols.forEach(symbol => {
        getSymbolInstances().forEach(layer => {
            if (layer._class == "symbolInstance" && layer.symbolID == symbol.symbolID) {
                symbol.used = true;
            }
        });
    });

    deliverable.count = symbolsCount;
    deliverable.symbols = masterSymbols;
    return deliverable;
}


//Handle POST Request from Client Form
router.post("/uploads", upload.array("files"), (req, res) => {
    let data = getRequestData(req);
    let fileNames = storeFileNames(data);
    fileNames = changeFileNames(fileNames);
    let dirNames = createDirNames(data);
    createDirs(dirNames);
    unzipFiles();
    //await deleteZipFiles();

    res.sendStatus(200);
});

//Handle GET Request from Client Form
router.get("/dashboard", (req, res) => {
    res.status(200).send(getMasterSymbols());
});

//Add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});