
/**
 * Module dependencies.
 */

var fs = require('fs')
var express = require('express')
var ejs = require('ejs')
var app = express();

var http = require('http')
var httpserver = http.createServer(app)

var coffeescript = require('iced-coffee-script')
var subtitleread = require('./static/subtitleread')
var chinesedict = require('./static/chinesedict')
var aux = require('./aux')

httpserver.listen(aux.portnum);

var nowjs = require('now')
var everyone = nowjs.initialize(httpserver);

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.set('view options', { layout: false })
  app.locals({ layout: false })
  app.use(express.static(__dirname + '/static'));
});

nowjs.on("connect", function() {
  aux.initializeUser(this)
})

everyone.on("connect", function(){
  console.log("Joined: " + this.now.name);
});

everyone.on("disconnect", function(){
  console.log("Left: " + this.now.name);
});

console.log('express server started')

//console.log("Express server listening on port %d in %s mode", httpserver.address().port, app.settings.env);
