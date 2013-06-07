
/*
 * GET home page.
 */

exports.index = function(req, res){
  req.db.get("titleTest",function(err,result){
    res.render('index', { title: result });
  });
};

exports.update = function(req, res){
  console.log("executing update");
  req.db.set("titleTest",req.body.titleTest, function(err,result){
    console.log("done!");
    res.writeHead(200);
    res.end();
  });
};
