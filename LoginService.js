var exp = require('express');
var cor = require('cors');
var mon = require('mongoose');
var bp = require('body-parser');
var jwt = require('jsonwebtoken');
const { strict } = require('assert');
const { stringify } = require('querystring');

//connection string
const url = 'mongodb://localhost:27017/LoginDB';
//connect to db
mon.connect(url,function(err){
    if(err)
    {
        console.log('error while connecting to DB')
    }
    else{
        console.log('connected')
    }
})

//creating schema to connect the DB
var schema = mon.Schema;
const userSchema = new schema({
    fullName : String,
    email : String,
    password : String
})

//Bind schema with table for using code 1st approach
var User = mon.model('User',userSchema,'UserLogin');

//enable body-parser
var express = exp();
express.use(bp.urlencoded({extended: false}));
express.use(bp.json());

//enable CORS
express.use(cor());

//creating endpoint for registration

express.post('/Register',function(req,res){
    let userData = req.body;
    //console.log(userData);
    let temp = new User(userData);
    temp.save(function(err, document){
        if(err)
        {
            console.log(err);
        }
        else{
            res.status(200).send(document);
        }
    })
})

//Login
express.post('/Login', function(req,res){

    let userData = req.body;
    User.findOne({email: userData.email},function(err,document)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(!document)
                {
                    res.status(401).send("Invalid Email");
                }
                else{
                    if(document.password!==userData.password)
                    {
                        res.status(401).send("Invalid Password");
                    }
                    else{
                        //generating token on successfull login
                        let payload = {
                            subject: document._id
                        };
                        let token = jwt.sign(payload, 'SecretKey');
                        //res.status(200).send(document);
                        res.status(200).send({token});
                    }
                }
            }
        })
})

//Middleware Logic to validate credentials
function ValidateCredentials(req,res,next) //next is handler for callback
{
    //console.log("I am middleware");
    // if(!req.headers.gatepass)
    // {
    //     return res.status(401).send("Unauthorized request");
    // }
 

    // let temp = req.headers.gatepass.split(' ')[1];
    // //console.log(temp);
    // if(temp == 405)
    // {
    //     next();
    // }
    // else{
    //     console.log("Unauthorized");
    // }
   // next();

   if(!req.headers.authorization)
   {
       return res.status(401).send("Unauthorized request");
   }
    let token = req.headers.authorization.split(' ')[1];
    //console.log(token);
    if(token == 'null')
    {
        return res.status(401).send("Unauthorized request");
    }
    else{
        let payload = jwt.verify(token,'SecretKey', function(err,decode){
            if(err)
            {
                return res.status(401).send("Unauthorized Request");
            }
            else{
                req.userId = decode.subject;
                next();
            }
        });

    }
}

//Home
express.get('/Home',ValidateCredentials,function(req,res){  //called middleware
    let data = [
        {
            "id":"1",
            "name":"C#",
            "author":"Balagurusamy",
            "price":"200",
        },
        {
            "id":"2",
            "name":".Net Framework",
            "author":"sandeep Karan",
            "price":"500",
        },
        {
            "id":"3",
            "name":"Angular",
            "author":"Google",
            "price":"2000",
        },
    ]
    res.send(data);
})

//start the server on port 5200
express.listen(5200,function(){
    console.log('server started');
})