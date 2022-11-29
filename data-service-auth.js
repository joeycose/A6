var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;
var exports = module.exports = {};
mongoose.set('debug', true);



var userSchema =  new Schema({

    "userName"     : {"type" : String,
                      "unique" : true },

    "password"     :  String,

    "email"        :  String,

    "loginHistory" : [{  "dateTime" : Date,
                        "userAgent" :  String
                      }]

});


//userSchema.pre('save', () => console.log('Hello from pre save'));

let User;

function isEmptyOrSpaces(str){ //From stackoverflow: https://stackoverflow.com/questions/10232366/how-to-check-if-a-variable-is-null-or-empty-string-or-all-whitespace-in-javascri
    return str === null || str.match(/^ *$/) !== null;
}

exports.initialize = function(){

    return new Promise(function(resolve, reject){

        //let db = mongoose.createConnection("mongodb://localhost:27017/", { useNewUrlParser: true }); //connect to database        
        let db = mongoose.createConnection("mongodb+srv://joeycaze:Tree_frog17@a6.u7rmy51.mongodb.net/A6-info?retryWrites=true&w=majority", { useNewUrlParser: true }); //connect to database
        
        db.on('error', function(err){ //Check for connection error
            reject("Mongo DB Database connection error");
        })

        db.once('open', function(){ //Check for connection success

            //if sucessful then add Users????
            console.log("DB CONNECTION SUCESSFUL");
           User = db.model("users", userSchema);
            resolve("Database connection Successful");

        })

    })
  

};


    
exports.registerUser = function(userData){

    let errMsgs = [];
    

    return new Promise(function(resolve,reject){

        //Do validation check of userData params
        console.log("Register User Called");

        console.log(userData);
        //console.log(userData.password);

        //Password Validation
        if (isEmptyOrSpaces(userData.password)){ //Checks for null, undefined, 0, 000, "", False (Got from stackoverflow : https://stackoverflow.com/questions/154059/how-to-check-empty-undefined-null-string-in-javascript)
                errMsgs.push("Password 1 cannot be empty or only white spaces!");
        }

        if (isEmptyOrSpaces(userData.password2)){ //Checks for null, undefined, 0, 000, "", False (Got from stackoverflow : https://stackoverflow.com/questions/154059/how-to-check-empty-undefined-null-string-in-javascript)
            errMsgs.push("Password 2 cannot be empty or only white spaces!");
        }

        if (userData.password != userData.password2){
            errMsgs.push("Passwords must match!")
        }

        //Username Validation
        if (isEmptyOrSpaces(userData.userName)){ //Checks for null, undefined, 0, 000, "", False (Got from stackoverflow : https://stackoverflow.com/questions/154059/how-to-check-empty-undefined-null-string-in-javascript)
                errMsgs.push("Username cannot be empty or only white spaces");
        }
        

        //User creation :)
        if (errMsgs.length > 0){
            reject(errMsgs);
        }
        else{
              
            console.log("No errors with registration page");

            var newUser = new User(userData);

            console.log("New user created ");
            console.log(newUser);


    bcrypt.genSalt(10, function(err, salt) { // Generate a "salt" using 10 rounds
    bcrypt.hash(newUser.password, salt, function(er, hash) { // encrypt the password: "myPassword123"
        // TODO: Store the resulting "hash" value in the DB

        if (!er){

            newUser.password = hash;

            newUser.save((err) => {
                console.log("TEST");
            if(err) {
                reject(err);
            } else {
                    resolve();
            }
            
            });
        }
        else{
            reject("HASHING ERROR D:");
        }

    });
    });


            
        
  
        }

    })
}


exports.checkUser = function(userData){

    return new Promise(function(resolve,reject){

        User.findOne({userName : userData.userName}).exec().then(function(user){
            

           
            if (user){

                console.log("User Exist")
                console.log("Passowrd : " + user.password);

                bcrypt.compare(userData.password, user.password).then(function(isMatch){

                    console.log("Comparing passowords")
                    if (isMatch == false){
                        console.log("Password Mismatch ):");
                        reject("Passwords do not match ): ");
                    }
                    else{ 
                        console.log("Password match :)");
                        //Update login history

                        //"loginHistory" : [{  "dateTime" : Date,
                        //"userAgent" : String
                        // }]
                        console.log("Pushing back history now ");
                        user.loginHistory.push({dataTime : new Date().toString(), userAgent : userData.userAgent});
                        console.log("History has been updated :) ");
                  



                        User.update({userName : user.userName},  { $set: {loginHistory: user.loginHistory}}, 
                            { multi: false}).exec().then(function(){
                                console.log("USER LOGGED IN");
                                resolve(user);

                            }).catch(function(err){
                                    reject("There was an error verifying the user : " + err);
                            })

                     //resolve();
                    }

                 }).catch(function(err){
                     reject("Encryption Error : "  + err);
                 })





            }
            else{
               reject( userData.userName + " was not found in the database ):");
            }

        }).catch(function(err){

                //CATCH THIS DICK ON FRIDAY AFTER 4 O CLOCK SWEETIE <3
                reject("Unable to find user : " + userData.userName);

        });

    })

  


}