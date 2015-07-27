var PORT = 8080;

var express = require('express');
var path = require('path');
var app = express();
// var Folder = require('./models/folder');

// server routes ===========================================================

// sample api route
// app.get('/v3/modulesfolders', function(req, res) {
//     // use mongoose to get all nerds in the database
//     Nerd.find(function(err, nerds) {

//         // if there is an error retrieving, send the error. 
//                         // nothing after res.send(err) will execute
//         if (err)
//             res.send(err);

//         res.json(nerds); // return all nerds in JSON format
//     });
// });

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

// app.get('/fluid', function (req, res) {
//   res.render('fluid', {});
// });

// app.get('/full', function (req, res) {
//   res.render('full', {});
// });

app.get('/', function (req, res) {
  res.render('fixed', {});
});

// set up route to public folder
app.post('/v3/tokens', function (req, res) {
  res.send('{"clientId":"55038c323c46cbc128000001","ownerId":"55038c323c46cbc128000001","token":"aglmd_tk_2cmFCxL7oDytws3hyvfMWAs6rVhziwyRMNDqZfx4xaaQbWFdduDNguMtUN9BWBCaZAnXHFMS"}');
});

app.use(express.static( 'public'));

// GET /v3/users/*/modules
app.get('/v3/users/*/modules', function (req, res) {
  res.sendfile("./public/v3/modules")
});

// GET /v3/modules/:module_id/documents/:document_id
 
app.use(express.static('./dev/assets'));

app.listen(PORT);

console.log('demo running on http://localhost:' + PORT + '/');
