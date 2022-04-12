const express = require('express'),
app = express(),
mongoose = require('mongoose'),
cors = require('cors'),
passport = require('passport'),
passportLocal = require('passport-local').Strategy,
cookieParser = require('cookie-parser'),
bcrypt = require('bcryptjs'),
session = require('express-session'),
bodyParser = require('body-parser'),
User = require('./user');

mongoose.connect('mongodb://localhost:27017/user_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
    origin: 'http://localhost:3000', // <-- location of frontend application
    credentials: true
}))

app.use(session({
    secret: 'asvewrgldkjfoweigealgkj',
    resave: true,
    saveUninitialized: true,
}))

app.use(cookieParser('asvewrgldkjfoweigealgkj'));
app.use(passport.initialize());
app.use(passport.session());
require('./passportConfig')(passport);

//Routes
app.post('/login', (req, res) => {
    passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        console.log(req.user);
      });
    }
  })(req, res);
})
app.post('/register', (req, res) => {
    User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
      });
      await newUser.save();
      res.send("User Created");
    }
})
})
app.get('/user', (req, res) => {
    res.send(req.user);
})
app.post('/logout', (req, res) => {
    req.logout();
    res.redirect('/')
})

//Start Server
app.listen(4000, () => console.log('server started'))