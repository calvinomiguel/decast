const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const ns = require('node-sketch');
const port = process.env.PORT || 3060;
const cors = require('cors');
const {
    json
} = require("body-parser");
const Sketch = require("node-sketch/src/Sketch");
const e = require("cors");
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

//Return Request Data
function getRequesData() {
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
        console.log('Names successfully changed...');
    });
}


//Handle POST Request from Client Form to upload files
router.post("/uploads", upload.array("files"), async (req, res) => {
    let reqData = req.files;
    let fileNames = await storeFileNames(reqData);
    fileNames = await changeFileNames(fileNames);

    res.status(200).send();
});

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

function getAllSymbols(arr_1, arr_2) {
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

function getSymbolCount(symbols, foreignSymbols) {
    return new Promise((resolve, reject) => {
        let count_1 = [...new Set([...symbols.map(symbol => symbol.symbolID)])];
        let count_2 = [...new Set([...foreignSymbols.map(symbol => symbol.originalMaster.symbolID)])];
        let count = count_1.concat(...count_2);
        count = [...new Set([...count.map(id => id)])].length;
        console.log(count)
        if (count) {
            resolve(count);
        } else {
            reject("No symbols");
        }
    });
}

function sendInfos(count, allSymbols) {
    return new Promise((resolve, reject) => {

        let obj = {
            symbols: allSymbols,
            count: count
        };

        if (Object.keys(obj).length > 0) {
            resolve(obj);
        } else {
            reject("Send infos error.");
        }
    });
}
//Handle GET Request from Client Form
router.get("/dashboard", async (req, res) => {
    let files = await getFiles();
    let foreignSymbols = await getForeignSymbols(files);
    let symbols = await getSymbols(files);
    let allSymbols = await getAllSymbols(foreignSymbols, symbols);
    let count = await getSymbolCount(symbols, foreignSymbols);
    let infos = await sendInfos(count, allSymbols);
    res.status(200).send(infos);
});

//Handle GET Request from Client Form
router.get("/components", async (req, res) => {
    res.status(200).send('hi');
});

//Add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});