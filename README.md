The content below is an example project proposal / requirements document. Replace the text below the lines marked "__TODO__" with details specific to your project. Remove the "TODO" lines.

(___TODO__: your project name_)

# POE Ladder Tracker

## Overview

(___TODO__: a brief one or two paragraph, high-level description of your project_)

I'm interested in tracking user behavior in a game. Grinding Gear Games, the game development company behind Path of Exile, has certain player data publicly available. This data can be parsed and plotted. I want to get player information at set intervals, then use the new information to update previous plots and analysis. Path of Exile (POE) is an action RPG where player characters can grind experience. There is a ladder system where players can compete with others. I want to observe how the ladder changes real time. Additionally, the game has multiple classes and ladders, so I want to be able to filter based on search criteria. I want to track how ladder information changes over the last 24 hour period.

## Data Model

(___TODO__: a description of your application's data and their relationships to each other_) 

The application will store Users, and their information

* a user has a name, password and page visits
* a league contains all the ladders within a particular league
* a ladder's data unit is dependent on the type of ladder

(___TODO__: sample documents_)

An Example User:

```javascript
{
  "name": "admin",
  "password": "adminpass",
  "visits": 128
}
```

An Exmaple League:

```javascript
{
  "id": "Standard",
  "ladders": []
}
```
An Exmaple Ladder:

```javascript
{
  "type": "labyrinth",
  "url": "http://api.pathofexile.com/ladders/FAKELEAGUE?type=labyrinth"
  "description":"FAKELEAGUE labyrinth"
  "data": [[1,2,3,4],[1,2,3,4,5],[1,2,3,4,5,6,7]],
  "index": 3 //index is a pointer to the array position for the next data entry
}
```

## [Link to Commented First Draft Schema](db.js) 

(___TODO__: create a first draft of your Schemas in db.js and link to it_)

## Wireframes

(___TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc._)

/leagues - Shows all current leagues and any ladders currently being tracked belonging to the league

![ladder](documentation/ladder.png)

/search - Adds a new ladder to be tracked

![search](documentation/search.png)

/leagues/ladder/:id - Redirect to the graph of the ladder's data

![ladder plot](documentation/plot.png)

/leagues/ladder/:id/raw - Raw ladder data

/leagues/raw - Raw league data

## Site map

(___TODO__: draw out a site map that shows how pages are related to each other_)

Here's [a crude example](documentation/site-map.png) of how the pages are related to each other. References refers to that the page contains a link that redirects to the other page. Redirect means it redirects on the GET request.

## User Stories or Use Cases

(___TODO__: write out how your application will be used through [user stories](http://en.wikipedia.org/wiki/User_story#Format) and / or [use cases](https://www.mongodb.com/download-center?jmp=docs&_ga=1.47552679.1838903181.1489282706#previous)_)

1. user views current ladders (various leagues)
2. user goes to a search page
3. user searches league (optionally ladder type)
4. user returns to league page
5. user selects and views various ladder graphs from the league page


## Research Topics

(___TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed_)

* (3 points) Client-side JavaScript library or module that we did not cover in class
    * I'm going to be Chart.js to present the data
    * Make several plots using the raw data
    * Demonstrates trends
* (5 points) External API Used
    * Using Grinding Gears Game's public API for POE's ladders
    * Continually get raw data from the API
    * Parse the data as more data is being retrieved on the API
    * API Documentation: https://www.pathofexile.com/developer/docs/api-resource-ladders

8 points total out of 8 required points (___TODO__: addtional points will __not__ count for extra credit_)


## [Link to Initial Main Project File](app.js) 

(___TODO__: create a skeleton Express application with a package.json, app.js, views folder, etc. ... and link to your initial app.js_)

## Annotations / References Used

(___TODO__: list any tutorials/references/etc. that you've based your code off of_)

1. [documentation on Chart.js](https://www.chartjs.org/docs/latest/)
2. [parameters for external javascript](https://stackoverflow.com/questions/2190801/passing-parameters-to-javascript-files)
3. [html and css syntax](https://www.w3schools.com/)
4. [mongoose documentation](https://mongoosejs.com/docs/api.html)
5. [promise usage](https://javascript.info/promise-chaining)