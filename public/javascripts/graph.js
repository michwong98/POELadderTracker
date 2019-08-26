var MYLIBRARY = MYLIBRARY || (function(){
	var _args = {}; // private

	return {
		init : function(Args) {
			_args = Args;
			// some other initialising
		},
		main : function() {
			const id = _args[0];
			const p = xhrpromise(id);
			p.then(function(response) {
				if (response !== null) {
					const data = response.data;
					const description = response.description;
					document.getElementById("ladder-title").appendChild(document.createTextNode(description));
					const parsedData = [];
					let x = 0;
					const lastIndex = response.index;
					let index = lastIndex;
					do {
						if (index < data.length && data[index].length > 0) {
							x += 1;
							for (let i = 0; i < data[index].length; i++) {
								parsedData.push({"x":x, "y":data[index][i]});
							}
						}
						index = (index+1)%100;
					} while (index !== lastIndex);
					const ctx = document.getElementById("myChart").getContext("2d");
					const chart = new Chart(ctx, {
						"type": "scatter",
						"data": {
							"labels": [],
							"datasets": [{
								"label": "Player Dataset",
								"backgroundColor":"rbg(255,99,132)",
								"borderColor":"rgb(255,99,132)",
								"data":parsedData
							}]
						},
						"options":{
							"pointHitDetectionRadius":1,
							"responsive":false,
							"scales":{
								"xAxes":[{
									"ticks": {
										"display":false,
										"beingAtZero":true,
										"padding":5
									},
								}],
								"yAxes":[{
									"scaleLabel":{
										"display":true,
										"labelString":yLabel[response.type]
									}
								}]
							},
							"legend":{
								"display":false
							},
						}
					});
				} else {
					const description = "No Ladder Found";
					document.getElementById("ladder-title").appendChild(document.createTextNode(description));
				}
			});
		}
	};
}());

const yLabel = {
	"labyrinth":"Time (seconds)",
	"depth": "Depth",
	"depthsolo": "Depth"
}

function xhrpromise(id) {
	return new Promise(function(fulfill) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", `/leagues/ladder/${id}/raw`)
		xhr.addEventListener("load", function(evt) {
			if (xhr.status >= 200 && xhr.status < 400) {
				const response = JSON.parse(xhr.responseText);
				if (response.hasOwnProperty("error")) {
					console.log(response["error"]);
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
			console.log("Error occurred during XMLHttpRequest");
			fulfill(null);
		})
		xhr.send();
	});
}