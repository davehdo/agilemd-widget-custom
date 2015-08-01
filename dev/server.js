var PORT = 8080;

var express = require('express');
var path = require('path');
var app = express();
// var Folder = require('./models/folder');

// server routes ===========================================================

// route to handle creating goes here (app.post)
// route to handle delete goes here (app.delete)

// frontend routes =========================================================
// route to handle all angular requests
// app.get('*', function(req, res) {
//     res.sendfile('./public/views/index.html'); // load our public/index.html file
// });
        

app.engine('ejs', require('ejs-locals'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/css', express.static('./_build/css'));

app.get('/app.js', function (req, res) {
  res.sendfile('./_build/app.js');
});

app.get('/', function (req, res) {
  res.render('full', {}); // options are fluid, full, and fixed (see dev/views/*)
});

// set up route to public folder
app.post('/v3/tokens', function (req, res) {
  res.send('{"clientId":"55038c323c46cbc128000001","ownerId":"55038c323c46cbc128000001","token":"aglmd_tk_2cmFCxL7oDytws3hyvfMWAs6rVhziwyRMNDqZfx4xaaQbWFdduDNguMtUN9BWBCaZAnXHFMS"}');
});

app.use(express.static( 'public'));

app.use(express.static('./dev/assets'));

app.listen(PORT);

console.log('demo running on http://localhost:' + PORT + '/');
