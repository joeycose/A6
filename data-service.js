const fs = require('fs'); //used for file reading :3
const data_folder = "./data/";

var employees;
var departments;
var exports = module.exports = {};

exports.initialize = function(){

    return new Promise(function(resolve, reject){

        fs.readFile(data_folder + "employees.json", function(err, data){

            if (err) reject(err)

            else{
            employees = JSON.parse(data);
            console.log("Employees file sucessfully opened and parsed");      
            
                fs.readFile(data_folder + "departments.json", function(err, data){
        
                    if (err) reject(err)
                    else
                    departments = JSON.parse(data);
                    console.log("Departments file sucessfully opened and parsed");
                    resolve("ALL FILES SUCCESFULLY READ");
                })
            }

        })
    
    
      


    })
  

}

 exports.getAllEmployees = function(){


        return new Promise(function(resolve , reject){

            if (employees.length != 0)
            resolve(employees);
            else
            reject("It seems we have no employees ):");

        })

}


exports.getEmployees = function(query){

    var condition;
    var value;
    var tmp = [];

    if (query.status !== undefined){
        condition = "status";
        value = query.status;
    }
    else if(query.department !== undefined){

        condition = "department";
        value = query.department;

    }
    else if(query.manager !== undefined){

        condition = "hasManager";
        value = query.manager;

    }
    else if(query.num !== undefined){

        condition = "id";
        value = query.num;

    }
    
    



    return new Promise(function(resolve,reject){

      For_Loop:for (let i = 0; i < employees.length; ++i){

            switch (condition){
                
             case "status": 
                if (employees[i].status === value)
                    tmp.push(employees[i]);
                break;

                
             case "department": 
             if (employees[i].department == value)
          

                 tmp.push(employees[i]);
             break;

             case "hasManager": 
             if (employees[i].employeeManagerNum == value)
                 tmp.push(employees[i]);
             break;

             
             case "id": 
             if (employees[i].employeeNum == value){
                 tmp.push(employees[i]);
                 break For_Loop;
                }
             break;

            }
          
      }  
      //console.log(tmp);

      if (tmp.length > 0 ){
          resolve(tmp)
      }
      else{
      reject("Either no employees with the condition " + condition + " === " + value + " Or something went wrong.... ):")
      }

    })


}


exports.getManagers = function(){
    
    var Managers = [];

    return new Promise(function(resolve, reject){


     if (employees.length != 0)
        for (let i = 0; i < employees.length; i++){
            if (employees[i].isManager == true)
            Managers.push(employees[i])
        }
    else {
        reject("Employees array is empty... sorry pal");

   
    }
    if (Managers.length != 0){

        resolve(Managers);

    }
    else{
        reject("No managers exist... ")
    }



    })


}

exports.getDepartments = function(){


    return new Promise(function(resolve , reject){

        if (departments.length != 0)
        resolve(departments);
        else
        reject("WE HAVE NO DEPARTMENTS!");

    })

}

exports.addEmployee = function(data){

    return new Promise(function(resolve, reject){

        console.log("add Employee Called");

       var errText = "";

       let emp = {  //create emp object using data parameter
            employeeNum : employees.length + 1,       
            firstName : data.firstName,
            lastName : data.lastName,
            email : data.email,
            SSN : data.SSN,
            addressStreet : data.addressStreet,
            addressState: data.addressState,
            addressPostal : data.addressPostal,
            maritalStatus : data.maritalStatus,
            isManager : data.isManager === undefined ? false : true,
            employeeManagerNum : data.employeeManagerNum === undefined ? null : data.employeeManagerNum,
            status : data.status,
            department : data.department,
            hireDate : data.hireDate
       };   
   
        
            employees.push(emp);
            console.log("RESOLVED addemployee")
            resolve(emp);
      

    })
   
}

exports.updateEmployee = function(employeeData){
    console.log("UPDATE CALLED")
    return new Promise(function(resolve, reject){


        for(let i = 0; i< employees.length; ++i){

            if (employees[i].employeeNum == employeeData.employeeNum){
                console.log("MATCH FOUND FOR UPDATE");
                employees[i] = employeeData;
                console.log("Update complete");
                resolve();
            }

        }

        reject("No emp of " + employeeData.employeeNum + "Found");
            

        

    })
}