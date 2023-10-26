const express = require('express');
const app = express();
const path = require('path');
const exphds = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const {mongoDbUrl} = require('./config/database');

// mongoose.connect(mongoDbUrl)
//     .then(db=>console.log('DB connected'))
//     .catch(err=>console.log(err));


mongoose.set("strictQuery", false);

mongoose.connect(mongoDbUrl);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app.use(express.static(path.join(__dirname, 'public')));

const {select, formatDate, paginate} = require('./helpers/handlebars-helpers');

app.engine('handlebars', exphds({defaultLayout: 'home', helpers: {select: select, formatDate: formatDate, paginate: paginate}}));
app.set('view engine', 'handlebars');

//Upload middleware

app.use(upload());

//Body Parser

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//method override

app.use(methodOverride('_method'));

app.use(session({
    secret: 'chbarbosa2018',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

//PASSSPORT
app.use(passport.initialize());
app.use(passport.session());

//Local Variables

app.use((req,res,next)=>{
    res.locals.user = req.user || null;

    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

// Routes

const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

const port = process.env.PORT || 4500;

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
});