/**********************************************************************************  
 * BTI325–Assignment4* 
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy. 
 *  No part *  of this assignment has been copied manually or electronically from any other source *  
 * (including 3rd party web sites) or distributed to other students.*

Name: Giuseppe Cosentino

Heroku Link: https://fierce-chamber-53489.herokuapp.com/

* *********************************************************************************/ 
 
 
 var bodyParser = require('body-parser');
 var express = require("express");
 const exphbs = require("express-handlebars"); 

 
 var app=express();
 
 app.engine('.hbs', exphbs.engine({extname : ".hbs",   
 
 
 helpers: {
 
     navLink : function(url, options){  
     
             return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';},
           
     equal   : function (lvalue, rvalue, options) {
 
               if (arguments.length < 3)
 
               throw new Error("Handlebars Helper equal needs 2 parameters");//I don't fully understand this helper function, more research needed
               
               if (lvalue != rvalue) {
                 return options.inverse(this);} 
               
               else {
                 
                 return options.fn(this);}
 
     }
 }
 
 
 
 
 })) 
 
 app.set('view engine', '.hbs');
 app.use(express.static('public')); 
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());
 
 var HTTP_PORT = process.env.PORT || 8080;
 
 
 var fs = require("fs");
 var path = require('path');
 var multer =  require('multer'); 
 
 
 var storage = multer.diskStorage({
 
   destination : "./public/images/uploaded", //store files here
   filename: function(req, file, cb){
       cb(null, Date.now() + path.extname(file.originalname)); //Name file with date & time of posting
   }
 
 });
 
 const upload = multer({storage : storage});  //tell multer to use the diskStorage function for naming files instead of its default settings
 
 const data_services =  require("./data-service")
 
 const views = '/views/';
 
 function onHttpStart() {
     console.log("Express http server listening on: " + HTTP_PORT);
   }
  
 
 app.use(function(req,res,next){ //adds property activeRoute to app.locals. I don't fully understand this  function, more research needed
 
   let route = req.baseUrl + req.path;
   app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
   next();
 
 });
 
 app.get("/", (req, res) =>{
  
     res.render('home');
     //res.sendFile(path.join(__dirname + views + "home.html"));
 })
 
 app.get("/about", (req, res) =>{
     res.render("about");
   //res.sendFile(path.join(__dirname + views + "about.html"));
 })
 
 
 app.get("/employees", function(req,res){
 
   console.log(req.query);
 
 
   if(Object.keys(req.query).length === 0){ //check if query is empty 
     data_services.getAllEmployees().then(function(data){
 
         //res.json(data);
         res.render("employees", {data : data});
     })
     .catch(function(err){
        res.render("employees" , {data: err});
     })
   }
   else if (Object.keys(req.query).length !== 0){ //send params to getEmployees
     data_services.getEmployees(req.query).then(function(data){
       res.render("employees", {data : data});
       //res.json(data)
       
     }).catch(function(err){
       res.render("employees" , {error: err});
       //res.send(err);
     })
   }
 
 })
 
 app.get("/employees/add", function(req,res){
 
 
   res.render("addEmployee")
   //res.sendFile(path.join(__dirname + views + "addEmployee.html"));
 
 
 })
 
 app.get("/employees/:num", function(req, res){
 
   
   data_services.getEmployees(req.params).then(function(data){
     
     //console.log(data);
     res.render("employee", {emp: data[0]});
     //res.json(data)
   }).catch(function(err){
     console.log("ERROR : " + err);
     res.render("employee", {error: err});
   
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
       res.render("departments" , {data: data});
   })
   .catch(function(err){
       res.render("departments" , {data: err});
   })
 
 })
 
 
 
 app.get("/images/add", function(req,res){
 
   res.render("addImage")
   //res.sendFile(path.join(__dirname + views + "addImage.html"));
 
 })
 
 app.get("/images",  function(req, res){
 
       fs.readdir("./public/images/uploaded", function(err, items){
 
 
         console.log("ITEMS : " + items)
         res.render("images", {data: items});
 
          if (err){
           res.send("IMAGE RETRIVIAL ERROR :" + err);
           console.log(err);
 
          }
 
       })
 
     
 
  
 
 })
 
 app.post("/employee/update", function(req,res){
    
     data_services.updateEmployee(req.body).then(function(data){
       console.log(req.body);
         res.redirect("/employees");
 
     }).catch(function(err){
 
       res.send(err);
 
     })
 
 })
 
 
 app.post("/images/add", upload.single("imageFile"), function(req, res){
     
   //Yo call me pussy ass bitch <3 
   //All love all love 
 
 
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