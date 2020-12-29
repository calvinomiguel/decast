const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const unzipper = require('unzipper');
//const decompress = require('decompress');
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
    return new Promise((resolve, reject) => {
        let reqData = request.files;
        if (reqData == request.files) {
            resolve(reqData);
        } else {
            reject('Couldn\'t process request.');
        }
    });
}

//Store original and current file names in array
function storeFileNames(reqData) {
    return new Promise((resolve, reject) => {
        let fileNames = [];
        reqData.forEach(file => {
            fileNames.push({
                oName: file.originalname.replace(".sketch", ".zip"),
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

//Function for changing the name of the uploaded file to original name
function changeFileNames(fileNames) {
    return new Promise((resolve, reject) => {
        fileNames.forEach(nameGroup => {
            console.log(nameGroup);
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
        console.log('Names successfully changed...');
    });
}

//Function for creating names for directories for files to be unzipped
function createDirNames(reqData) {
    return new Promise(function (resolve, reject) {
        dirNames = [];
        reqData.forEach(file => {
            dirNames.push(file.originalname.replace(".sketch", ""));
        });
        console.log(dirNames);
        if (dirNames.length > 0) {
            resolve(dirNames);
        } else {
            reject("Failed in creating dir names for files to be unzipped.");
        }
    });
}

//Create directories
function createDirs(dirNames) {
    return new Promise((resolve, reject) => {
        checkSuccess = [];
        dirNames.forEach(name => {
            fs.mkdirSync(`${dir}/${name}`, {
                recursive: true,
            })
            checkSuccess.push(true);
            console.log("Directory for " + name + " created!");
        });
        if (checkSuccess.length == dirNames.length) {
            resolve('All directories successfully created!');
        } else {
            reject('Something went wrong while creating the directories.');
        }
    });
}

//Function for getting files to be Unzipped from the directory
function getDirsToUnzip() {
    return new Promise((resolve, reject) => {
        console.log("Get files to unzip...");
        let dirFiles = fs.readdirSync(dir);
        if (dirFiles.length > 0) {
            resolve(dirFiles);
        } else {
            reject('Something went wrong while getting files to unzip.');
        }
    });
}

//Function for unzipping uploaded files
function unzipFiles(directories) {
    return new Promise((resolve, reject) => {
        console.log("Start unzipping files...");

        let zipFiles = [];
        for (let file of directories) {
            let dirName = `${dir}/${file}`;
            let newDir = `${dir}/${file.replace(".zip", "")}`;
            zipFiles.push(dirName);
            if (file.includes('.zip')) {
                fs.createReadStream(dirName)
                    .pipe(unzipper.Extract({
                        path: newDir
                    }));
            }
        };
        if (zipFiles.length == directories.length) {
            resolve(zipFiles);
        } else {
            reject('Something went wrong while unzipping files.');
        }
    });
}

function deleteZipFiles(zipFiles) {
    return new Promise((resolve, reject) => {
        console.log('Files to unzip');
        zipFiles.forEach(file => {
            if (file.includes('.zip')) {
                fs.unlinkSync(file);
            }
        });
        if (zipFiles.length > 0) {
            resolve("Successfully deleted all files");
        } else {
            reject('Something went wrong while deleting files.');
        }
    });
}

async function processPostRequest(request) {
    let data = await getRequestData(request);
    let fileNames = await storeFileNames(data);
    fileNames = await changeFileNames(fileNames);
    let dirNames = await createDirNames(data);
    await createDirs(dirNames);
    let unzipDirs = await getDirsToUnzip();
    let zipFiles = await unzipFiles(unzipDirs);
    //await deleteZipFiles(zipFiles);
}

//CREATING OBJ SCHEMA
function getFolders() {
    return new Promise((resolve, reject) => {
        let folders = [];
        let controller = false;
        //Get all folders inside of uploads folder
        fs.readdirSync(dir).forEach(file => {
            //Save folder names and paths into folders array
            if (!file.includes('.DS_Store') && !file.includes('.zip')) {
                folders.push({
                    name: file,
                    path: dir + "/" + file
                });
            }
        });
        controller = true;
        if (folders.length > 0 && controller == true) {
            resolve(folders);
        } else {
            reject("Something went wrong while getting the folders names and paths.");
        }
    });
}

function setObjStructure(folders) {
    return new Promise((resolve, reject) => {
        let controller = false;
        folders.forEach(folder => {
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

            fs.readdirSync(folder.path).forEach(file => {
                if (!file.includes(".DS_Store")) {
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
                }

            });
        });
        controller = true;
        if (controller == true) {
            resolve(folders);
        } else {
            reject("Something went wrong while setting the folders structure.");
        }
    });
}

function setObjSubFolders(folders) {
    return new Promise((resolve, reject) => {
        let controller = false;
        folders.forEach(folder => {
            let pages = folder.dir.pages;
            let previews = folder.dir.previews;
            let textPreviews = folder.dir.textPreviews;
            let images = folder.dir.images;
            pages.files = [];
            previews.files = [];
            textPreviews.files = [];
            images.files = [];

            if (!pages.path.includes('.zip') && !pages.path.includes('.DS_Store')) {
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
            }
            controller = true;
        });

        if (controller == true) {
            resolve(folders);
        } else {
            reject("");
        }
    });
}

function getFilesContent(folders) {
    return new Promise((resolve, reject) => {
        let controller;
        //META, DOC & USER JSON FILES
        folders.forEach(folder => {
            let jsonFiles = folder.json;

            jsonFiles.forEach(file => {
                let data = fs.readFileSync(file.path, "utf8")
                file.content = JSON.parse(data);
            });
        });

        //PAGE FILES
        folders.forEach(folder => {
            let pageFiles = folder.dir.pages.files;

            pageFiles.forEach(file => {
                let data = fs.readFileSync(file.path, "utf8")
                file.content = JSON.parse(data);
            });
        });

        //IMAGES FILES
        folders.forEach(folder => {
            let imageFiles = folder.dir.images.files;

            imageFiles.forEach(file => {
                let data = fs.readFileSync(file.path, "base64")
                file.content = data;
            });
        });

        //Previews FILES
        folders.forEach(folder => {
            let previewFiles = folder.dir.previews.files;

            previewFiles.forEach(file => {
                let data = fs.readFileSync(file.path, "base64")
                file.content = data;
            });
        });

        //Text Previews FILES
        folders.forEach(folder => {
            let textPreviewFiles = folder.dir.textPreviews.files;

            textPreviewFiles.forEach(file => {
                if (folder.dir.textPreviews.path != false) {
                    let encoding = file.name.includes('.pdf') ? "base64" : "utf8";
                    let data = fs.readFileSync(file.path, "utf8")
                    file.content = file.name.includes('.pdf') ? data : JSON.parse(data);
                }
            });
        });
        controller = true;

        if (controller == true) {
            resolve(folders);
        } else {
            reject("Something went wrong while getting json content.");
        }
    });
}

async function createObjSchema() {
    let folders = await getFolders();
    let objStructure = await setObjStructure(folders);
    let objSubFolders = await setObjSubFolders(objStructure);
    let filesContent = await getFilesContent(objSubFolders);

    return filesContent;
}

async function getPages() {
    let pages = [];
    let objSchema = await createObjSchema();
    objSchema.forEach(obj => {
        pages.push(obj.dir.pages);
    })
    return pages;
}

async function getDocFiles() {
    let schema = await createObjSchema();
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

async function getPageFiles() {
    let filesGroups = [];
    let files = [];
    let deliverable = [];
    let pages = await getPages();
    pages.forEach(obj => {
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

async function getSymbolInstances() {
    let symbolInstances = [];
    let pagesFiles = await getPageFiles();
    pagesFiles.forEach(file => {
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

async function getForeignSymbols() {
    let foreignSymbols = [];
    let docs = await getDocFiles();
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


async function getMasterSymbols() {
    let masterSymbols = [];
    let symbolsCount = 0;
    let deliverable = {};
    let objSchema = await createObjSchema();
    let symbolInstances = await getSymbolInstances();
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
        symbolInstances.forEach(layer => {
            if (layer._class == "symbolInstance" && layer.symbolID == symbol.symbolID) {
                symbol.used = true;
            }
        });
    });

    deliverable.count = symbolsCount;
    deliverable.symbols = masterSymbols;
    getForeignSymbols(getDocFiles());
    return deliverable;
}

//Handle POST Request from Client Form
router.post("/uploads", upload.array("files"), (req, res) => {
    processPostRequest(req);
    res.sendStatus(200);
});

//Handle GET Request from Client Form
router.get("/dashboard", async (req, res) => {
    res.status(200).send(await getMasterSymbols());
});

//Add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});