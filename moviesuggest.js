var feedToMovieParser = require('./ftmp.js');
var GoogleAuthorizer = require('googlereaderauth').GoogleAuthorizer;
var googleAuth = new GoogleAuthorizer();

googleAuth.on('authDone', function(access_token, access_token_secret) {
	var unixTimestamp = new Date().getTime();
	var url = 'http://www.google.com/reader/api/0/stream/contents/user/-/state/com.google/starred?n=200&client=moviesuggest&ck=' + unixTimestamp;
	googleAuth.oa.get(url, access_token, access_token_secret, function(error, data) {
		if (error) {
			console.log(error);
		} else {
			var list = JSON.parse(data).items;

			var todo = list.length;
			var newList = [];
			list.forEach(function (item, index) {
				feedToMovieParser.makeMovieObject(item, function(movie) {
					newList.push(movie);
					todo--;
					if (todo === 0) {
						newList.sort(function(a, b) { return b.score - a.score; });
						console.log(newList.slice(0, 10));
					}
				});
			});
		}
	});
});

googleAuth.on('verificationCodeNeeded', function(url) {
	console.log('Please go to ' + url);
	ask("Please enter the verification code:\n", /[\w\d]+/, googleAuth.continueAuth);
});

googleAuth.on('error', function(error) {
	console.log(error);
	console.log(error.stack);
	process.exit(1);
});

googleAuth.authWithGoogle();


function ask(question, format, callback) {
	var stdin = process.stdin;
	var stdout = process.stdout;

	stdin.resume();
	stdout.write(question);

	stdin.once('data', function(data) {
		data = data.toString().trim();

		if (format.test(data)) {
			callback(data);
		} else {
			stdout.write("It should match: "+ format +"\n");
			ask(question, format, callback);
		}
	});
}
