
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var util = require('util');
var app = express();
var MongoStore = require('connect-mongo')(express);
var settings = require('./setting');
var expressValidator = require('express-validator');
var sessionStore = new MongoStore({db:settings.db},function(){ console.log('connect mongodb success...');});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.cookieParser());   
app.use(express.session({
    secret : settings.cookieSecret,
    store : sessionStore,
    cookie : {
          maxAge : new Date(Date.now() + 1000*60*60) 
      }    
   }));
app.use(expressValidator());

app.use(express.static(path.join(__dirname, 'public')));//启用静态引用
app.use(app.router);//启用路由规则

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/',routes.index);
app.get('/main',routes.checkLogin);
app.get('/main',routes.main);
app.get('/image',routes.image);
app.post('/post',routes.post);
app.get('/reg',routes.reg);
app.post('/reg',routes.doReg);
app.get('/login',routes.login);
app.post('/login',routes.doLogin);
app.get('/logout',routes.logout);
app.get('/webservice/:user',routes.webservice);
app.post('/upfile',routes.upfile);
app.get('*',routes.errorHtml);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

