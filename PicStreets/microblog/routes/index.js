
/*
 * GET home page.
 */
var fs = require('fs');
var querystring = require('querystring');
var url = require('url');
exports.index = function(req, res){
  res.render('index', { title: 'Express'});
};
exports.user = function(req, res){

};
exports.post = function(req, res){
	
};
exports.reg = function(req, res){
	
};
exports.doReg = function(req, res){
	
};
exports.login = function(req, res){
	
};
exports.doLogin = function(req, res){
	
};
exports.logout = function(req, res){
	
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
}