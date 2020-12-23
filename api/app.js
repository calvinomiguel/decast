const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const decompress = require('decompress');
const port = process.env.PORT || 3060;
const cors = require('cors');
const dir = `${__dirname}/uploads/`;
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

//Handle POST Request from Client Form
router.post("/uploads", upload.array("files"), (req, res) => {
    let names = [];
    const files = req.files;
    let dirNames = [];
    //Store original and current file names in array
    function storeFileNames() {
        files.forEach((file) => {
            names.push({
                oName: file.originalname.replace(".sketch", ".zip"),
                tmpName: file.filename
            });
        });
    }

    //Function for changing the name of the uploaded file to original name
    function changeFileName() {
        names.forEach(nameGroup => {
            let tmpPath = `${dir}${nameGroup.tmpName}`;
            let oPath = `${dir}${nameGroup.oName}`;

            fs.renameSync(tmpPath, oPath, () => {
                console.log(`${nameGroup.tmpName} was renamed to ${nameGroup.oName}!`);
            });
        });
    }

    //Function for creating names for directories for files to be unzipped
    function createDirNames() {
        fs.readdirSync(dir, (err, files) => {
            if (err) {
                throw err;
            }
            console.log(files);
        });

    }

    //Create directories
    function createDirs() {
        fs.readdirSync(dir, (err, files) => {
            if (err) {
                throw err;
            }
            files.forEach(file => {
                let fileName = file.replace(".zip", "");
                fs.mkdir(`${dir}${fileName}`, {
                        recursive: true,
                    },
                    (err) => {
                        if (err) {
                            throw err;
                        }
                    }
                );
                console.log("Directory for " + fileName + " created!");
            });
        });
    }

    //Function for unzipping uploaded files
    function unzipFiles() {
        fs.readdirSync(dir).forEach(file => {
            let dirName = file.replace('.zip', '');

            console.log("Creating a new directory for " + dirName + " content...");
            //Create directory to store unzipped filesize
            fs.mkdir(`${dir}${dirName}`, {
                    recursive: true,
                },
                err => {
                    if (err) {
                        throw err;
                    }
                    console.log("Directory for " + dirName + " created!");
                }
            );

            //Unzip file and place content in new folder
            if (file != '.DS_Store') {
                console.log("Unzipping " + dirName + "...");
                (async () => {
                    try {
                        await decompress(`${dir}/${file}`, `${dir}/${dirName}`);
                    } catch (err) {
                        console.log(err);
                    }
                })();
                console.log(dirName + " was successfully unzipped!");

            }
        });

        console.log("4.) Check for original .zip files");

        //Delete unzipped files
        fs.readdirSync(dir).forEach(file => {
            let dirName = `${dir}/${file}`;
            if (file.includes('.zip')) {
                console.log("Deleting " + file + "...");
                (async () => {
                    try {
                        await fs.unlinkSync(dirName);
                    } catch (err) {
                        console.log(err);
                    }
                })();
                console.log(file + " was deleted!")
            }
        })
    }

    //Call functions
    console.log("1.) File names are being stored...");
    storeFileNames();
    console.log("File names succesfully stored!");
    console.log("2.) Files are being renamed...");
    changeFileName();
    console.log("All files successfully renamed!");
    console.log("3.) Create directories names...");
    createDirNames();
    console.log("Directories names were successfully created");
    console.log("4.) Creating directories...");
    createDirs();
    unzipFiles();
    res.sendStatus(200);
});

//Send JSON files to client
router.get("/uploads", (req, res) => {
    const sketchFiles = [];
    const mainFolders = [];
    const subFolders = [];
    let sketchFile = new Object();

    //Check main folder
    fs.readdirSync(dir).forEach(DIR__L1 => {
        let properties = new Object();
        properties.name = DIR__L1;
        sketchFile.file = properties;
        sketchFiles.push(sketchFile);
        mainFolders.push(DIR__L1);
    });

    //Check subfolders
    console.log("Log subfolders");
    mainFolders.forEach(folder => {
        fs.readdirSync(dir + "/" + folder).forEach(DIR__L2 => {
            let dir__2 = dir + '/' + folder + '/' + DIR__L2;
            let content = new Object();
            if (DIR__L2 === "document.json") {

            }

            //Check subfolders of subfolders
            if (!DIR__L2.includes(".json")) {
                fs.readdirSync(dir + "/" + folder + "/" + DIR__L2).forEach(DIR__L3 => {
                    //  console.log(DIR__L3);
                });
            }
        });
    })
    //Check subfolders

    console.log(mainFolders);
    res.status(200);
    res.send(sketchFiles);

});

//Add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});