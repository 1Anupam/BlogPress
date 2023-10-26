const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.all('/*',(req,res,next)=>{
    if (!req.user || !req.isAuthenticated()) {
        if (req.path === '/login' || req.path === '/register') {
            return next(); // Allow access to login and register pages
        } else {
            return res.redirect('/login'); // Redirect to login for other pages
        }
    }
    req.app.locals.layout = 'home';
    next();
});

router.get('/', (req, res)=>{
    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({})
        .skip((perPage*page)-perPage)
        .limit(perPage)
        .then(posts => {
            Post.count().then(postCount=>{
                Category.find({}).then(categories => {
                    res.render('home/index', {
                        posts: posts,
                        categories: categories,
                        current: parseInt(page),
                        pages: Math.ceil(postCount/perPage)
                    });
                });
            });
    });

    //a missing catch error here

});
router.get('/about', (req, res)=>{

    res.render('home/about');

});
router.get('/login', (req, res)=>{

    res.render('home/login');

});

//APP Login
// passport.use(new LocalStrategy({usernameField: 'email'},(email, password, done)=> {
//     User.findOne({email:email}).then(user=>{
        
//         if(!user) return done(null, false, {message: 'no user found'});
//         bcrypt.compare(password, user.password, (err, matched)=>{
//             if (err) return err;
//             if (matched) {
//                 console.log(user)
//                 return done(null, user);                
//             } else {
//                 return done(null, false, {message:'password is incorrect'});
                
//             }
//         });
//     });
// }));

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) return done(null, false, { message: 'no user found' });
      
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        
        return done(null, user);
      } else {
        return done(null, false, { message: 'password is incorrect' });
      }
    } catch (error) {
      return done(error, false, { message: 'authentication error' });
    }
  }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(async function(id, done) {
    user = await User.findById(id);
    done(null, user)
});


// router.post('/login', (req, res, next)=>{
//     passport.authenticate('local',{
//         successRedirect: '/admin',
//         failureRedirect: '/login',
//         failureFlash: true
//     })(req, res, next);

// });

router.post('/login',function(req, res,next) {
    console.log('authenicating');
    next()
  } ,
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    console.log("ur good");
    res.redirect('/admin');
  });

router.get('/logout', (req, res)=>{

    req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/login');
      })


});
router.get('/register', (req, res)=>{

    res.render('home/register');

});
router.post('/register', (req, res)=>{

    let errors = [];

    if (!req.body.firstName) {
        errors.push({message: 'please add a first name'});
    }

    if (!req.body.lastName) {
        errors.push({message: 'please add a last name'});
    }

    if (!req.body.email) {
        errors.push({message: 'please add an email'});
    }

    if (!req.body.password) {
        errors.push({message: 'please add a password'});
    }

    if (!req.body.passwordConfirm) {
        errors.push({message: 'please add a password'});
    }

    if (req.body.password !== req.body.passwordConfirm) {
        errors.push({message: "Password Fields don't match"});
    }

    if (errors.length > 0) {
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
        
    } else {

        User.findOne({email: req.body.email}).then(user=>{
            if (user) {
                req.flash(res.locals.error_message, 'That email exist please login');
                res.redirect('/login');
            }
        });

        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUser.password, salt, (err, hash)=>{
                newUser.password = hash;
                newUser.save().then(savedUser => {
                    req.flash('success_message', 'you now are registered, please login')
                    res.redirect('/login');
                });
            });
        });


    }


});
router.get('/post/:slug', (req, res)=>{

    Post.findOne({slug: req.params.slug})
    .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', models: 'users'}})
    .populate('user')
    .then(post => {

        Category.find({}).then(categories => {
            res.render('home/post', {post: post, categories: categories});
        });
    });

});

module.exports = router;