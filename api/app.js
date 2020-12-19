const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer({ dest: `${__dirname}/uploads` });
//const uploadsFolder = __dirname + "/uploads/";
const port = 3060;
//const fs = require("fs");
//const path = require("path");
//const { res } = require("express");
//const dirPath = path.join(__dirname, "uploads");

app.use(express.urlencoded());

//Set files in upload folder
app.post("/files", upload.array("sketch-files"), (req) => {
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

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
}); 