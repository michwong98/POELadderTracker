//app.js
const express = require("express");
const app = express();
const path = require("path");
const request = require("request");
const cookieParser = require("cookie-parser");
require("./db.js");


const mongoose = require("mongoose");
const League = mongoose.model("League");
const Ladder = mongoose.model("Ladder");
const User = mongoose.model("User");

app.set("view engine", "hbs");
app.use(express.urlencoded({extended: false}));
const staticPath = path.resolve(__dirname, "public");
app.use(express.static(staticPath));
app.use(cookieParser());

app.use("/:path",function(req, res, next) { //checks if user is logged in or not
	const p = new Promise(function(fulfill) {
		const id = req.cookies.sessionid;
		User.findOne({"_id": id}, function(err, foundUser) {
			if (err) { //failed to find
				console.log(err);
				fulfill(false);
			} else if (foundUser === null) { //login doesn't exist
				fulfill(false);
			} else { //user is found, increments visits
				foundUser.visits++;
				foundUser.save(function(err) {
					if (err) {
						console.log(err);
						fulfill(false);
					} else {
						fulfill(true);
					}
				});
			}
		});
	});
	p.then(function(val) {
		if (val) { //logged in
			next();
		} else if (req.params.path !== "") { //redirect to index to log in
			res.redirect("/");
		} else { //normally unreachable
			next();
		}
	});
});

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;



app.get("/", (req, res) => {
	res.render("index.hbs");
});

app.post("/", (req, res) => {
	const name = req.body.name;
	const password = req.body.password;
	if (name === "" || password === "") { //missing field
		res.redirect("/");
	} else {
		User.findOne({"name": name, "password":password}, function(err, foundUser) {
			if (err) {
				console.log(err);
				res.redirect("/");
			} else if (foundUser === null) { //not an existing user, register
				const newUser = new User({
					"name": name,
					"password": password,
					"visits": 0
				});
				newUser.save(function(err) {
					if (err) {
						console.log(err);
						res.redirect("/");
					} else {
						res.set("Set-Cookie", `sessionid=${newUser["_id"]}`); //sessionid
						res.redirect("/leagues");
					}
				});
			} else { //user exists
				res.set("Set-Cookie", `sessionid=${foundUser["_id"]}`);
				res.redirect("/leagues");
			}
		});
	}
});

app.get("/initial", (req, res) => { //league information is missing, need to geneerate
	res.send("<a href=\"/leagues\">Initializing, if not redirect, please wait then try again</a>");
	//retrieve league information from api
	request("http://api.pathofexile.com/leagues?type=main&realm=pc&compact=1", (err, reponse, body) => {
		if (err) {
			console.log(err);
		} else {
			const leagues = JSON.parse(body);
			console.log(leagues);
			for (let i = 0; i < leagues.length; i++) {
				League.findOne({id: leagues[i].id}, (err, league) => {
					if (err) {
						console.log(err);
					} else {
						if (league === null) { //league doesn't already exist
							const leagueInfo = { //new league
								id: leagues[i].id,
								ladders: []
							};
							const newLeague = new League(leagueInfo);
							newLeague.save(function(err) {
								if (err) {
									console.log(err);
								}
							}); //end save
						} //end if
					} //end if else
				}); //end findOne
			} //end for
		} //end if else
	}); //end request
}); //end get /initial

app.get("/leagues", (req, res) => { //displays leagues or prompts to initialize league data
	League.find({}, (err, foundLeagues) => {

		if (err) {
			console.log(err);
			res.render("leagues-not-found.hbs");
		}
		if (foundLeagues.length > 0) {
			res.render("leagues.hbs", {leagues: foundLeagues});
		} else {
			res.render("leagues-not-found.hbs");
		}
	});
});

app.get("/leagues/raw", (req, res) => { //json of all leagues
	League.find({}, (err, foundLeagues) => {
		if (err) {
			console.log(err);
			res.redirect("/leagues");
		} else {
			res.json(foundLeagues);
		}
	});
});

app.get("/leagues/ladder/:id/raw", (req, res) =>{ //serves ladder json
	Ladder.findOne({"_id":req.params.id}, function(err, foundLadder) {
		if (err) {
			console.log(err);
			res.json({"error":"not found"});
		} else if (foundLadder == null) {
			res.send({"error":"not found"});
		}else {
			res.json(foundLadder);
		}
	});
});

app.get("/leagues/ladder/:id", (req, res) => { //redirect to graph
	res.redirect(`/leagues/ladder/${req.params.id}/graph`);
});

app.get("/leagues/ladder/:id/graph", (req, res) => {
	//displays the ladder data as a graph
	res.render("ladder-graph.hbs", {"id":req.params.id});
});

app.get("/search", (req, res) => { //form to add a new ladder

	League.find({}, (err, foundLeagues) => {

		if (err) {
			console.log(err);
		}
		res.render("search.hbs", {leagues: foundLeagues});

	});

});

const ladderFilter = { //used for url
	"depthsolo": "sort=depthsolo",
	"depth": "sort=depth",
	"labyrinth": "type=labyrinth&difficulty=4"
};

const classes = { //used for description and url
	"0":"scion",
	"1":"marauder",
	"2":"ranger",
	"3":"witch",
	"4":"duelist",
	"5":"templar",
	"6":"shadow"
};

app.post("/search", (req, res) => { //adds a new ladder to the database

	const leagueName = req.body.league;
	const ladderName = req.body.ladder;
	const classValue = req.body.class;

	let description = `${leagueName} ${ladderName}`;
	if (classValue != undefined) {
		description += ` ${classes[classValue]} only`;
	}


	if (leagueName == undefined || ladderName == undefined) {
		res.redirect("/search");
	} else {
		let url = `http://api.pathofexile.com/ladders/${leagueName}?${ladderFilter[ladderName]}&limit=25&realm=pc`;
		if (classValue != undefined) { //optinal class field
			url += `&class=${classValue}`;
		}
		Ladder.findOne({"url": url}, function(err, foundLadder) {
			if (err) {
				console.log(err);
				res.redirect("/leagues");
			} else if (foundLadder === null) { //ladder doesn't exist
				const newLadder = new Ladder({
					"type": ladderName,
					"description": description,
					"url": url,
					"data": [],
					"index": 0
				});
				newLadder.save(function(err) {
					if (err) {
						console.log(err);
					} else {
						League.findOne({"id":leagueName}, function(err, foundLeague) {
							if (err) {
								console.log(err);
							} else if (foundLeague != undefined) {
								foundLeague.ladders.push(newLadder);
								foundLeague.save(function(err) {
									if (err) {
										console.log(err);
										res.redirect("/search");
									} else {
										res.redirect("/leagues");
									}
								});
							}
						});
					}
				});
			} else {
				res.redirect("/leagues");
			}
		});

	}

});

app.get("/leagues/:league", (req, res) => { //json league obj
	League.findOne({"id": req.params.league}, function(err, foundLeague) {
		if (foundLeague == undefined) {
			res.redirect("/leagues");
		} else {
			res.json(foundLeague);
		}
	});
});

app.listen(process.env.PORT || 3000, () => {console.log("Server is listening.");});

const filter = {
	"labyrinth": function(entry) {
		return entry["time"];
	},
	"depth": function(entry) {
		return entry["character"]["depth"]["default"];
	},
	"depthsolo": function(entry) {
		return entry["character"]["depth"]["solo"];
	},

};

//setInterval(updateData, 846000); //updates completely every 24 hours

function updateData() { //updates all leagues and ladders
	console.log("Updating ladder data");
	League.find({}, function(err, foundLeagues) {
		for (let i = 0; i < foundLeagues.length; i++) {
			setTimeout(updateLeague.bind(null, foundLeagues[i]), 10000); //timeout to avoid rate limit
		}
	});
}

function updateLeague(league) {
	const ladders = league.ladders;
	const promises = []; //waits for all ladders to update before saving league
	for (let i = 0; i < ladders.length; i++) {
		const p = updateLadder(ladders[i], league);
		promises.push(p);
	}
	league.markModified("ladders");
	Promise.all(promises).then(function() {
		league.save(function(err) {
			if (err) {
				console.log(err);
			}
		});
	});

}

function updateLadder(ladder) {
	return new Promise(function(fulfill) {
		const ladderPromise = getLadderData(ladder.url); //gets json from api
		ladderPromise.then(function(response) {
			parseLadderData(response, ladder); //parses response
			fulfill(true); //ladder has finished updating
		})
	});
}

function getLadderData(url) { //xmlhttprequest for json from api
	return new Promise(function(fulfill) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.addEventListener("load", function(evt) {
			if (xhr.status >= 200 && xhr.status < 400) {
				const response = JSON.parse(xhr.responseText);
				if (response.hasOwnProperty("error")) {
					console.log(response.error);
					fulfill(null);
				} else {
					fulfill(response);
				}
			} else {
				console.log(`Error getting response from ${url} .`);
				fulfill(null);
			}
		});
		xhr.addEventListener("error", function(evt) {
			console.log("Error occurred during XMLHttpRequest.");
			fulfill(null);
		});
		xhr.send();
	});
}

function parseLadderData(response, ladder) {
	if (response === null) {
		return null;
	} else {
		//parsing the response for each individual entry and storing into a new array called newData
		const type = ladder.type;
		const newData = [];
		const entries = response.entries;
		for (let i = 0; i < entries.length; i++) {
			const entry = filter[type](entries[i]);
			newData.push(entry);
		}
		//parsing data
		const index = ladder.index; ladder.index = (index+1)%100; ladder.data[index] = newData;
		const id = ladder["_id"];
		const obj = {}; const indexstr = `data.${index}`; obj[indexstr] = newData; obj["index"] = (index+1)%100;
		Ladder.findOneAndUpdate({"_id":id}, {"$set":obj}, function(err) { //updating ladder
			if (err) {
				console.log(err);
				return [];
			} else {
				return newData;
			}
		});
	}
}