var PORT = 8080;

var express = require('express');
var path = require('path');
var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/css', express.static('./_build/css'));

app.get('/app.js', function (req, res) {
  res.sendfile('./_build/app.js');
});

app.get('/fluid', function (req, res) {
  res.render('fluid', {});
});

app.get('/full', function (req, res) {
  res.render('full', {});
});

app.get('/', function (req, res) {
  res.render('fixed', {});
});

app.use(express.static('./dev/assets'));

app.listen(PORT);

console.log('demo running on http://localhost:' + PORT + '/');
