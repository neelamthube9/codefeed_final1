// app/routes.js



module.exports = function(app, passport) {



    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('home.ejs'); // load the home.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/checkprofile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/checkprofile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/solve', isLoggedIn, function(req, res) {
        res.render('solve.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/add', isLoggedIn, function(req, res) {
        
        res.render('add.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.post('/checkSolution', isLoggedIn, function(req, res) {
        var Problem = require('../app/models/problems');
        var data = req.body.output ;
        var name = req.body.problem_name;
        Problem.find({problem_name: name}, function(err, docs) {
            if(!err){
                if(data==docs.problem_output){
                    res.send('../views/success.ejs') //success file
                }
                else
                    res.send('../views/failure.ejs') //failure file
            }
        });

    });



  app.get('/viewproblem', isLoggedIn, function(req, res) {
    var mymodule = require('../views/viewproblem')
    var mongoose = require('mongoose');
    var Problems= require('../app/models/problems');
    var selectedid=req.body.problem_id;
    console.log(selectedid)
    Problems.find({problem_id: selectedid },function(err, docs){if(docs)      {
     res.render('../views/viewproblem.ejs', {data:docs});
     }; 
}); 
});
       
app.get('/loggedinhome', function(req, res) {
        var mongoose = require('mongoose');
        var problems = require('../app/models/problems');
        problems.find({}, function(err, docs) {
            if(!err) {
                console.log(docs) ;
                res.render('../views/loggedinhome.ejs', {
                    documents: docs 
                });
            }
        });
    });

app.get('/feed', function(req, res) {
        var mongoose = require('mongoose');
        var solution = require('../app/models/solution');
        solution.find({}, function(err, docs) {
            if(!err) {
                console.log(docs) ;
                res.render('../views/feed.ejs', {documents: docs});
                
                }});
            });

app.get('/viewproblist', isLoggedIn, function(req, res) {
        var mongoose = require('mongoose');
        var solution = require('../app/models/solution');
        var currentuser=req.user.username;
        solution.find({"username":currentuser}, function(err, docs) {
            if(!err) {
                console.log(docs) ;
                res.render('../views/viewproblem.ejs', {documents: docs});
                
                }});
        
            });

            


       
app.get('/showprofile', isLoggedIn, function(req, res) {
        var mongoose = require('mongoose');
        var User = require('../app/models/user');


        User.find({"username": req.user.username}, function(err, docs) {
            if(!err) {
                console.log(docs) ;
                res.render('../views/profile.ejs', {
                    documents: docs 
                });
            }
        });

        
    });


app.get('/rankings', isLoggedIn, function(req, res) {
        var mongoose = require('mongoose');
        var User = require('../app/models/user');

    User.find().sort({ solved_count: 'descending' }).exec(function(err, ranks) { 
    if(!err) {
                console.log(ranks) ;
                res.render('../views/rankings.ejs', {
                    documents: ranks 
                }); }});
   });

       
app.get('/showstats', isLoggedIn, function(req, res) {
        var mongoose = require('mongoose');
        var Solution = require('../app/models/solution');


        Solution.find({"username": req.user.username}, function(err, docs) {
            if(!err) {
                console.log(docs) ;
                res.render('../views/stats.ejs', {
                    documents: docs 
                });
            }
        });

        
    });

       
app.get('/checkprofile', isLoggedIn, function(req, res) {
        var mongoose = require('mongoose');
        var User = require('../app/models/user');
        console.log("Current username is: "+req.user.username)
        if((req.user.username || req.user.name) ==null){
            res.redirect('/updateprofile')
        }
        else
        {
            res.redirect('/updateprofile1')
        }
            
            });
 

app.get('/updateprofile', function(req, res) {
                res.render('../views/signupprofile.ejs')
    });

app.get('/updateprofile1', function(req, res) {
                res.render('../views/signupprof.ejs')
    });

app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


// =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facsuccessRedirect : '/loggedinhome',
            
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : [ 'email'], failureRedirect:'/login' }, function(req, res){
        
        }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect:'/checkprofile',
            failureRedirect:'/'
        }));

    // route for logging out
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};
// route middlewa

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
