
var bodyParser = require('body-parser');
var express = require("express");
const { engine } = require("express-handlebars"); //express handlebars

var app=express();

app.engine('.hbs', engine({extname : ".hbs",   //Tells server how to hadnle HTML files thar formatted using handlebar's format(.hbs)

//gg

helpers: {

    navLink : function(url, options){  //I don't fully understand this helper function, more research needed
    
            return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';},
          
    equal   : function (lvalue, rvalue, options) {

              if (arguments.length < 3)

              throw new Error("Handlebars Helper equal needs 2 parameters");
              
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
var multer =  require('multer'); //Used for uploading files


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

app.get("/employees/add", function(req,res){



  data_services.getDepartments().then(function(array_of_depts){

    res.render("addEmployee", {departments : array_of_depts});
    

  }).catch(function(err){


    res.render("addEmployee", {departments : []});

  })

  //res.sendFile(path.join(__dirname + views + "addEmployee.html"));


})

app.get("/employees/:num", function(req, res){

  
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

app.get('/employee/delete/:employeeNum', function(req, res){

        data_services.deleteEmployeeByNum(req.params).then(function(){

          res.redirect("/employees")

        }).catch(function(err){

          res.send("ERROR : " + err);

        })


});

app.get("/managers", function(req, res){

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

app.get("/departments", function(req, res){

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

app.get("/departments/add", function(req,res){

    res.render("addDepartment");

})

app.get("/department/:departmentId", function(req,res){

  data_services.getDepartmentById(req.params).then(function(dept){

    //res.json(dept);
     res.render("department", {data: dept})

  }).catch(function(err){
    res.send("ERROR :  " + err);
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
   
    data_services.updateEmployee(req.body).then(function(){
      //console.log(req.body);
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

app.post("/departments/add", function(req,res){

  
  data_services.addDepartment(req.body).then(function(){
      res.redirect("/departments");
  }).catch(function(err){

    res.send("ERROR :  " + err);


  })


})

app.post("/department/update", function(req,res){


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
  app.listen(HTTP_PORT, onHttpStart);

}).catch(function(err){
  console.log(err);
})