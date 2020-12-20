const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer({
    dest: "./uploads"
});
const cors = require('cors');
app.use(cors());
//const uploadsFolder = __dirname + "/uploads/";
const port = process.env.PORT || 3060;
//const fs = require("fs");
//const path = require("path");
//const { res } = require("express");
//const dirPath = path.join(__dirname, "uploads");
app.use(express.json());
app.use(express.urlencoded());

//Set files in upload folder
app.post("/files", upload.array("sketch-files"), (req, res) => {
    console.log(req.files);
    req.send(req.files);
});

const files = [{
        id: 1,
        name: "decast.sketch"
    },
    {
        id: 2,
        name: "lbry.sketch"
    },
    {
        id: 3,
        name: "bitchute.sketch"
    },
    {
        id: 4,
        name: "parler.sketch"
    }
];
/*
app.post("/uploads", (req, res) => {
    const file = {
        "id": files.length + 1,
        "name": req.body.name
    };
    files.push(file);
    res.send(file);
});
*/
app.post("/uploads", (req, res) => {
    res.send(req.body);
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

app.get("/", (req, res) => {
    res.send("<html><head><title>API Server</title></head><body><h1>Hello World!</h1></body></html>");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});