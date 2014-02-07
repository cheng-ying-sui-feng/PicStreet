
/*
 * GET home page.
 */
var fs = require('fs');
var querystring = require('querystring');
var url = require('url');
var MongoClient  = require('mongodb').MongoClient;
var format = require('util').format;
var Db  = require('mongodb').Db;
var Server = require('mongodb').Server;
var settings = require('../setting');

exports.index = function(req, res){
  	var state = "login";
 	if(req.session.uid==undefined){
  	  state = "nologin";
    }
    var username="";
    var pwd="";
    if(req.session.username!=undefined){
    	username=req.session.username;
    }
    if(req.session.pwd!=undefined){
    	pwd=req.session.pwd;
    }
    res.render('index', { title: 'Express',state:state,username:username,pwd:pwd});
};
exports.main = function(req, res){
	var username = req.session.username;
	var uid = req.session.uid;
	var path = "./image/"+username;
	fs.readdir(path,function(error,files){
		if(error){
			res.writeHead(500, {"Content-Type": "text/plain"});
     		res.write(error + "\n");
      		res.end();
		}else{
			var content = new Array();
			for(var i=0;i<files.length;i++){
				content[i]  =files[i];
			};
			res.render('main', { title: '个人首页',username:username,uid:uid,content:content});
		}
	});
	
};
exports.post = function(req, res){
	
};
exports.reg = function(req, res){
  res.render('reg', { title: '注册'});
};
exports.doReg = function(req, res){
	var username = req.body['username'];
	var password = req.body['password'];
	var email = req.body['email'];
	var flag = true;
	var db = new Db(settings.db,new Server(settings.host,settings.port));
	db.open(function(err,db){
		db.createCollection('microblog',function(err,collection){
			if(err) {
				throw err;
				res.send('false');
			}
			collection.find({'username':username}).toArray(function(err,exp){
				if(exp.length>0){
					res.send("named");
				}else{
					var uid=1000;
					collection.find().toArray(function(err,exp){
						if(exp.length>0){
							uid=Number(exp[exp.length-1].uid)+1;
						}
						collection.insert({'username':username,'pwd':password,'email':email,'uid':uid},function(err,exp){
						if(err) {throw err;res.send('false');}
						if(exp.length>0){
							var dirpath = "./image/"+username;
							fs.mkdir(dirpath,function(err){
								if(err) throw err;
							});
							res.send("success");
						}else{
							res.send("false");
						}
						db.close();
					});
					});
				}	
			});
		});
	});
};
exports.login = function(req, res){
	
};
exports.doLogin = function(req, res){
	var username = req.body['username'];
	req.assert('username', 'Username is empty').notEmpty();
 	var password = req.body['password'];
    req.assert('password', 'password is empty').notEmpty();
    var remember = req.body['remember'];
    var errors = req.validationErrors(true);
    if (errors) {
    	res.redirect('/');
    }else{
    var db = new Db(settings.db,new Server(settings.host,settings.port),{safe:false});
	db.open(function(err,db){
		db.createCollection('microblog',function(err,collection){
			if(err) throw err;
			collection.find({'username':username,'pwd':password}).toArray(function(err,exp){
				if(exp.length>0){
				req.session.uid = exp[0].uid;
				req.session.username = exp[0].username;
				if(remember=='remember'){
					req.session.pwd=exp[0].pwd;
				}
				}
				res.redirect('/');
				db.close();		
			});
		});
	});
    }
    
};
exports.logout = function(req, res){
	req.session.uid=null;
	res.redirect('/');
};
exports.image = function(req,res){
	var query = url.parse(req.url).query;
	var user = querystring.parse(query)['user'];
	var imagename = querystring.parse(query)['imagename'];
	var type = imagename.split(".")[1];
	var filename = "./image/"+user+"/"+imagename;
	fs.readFile(filename, "binary", function(error, file) {
    if(error) {
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.write(error + "\n");
      res.end();
    } else {
      switch(type){
      	case 'jpg':  res.writeHead(200, {"Content-Type": "image/jpeg"});
      				 break;
      	case 'png':  res.writeHead(200, {"Content-Type": "image/png"});
      				 break;
      }
     
      res.write(file, "binary");
      res.end();
    }
  });

};
exports.webservice = function(req,res){
	var user = req.params.user;
	var path = "./image/"+user;
	fs.readdir(path,function(error,files){
		if(error){
			res.writeHead(500, {"Content-Type": "text/plain"});
   		    res.write(error + "\n");
   			res.end();
		}else{
			res.writeHead(200, {"Content-Type": "text/plain"});
			var content="[";
			for(var i=0;i<files.length;i++){
				content+="{\"imagename\":\""+files[i]+"\"},";	
			}
			if(content.length>1){
				content = content.substring(0,content.length-1)+"]";
			}
			res.write(content);
			res.end();
		}
	});
};

exports.checkLogin = function(req,res,next){
	if(!req.session.uid){
		return res.redirect('/');
	}
	next();
};

exports.upfile=function(req,res,next){
	var tmp_path = req.files.upfile.path;
	var target_path = './image/'+req.session.username+'/'+req.files.upfile.name;
	fs.rename(tmp_path,target_path,function(err){
		if(err) throw err;
		fs.unlink(tmp_path,function(){
			if(err) throw err;
			res.redirect('/main');
		})
	})
	console.log(tmp_path);
}

exports.errorHtml=function(req,res){
	console.log('404 handle!!!!!');
	res.render('404');
}