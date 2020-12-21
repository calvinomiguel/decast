const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const upload = multer({
    dest: "./uploads/"
});
const cors = require('cors');
app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(bodyParser.json());
app.use(bodyParser.raw());
const port = process.env.PORT || 3060;

//Handle POST Request from Client Form
router.post("/uploads", upload.array("files"), (req, res) => {
    const names = [];
    const files = req.files;
    files.forEach((file) => {
        names.push({
            oName: file.originalname,
            tmpName: file.filename
        });
    })

    function changeFileName() {
        names.forEach(name => {
            let tmpPath = `${__dirname}/uploads/${name.tmpName}`;
            let oPath = `${__dirname}/uploads/${name.oName}`;
            fs.rename(tmpPath, oPath, () => {
                console.log(`${name.tmpName} was rename to ${name.oName}`);
            });
        });
        fs.readdirSync(`${__dirname}/uploads`).forEach(file => {
            console.log(file);
        });
    }
    console.log(req.files);
    res.sendStatus(200);
    changeFileName();
});


// add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.send("<html><head><title>API Server</title></head><body><h1>Hello World!</h1></body></html>");
});

//const fs = require("fs");
//const path = require("path");
//const { res } = require("express");
//const dirPath = path.join(__dirname, "uploads");
/*
//Set files in upload folder
app.post("/files", upload.array("sketch-files"), (req, res) => {
    console.log(req.files);
    req.send(req.files);
});
//Get files in uploads folder
/*app.get('/api/uploads', (req, res) => {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory:' + err);
        } 
        res.send(files);
    });
});
*/