//db.js
const mongoose = require("mongoose");

const ladderSchema = new mongoose.Schema({
	"type": {type: String, required: true},
	"description": {type: String, required: true},
	"url": {type: String, required: true},
	"data": [[Number]],
	"index": Number
});
const Ladder = mongoose.model("Ladder", ladderSchema);

const leagueSchema = new mongoose.Schema({
	"id": {type: String, required: true},
	"ladders" : {type: [Ladder.schema], required: true}
});
mongoose.model("League", leagueSchema);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/poe';
}

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect(dbconf, {useNewUrlParser: true});