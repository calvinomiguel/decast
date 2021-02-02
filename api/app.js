const express = require('express');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const router = express.Router();
const fs = require('fs');
const fsp = fs.promises;
const ns = require('node-sketch');
const port = process.env.PORT || 3060;
const cors = require('cors');
const sketchtool = require('sketchtool-cli');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const exec = util.promisify(require('child_process').exec);
const {
	json
} = require('body-parser');
const dir = process.argv[2] || process.cwd() + '/uploads';
const outputDir = process.cwd() + '/exports';
const unzippedOutput = process.cwd() + '/sketch'
const dataDir = process.cwd() + '/data';
const upload = multer({
	dest: './uploads/'
});
const _ = require('lodash');
const flatten = require('flat');
const unflatten = require('flat').unflatten;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);

//Store original and current file names in array
function storeFileNames(requestData) {
	return new Promise((resolve, reject) => {
		let fileNames = [];
		requestData.forEach(file => {
			fileNames.push({
				oName: file.originalname,
				tmpName: file.filename
			});
		});
		if (fileNames.length > 0) {
			resolve(fileNames);
		} else {
			reject('Failed storing original and current file names in an array.');
		}
	});
}

//Function for changing the names of the uploaded files to original name
function changeFileNames(fileNames) {
	return new Promise((resolve, reject) => {
		fileNames.forEach(nameGroup => {
			let tmpPath = `${dir}/${nameGroup.tmpName}`;
			let oPath = `${dir}/${nameGroup.oName.replace(/[- )(]/g, '')}`;
			fs.renameSync(tmpPath, oPath, () => {
				console.log(`${nameGroup.tmpName} was renamed to ${nameGroup.oName}!`);
			});
		});
		if (fileNames) {
			resolve(fileNames);
		} else {
			reject('Failed in changing tmp file names to original file names.');
		}
	});
}

//Get all file names in upload directory
function getFileNames() {
	return new Promise((resolve, reject) => {
		let fileNames = [];
		fs.readdir(dir, (err, files) => {
			if (err) {
				reject(err);
			} else {
				files.forEach(file => {
					if (file.includes('.sketch')) {
						fileNames.push({
							name: file,
							path: dir + '/' + file
						});
					}
				});
				if (fileNames.length > 0) {
					resolve(fileNames);
				} else {
					reject('No files found.');
				}
			}
		});
	});
}

//Get pages globally
async function getGlobalPages(files) {
	let globalPages = [];
	let globalPagesRestructured = [];

	for (let file of files) {
		const sketch = await ns.read(file.path);
		globalPages.push(...sketch.pages);
	}

	for (let page of globalPages) {
		globalPagesRestructured.push({
			name: page.name,
			_class: page._class,
			do_objectID: page.do_objectID,
			//layers: page.layers
		});
	}
	let objSchema = {
		files: files,
		pages: [...globalPagesRestructured]
	};
	return objSchema;
};

//Get pages locally
async function getPages(objSchema) {
	let files = objSchema.files;
	for (let file of files) {
		const sketch = await ns.read(file.path);
		let pages = sketch.pages;
		let pageList = [];
		for (let page of pages) {
			pageList.push({
				name: page.name,
				_class: page._class,
				do_objectID: page.do_objectID,
			})
		}
		file.pages = [...pageList];
	}
	return objSchema;
}

//Get all symbols locally
async function getSymbols(objSchema) {
	let files = objSchema.files;
	//Get all foreign and local symbols and push them in file object
	for (let file of files) {
		let symbols = [];
		let sketch = await ns.read(file.path);
		let masterSymbols = sketch.symbols;
		let foreignSymbols = sketch.foreignSymbols;
		symbols.push(...masterSymbols);
		symbols.push(...foreignSymbols);
		file.symbols = symbols;
	}
	return objSchema;
}

//Restructure symbols objects
function restructureSymbolsObj(objSchema) {
	return new Promise((resolve, reject) => {
		let files = objSchema.files;
		//Restructure symbol objects
		for (let file of files) {
			let symbolArr = [];
			let symbols = file.symbols;
			for (let symbol of symbols) {
				if (symbol._class == 'MSImmutableForeignSymbol') {
					//let _libraryID = symbol.libraryID;
					let _sourceLibraryName = symbol.sourceLibraryName;
					let _originalFileName = symbol.sourceLibraryName + '.sketch';
					let _currentFileName = file.name;
					let _name = symbol.originalMaster.name;
					let _symbolClass = symbol.originalMaster._class;
					let _originalMasterID = symbol.originalMaster.symbolID;
					let _symbolMasterID = symbol.symbolMaster.symbolID;
					let _objectID = symbol.symbolMaster.do_objectID;
					symbolArr.push({
						//libraryID: _libraryID,
						sourceLibraryName: _sourceLibraryName,
						originalFileName: _originalFileName,
						currentFileName: _currentFileName,
						name: _name,
						_class: _symbolClass,
						originalMasterId: _originalMasterID,
						symbolMasterID: _symbolMasterID,
						do_objectID: _objectID
					});
				}
				if (symbol._class == 'symbolMaster') {
					//let _libraryID = false;
					let _sourceLibraryName = false;
					let _currentFileName = file.name;
					let _originalFileName = file.name;
					let _name = symbol.name;
					let _symbolClass = symbol._class;
					let _originalMasterID = symbol.symbolID;
					let _symbolMasterID = false;
					let _objectID = symbol.do_objectID;
					symbolArr.push({
						//libraryID: _libraryID,
						sourceLibraryName: _sourceLibraryName,
						name: _name,
						currentFileName: _currentFileName,
						originalFileName: _originalFileName,
						_class: _symbolClass,
						originalMasterId: _originalMasterID,
						do_objectID: _objectID,
						symbolMasterID: _symbolMasterID,
					})
				}
			};
			file.symbols = symbolArr;
		}
		if (objSchema) {
			resolve(objSchema);
		} else {
			reject('Something went wrong.');
		}
	});
}

//Restructure symbols objects and set them globally
function uniteIdenticalSymbols(objSchema) {
	return new Promise((resolve, reject) => {
		let files = objSchema.files;
		let array = [];
		let symbolList = []
		let data;

		//Set all symbols in one array
		for (let file of files) {
			symbolList.push(...file.symbols);
		}

		//Reduce symbols to unique IDs
		for (let file of files) {
			data = symbolList.reduce((acc, v) => {
				const exists = acc[v.originalMasterId];
				if (exists) {
					// if current obj is an instance of master
					if (v.symbolMasterID) {
						// push to id to master's symbols array
						acc[v.originalMasterId].symbolIDs.push(v.symbolMasterID);
					}
					return acc;
				}

				// if doesnt exist, make a new entry in accumulator
				const entry = {
					...v,
					symbolIDs: []
				}
				const symbolMasterID = v.symbolMasterID;

				// since symbolMasterID is false, we can just remove it from object
				// it gets replaced by symbols array anyways
				delete entry.symbolMasterID;

				// if we're iterating over an instance of a symbol and not a master component
				// (because the array isnt sorted to have symbolMasterID:false first)
				if (symbolMasterID) {
					// then push into symbols
					entry.symbolIDs.push(symbolMasterID);
				}

				// push entry into accumulator, unique by originalMasterId
				acc[v.originalMasterId] = entry;
				return acc;
			}, {});
		}

		//Remove symbol ID as property
		for (const [key, value] of Object.entries(data)) {
			array.push(value);
		}

		objSchema.symbols = [...array];

		if (objSchema.hasOwnProperty('files', 'symbols')) {
			resolve(objSchema);
		} else {
			reject('Could not get list of unique symbols.');
		}
	});
}

//Recursive function to get symbols nested in groups
function getSymbolsInGroups(groupsArr, symbolsArr) {
	let groupLayers = groupsArr.filter(group => group.hasOwnProperty("layers"));
	let layers = [];
	let symbols;
	let subGroups;
	for (let group of groupLayers) {
		layers.push(...group.layers);
	}

	if (layers.length > 0) {
		symbols = layers.filter(layer => layer._class == 'symbolInstance');
		subGroups = layers.filter(layer => layer._class == 'group');
		symbolsArr.push(...symbols);
		return getSymbolsInGroups(subGroups, symbolsArr);
	} else {
		return symbolsArr;
	}
}

async function getArtboards(objSchema) {
	let files = objSchema.files;
	let obj = [];
	let artboards = [];
	let totalArtboards = 0;
	for (let file of files) {
		const sketch = await ns.read(file.path);
		let pages = sketch.pages;
		let layers = [];
		let boards;

		//Push all layers of the file pages into layers array
		for (let page of pages) {
			layers.push(...page.layers);
		}

		//Filter layers array for layers of the class artboard
		boards = layers.filter(layer => layer._class == 'artboard');

		for (let board of boards) {
			//Push the artboards layers into the layers array
			artboards.push({
				file: {
					name: file.name,
					path: file.path
				},
				name: board.name,
				//_class: board._class,
				do_objectID: board.do_objectID,
				layers: [...board.layers]
			});
		}

		for (let artboard of artboards) {
			let boardLayers = [...artboard.layers];

			let groups = boardLayers.filter(layer => layer._class == "group");
			let symbols = boardLayers.filter(layer => layer._class == "symbolInstance");
			symbols = getSymbolsInGroups(groups, symbols);

			let symbolInstances = [];
			for (let symbol of symbols) {
				symbolInstances.push(symbol.symbolID);
			}
			artboard.symbolInstances = symbolInstances;
			//Get total count of artboards
			//totalArtboards += 1;

		}
	}
	for (let artboard of artboards) {
		delete artboard.layers;
	}

	obj = {
		//totalArtboards: totalArtboards,
		artboards: [...artboards]
	};
	return obj;
}

async function getGlobalSymbolInstances(objSchema) {
	const files = objSchema.files;
	let pages = [];
	let layers = [];
	let symbolInstances;
	let artboards;
	let artboardLayers = [];
	let artboardSymbolInstances;
	//Get pages of all files
	for (let file of files) {
		const sketch = await ns.read(file.path);
		pages.push(...sketch.pages);
	}

	//Get layers of all pages
	for (let page of pages) {
		layers.push(...page.layers)
	}

	//Filter all artboards from the layers
	artboards = layers.filter(layer => {
		return layer._class == 'artboard';
	});

	//Filter all symbol instances outside of artboards
	symbolInstances = artboards.filter(layer => {
		return layer._class == 'symbolInstance';
	});

	//Filter all group layers outside of artboards
	groups = artboards.filter(layer => {
		return layer._class == 'group'
	});

	//Get all symbols inside of groups
	symbolInstances = getSymbolsInGroups(groups, symbolInstances);


	//Get all layers from the artboards
	for (let artboard of artboards) {
		artboardLayers.push(...artboard.layers);
	}

	//Filter all symbolInstances from the layers
	artboardSymbolInstances = artboardLayers.filter(layer => layer._class == 'symbolInstance');
	groups = artboardLayers.filter(layer => layer._class == 'group');
	artboardSymbolInstances = getSymbolsInGroups(groups, artboardSymbolInstances);
	symbolInstances.push(...artboardSymbolInstances);

	objSchema.symbolInstances = symbolInstances;
	return objSchema;
}

function getGlobalSymbolsCount(objSchema) {
	return new Promise((resolve, reject) => {
		const files = objSchema.files;
		let symbols = objSchema.symbols;
		let symbolInstances = objSchema.symbolInstances;

		symbols.forEach(symbol => {
			let count = 0;
			let symbolIds = symbol.symbolIDs;
			let originalMasterId = symbol.originalMasterId;
			symbolInstances.forEach(instance => {
				if (instance.symbolID == originalMasterId) {
					count = count + 1;
				}
			});
			if (symbolIds != false) {
				symbolIds.forEach(symbolID => {
					symbolInstances.forEach(instance => {
						if (symbolID == instance.symbolID) {
							count = count + 1
						}
					});
				});
			}
			symbol.count = count;
		});

		delete objSchema.symbolInstances;

		if (files) {
			resolve(objSchema);
		} else {
			reject('Could not get symbol counts');
		}
	});
}

//Export symbol
function exportComponent(sketchFile, symbolId) {
	sketchtool.run('export layers ' + dir + '/' + sketchFile + ' --item=' + symbolId + ' --formats=png --scales=2 --use-id-for-name --save-for-web --output=' + outputDir + '/symbols');
}

//Export artboards
function exportArtboards(sketchFile) {
	sketchtool.run('export artboards ' + dir + '/' + sketchFile + ' --formats=jpg --scales=2 --use-id-for-name --save-for-web --output=' + outputDir + '/artboards');
}

async function getSketchFileNames() {
	let filenames = [];
	let files = await getFileNames()
	files.forEach(file => {
		filenames.push(file.name);
	});
	return filenames;
}

async function unzipFiles() {
	let filenames = await getSketchFileNames();
	let paths = [];
	for (let filename of filenames) {
		let sketchPath = dir + "/" + filename;
		filename = filename.replace('.sketch', '');
		let unzippedPath = unzippedOutput + '/' + filename;
		if (!fs.existsSync(unzippedPath)) {
			const {
				stdout,
				stderr
			} = await exec('unzip ' + sketchPath + ` -d ${unzippedPath}`);
		}

		paths.push(`${unzippedPath}`);
	}
	return paths;
}

async function readJsonFile(path, filename) {
	let data = await readFile(path + '/' + filename, 'utf8');
	return data;
}

async function removeSymbolFromDocument(paths, originalMasterId) {

	for (let path of paths) {

		//Read document.json
		let data = await readJsonFile(path, 'document.json');
		data = JSON.parse(data);

		const newForeignSymbols = data.foreignSymbols.filter((foreignSymbol) => {
			const fOriginalMasterId = foreignSymbol.originalMaster.symbolID;
			return fOriginalMasterId !== originalMasterId;
		});

		console.log(`Looking in ${path}`)
		console.log(`${data.foreignSymbols.length - newForeignSymbols.length} foreignSymbols with ID ${originalMasterId} found. Removing...`)
		data.foreignSymbols = newForeignSymbols;

		try {
			await fsp.writeFile(path + '/document.json', JSON.stringify(data))
		} catch (error) {
			console.error('Error writing document.json', error)
		}

	}
}

async function removeSymbolFromPages(paths, originalMasterId, symbolIds) {
	for (let sketchFilePath of paths) {
		console.log(`Looking in ${sketchFilePath}`)

		const files = await fsp.readdir(`${sketchFilePath}/pages`);
		const pages = files.filter(i => i.endsWith('.json'))

		for (const pageName of pages) {
			console.log(`Reading page ${pageName}`)

			//Read page json
			let data = await readJsonFile(`${sketchFilePath}/pages`, pageName);
			data = JSON.parse(data);

			// if symbols page, remove master and skip to next page
			const isSymbolsPage = data.layers.some(i => i._class === 'symbolMaster')
			if (isSymbolsPage) {

				// loop through all layers and remove the ones that match originalMasterId
				const newLayers = data.layers.filter(i => originalMasterId !== i.symbolID)

				// and replace original page's layers
				data.layers = newLayers

				console.log(`Removed ${data.layers.length - newLayers.length} symbols from Symbols page`)

				// save page to file
				try {
					await fsp.writeFile(`${sketchFilePath}/pages/${pageName}`, JSON.stringify(data))
				} catch (error) {
					console.error(`Error writing ${pageName}`, error)
				}

				// skip to next page
				continue;
			}

			// if page is not a symbols page, we need to traverse all the `layers` in each group/subcomponent/symbol/etc

			// to do this, we converted the heavily-nested object into a 1-deep flattened object
			// this means { foo: {bar: { bazz: 1 } } } turns into { 'foo.bar.bazz': 1 } and so on
			const flattened = flatten(data.layers)

			// we then extract all the paths (keys) that have `[index].symbolID`
			// to do this, we write a regex to recognize what part of the path is an array index
			const cleaned = Object.entries(flattened).reduce((acc, [path, value]) => {
				if (/\d+\.symbolID/.test(path)) {
					// we check if the value === originalMasterId OR one of the symbolIds from frontend
					if ([originalMasterId, ...symbolIds].includes(value)) {
						acc[path] = value
					}
				}
				return acc
			}, {})
			// and we put all the matching results into a new object, filtering them out of `flattened`

			// because we only flattened the data.layers, we need to add layers back to the path
			// so we can do a full search in the data object (page) later
			const pathsToDelete = Object.keys(cleaned).map(i => {
				return `layers.${i.replace('.symbolID', '')}`
			})

			const toFilter = {}

			// for each path we need to delete
			pathsToDelete.forEach(symbolPath => {
				// we get the actual symbol object from the path via lodash.get
				const symbol = _.get(data, symbolPath)

				// we get the layers array, 
				const symbolArrayPath = symbolPath.split(/\.\d+$/)[0]
				const parentOfArrayPath = symbolArrayPath.split(/\.layers$/)[0]

				if (toFilter[parentOfArrayPath]) {
					toFilter[parentOfArrayPath].push(symbol.do_objectID)
				} else {
					toFilter[parentOfArrayPath] = [symbol.do_objectID]
				}
			})

			Object.entries(toFilter).forEach(([groupPath, objectIDs]) => {
				let group;

				if (groupPath === 'layers') {
					group = data
				} else {
					group = _.get(data, groupPath)
				}

				group.layers = group.layers.filter(i => !objectIDs.includes(i.do_objectID))
			})


			try {
				await fsp.writeFile(`${sketchFilePath}/pages/${pageName}`, JSON.stringify(data))
			} catch (error) {
				console.error(`Error writing ${pageName}`, error)
			}
		}
	}
}

async function deleteSymbol(originalMasterId, symbolIds) {
	let unzippedPaths = await unzipFiles();

	// remove from non-master files
	await removeSymbolFromDocument(unzippedPaths, originalMasterId);

	// remove from all artboards across all pages
	await removeSymbolFromPages(unzippedPaths, originalMasterId, symbolIds);
}

async function rezipFiles(filenames) {
	let files = filenames;
	for (let file of files) {
		let filename = file.replace(".sketch", "");
		let unzippedPath = unzippedOutput + '/' + filename;
		const { stdout, stderr } = await exec(`cd ${unzippedPath} && zip -r -X ${dir}/${filename}.sketch ./*`);
	};
}

//Upload files, process data, create json file
app.post('/uploads', upload.array('files'), async (req, res) => {
	let reqData = req.files;
	let fileNames = await storeFileNames(reqData);
	fileNames = await changeFileNames(fileNames);
	let files = await getFileNames();
	files = await getGlobalPages(files);
	let artboards = await getArtboards(files);

	files = await getSymbols(files);
	files = await restructureSymbolsObj(files);
	files = await uniteIdenticalSymbols(files);
	files = await getGlobalSymbolInstances(files);
	files = await getGlobalSymbolsCount(files);

	let totalSymbols = 0;
	let symbolsArr = [...files.symbols];
	for (let symbol of symbolsArr) {
		totalSymbols += 1;
	}
	files.totalSymbols = totalSymbols;
	files = Buffer.from(JSON.stringify(files));
	await fsp.writeFile(dataDir + '/data.json', files, () => {
		console.log('Data file created');
	});

	//Loop through array in artboards object
	//to get total number of artboards
	let totalArtboards = 0;
	for (let artboard of artboards.artboards) {
		totalArtboards += 1;
	}
	//Push number into object
	artboards.totalArtboards = totalArtboards;

	//Stringify object
	artboards = Buffer.from(JSON.stringify(artboards));

	//Create json file
	await fsp.writeFile(dataDir + '/artboards.json', artboards, () => {
		console.log('Artboards file created');
	});
	res.status(200).send(files);
});

//Send json file to client
router.get('/data', async (req, res, next) => {
	let fileName = 'data.json';
	res.sendFile(dataDir + '/' + fileName, (err) => {
		if (err) {
			next(err);
		} else {
			console.log('Sent:', fileName);
		}
	});
});

//Get suggestions
router.get('/suggestions', async (req, res, next) => {
	let data = await readFile(dataDir + '/data.json', 'utf8');
	data = JSON.parse(data);
	let symbols = data.symbols;
	let notUsed = symbols.filter(symbol => symbol.count == 0);
	let usedOnce = symbols.filter(symbol => symbol.count == 1);
	let duplicates = [];


	for (let a = 0; a < symbols.length; a++) {
		let currentVal = symbols[a];
		for (let b = 0; b < symbols.length; b++) {
			let compareVal = symbols[b];

			if (compareVal.name == currentVal.name && a != b) {
				if (!symbols.includes(compareVal)) {
					duplicates.push(compareVal);
				}
			}
		}
	}
	let suggestions = [
		{
			suggestion: `${notUsed.length} components aren't being used`,
			status: notUsed.length > 0 ? true : false,
		},
		{
			suggestion: `${usedOnce.length} components are used only once`,
			status: usedOnce.length > 0 ? true : false,
		},
		{
			suggestion: `${duplicates.length} components with conflicting names`,
			status: duplicates.length > 0 ? true : false,
		},
	];

	res.status(200).send(suggestions);
});


//Send artboards json file to client
router.get('/artboards/data', async (req, res, next) => {
	let fileName = 'artboards.json';
	res.sendFile(dataDir + '/' + fileName, (err) => {
		if (err) {
			next(err);
		} else {
			console.log('Sent:', fileName);
		}
	});
});

//Export symbol and send to client
router.get('/component/', async (req, res, next) => {
	let symbolId = req.query.id;
	let fileName = req.query.origin;
	let imgPath = outputDir + '/symbols/' + symbolId + '@2x.png';
	let sketchFilePath = dir + '/' + fileName;

	try {
		//If rootfile doesn't exist send message to client
		if (!fs.existsSync(sketchFilePath)) {
			res.status(200).send({
				message: false,
				file: fileName
			});
		} else {

			//Else check if img of the file to be export already exists
			//If not export and send to client
			//if (!fs.existsSync(imgPath)) {//}
			res.set({
				'Content-Type': 'image/png'
			});

			res.sendFile(imgPath, (err) => {
				if (err) {
					next(err);
				} else {
					//console.log('Sent:', symbolId);
				}
			});
		}

	} catch (err) {
		console.error(err);
	}
});

//Export all symbols to exports -> symbols
router.get('/components/', async (req, res) => {
	let data = await readFile(dataDir + '/data.json', 'utf8');
	data = JSON.parse(data);
	let symbols = data.symbols;

	for (let symbol of symbols) {
		let sketchFile = symbol.currentFileName;
		let symbolId = symbol.do_objectID;
		exportComponent(sketchFile, symbolId);
	}

	res.status(200).send('symbols');
});

//Export all artboards to exports -> artboards
router.get('/artboards/', async (req, res, next) => {
	try {
		let filePath = req.query.filePath;
		let fileName = req.query.fileName;
		let lastFile = req.query.lastFile;

		//If start the process only if axf.json file doesn't exist
		if (!fs.existsSync(dataDir + '/axf.json')) {
			//If file doesn't exist send message to client
			if (!fs.existsSync(filePath)) {
				res.status(200).send('While trying to export artboards decast couldn\'t find ' + fileName);
			} else {
				//Export all artboards of the files
				exportArtboards(fileName);

				//Check if this was the last file
				//If true, create an axf.json file for controlling purposes later
				if (lastFile.includes("true")) {
					let fileContent = {
						work: "finished"
					};
					fileContent = JSON.stringify(fileContent);
					await fsp.writeFile(dataDir + '/axf.json', fileContent, () => {
						console.log('Data file created');
					});
				}
				res.send(fileName + ' was exported');
			}
		}
	} catch (err) {
		next(err);
	}
});

//Send artboard img to client
router.get('/component/artboards', async (req, res, next) => {
	let do_objectID = req.query.do_objectID;
	let imgPath = outputDir + '/artboards/' + do_objectID + '@2x.jpg';
	try {
		if (do_objectID != undefined) {
			if (fs.existsSync(imgPath)) {
				res.set({
					'Content-Type': 'image/jpeg'
				});

				res.sendFile(imgPath, (err) => {
					if (err) {
						next(err);
					} else {
						//console.log('Sent:', symbolId);
					}
				});
			}
		}
	} catch (err) {
		console.error(err);
	}
});

//Send artboards stats data to client
router.get('/stats/', async (req, res) => {
	let data = await readFile(dataDir + '/artboards.json', 'utf8'); //Get data.json file content
	let originalMasterId = req.query.originalMasterId;
	let symbolIds = req.query.symbolIds;
	data = JSON.parse(data);
	let artboards = data.artboards; //Parse data
	let totalArtboards = data.totalArtboards;
	let artboardsCount = 0;

	for (let artboard of artboards) {
		let instancesIDs = artboard.symbolInstances;

		let originalIdExists = instancesIDs.some((id) => id == originalMasterId);
		let symbolIdExists = false;

		if (symbolIds != undefined) {
			symbolIdExists = instancesIDs.some(id => symbolIds.includes(id));
		}

		if (originalIdExists == true || symbolIdExists == true) {
			artboardsCount += 1;
		}
		//console.log(originalIdExists, symbolIdExists);
	}

	let deliverable = {
		artboardsUsing: artboardsCount,
		totalArtboards: totalArtboards
	}

	res.send(deliverable);
});

//Delete symbol
router.post('/delete/symbol', async (req, res) => {
	//Get sketch file names to use later as argument
	let filenames = await getSketchFileNames();

	//Get ids from client
	let originalMasterId = req.body.params.originalMasterId;
	let symbolIds = req.body.params.symbolIds;

	//Delete symbol from sketch files
	await deleteSymbol(originalMasterId, symbolIds);

	//Delete original sketch files
	let isSketchFiles = await fsp.readdir(dir);
	isSketchFiles = isSketchFiles.includes('.DS_Store') && isSketchFiles.length == 1 || isSketchFiles.length == 0;

	if (isSketchFiles) {
		console.log('No data files found.');
	} else {
		const deleteData = await exec('rm ' + dir + '/*');
	}

	//Archive edited sketch files as new sketch files
	await rezipFiles(filenames);

	//Delete all files in data directory
	const {
		stdout,
		stderr
	} = await exec('rm ' + dataDir + '/*');
	let files = await getFileNames();
	files = await getGlobalPages(files);
	let artboards = await getArtboards(files);

	files = await getSymbols(files);
	files = await restructureSymbolsObj(files);
	files = await uniteIdenticalSymbols(files);
	files = await getGlobalSymbolInstances(files);
	files = await getGlobalSymbolsCount(files);

	let totalSymbols = 0;
	let symbolsArr = [...files.symbols];
	for (let symbol of symbolsArr) {
		totalSymbols += 1;
	}
	files.totalSymbols = totalSymbols;
	files = Buffer.from(JSON.stringify(files));
	await fsp.writeFile(dataDir + '/data.json', files, () => {
		console.log('Data file created');
	});

	//Loop through array in artboards object
	//to get total number of artboards
	let totalArtboards = 0;
	for (let artboard of artboards.artboards) {
		totalArtboards += 1;
	}
	//Push number into object
	artboards.totalArtboards = totalArtboards;

	//Stringify object
	artboards = Buffer.from(JSON.stringify(artboards));

	//Create json file
	await fsp.writeFile(dataDir + '/artboards.json', artboards, () => {
		console.log('Artboards file created');
	});
	res.send('Symbol deleted successfully.')
});

//Delete symbols
router.post('/delete/symbols/', async (req, res) => {
	//Get sketch file names to use later as argument
	let filenames = await getSketchFileNames();

	//Get symbols from query
	let symbols = req.body.params.symbols;

	for (let symbol of symbols) {
		//Get ids from client
		let originalMasterId = symbol.originalMasterId;
		let symbolIds = symbol.symbolIDs;

		//Delete symbol from sketch files
		await deleteSymbol(originalMasterId, symbolIds);

		//Delete original sketch files
		let isSketchFiles = await fsp.readdir(dir);
		isSketchFiles = isSketchFiles.includes('.DS_Store') && isSketchFiles.length == 1 || isSketchFiles.length == 0;

		if (isSketchFiles) {
			console.log('No data files found.');
		} else {
			const deleteData = await exec('rm ' + dir + '/*');
		}

		//Archive edited sketch files as new sketch files
		await rezipFiles(filenames);
	}

	//Delete all files in data directory
	const {
		stdout,
		stderr
	} = await exec('rm ' + dataDir + '/*');
	let files = await getFileNames();
	files = await getGlobalPages(files);
	let artboards = await getArtboards(files);

	files = await getSymbols(files);
	files = await restructureSymbolsObj(files);
	files = await uniteIdenticalSymbols(files);
	files = await getGlobalSymbolInstances(files);
	files = await getGlobalSymbolsCount(files);

	let totalSymbols = 0;
	let symbolsArr = [...files.symbols];
	for (let symbol of symbolsArr) {
		totalSymbols += 1;
	}
	files.totalSymbols = totalSymbols;
	files = Buffer.from(JSON.stringify(files));
	await fsp.writeFile(dataDir + '/data.json', files, () => {
		console.log('Data file created');
	});

	//Loop through array in artboards object
	//to get total number of artboards
	let totalArtboards = 0;
	for (let artboard of artboards.artboards) {
		totalArtboards += 1;
	}
	//Push number into object
	artboards.totalArtboards = totalArtboards;

	//Stringify object
	artboards = Buffer.from(JSON.stringify(artboards));

	//Create json file
	await fsp.writeFile(dataDir + '/artboards.json', artboards, () => {
		console.log('Artboards file created');
	});

	res.status(200).send();
});

//Export project files
router.get('/export', async (req, res) => {
	//Zip all files in upload directory
	const {
		stdout,
		stderr
	} = await exec('zip -r -j ' + dir + '/decast.zip uploads/*');

	res.download(dir + '/decast.zip');
});

//Deletes exported ZIP 
router.get('/delete-zip', async (req, res) => {
	//Zip all files in upload directory
	const {
		stdout,
		stderr
	} = await exec('rm ' + dir + '/decast.zip');

	res.status(200).send('decast.zip deleted.');

});

//Delete all project files
router.get('/delete-project', async (req, res) => {

	let isDataFiles = await fsp.readdir(dataDir);
	isDataFiles = isDataFiles.includes('.DS_Store') && isDataFiles.length == 1 || isDataFiles.length == 0;

	let isArtboardFiles = await fsp.readdir(outputDir + '/artboards/');
	isArtboardFiles = isArtboardFiles.includes('.DS_Store') && isArtboardFiles.length == 1 || isArtboardFiles.length == 0;

	let isSymbolFiles = await fsp.readdir(outputDir + '/symbols/');
	isSymbolFiles = isSymbolFiles.includes('.DS_Store') && isSymbolFiles.length == 1 || isSymbolFiles.length == 0;

	let isSketchFiles = await fsp.readdir(dir);
	isSketchFiles = isSketchFiles.includes('.DS_Store') && isSketchFiles.length == 1 || isSketchFiles.length == 0;

	let isUnzippedFiles = await fsp.readdir(unzippedOutput);
	isUnzippedFiles = isUnzippedFiles.includes('.DS_Store') && isUnzippedFiles.length == 1 || isUnzippedFiles.length == 0;

	if (isDataFiles) {
		console.log('No data files found.');
	} else {
		const deleteData = await exec('rm ' + dataDir + '/*');
	}

	if (isArtboardFiles) {
		console.log('No artboards found.');
	} else {
		const deleteArtboards = await exec('rm ' + outputDir + '/artboards/*');
	}

	if (isSymbolFiles) {
		console.log('No symbols found.');
	} else {
		const deleteSymbols = await exec('rm ' + outputDir + '/symbols/*');
	}

	if (isSketchFiles) {
		console.log('No sketch files found.');
	} else {
		const deleteSketchFiles = await exec('rm ' + dir + '/*');
	}
	if (isUnzippedFiles) {
		console.log('No unzipped files found.');
	} else {
		const deleteUnzippedFiles = await exec('rm -r ' + unzippedOutput + '/*');
	}
	res.status(200).send();
});

router.get('/getcomponents', async (req, res) => {
	let data = await readFile(dataDir + '/data.json', 'utf8');
	data = JSON.parse(data);
	let symbols = data.symbols;
	let deliverable = [];
	for (let symbol of symbols) {
		deliverable.push({
			name: symbol.name,
			do_objectID: symbol.do_objectID,
			sketchFile: symbol.originalFileName,
		});
	}

	res.send(deliverable);
});

app.get('/getcomponentimg', async (req, res) => {
	let do_objectID = req.query.do_objectID;
	let imgPath = outputDir + '/symbols/' + do_objectID + '@2x.png';
	try {
		if (do_objectID != undefined) {
			if (fs.existsSync(imgPath)) {
				res.set({
					'Content-Type': 'image/png'
				}).sendFile(imgPath, (err) => {
					if (err) {
						next(err);
					} else {
						//console.log('Sent:', symbolId);
					}
				});
			}
		}
	} catch (err) {
		console.error(err);
	}
});

router.get('/getartboards', async (req, res) => {
	let data = await readFile(dataDir + '/artboards.json', 'utf8');
	data = JSON.parse(data);
	let artboards = data.artboards;
	let deliverable = [];
	for (let artboard of artboards) {
		deliverable.push({
			name: artboard.name,
			do_objectID: artboard.do_objectID,
			sketchFile: artboard.file.name,
		});
	}
	res.send(deliverable);
});

router.get('/getartboardimg', async (req, res) => {
	let do_objectID = req.query.do_objectID;
	let imgPath = outputDir + '/artboards/' + do_objectID + '@2x.jpg';
	try {
		if (do_objectID != undefined) {
			if (fs.existsSync(imgPath)) {
				res.set({
					'Content-Type': 'image/jpeg'
				});

				res.sendFile(imgPath, (err) => {
					if (err) {
						next(err);
					} else {
						//console.log('Sent:', symbolId);
					}
				});
			}
		}
	} catch (err) {
		console.error(err);
	}
});
//Add router in the Express app.
app.use('/', router);

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});