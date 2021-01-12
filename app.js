var express = require('express');
var mongoose =  require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");

var app = express();

//Database Connection
mongoose.connect("mongodb+srv://user1:12345@cluster0.kvp5y.mongodb.net/login-db?retryWrites=true&w=majority", {
    useUnifiedTopology: true,
    useNewUrlParser: true 
});
app.use(require("express-session")({
    secret:"it's secrate",       
    resave: false,          
    saveUninitialized:false    
}));

passport.serializeUser(User.serializeUser());       
passport.deserializeUser(User.deserializeUser());   
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded(
      { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());

//Routings
app.get("/", (req,res) =>{
    res.render("home");
});
app.get("/userprofile",isLoggedIn ,(req,res) =>{
    res.render("userprofile");
});
app.get("/login",(req,res)=>{
    res.render("login");
});

//Authentication Routings
app.post("/login",passport.authenticate("local",{
    successRedirect:"/userprofile",
    failureRedirect:"/login"
}),function (req, res){
    console.log("User Authentication Successful")
});
app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    
    User.register(new User({username: req.body.username,phone:req.body.phone}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("register");
        }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    });   
    });
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//Server Configuration
const port = 2120;
app.listen(process.env.PORT ||port,function (err) {
    if(err){
        console.log(err);
    }else {
        console.log("Server Started At Port", port);
        console.log("Access client at : " + "http://localhost:"+port);
    } 
      
});