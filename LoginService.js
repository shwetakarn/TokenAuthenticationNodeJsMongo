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
                        res.status(200).send(document);
                    }
                }
            }
        })
})

//Home
express.get('/Home',function(req,res){
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