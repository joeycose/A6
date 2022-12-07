/*********************************************************************************
* BTI325 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Giuseppe Cosentino 
* Online (Heroku Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 


var bodyParser = require('body-parser');
var express = require("express");
const exphbs = require("express-handlebars"); //express handlebars
var clientSessions = require("client-sessions");

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
app.use(express.static('public')); //idk know what this is used for q.q
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "Joes_BTI325_A6", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));


var HTTP_PORT = process.env.PORT || 8080;

var fs = require("fs");
var path = require('path');
var multer =  require('multer'); //Used for uploading files


var storage = multer.diskStorage({

  destination : "./public/images/uploaded", //store files here
  filename: function(req, file, cb){
      cb(null, Date.now() + path.extname(file.originalname)); 
  }

});

const upload = multer({storage : storage});  

const data_services =  require("./data-service")
const dataServiceAuth = require("./data-service-auth");

const views = '/views/';

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
 
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}


app.use(function(req,res,next){ 

  res.locals.session = req.session;

  let route = req.baseUrl + req.path;//adds property activeRoute to app.locals. I don't fully understand this  function, more research needed
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


app.get("/login", function(req,res){
    console.log("LOGIN PAGE!");
    res.render("login");

})

app.get("/logout", function(req, res){

  
    req.session.reset();
    res.redirect("/");

});


app.get("/register", function(req,res){

  res.render("register");

})

app.get("/userHistory", ensureLogin,function(req,res){

    res.render("userHistory");

});

app.get("/employees", ensureLogin, function(req,res){

  console.log(req.query);


  if(Object.keys(req.query).length === 0){ //check if query is empty 
    data_services.getAllEmployees().then(function(data){

        //res.json(data);
        if (data.length > 0){
          res.render("employees", {data : data});
        }
        else{
          res.render("employees", {data : "No results"});
        }
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

app.get("/employees/add", ensureLogin, function(req,res){



  data_services.getDepartments().then(function(array_of_depts){

    res.render("addEmployee", {departments : array_of_depts});
    

  }).catch(function(err){


    res.render("addEmployee", {departments : []});

  })

  //res.sendFile(path.join(__dirname + views + "addEmployee.html"));


})

app.get("/employees/:num", ensureLogin, function(req, res){

  
  let viewData = {};

  data_services.getEmployees(req.params).then((data) => {
      if (data) {
  
          viewData.employee = data; //store employee data in the "viewData" object as "employee"
      } else {
          viewData.employee = null; // set employee to null if none were returned
      }
  }).catch(() => {
      viewData.employee = null; // set employee to null if there was an error 
  }).then(data_services.getDepartments)
  .then((data) => {
      viewData.departments = data; // store department data in the "viewData" object as "departments"

      // loop through viewData.departments and once we have found the departmentId that matches
      // the employee's "department" value, add a "selected" property to the matching 
      // viewData.departments object

      for (let i = 0; i < viewData.departments.length; i++) {
          if (viewData.departments[i].departmentId == viewData.employee[0].dataValues.department) {
              viewData.departments[i].selected = true;
          }
      }

  }).catch(() => {
      viewData.departments = []; // set departments to empty if there was an error
  }).then(() => {
      if (viewData.employee == null) { // if no employee - return an error
          res.status(404).send("Employee Not Found");
      } else {
        console.log(viewData.employee);
          res.render("employee", { viewData: viewData }); // render the "employee" view
      }
  })
})

app.get('/employee/delete/:employeeNum', ensureLogin, function(req, res){

        data_services.deleteEmployeeByNum(req.params).then(function(){

          res.redirect("/employees")

        }).catch(function(err){

          res.send("ERROR : " + err);

        })


});

app.get("/managers",ensureLogin, function(req, res){

    data_services.getManagers().then(function(data){
      //res.json(data);
      if (data.length > 0){
        res.render("managers", {data : data});
      }
      else{
        res.render("managers", {data : "No results"});
      }
  })
  .catch(function(err){
     res.render("managers" , {data: err});
  })


})

app.get("/departments", ensureLogin, function(req, res){

    data_services.getDepartments().then(function(data){

      if (data.length > 0){
        res.render("departments", {data : data});
      }
      else{
        res.render("departments", {data : "No results"});
      }
      
  })
  .catch(function(err){
      res.render("departments" , {data: err});
  })

})

app.get("/departments/add", ensureLogin, function(req,res){

    res.render("addDepartment");

})

app.get("/department/:departmentId",ensureLogin, function(req,res){

  data_services.getDepartmentById(req.params).then(function(dept){

    //res.json(dept);
     res.render("department", {data: dept})

  }).catch(function(err){
    res.send("ERROR :  " + err);
  })

})

app.get("/images/add", ensureLogin, function(req,res){

  res.render("addImage")
  //res.sendFile(path.join(__dirname + views + "addImage.html"));

})

app.get("/images", ensureLogin, function(req, res){

      fs.readdir("./public/images/uploaded", function(err, items){


        console.log("ITEMS : " + items)
        res.render("images", {data: items});

         if (err){
          res.send("IMAGE RETRIVIAL ERROR :" + err);
          console.log(err);

         }

      })

    

 

})


app.post("/register", function(req, res){

  console.log("REGISTERING USER!");
      dataServiceAuth.registerUser(req.body).then(function(){
        

         res.render("register", {successMessage : "User Created"});

      }).catch(function(errors){

            res.render("register", {errorMessage : errors, userName : req.body.userName})

      });

});

app.post("/login", function(req,res){

    req.body.userAgent = req.get('User-Agent');

    dataServiceAuth.checkUser(req.body).then(function(user){

      req.session.user = {

        userName : user.userName,
        email : user.email,
        loginHistory : user.loginHistory


      }

      res.redirect("/employees");

    }).catch(function(err){

      //Returning the userName back to the login page, so the user does not forget the user value that was used to attempt to log into the system
      res.render("login", {errorMessage : err, userName : req.body.userName});

    })

});


app.post("/employee/update", ensureLogin, function(req,res){
   
    data_services.updateEmployee(req.body).then(function(){
      //console.log(req.body);
        res.redirect("/employees");

    }).catch(function(err){

      res.send(err);

    })

})


app.post("/images/add", ensureLogin, upload.single("imageFile"), function(req, res){
    
  //Yo call me pussy ass bitch <3 
  //All love all love 

  res.redirect("/images")


});

app.post("/employees/add", ensureLogin, function(req,res){
  //console.log(req.body);

      data_services.addEmployee(req.body).then(function(data){

          console.log(data);
          res.redirect("/employees");

      }).catch(function(err){
        
        res.send(err);

      })


})

app.post("/departments/add", ensureLogin, function(req,res){

  
  data_services.addDepartment(req.body).then(function(){
      res.redirect("/departments");
  }).catch(function(err){

    res.send("ERROR :  " + err);


  })


})

app.post("/department/update", ensureLogin, function(req,res){


    data_services.updateDepartment(req.body).then(function(){
      res.redirect("/departments")
    }).catch(function(err){
      res.send("ERROR : " + err);
    })


})

app.use((req, res) => {
    res.status(404).send("Your princess is in another castle brother...");
});


data_services.initialize().then(function(data){


  dataServiceAuth.initialize().then(function(data){

    app.listen(HTTP_PORT, onHttpStart);

  }).catch(function(err){

    console.log("Unable to start server : " + err);

  })


 

}).catch(function(err){
  
  console.log("Unable to start server : " + err);
})
