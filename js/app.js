var lastfm = new LastFM({
	apiKey    : 'a75a2bb78877595c7851f5f71672cff4',
	apiSecret : 'c8dc66d3c071fa4a90ce28bfe32db378'
});

$.YQL = function(query, callback) {
	if (!query || !callback) {
			throw new Error('$.YQL(): Parameters may be undefined');
	}
	var encodedQuery = encodeURIComponent(query.toLowerCase()),
			url = 'http://query.yahooapis.com/v1/public/yql?q='
					+ encodedQuery + '&format=json&callback=?';
		$.getJSON(url, callback);
};


var topAlbums = [];
var albumList;
var realUserName;
var year;
var hash;

var parseAlbumsCounter = 0;	
var lastRequest; 
function parseAlbums(list){
	var thisAlbum = list[parseAlbumsCounter];
	parseAlbumsCounter += 1;
	if (thisAlbum === undefined){
		return;
	}

	// Try and Check for common fuckups in the naming
	thisAlbum.name = thisAlbum.name.replace("CD 1", "");
	thisAlbum.name = thisAlbum.name.replace("Deluxe Edition", "");
	thisAlbum.name = thisAlbum.name.replace("(Bonus Track Version)", "");
	thisAlbum.name = thisAlbum.name.replace(" EP", "");
	thisAlbum.name = thisAlbum.name.replace("[Explicit]", "");
	thisAlbum.name = thisAlbum.name.replace(" ()", "");

	lastfm.album.getInfo({album: thisAlbum.name, artist: thisAlbum.artist.name},
		{success: function(fmData){
			// Try and get the release date from the Last.FM data
			//console.log(thisAlbum.artist.name + " - " + thisAlbum.name);
			//console.log(fmData);
			var trimmedDate = fmData.album.releasedate.replace(/^\s+|\s+$/g, '');
			if (trimmedDate != ""){
				if (fmData.album.releasedate.indexOf(year) != -1){
					addAlbum(thisAlbum);	
				}
				//parseAlbums(list);
			}
			// Snap, no release data. Lets get it from YQL/MusicBrains!
			else{
				query = "select * from xml where url='http://musicbrainz.org/ws/1/release/?type=xml&artist=";
				query+= escape(thisAlbum.artist.name)+"&title="+escape(thisAlbum.name) + "'";
				$.YQL(query,
					function(yqlData){
						// Very likely we get stuff undefined errors in here, so catch and continue if so
						try{	
							//console.log(yqlData.query.results.metadata['release-list']);
							// Find the relesase date if there are multiple releases objects
							var releaseDate;
							var releaseObject = yqlData.query.results.metadata['release-list'].release;
							if (releaseObject instanceof Array){
								var eventObject = releaseObject[0]['release-event-list'].event;
								if (eventObject instanceof Array){
									releaseDate = eventObject[0].date;
								}
								else{
									releaseDate = eventObject.date;
								}
							}
							// Or if there is only one release
							else{
								// Get the date if events is an array
								var eventObject = releaseObject['release-event-list'].event;
								if (eventObject instanceof Array){
									releaseDate = eventObject[0].date;
								}
								// Or if there is just one event
								else {
									releaseDate = eventObject.date;
								}
							}
							// Fucking finally. Should have the release date by now...
							if (releaseDate.indexOf(year) != -1){
								addAlbum(thisAlbum);	
							}
						}
						catch (error){
							//console.log("Oops, fucked up parsin a MusicBrainz results. Hope it's not from 2010. Here it is...");
							//console.log(yqlData);
							//console.log("PS: Artist: " + thisAlbum.artist.name + " - " + thisAlbum.name);
						}
				});
			}
			// Check and see if this was the last album. If so, show the results
			if (thisAlbum.name == list[49].name){
				showResults();
			}
		}},
		{error: function(code, message){
			console.log("Error! Code: " + code + " Message: " + message);
		}});
		parseAlbums(list);
}

function addAlbum(album){
	topAlbums.push(album);
}

function resetAll(){
				topAlbums = []
				parseAlbumsCounter = 0;	
		$('#results').html('');
		if ($('#friendsToolbar').is(":visible")){
			$('#friendsToolbar').hide('blind');
		}
		if ($('#yearsToolbar').is(":visible")) {
			$('#yearsToolbar').hide('blind');
		}
}

function showResults(){
	results = $('#results');

	results.append('<h1>' + realUserName + "'s Top Albums of " + year +"</h1>");
	results.append("<div class='quiet'> According to Last.FM scrobbles</div><br/>");
	// Sort top albums before displaying!
	function compareAlbums(a,b) {
		return b.playcount - a.playcount;
	}
	topAlbums.sort(compareAlbums);
	$.each(topAlbums, function(index, value) {
		if (index > 9){
			return false;
		}
		var newDiv = "<div id='result" + index + "'><img src='" + value.image[3]["#text"] + "'><br/>";
		newDiv += "<h3>" + value.artist.name + " - " + value.name + '</h3></div>';
		results.append(newDiv);
		$('#result' + index).show('blind');
	});

	// Finally, hide the loading screen and show the results
	if ($('#loading').is(":visible")){
		$('#loading').hide('blind');
	}
	results.show('blind');
	$('#friendsToolbar').show('blind');
	$('#yearsToolbar').show('blind');
}

$(function(){

	// Bind an event to window.onhashchange. Note the only hash we set is the username
	$(window).hashchange( function(){

		hash = location.hash;
		year = hash.substr(1,4);
		// If the hash is empty, it may just be an inital load, or it could be a 'back' on the browswer
		if (hash == ""){
			if ($('#loading').is(":visible")){
				$('#loading').hide();
			}
			if ($('#results').is(":visible")){
				$('#results').hide();
			}
			if ($('#getUser').is(":hidden")){
				$('#getUser').show('blind');
			}
			if ($('#pageTitle').is(":hidden")){
				$('#pageTitle').show('blind');
			}
			if ($('#footer').is(":hidden")){
				$('#footer').show('blind');
			}
			if ($('#toolbar').is(":visible")){
				$('#toolbar').hide();
			}
			return;
		}
		else{
			if ($('#getUser').is(":visible")){
				$('#getUser').hide();
			}
			if ($('#results').is(":visible")){
				$('#results').hide();
			}
			if ($('#loading').is(":hidden")){
				$('#loading').show('blind');
			}
			if ($('#pageTitle').is(":visible")){
				$('#pageTitle').hide();
			}
			if ($('#footer').is(":visible")){
				$('#footer').hide();
			}
			if ($('#toolbar').is(":hidden")){
				$('#toolbar').show('blind');
			}
		}


		// If the failure message is showing, hide it
		var userFail = $('#getUserFailure');
		if ($(userFail).is(":visible")){
			$(userFail).hide('blind');
		}


		function getUserFail(message){
			$(userFail).html(message);
			$(userFail).show('blind');
			if ($('#loading').is(":visible")){
				$('#loading').hide('blind');
			}
			if ($('#getUser').is(":hidden")){
				$('#getUser').show('blind');
			}
		}

		lastfm.user.getTopAlbums({user: hash.substr(5), period: '12month'}, {
			success: function(data){
				if (data.topalbums.album == null){
					getUserFail("Not enough data from that user. Please try another!");
					return;
				}

				realUserName = data.topalbums['@attr'].user;
				// Set the page title based on the username.
				document.title = realUserName + "'s Top Albums of " + year;
				$('#friend-list-username').html('<h4>'+ realUserName + "'s" +  '</h4>'); 
				// Looks like everything is fine. Set the hash parameter and let hashchange take over
				// Set the parameter
				
				albumList = data.topalbums.album;
				resetAll();
				parseAlbums(albumList);
			}, error: function(code, message){	
				getUserFail("Sorry, that username appears to be invalid. Maybe you misspelled it?");
			}
		});
		lastfm.user.getFriends({user: hash.substr(5)}, {
			success: function(data){
				// Simplified cause we know there are no matches
				function compareUsers(a,b){
					if ( a.name.toLowerCase() < b.name.toLowerCase() )
						return -1;
					else
						return 1;
				}
				var sorted = data.friends.user;
				sorted.sort(compareUsers);


				$('#friend-list').html('');	
				$('#friend-list').append('<option value=null>Select to judge.</option>');
				$.each(sorted, function(index, value){
					var item = '<option value="' + value.name + '">' + value.name + '</option>'; 
					$('#friend-list').append(item);
				});
				// Selectors to Bootstrap using bootstrap-selector lib
				$('.selectpicker').selectpicker();
			},
			error: function(code, message){
				console.log(code + message);	
			}
		});
		lastfm.user.getInfo({user: hash.substr(5)}, {
			success: function(data) {
				var registerYear = new Date(data.user.registered["unixtime"]*1000).getFullYear();
				var currentYear = new Date().getFullYear();
								
				$('#year-list').html('');
				$('#year-list').append('<option value=null>Select to judge.</option>');
				while(currentYear>registerYear) {
					var item = '<option value="' + currentYear + '">' + currentYear + '</option>';
					$('#year-list').append(item);
					currentYear--;
				};
			},
			error: function(code, message) {
				console.log(code + message);
			}
		});
		
	})

	
	
	// Since the event is only triggered when the hash changes, we need to trigger
	// the event now, to handle the hash the page may have loaded with.
	$(window).hashchange();
});

$(document).ready(function() {
	$('#submitUser').click(function(){
		// Just set the hash for username. Hashchange will take are of the rest
		location.hash = new Date().getFullYear() + $('#username').val();
		window.location.href=window.location.href
	})

	$('#friend-list').on("change keyup", function(item){
		var picked = $('#friend-list').val();
		console.log(picked);
		location.hash = hash.substr(1,4) + picked;
		window.location.href=window.location.href
		$('#friendsToolbar').hide('blind');
	});
	
	$('#year-list').on("change keyup", function(item) {
		var picked = $('#year-list').val();
		console.log(picked);
		location.hash = picked + hash.substr(5);
		window.location.href = window.location.href
		$('#yearsToolbar').hide('blind');
	});

	/*$('#about-link').click(function(){

		if ($('#about').is(":visible")){
			$('#about').hide('blind');
		}
		else{
			$('#about').show('blind');
		}
		return false;
	});

	$('#about-close').click(function(){
		$('#about').hide('blind');
		return false;
	});*/

});


