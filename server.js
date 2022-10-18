var bodyParser = require('body-parser');
var express = require("express");
var app=express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var HTTP_PORT = process.env.PORT || 8080;


var fs = require("fs");
var path = require('path');

var multer =  require('multer'); 
var storage = multer.diskStorage({

  destination : "./public/images/uploaded", 
  filename: function(req, file, cb){
      cb(null, Date.now() + path.extname(file.originalname)); 
  }

});

const upload = multer({storage : storage});  

const data_services =  require("./data-service")


const views = '/views/';


app.use(express.static('public')); 


function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
  }
 
app.get("/", (req, res) =>{

    res.sendFile(path.join(__dirname + views + "home.html"));
})

app.get("/about", (req, res) =>{

  res.sendFile(path.join(__dirname + views + "about.html"));
})


app.get("/employees", function(req,res){

  console.log(req.query);


  if(Object.keys(req.query).length === 0){ 
    data_services.getAllEmployees().then(function(data){
        res.json(data);
    })
    .catch(function(err){
      res.json({"message" : err});
    })
  }
  else if (Object.keys(req.query).length !== 0){ 
    data_services.getEmployees(req.query).then(function(data){
      res.json(data)
    }).catch(function(err){
      res.send(err);
    })
  }

})

app.get("/employees/add", function(req,res){

  res.sendFile(path.join(__dirname + views + "addEmployee.html"));


})

app.get("/employees/:num", function(req, res){

  
  data_services.getEmployees(req.params).then(function(data){
    res.json(data)
  }).catch(function(err){
    res.send(err);
  
  })
})

app.get("/managers", function(req, res){

    data_services.getManagers().then(function(data){
      res.json(data);
  })
  .catch(function(err){
    res.json({"message" : err});
  })


})

app.get("/departments", function(req, res){

    data_services.getDepartments().then(function(data){
      res.json(data);
  })
  .catch(function(err){
    res.json({"message" : err});
  })

})



app.get("/images/add", function(req,res){

  res.sendFile(path.join(__dirname + views + "addImage.html"));

})

app.get("/images",  function(req, res){

      fs.readdir("./public/images/uploaded", function(err, items){


         res.send("ITEMS : " + items)

         if (err)
         console.log(err);

      })

      //res.json();

})


app.post("/images/add", upload.single("imageFile"), function(req, res){
    
  res.redirect("/images")


});

app.post("/employees/add", function(req,res){
  //console.log(req.body);

      data_services.addEmployee(req.body).then(function(data){

          console.log(data);
          res.redirect("/employees");

      }).catch(function(err){
        
        res.send(err);

      })


})



app.use((req, res) => {
    res.status(404).send("Your princess is in another castle brother...");
  });


data_services.initialize().then(function(data){
  app.listen(HTTP_PORT, onHttpStart);

}).catch(function(err){
  console.log(err);
})