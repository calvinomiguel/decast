const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const decompress = require('decompress');
const port = process.env.PORT || 3060;
const cors = require('cors');
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

    //Call functions
    changeFileName();
    unzipFiles();
    res.sendStatus(200);
});

app.get("/uploads", (req, res) => {
    fs.readFile('./uploads/decast/document.json', function read(err, data) {
        if (err) {
            throw err;
        }
        const content = data;
        console.log(req)
        // Invoke the next step here however you like
        console.log(JSON.parse(content.toString('utf8'))); // Put all of the code here (not the best solution)
        res.status(200);
        res.send(content); // Send JSON Data
    });
});
//Add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});