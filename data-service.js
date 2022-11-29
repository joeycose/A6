const fs = require('fs'); 
const data_folder = "./data/";

var mongoose = require('mongoose');
var employees;
var departments;

var exports = module.exports = {};

const Sequelize = require('sequelize');

var sequelize = new Sequelize('suoufqxe', 'suoufqxe', 'ziwXZ0gQDSaoMq_SIuxGsFQi257kkmSX', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

 sequelize.authenticate().then(()=>console.log('Connection success.')).catch((err)=>console.log("Unable to connect to DB.", err));

 var Employee = sequelize.define('Employee',{

    empNum : {
        
        type: Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey : true    },
    
    firstName          : Sequelize.STRING,
    lastName           : Sequelize.STRING,
    email              : Sequelize.STRING,
    SSN                : Sequelize.STRING,
    addressStreet      : Sequelize.STRING,
    addressCity        : Sequelize.STRING,
    addressState       : Sequelize.STRING,
    addressPostal      : Sequelize.STRING,
    maritalStatus      : Sequelize.STRING,
    isManager          : Sequelize.BOOLEAN,
    employeeManagerNum : Sequelize.INTEGER,
    status             : Sequelize.STRING,
    department         : Sequelize.INTEGER,
    hireDate           : Sequelize.STRING

 });


 var Department = sequelize.define('Department', {


    departmentId : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },

    departmentName : Sequelize.STRING

 })

exports.initialize = function(){

    return new Promise(function(resolve, reject){

            sequelize.sync().then(function(){
                console.log("Initialize function was able to sync with database ;3")
                    resolve();

           

            }).catch(function(err){

                reject("Unable to sync data from Initialize :" + err)
            }) 
            
        })
    
    
      


    }

  



 exports.getAllEmployees = function(){


        return new Promise(function(resolve , reject){

            sequelize.sync().then(function(){

                Employee.findAll({order: ['empNum']}).then(function(array_of_emps){

                        resolve(array_of_emps);
                }).catch(function(err){

                    reject("No results or error : " + err)

                })


            }).catch(function(err){
                reject("Sync Error in getAllEmployees ):");
            })
 

        })

}
//test

exports.getEmployees = function(query){

    var condition;
   
    if (query.status !== undefined){

       condition = {status : query.status}
        
    }
    else if(query.department !== undefined){

        condition = {department : query.department};
      
    }
    else if(query.manager !== undefined){

        condition = {hasManager : query.manager};
  
    }
    else if(query.num !== undefined){

        condition = {empNum : query.num }


    }
    

    return new Promise(function(resolve,reject){

            sequelize.sync().then(function(){

                Employee.findAll({where : condition, order : ['empNum']}).then(function(array_of_emps){

                        resolve(array_of_emps);

                }).catch(function(err){
                        reject("No results found for : " +  condition)
                })



            })
          
      
    })


}


exports.getManagers = function(){
    
    var Managers = [];

    return new Promise(function(resolve, reject){

        sequelize.sync().then(function(){

            Employee.findAll({where : {isManager : true}, order : ['empNum']}).then(function(array_of_mangers){

                resolve(array_of_mangers);

            }).catch(function(err){
                reject("No Managers exist or error: " + err)
            })


        }).catch(function(err){

            reject("Something went wrong with sync in getManagers function :" + err )

        })
        



    })


}

exports.getDepartments = function(){


    return new Promise(function(resolve , reject){

        sequelize.sync().then(function(){

            Department.findAll({order : ['departmentId']}).then(function(array_of_depts){

                   //console.log(array_of_depts);
                    resolve(array_of_depts);

            }).catch(function(err){
                        reject("No results found or Error : " + err)
            })



        }).catch(function(err){
            reject("Error with sync in getDepartments ):")
        })
    })

}

var CheckIfAttributesExist = function(emp){


console.log(emp);

    for (attribute in emp){
        if (attribute === ""){
            attribute = null;
        }
    }
}



exports.addEmployee = function(data){

    return new Promise(function(resolve, reject){

        console.log("add Employee Called");

       


        sequelize.sync().then(function(){

            CheckIfAttributesExist(data); //set emp_array attributes to null if they're empty

            Employee.create({
                //empNum: data.employeeNum,
                firstName : data.firstName ? data.firstName  : null,
                lastName : data.lastName ? data.lastName : null,
                email : data.email ? data.email : null,
                SSN : data.SSN ? data.SSN : null,
                addressStreet : data.addressStreet ? data.addressStreet : null,
                addressCity : data.addressCity ? data.addressCity : null,
                addressState: data.addressState ? data.addressState : null,
                addressPostal : data.addressPostal ? data.addressPostal : null,
                maritalStatus : data.maritalStatus  ? data.maritalStatus : null,
                isManager : data.isManager ? false : true,
                employeeManagerNum : data.employeeManagerNum ? data.employeeManagerNum : null,
                status : data.status ? data.status : null,
                department : data.department ? data.department : null,
                hireDate : data.hireDate ? data.hireDate : null    

            }).then(function(newEmp){
                    console.log(newEmp);
                    resolve(newEmp);

            }).catch(function(err){
                reject("Something went wrong with adding a new employe : " + err )
            })

        }).catch(function(error){

            reject("Something went wrong with sync in addEmployee function : " + err)
        })



    })
   
}


exports.updateEmployee = function(data){
   
    

    return new Promise(function(resolve, reject){


     sequelize.sync().then(function(){

      CheckIfAttributesExist(data); //set emp_array attributes to null if they're empty

        Employee.update({

            firstName : data.firstName ? data.firstName : null,
            lastName : data.lastName ? data.lastName : null,
            email : data.email ? data.email : null,
            SSN : data.SSN ? data.SSN : null,
            addressStreet : data.addressStreet ? data.addressStreet : null,
            addressState: data.addressState ? data.addressState : null,
            addressPostal : data.addressPostal ? data.addressPostal : null,
            addressCity : data.addressCity ? data.addressCity : null,
            maritalStatus : data.maritalStatus  ? data.maritalStatus : null,
            isManager : data.isManager ? false : true,
            employeeManagerNum : data.employeeManagerNum ? data.employeeManagerNum : null,
            status : data.status ? data.status : null,
            department : data.department ? data.department : null,
            hireDate : data.hireDate ? data.hireDate : null

        }, {where : {empNum : data.employeeNum}}).then(function(){
            resolve();
        }).catch(function(err){
            reject("Update Employee Function Error : " + err);
        })


     }).catch(function(err){
         reject("Sync error in updateEmployee Function : " + err);
     })
            

        

    })
}



exports.deleteEmployeeByNum = function(data){

        return new Promise(function(resolve, reject){

            sequelize.sync().then(function(){

                Employee.destroy({where : {empNum : data.employeeNum}}).then(function(){
                    resolve();
                }).catch(function(err){
                    reject("Err with delete emp : " + err);
                })


            }).catch(function(err){

                reject("Issue with Sync in  deleteEmpy : " + err)
            })

        })

}


exports.addDepartment = function(data){


    return new Promise(function(resolve, reject){
        
        sequelize.sync().then(function(){

            CheckIfAttributesExist(data);

            Department.create({

                departmentName : data.departmentName

            }).then(function(dept_obj){

                resolve();

            }).catch(function(err){


                reject("Error with Dept Create : " + err);

            })


        }).catch(function(err){
            reject("ERROR : " +  err)
        })
    })
}


exports.updateDepartment = function(data){
    

    return new Promise(function(resolve, reject){

        sequelize.sync().then(function(){

            console.log(data);
            Department.update({
    
                departmentName : data.departmentName
    
            }, {where : {departmentId : data.departmentId}}).then(function(){
                resolve()
            }).catch(function(err){
                reject("ERROR : " + err);
            })
    
        }).catch(function(err){
    
            reject("Error in update Department Sync : " + err);
        })


    })
    

}


exports.getDepartmentById = function(data){


    return new Promise(function(resolve, reject){

        sequelize.sync().then(function(){

            Department.findAll({where : {departmentId : data.departmentId}}).then(function(dept_obj){

                    resolve(dept_obj[0]);

            }).catch(function(err){

                reject("Error with findAll depts : " + err);

            })

        }).catch(function(err){

            reject("ERROR with sync in getDeptById : " + err);
        })

    })




}