var recommendationsObj = {
  pairs: [{
    icon: "chancetstorms",
    beer: ["gose", "hefeweizen", "wit"],
  }, {
    icon: "nt_chancetstorms",
    beer: ["dubbel"],
  }, {
    icon: "tstorms",
    beer: ["imperial IPA", "pale ale"],
  }, {
    icon: "chancerain",
    beer: ["cream stout"],
  }, {
    icon: "clear",
    beer: ["saison", "sour"],
  }, {
    icon: "mostlycloudy",
    beer: ["pumpkin ale"],
  }, {
    icon: "partlycloudy",
    beer: ["coffee stout", "barley wine", "farmhouse ale"],
  }, {
    icon: "cloudy",
    beer: ["spiced ale"],
  }, {
    icon: "rain",
    beer: ["IPA"],
  }, {
    icon: "snow",
    beer: ["imperial stout"],
  }, {
    icon: "chanceflurries",
    beer: ["smoked stout"],
  }, {
    icon: "chancesleet",
    beer: ["baltic porter"],
  }, {
    icon: "chancesnow",
    beer: ["oatmeal stout"],
  }, {
    icon: "flurries",
    beer: ["milk stout", "oyster stout"],
  }, {
    icon: "fog",
    beer: ["amber ale", "bitter"],
  }, {
    icon: "hazy",
    beer: ["pale ale", "imperial pilsner"],
  }, {
    icon: "mostlysunny",
    beer: ["saison", "kolsch"],
  }, {
    icon: "partlysunny",
    beer: ["berliner weiss", "pale lager"],
  }, {
    icon: "sunny",
    beer: ["pale ale", "biere de garde"],
  }, {
    icon: "sleet",
    beer: ["eisbock", "dunkelweizen"],
  }, {
    icon: "unknown",
    beer: ["wine"],
  }]
}

$(window).on("load", function() {
  $(".loader").fadeOut(3000);
})

// Geolocator API to automatically populate with your local zip code
function getYourZippy() {
  var queryURL = "https://ipapi.co/json/";

  $.ajax({
    url: queryURL,
    method: "GET"
  }).done(function(pizza) {
    var autoZippy = pizza.postal;

    localStorage.clear();
    localStorage.setItem("geoZip", autoZippy);

    if (autoZippy === "") {
      autoZippy = "90210";

      localStorage.clear();
      localStorage.setItem("geoZip", autoZippy);
    }

    weather();
  })
}

getYourZippy();

//When you submit zip code, set that zip in localstorage and rec new beer
$(".submit").on("click", function(event) {
  var zip = $(".zippy").val().trim();
  var code = $(".zippy").val().trim();
  var modal = $("#myModal");
  var span = $(".close"); // Get the <span> element that closes the modal

  event.preventDefault();

  localStorage.clear();
  localStorage.setItem("zip", zip);

  if (zip === "") {
      zip = "90210";

      localStorage.clear();
      localStorage.setItem("zip", zip);
    } else if (zip.length !== 5) {
      zip = "90210";

      localStorage.clear();
      localStorage.setItem("zip", zip);
    }

  $(".weather").empty();
  $(".beer").empty();
  
  var queryURL = "https://api.wunderground.com/api/b6005ea6b47964f3/forecast/geolookup/q/" + localStorage.getItem("zip") + ".json";

  $.ajax({
    url: queryURL,
    method: 'GET'
  })
  .done(function(response) {
    var results = response.forecast.txt_forecast.forecastday[0];
    var zippy = $("<p class='zippo'>");
    var weatherInfo = $("<p>");
    var weatherIcon = response.forecast.txt_forecast.forecastday[0].icon;
    var highTemp = response.forecast.simpleforecast.forecastday[0].high.fahrenheit;

    $(".weather").append(zippy);
    zippy.html(response.location.zip);
    $(".weather").append(weatherInfo);
    weatherInfo.text(results.fcttext);

    if (weatherIcon === "tstorms" || weatherIcon === "rain") {
      getARainText();
    } else {
      getAColorText(highTemp);
    }
    
    getABeer(weatherIcon);
    playSpotify(weatherIcon);
    });

  if (code.length !== 5) {
    modal.css("display", "block");
    $(".zippy").val("");
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }
});

// Function to determine the weather based on zip in localStorage, for repeat visitors reloading page.
function weather() {
  var queryURL

  if (!localStorage.getItem("zip")) {
    queryURL = "https://api.wunderground.com/api/b6005ea6b47964f3/forecast/geolookup/q/" + localStorage.getItem("geoZip") + ".json";
  } 

  else if (localStorage.getItem("zip").length === 5) {
    queryURL = "https://api.wunderground.com/api/b6005ea6b47964f3/forecast/geolookup/q/" + localStorage.getItem("zip") + ".json";
  }

  $.ajax({
    url: queryURL,
    method: 'GET'
  }).done(function(response) {
    var results = response.forecast.txt_forecast.forecastday[0];
    var zippy = $("<p class='zippo'>");
    var weatherInfo = $("<p>");
    var weatherIcon = response.forecast.txt_forecast.forecastday[0].icon;
    var highTemp = response.forecast.simpleforecast.forecastday[0].high.fahrenheit;

    $(".weather").append(zippy);
    zippy.text(response.location.zip);
    $(".weather").append(weatherInfo);
    weatherInfo.text(results.fcttext);

    getABeer(weatherIcon);
    playSpotify(weatherIcon);

    if (weatherIcon === "tstorms" || weatherIcon === "rain") {
      getARainText();
    } else {
      getAColorText(highTemp);
    }
  })
}

// Function to pull a beer from BreweryDB, passes weatherIcon as a parameter. 
function getABeer(val1) {
  var weatherKey
  for (var i = 0; i < recommendationsObj.pairs.length; i++) {
    if (recommendationsObj.pairs[i].icon === val1) {
      weatherKey = i;
    }
  }

  var randomBeerType = Math.floor(Math.random() * recommendationsObj.pairs[weatherKey].beer.length)
  var APIkey = "c54928017d8919c3c993272329ea38d1";
  var beer = recommendationsObj.pairs[weatherKey].beer[randomBeerType];
  var searchQueryURL = "https://cryptic-waters-49114.herokuapp.com/v2/search?key=" + APIkey + "&q=" + beer + "&type=beer&withBreweries=Y";

  $.ajax({
    url: searchQueryURL,
    method: "GET"
  }).done(function(cheese) {
    var randomBeerArrNum = Math.floor(Math.random() * 50);
    var beerName = cheese.data[randomBeerArrNum].name;
    var brewery = cheese.data[randomBeerArrNum].breweries[0].name;
    var abv;
    var description;
    var label;

    if (typeof(cheese.data[randomBeerArrNum].labels) !== "undefined") {
      label = cheese.data[randomBeerArrNum].labels.large;
    } else {
      label = "assets/images/drink.png";
    }

    if (typeof(cheese.data[randomBeerArrNum].description) !== "undefined") {
      description = cheese.data[randomBeerArrNum].description;      
    } else {
      description = "";
    }

    if (typeof(cheese.data[randomBeerArrNum].abv) !== "undefined") {
      abv = cheese.data[randomBeerArrNum].abv;
    } else {
      abv = "mystery";
    }

    var beerPrint = $("<p class='beero'>");
    var beerBrewery = $("<p class='brewery'>");
    var beerInfo = $("<p>");
    var beerLabel = $("<img>");
    $(".beer").append(beerPrint);
    beerPrint.html(beerName);
    $(".beer").append(beerBrewery);
    beerBrewery.html(brewery);
    $(".beer").append(beerInfo);
    beerInfo.html(description + "<br>" + abv + " % ABV");
    beerLabel.attr("src", label).addClass("img-responsive beer-label");
    $(".beer").append(beerLabel);

    sendBeerToFire(beerName, description, abv, brewery);
  })
}

// Function to determine which colorful rain description we're applying to the forecast 
function getARainText() {
  var colorTextArr = ["Rainboots go with everything today.", "Today's weather is wet feet. All day.",
  "Today all of your internal crying affected the universe and your own weak human tears are raining down on you. You need a beer.",
  "You’re going to look like a drowned rat. Have a beer.",
  "Do you like the smell of rain? If not, you're not going to like the smell of today."]
  var random = Math.floor(Math.random() * colorTextArr.length);
  var weatherText = colorTextArr[random];

  var pColorText = $("<p>");
  pColorText.text(weatherText).appendTo(".weather");
  transitionLang();
}

// Function to determine which colorful weather (based on temp) description we're applying to the forecast.
function getAColorText(temp) {
  var weatherText 

  if (temp >= 90) {
    var colorTextArr = ["Today's weather is sweaty armpits and misery", 
    "Be prepared to melt like the wicked witch you know you secretly are.", 
    "Today’s weather is fried eggs on the sidewalk. They’re eco-friendly, I guess.",
    "The human body is made of 65% water and that’s way less than the humidity today. Good luck.",
    "Today’s weather is just fucking miserable.",
    "Wow, this is perfect weather for a beer. Like yesterday. And tomorrow. And forever. Every day is perfect for a beer.",
    "Today’s weather is like you smoked a bunch of bath salts in Florida but you don’t know where you got the bath salts or how you got to Florida.",
    "Mordor",
    "These are the days sweat stains are made out of.",
    "Today you’re going to sweat in places you didn’t know could sweat. It’s going to be awful."];
    var random = Math.floor(Math.random() * colorTextArr.length);
    var weatherText = colorTextArr[random];
  } 
  else if (temp >= 80 && temp < 90) {
    var colorTextArr = ["Today is undercooked fried eggs on the sidewalk. You’re still going to sweat.",
    "Today is...too fucking hot. But maybe you're the one to like that light sweaty sheen on your clothes."];
    var random = Math.floor(Math.random() * colorTextArr.length);
    var weatherText = colorTextArr[random];
  }
  else if (temp >= 70 && temp < 80) {
    var colorTextArr = ["Is it Spring? Is it Fall? Is it that weird winter day that reminds you global warming is real?",
    "Your body might like it outside today.", "Whoa what a weather."];  
    var random = Math.floor(Math.random() * colorTextArr.length);
    var weatherText = colorTextArr[random];
  }
  else if (temp >= 60 && temp < 70) {
    var colorTextArr = ["Do you need a jacket? Do you wear a sweater? A t-shirt? Closet roulette."];
    var random = Math.floor(Math.random() * colorTextArr.length);
    var weatherText = colorTextArr[random];
  }
  else if (temp >= 50 && temp < 60) {
    var colorTextArr = ["Today’s weather is amazing so get your butt outside already.",
    "It’s rainbows and unicorns and fairies out there."];
    var random = Math.floor(Math.random() * colorTextArr.length);
    var weatherText = colorTextArr[random];
  }
  else if (temp >= 40 && temp < 50) {
    var colorTextArr = ["Wow, this is perfect weather for a beer. Jk, it’s always perfect weather for a beer.",
    "Whoa, what a weather."];
    var random = Math.floor(Math.random() * colorTextArr.length);
    var weatherText = colorTextArr[random];
  }
  else if (temp >= 30 && temp < 40) {
    var colorTextArr = ["Wow, this is perfect weather for a beer. Jk, it’s always perfect weather for a beer."];
    var random = Math.floor(Math.random() * colorTextArr.length);
    var weatherText = colorTextArr[random];
  }
  else if (temp >= 20 && temp < 30) {
    var colorTextArr = ["It’s too cold to leave bed. Don’t bother.",
    "Today’s weather means your hands are colder than the beer you’re drinking. Worth it."];
    var random = Math.floor(Math.random() * colorTextArr.length);
    var weatherText = colorTextArr[random];
  }
  else if (temp < 20) {
    var colorTextArr = ["It’s Summer! ...somewhere else. Far away. Not here.",
    "Today’s weather is colder than the cold, icy heart you pretend you don’t have.",
    "Today is the cold, bleak grip of a death eater. All day."];
    var random = Math.floor(Math.random() * colorTextArr.length);
    var weatherText = colorTextArr[random];
  }

  var pColorText = $("<p>");
  pColorText.text(weatherText).appendTo(".weather");
  transitionLang();
}

// Function to put transitional language between weather, beer+playlist.
function transitionLang() {
  var pTag = $("<p>");
  var pText = "We recommend pairing your forecast with this beer and playlist:";

  pTag.text(pText).appendTo(".weather");
}

// Initializes Firebase
var config = {
    apiKey: "AIzaSyD8Ty6GU2c1yTwgvvS66r3Th5cM55HZEyA",
    authDomain: "project-one-c87a1.firebaseapp.com",
    databaseURL: "https://project-one-c87a1.firebaseio.com",
    projectId: "project-one-c87a1",
    storageBucket: "project-one-c87a1.appspot.com",
    messagingSenderId: "294964502453"
  };

firebase.initializeApp(config);

var database = firebase.database();
var beersRef = database.ref("beers");

// Stores beer recommendation in firebase.
function sendBeerToFire(beer, descript, abv, brewery) {
  if (descript === "undefined") {
    descript = "";
  }

  var beerObj = {
    beer: beer,
    description: descript,
    abv: abv,
    brewery: brewery
  }

  beersRef.push(beerObj); 

  database.ref().on("child_added", function(snapshot) {
    var kiddo = snapshot.numChildren();
    $(".odometer").text(kiddo);
  });

  database.ref("beers").limitToLast(20).on("child_added", function(childSnapshot) {
    $('.table').prepend("<tr><td></td><td></td><td></td></tr>");
    var firstRowTds = $("table")
      .children()
      .eq(1)
      .children("tr")
      .eq(0)
      .children("td");

    firstRowTds.eq(0).text(childSnapshot.val().beer);
    firstRowTds.eq(1).text(childSnapshot.val().brewery);
    firstRowTds.eq(2).text(childSnapshot.val().abv + " %");
  })
}

// Function to determine playlist based on weather, pop to DOM. Passes weatherIcon as a param.
function playSpotify(icon) { 
  var cloudyPlaylist = ["cloudy", "fog", "hazy", "nt_chancetstorms"];
  var cloudyPlaylistSrc = ["https://open.spotify.com/embed?uri=spotify:user:shelbysatt:playlist:1zSs9BHKuMLjhsPKEyIYiT"];

  var clearPlaylist = ["sunny", "clear"];
  var clearPlaylistSrc = ["https://open.spotify.com/embed?uri=spotify:user:chloeszep:playlist:2WbnT6KIaCyPhvT7FjGkhj"];

  var stormyPlaylist = ["tstorms", "chancetstorms",];
  var stormyPlaylistSrc = ["https://open.spotify.com/embed?uri=spotify:user:spotify:playlist:37i9dQZF1DX2pSTOxoPbx9"];

  var snowPlaylist = ["snow", "chanceflurries", "chancesleet", "chancesnow", "flurries", "sleet"];
  var snowPlaylistSrc = ["https://open.spotify.com/embed?uri=spotify:user:11135485325:playlist:1UOKjxsR4Kcauv8oUYtNzO"];

  var mocloudyPlaylist = ["mostlycloudy"];
  var mocloudyPlaylistSrc = ["https://open.spotify.com/embed?uri=spotify:user:1276682885:playlist:2TtL9oWZuTDciLtqlrjgQh"];

  var moclearPlaylist = ["mostlysunny", "partlycloudy", "partlysunny"];
  var moclearPlaylistSrc = ["https://open.spotify.com/embed?uri=spotify:user:spotify:playlist:37i9dQZF1DWX1vYQSk2Qrd"];

  var rainPlaylist = ["rain", "chancerain"];
  var rainPlaylistSrc = ["https://open.spotify.com/embed?uri=spotify:user:spotify:playlist:37i9dQZF1DXbvABJXBIyiY"];

  var unknownPlaylist = ["unknown"];
  var unknownPlaylistSrc = ["https://open.spotify.com/embed?uri=spotify:user:11173244841:playlist:0T7TZgUDT14o7fmWGrzvHk"];

  $("#spotify").empty();

  if (cloudyPlaylist.indexOf(icon) !== -1) {
    playlist = cloudyPlaylistSrc;
    playlistTitle = "Cloudy Day for a Beer Playlist";
  } else if (clearPlaylist.indexOf(icon) !== -1) {
    playlist = clearPlaylistSrc;
    playlistTitle = "What a Clear Day for a Beer Playlist";
  } else if (stormyPlaylist.indexOf(icon) !== -1) {
    playlist = stormyPlaylistSrc;
    playlistTitle = "Thunder and Lightning and Beer Playlist";
  } else if (snowPlaylist.indexOf(icon) !== -1) {
    playlist = snowPlaylistSrc;
    playlistTitle = "It's a Snowy Beer Day Playlist";
  } else if (mocloudyPlaylist.indexOf(icon) !== -1) {
    playlist = mocloudyPlaylistSrc;
    playlistTitle = "Mostly Cloudy Beer Playlist";
  } else if (moclearPlaylist.indexOf(icon) !== -1) {
    playlist = moclearPlaylistSrc;
    playlistTitle = "What a Clear Day for a Beer Playlist";
  } else if (rainPlaylist.indexOf(icon) !== -1) {
    playlist = rainPlaylistSrc;
    playlistTitle = "Rainy Days Deserve Beers and Playlists";
  } else {
    playlist = unknownPlaylistSrc;
    playlistTitle = "It's the Apocalypse Maybe Playlist";
  }

  $("#spotify").attr("src", playlist);
  $(".listo").empty();
  $("<p>").text(playlistTitle).addClass("listo").prependTo(".music");

  var myTimer = setTimeout(removeLoading, 500)

  function removeLoading() {
    $("#loading-gif").addClass("loading-gif-hide");
    clearTimeout(myTimer);
  }
}

// NYT API pull, pops articles to the dom in the news div.
$(document).ready(function() {
  var url = "https://api.nytimes.com/svc/topstories/v2/home.json";
  
  url += '?' + $.param({
    'api-key': "c9018bad76144ca0a408994b54795e18"
  });
  
  var numArticles = 5
  
  $.ajax({
    url: url,
    method: 'GET',
  }).done(function(results) {
    $("#well-section").empty();
    for (var i = 0; i < numArticles; i++) {
      var wellSection = $("<div>");
      wellSection.addClass("well wello");
      wellSection.attr("id", "well-section-" + i);
      $("#well-section").append(wellSection);
      if (results.section.home !== "null") {
        $("#well-section" + i)
        .append("<panel-body>" + results.section + "<panel-body>");
      }
      if (results.results[i].multimedia.length > 0) {
      $("#well-section-" + i).append("<img src= '" + results.results[i].multimedia[1].url + "' class='art-img'" + "/>");
      }
      $("#well-section-" + i).append("<div class='article'></div>");
      $("#well-section-" + i + " div").append("<p class='art-title'><strong>" + results.results[i].title + "</strong></p>");
      $("#well-section-" + i + " div").append("<p class='art-abs'>" + results.results[i].abstract + "</p>");
      $("#well-section-" + i + " div").append("<p class='art-by'>" + results.results[i].byline + "</p>");
      $("#well-section-" + i + " div").append("<p><a href='" + results.results[i].url + "' class='art-link' target='_blank'>" + "Read more..." + "</a></p>");
    }
  });
});