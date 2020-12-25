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

//Handle GET Request from Client Form
router.get("/uploads", (req, res) => {
    let PATH__L1 = [];
    let sketchFiles = [];

    //Get all folders inside of uploads folder
    fs.readdirSync(dir).forEach(file => {
        //Save folder names into array
        PATH__L1.push({
            name: file,
            path: dir + "/" + file
        });
    });

    PATH__L1.forEach(folder => {
        folder.json = [];
        folder.dir = {
            pages: {
                files: "",
                path: ""
            },
            previews: {
                files: "",
                path: ""
            },
            textPreviews: {
                files: "",
                path: false
            },
        };

        fs.readdirSync(folder.path).forEach(file => {
            if (file.includes("pages")) {
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
        pages.files = [];
        previews.files = [];
        textPreviews.files = [];
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


    res.send(PATH__L1);
});

//Add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});