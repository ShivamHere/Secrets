require('dotenv').config();         //Keep this as early as possible in the file.
const express = require('express');
const app = express();
const ejs = require('ejs');
const _ = require('lodash');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const PORT = process.env.PORT || 3300;

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());
app.set('view engine', 'ejs');

const newDbName = "/userDB";
const db = "mongodb://localhost:27017"+newDbName; //for local database.
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if (err) console.error(err);
    else console.log("Connected to the mongodb");
});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({    //new statement is must for encryption
    email:{
        type:String,
        unique:true
    },
    password:String
});
//let secretLine = "Thisissceretcoderequired.";   //Used for encrypt, works automatically for save and find.
let secretLine = process.env.SECRET;              //Save all secret key, api or passwords in .env file which remains hidden.
//Add this plugin before creating mongoose model, add all fields which needs to be encrypted.
userSchema.plugin(encrypt, { secret: secretLine, encryptedFields:['password'] });

const User = new mongoose.model('User',userSchema);

app.get('/',(req,res)=>{
    res.render('home');
});
app.get('/login',(req,res)=>{
    res.render('login');
});
app.get('/register',(req,res)=>{
    res.render('register');
});
app.get('/secrets', (req,res)=>{
    res.redirect('/');
});

app.post('/register', (req,res)=>{
    const newUser = new User({
        email: _.toLower(req.body.email),
        password: req.body.password
    });
    newUser.save().then(()=>{
        console.log(`${newUser.email} is added to DB.`);
        res.render('secrets');
    }).catch((err)=>{
        console.log(err);
        res.render('register');
    });
});
app.post('/login', (req,res)=>{
    User.findOne({email: _.toLower(req.body.email)},(err,foundUser)=>{
        if(err) console.log(err);
        else{
            if(foundUser.password === req.body.password){
                res.render('secrets');
            }
            else{
                console.log('Password didn\'t match');
                res.redirect('/login');
            }
        }
    });
});





app.listen(PORT, () => {
    console.log("Server started at port", PORT);
});
