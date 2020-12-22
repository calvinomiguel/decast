const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const decompress = require('decompress');
const port = process.env.PORT || 3060;
const upload = multer({
    dest: "./uploads/"
});
const cors = require('cors');

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
    const names = [];
    const files = req.files;

    //Store original and current file names in array
    files.forEach((file) => {
        names.push({
            oName: file.originalname.replace(".sketch", ".zip"),
            tmpName: file.filename
        });
    });

    //Function for changing the name of the uploaded file to original name
    function changeFileName() {
        names.forEach(nameGroup => {
            let tmpPath = `${__dirname}/uploads/${nameGroup.tmpName}`;
            let oPath = `${__dirname}/uploads/${nameGroup.oName}`;
            fs.rename(tmpPath, oPath, () => {
                console.log(`${nameGroup.tmpName} was rename to ${nameGroup.oName}`);
            });
        });
        fs.readdirSync(`${__dirname}/uploads`).forEach(file => {
            console.log(file);
        });
    }

    //Function for unzipping uploaded files
    function unzipFiles() {
        fs.readdirSync(`${__dirname}/uploads`).forEach(file => {
            let dirName = file.replace('.zip', '');

            //Create directory to store unzipped filesize
            fs.mkdir(`${__dirname}/uploads/${dirName}`, {
                    recursive: true,
                },
                err => {
                    if (err) {
                        throw err;
                    }
                    console.log("Directory created!");
                }
            );

            //Unzip file and place content in new folder
            if (file != '.DS_Store')
                (async () => {
                    try {
                        await decompress(`${__dirname}/uploads/${file}`, `${__dirname}/uploads/${dirName}`);
                    } catch (err) {
                        console.log(err);
                    }
                })();

            //Delete original ZIP file
            fs.unlinkSync(`${__dirname}/uploads/${file}`);

        });
    }
    console.log(req.files);
    changeFileName();
    unzipFiles();
    res.sendStatus(200);
});

// add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.send("<html><head><title>API Server</title></head><body><h1>Hello World!</h1></body></html>");
});