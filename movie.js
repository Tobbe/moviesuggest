function Movie() {
	this.genre = '';
	this.rating = 0;
	this.votes = 0;
}

exports.Movie = Movie;

Movie.prototype.prettyPrint = function() {
	return this.name + '\n' +
		'------------------------------------------------------------\n' + 
		'    releaseName: ' + this.releaseName + '\n' + 
		'          score: ' + this.score + '\n' + 
		'          genre: ' + this.genre + '\n' + 
		'         rating: ' + this.rating + '\n' + 
		'          votes: ' + this.votes + '\n' + 
		'           year: ' + this.year + '\n' + 
		'         imdbId: ' + this.imdbId + '\n' + 
		'      from imdb: ' + this.imdb + '\n';
}

Movie.prototype.genreContains = function(re) {
	return this.genre.search(re) != -1;
}

Movie.prototype.releaseContains = function(re) {
	return this.releaseName.search(re) != -1;
}

Movie.prototype.setScore = function() {
	this.score = Number(this.rating);
	this.votes = Number(this.votes);
	if (this.votes > 10000) {
		this.score += 0.3;
	} else if (this.votes < 100) {
		this.score -= 1.5;
	}

	if (this.genre) {
		if (this.genreContains(/war/i) && this.genreContains(/drama/i) -1) {
			this.score -= 0.5;
		}

		if (this.genreContains(/adventure/i)) {
			this.score += 0.3;
		}

		if (this.genreContains(/action/i)) {
			this.score += 0.2;
		}

		if (this.genreContains(/thriller/i)) {
			this.score += 0.2;
		}
	}

	if (this.releaseContains(/\.RC\.|\.PPV\.|\.PPVR[Ii][Pp][-\.]|\.[Xx]264[-\.]/)) {
		this.score -= 1.2;
	}

	this.score = Math.round(this.score * 10) / 10;
} 
