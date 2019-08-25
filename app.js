var express    = require('express');
    app        = express();
    bodyParser = require('body-parser');
    mongoose   = require('mongoose');
    passport   = require('passport')
    LocalStrategy = require('passport-local')
    User        = require('./models/user')
    Campground = require('./models/campground')
    Comment = require('./models/comment')
    seedDB     = require('./seeds');
//exported function by seeds.js file is store in seedDB and the the fn is called using seedDB();
seedDB();

//PASSPORT CONFIG
app.use(require("express-session")({
    secret:"Once again Rusty wins cutest dog",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
//because views is in other folder
app.set('views','v4/views');
//SCHEMA SETUP
//
// Campground.create(
//     {
//         name:"SalmonCreek ",img:"https://farm6.staticflickr.com/5098/5496185186_d7d7fed22a.jpg",desc:"A very beautiful mountain in Spain"
//     }
//         ,function (err,campgound) {
//         if(err){
//             console.log("error")
//
//         }
//         else {
//             console.log("newly created campground");
//             console.log(campgound);
//         }
//
//     }
// );


console.log("Yelp camp has started");
app.get('/',function (req,res) {
    res.render("landing");

})
//INDEX Route-- Show all campgrounds
app.get('/campground',function (req,res) {
    //Get all Campgrounds from DB
    Campground.find({},function (err,allcampgrounds) {

        if(err){
            console.log("error is:"+err);
        }
        else{
            res.render("campground/index",{campgrounds:allcampgrounds});
            //here campground is ejs file
        }

    })



});
//NEW ROUTE-- show form to create new campgorunds
app.get('/campground/new',function (req,res) {
    res.render("campground/new.ejs");

})
//SHOW ROUTE --show info about one campground
app.get('/campground/:id',function (req,res) {
    //Populate is used bcoz comments is received in form of array of object ids in campground
    Campground.findById(req.params.id).populate("comments").exec(function (err,foundCampground) {
        if(err){
            console.log(err)
        }
        else{
            console.log(foundCampground);
            //render show template with that campground
            res.render("campground/show",{campground:foundCampground});
        }

    })

})
//CREATE --add new campgrounds to DB
app.post('/campground',function (req,res) {
    var name=req.body.name;
    var img=req.body.image;
    var desc=req.body.description;
    var newObj={name:name,img:img,desc:desc};
    console.log(newObj);
    //create a new campground and save to database
    Campground.create(newObj,function (err,newlyCreated) {
        if(err){
            console.log(err);
        }
        else{
            res.redirect('campground');
        }
        
    })
   // console.log(campgrounds);
    //redirect back to campgrounds page
    //res.redirect('campground');

})
//========================
//AUTH ROUTES


app.get('/register',function (req,res) {
    res.render("register");

})
app.post('/register',function (req,res) {
    var newUser=new User({username:req.body.username})
    //Password is saved as hash function in passport
    User.register(newUser,req.body.password,function (err,user) {
    if(err){
        console.log(err)
        res.render("register")
    }
    passport.authenticate("local")(req,res,function () {
        res.redirect("/campground");

    })

    })

})
//SHOW LOGIN FORM

app.get('/login',function (req,res) {
    res.render("login");

})
//Here passport.authenticate is middleware provider by passport

app.post('/login',passport.authenticate("local",
    {
        successRedirect:"/campground",
        failureRedirect:"/login"
            }),function (req,res) {

})

//LOGOUT ROUTE
app.get('/logout',function (req,res) {
    req.logout();
    res.redirect('/campground');

})


// ====================================
//comments routes
//nested routes
app.get('/campground/:id/comments/new',function(req,res){
    Campground.findById(req.params.id,function (err,campground) {
        if(err)
            console.log(err)
        else
        res.render("comments/new",{campground:campground})

    })
})
app.post("/campground/:id/comments",function (req,res) {
    //lookup campground using id
    Campground.findById(req.params.id,function (err,campground){
        if(err){
            console.log(err)
            redirect("/campground")

        }
        else{
           Comment.create(req.body.comment,function (err,comment) {
               if(err)
                   console.log(err)
               else{
                   campground.comments.push(comment);
                   campground.save();
                   res.redirect("/campground/"+campground._id)
               }
           })

        }
        
    })
    //create new comments
    //connect new comment to campground
    //redirect to campground show page
    

})
app.listen('2325',function () {
    console.log("Server started on port 2325");
    
})