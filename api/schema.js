//CREATING OBJ SCHEMA
function getFolders() {
    return new Promise((resolve, reject) => {
        let folders = [];
        let controller = false;
        //Get all folders inside of uploads folder
        fs.readdirSync(dir).forEach(file => {
            //Save folder names and paths into folders array
            if (!file.includes('.DS_Store') && !file.includes('.zip')) {
                folders.push({
                    name: file,
                    path: dir + "/" + file
                });
            }
        });
        controller = true;
        if (folders.length > 0 && controller == true) {
            resolve(folders);
        } else {
            reject("Something went wrong while getting the folders names and paths.");
        }
    });
}

function setObjStructure(folders) {
    return new Promise((resolve, reject) => {
        let controller = false;
        folders.forEach(folder => {
            folder.json = [];
            folder.dir = {
                pages: {
                    files: "",
                    path: ""
                },
                images: {
                    files: "",
                    path: false
                },
                previews: {
                    files: "",
                    path: ""
                },
                textPreviews: {
                    files: "",
                    path: false
                }
            };
        });
        fs.readdirSync(folder.path).forEach(file => {
            if (!file.includes(".DS_Store")) {
                if (file.includes("pages")) {
                    folder.dir.pages.path = dir + "/" + folder.name + "/" + file;
                }
                if (file.includes("images")) {
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
            }

        });
        controller = true;
        if (controller == true) {
            resolve(folders);
        } else {
            reject("Something went wrong while setting the folders structure.");
        }
    });
}

function setObjSubFolders(folders) {
    return new Promise((resolve, reject) => {
        folders.forEach(folder => {
            let controller = false;
            let pages = folder.dir.pages;
            let previews = folder.dir.previews;
            let textPreviews = folder.dir.textPreviews;
            let images = folder.dir.images;
            pages.files = [];
            previews.files = [];
            textPreviews.files = [];
            images.files = [];

            if (!pages.path.includes('.zip') && !pages.path.includes('.DS_Store')) {
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

                if (images.path != false) {
                    fs.readdirSync(images.path).forEach(file => {
                        images.files.push({
                            name: file,
                            path: previews.path + "/" + file,
                            content: ""
                        });
                    });
                }
            }
            controller = true;
        });

        if (controller == true) {
            resolve(folders);
        } else {
            reject("");
        }
    });
}

function getFilesContent(folders) {
    return new Promise((resolve, reject) => {
        let controller;
        //META, DOC & USER JSON FILES
        folders.forEach(folder => {
            let jsonFiles = folder.json;

            jsonFiles.forEach(file => {
                let data = fs.readFileSync(file.path, "utf8")
                file.content = JSON.parse(data);
            });
        });

        //PAGE FILES
        folders.forEach(folder => {
            let pageFiles = folder.dir.pages.files;

            pageFiles.forEach(file => {
                let data = fs.readFileSync(file.path, "utf8")
                file.content = JSON.parse(data);
            });
        });

        //IMAGES FILES
        folders.forEach(folder => {
            let imageFiles = folder.dir.images.files;

            imageFiles.forEach(file => {
                let data = fs.readFileSync(file.path, "base64")
                file.content = data;
            });
        });

        //Previews FILES
        folders.forEach(folder => {
            let previewFiles = folder.dir.previews.files;

            previewFiles.forEach(file => {
                let data = fs.readFileSync(file.path, "base64")
                file.content = data;
            });
        });

        //Text Previews FILES
        folders.forEach(folder => {
            let textPreviewFiles = folder.dir.textPreviews.files;

            textPreviewFiles.forEach(file => {
                if (folder.dir.textPreviews.path != false) {
                    let encoding = file.name.includes('.pdf') ? "base64" : "utf8";
                    let data = fs.readFileSync(file.path, "utf8")
                    file.content = file.name.includes('.pdf') ? data : JSON.parse(data);
                }
            });
        });
        controller = true;

        if (controller == true) {
            resolve(folders);
        } else {
            reject("Something went wrong while getting json content.");
        }
    });
}