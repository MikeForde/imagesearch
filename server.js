// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongodb = require('mongodb');
var mongo = require('mongodb').MongoClient;
var url = "mongodb://testuser:testpass@ds161032.mlab.com:61032/dbimagesearch";
const Bing = require('node-bing-api')({accKey : 'c9123a83978842fc87a535db22bd2e9a'});
//var util = require('util');


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  //base address only entered - go to default page with instructions on use
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/api/imagesearch/:searchVal*", function (req, response) 
{
  
  
  var { searchVal } = req.params;
  var { offset } = req.query;
  
  var doc = {
      searchVal: searchVal,
      searchDate: new Date()
  }
  
  
  // Bing/end point stuff
  Bing.images(searchVal, {
  count: 10,   // Number of results (max 50) 
  offset: offset    // Skip first 3 result 
  }, function(error, res, body){
    //console.log(body.value.count);
    
    var arrValues = body.value;
    var arrReturn = [];
    
    var lenArrVals = arrValues.length;
    
    for(var x=0;x<lenArrVals;x++){
      var obj = {
        url: arrValues[x].webSearchUrl,
        snippet: arrValues[x].name,
        thumbnail: arrValues[x].thumbnailUrl,
        context: arrValues[x].hostPageDisplayUrl
      }
      arrReturn.push(obj);
    }
    
    //url - actual image location --> webSearchUrl
    //snippet - title -> name
    
    //thumbnail - thumbnail of image --> thumbnailUrl
    //context --> hostPageDisplayUrl
    
    response.send(arrReturn);
  });
  
  // https://api.cognitive.microsoft.com/bing/v5.0/images
  
   async function addSearchToDatabase(){
//     // check database for current highest shortURL number
    const db = await mongodb.MongoClient.connect(url);

//     // db gives access to the database    
//      var newCollect = db.collection('tblSearches');

//     // find highest shortURL number stored

//     // first check if any records
    //var records = await db.collection('tblSearches').count();
     
    var documents = await db.collection('tblSearches').insert(doc);

    db.close();
    //response.send("Done " + doc);
   }
  
  
  // store webaddress and shortURL in database
  addSearchToDatabase();
  
  //response.send("Done outside async");
  
  
  
});


app.get("/api/recentsearches/", function (req, response) 
{
  console.log("Recents");
  
  // end points
  // https://api.cognitive.microsoft.com/bing/v5.0/images
  
   async function getSearchesFromDatabase(){
//     // check database for current highest shortURL number
    const db = await mongodb.MongoClient.connect(url);

//     // db gives access to the database    

//     // first check if any records
    //var records = await db.collection('tblSearches').count();
    // var documents = await db.collection('tblShortUrls').find({ shortURLNumber: asNumber }).toArray();
     
    var documents = await db.collection('tblSearches').find().toArray();

    db.close();
    console.log(documents);
    response.send(documents);
   }
  
  
  // store webaddress and shortURL in database
  getSearchesFromDatabase();
  
  //response.send("Done outside async");
  
  
  
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


