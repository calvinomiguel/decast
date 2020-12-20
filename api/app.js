const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const router = express.Router();
const upload = multer({
    dest: "./uploads"
});
const cors = require('cors');
app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded());
//const uploadsFolder = __dirname + "/uploads/";
const port = process.env.PORT || 3060;
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

app.get("/", (req, res) => {
    res.send("<html><head><title>API Server</title></head><body><h1>Hello World!</h1></body></html>");
});

//Handle POST Request from Client Form
router.post("/uploads", (req, res) => {
    console.log(req.body);
});



// add router in the Express app.
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});