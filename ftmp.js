var http = require('http');
var Movie = require('./movie.js').Movie;

exports.makeMovieObject = makeMovieObject;

function makeMovieObject(item, callback) {
	var movie = new Movie();
	movie.releaseName = getMovieReleaseName(item);
	movie.imdbId = getImdbId(item);

	parseItemInToMovie(item, movie);

	getImdbData(movie.imdbId, movie.name, movie.year, function(data) {
		if (data) {
			movie.name = data.Title;
			movie.genre = data.Genre;
			movie.year = data.Year;
			movie.imdbId = data.ID;
			movie.imdb = true;

			if (data.Rating != 'N/A') {
				movie.rating = data.Rating;
			}

			if (data.Votes != 'N/A') {
				movie.votes = data.Votes;
			}
		}

		movie.setScore();
		callback(movie);
	});
}

function getImdbData(id, name, year, gotImdbData) {
	var options = {
		host: 'www.imdbapi.com',
		path: '/?i=' + id
	};

	if (!id) {
		options.path = '/?t=' + encodeURIComponent(name);

		if (year) {
			options.path += '&y=' + year;
		}
	}

	http.get(options, function(response) {
		response.setEncoding('utf8');

		var data = '';
		response.on('data', function(chunk) {
			data += chunk;
		});

		response.on('end', function() {
			data = JSON.parse(data);

			if (!data.Response || data.Response != 'True') { 
				if (!data.Response || data.Response != 'Parse Error') {
					console.log(data);
				}

				gotImdbData(null);
			} else {
				gotImdbData(data);
			}
		});
	});
}

function getMovieReleaseName(item) {
	var name = item.title.replace(/\s+/g, '.');
	var re = new RegExp('Release Name[^<]*</strong>[\\s:]*(</?[^>]+>\\s?)*(' + item.title.split(' ')[0] + '.*?)(<br>|</p>)', 'i');
	var match = item.content.content.match(re);
	if (match && match[2]) {
		name = match[2];
		name = name.replace(/\s+/g, '.');
	}

	return name;
}

function getMovieName(item) {
	var name = item.title.replace(/-[\w\d]+$/, '');
	name = name.replace(/DVDRip|BDRip|x264|720[ip]|1080[ip]|Blu[Rr]ay|XviD|DivX|DVD-?[Rr]|PPVRIP|PROPER|REAL|REPACK|R5/g, '');
	name = name.replace(/((19|20)\d\d).*$/, '$1');
	name = name.replace(/\s+$/, '');
	name = name.replace(/\s+/g, ' ');

	return name;
}

function parseItemInToMovie(item, movie) {
	var content = item.content.content;

	movie.name = getMovieName(item);

	var match = movie.name.match(/(19|20)\d\d$/);
	if (match) {
		movie.year = match[0];
	}
	
	var match = content.match(/>Genre:<\/strong>\s*([\w\s\|]+)/);
	if (match) {
		movie.genre = match[1].replace(/\s\|\s/g, ', ');
	}

	movie.rating = 0;
	movie.votes = 0;
	match = content.match(/rating[^\d-]*([\d\.]+)(\/10 \(([\d,]+)\s+vote)?/i);
	if (match) {
		movie.rating = match[1];

		if (match[3]) {
			movie.votes = match[3].replace(',', '');
		}
	}
}

function getImdbId(item) {
	var match = item.content.content.match(/<a href="http:\/\/www.imdb.com\/title\/(\w+\d+)\/">IMDB<\/a>/i);

	if (match) {
		return match[1];
	}

	return undefined;
}
