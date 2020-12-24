const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const decompress = require('decompress');
const port = process.env.PORT || 3060;
const cors = require('cors');
const dir = `${__dirname}/uploads`;
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
            let tmpPath = `${dir}/${nameGroup.tmpName}`;
            let oPath = `${dir}/${nameGroup.oName}`;

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
        });
        console.log('THESE ARE THE DIRECTORIES NAMES');
        files.forEach(file => {
            dirNames.push(file.originalname.replace(".sketch", ""));
        });
        console.log(dirNames);
    }

    //Create directories
    function createDirs() {
        dirNames.forEach(name => {
            fs.mkdir(`${dir}/${name}`, {
                    recursive: true,
                },
                (err) => {
                    if (err) {
                        throw err;
                    }
                }
            );
            console.log("Directory for " + name + " created!");
        });
    }

    //Function for deleting unzipped files
    function deleteZipFiles() {
        fs.readdirSync(dir).forEach(file => {
            let dirName = `${dir}/${file}`;
            if (file.includes('.zip')) {
                console.log("Deleting " + file + "...");
                fs.unlinkSync(dirName);
                console.log(file + " was deleted!")
            }
        })
    }

    //Function for unzipping uploaded files
    function unzipFiles() {
        console.log("FILES TO BE UNZIPPED!!!!!");
        fs.readdirSync(dir).forEach(file => {
            let dirName = `${dir}/${file}`;
            let newDir = `${dir}/${file.replace(".zip", "")}`;
            if (file.includes('.zip')) {
                decompress(dirName, newDir).then(files => {
                    console.log(file + " successfully unzipped!");
                    //Delete ZIP file after unzipping
                    deleteZipFiles();
                });
            }
        });
    }



    //Call functions
    storeFileNames();
    changeFileName();
    createDirNames();
    createDirs();
    unzipFiles();
    res.sendStatus(200);
});


//Add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});