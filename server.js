if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('passport')
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const users = []
const bcrypt = require('bcrypt')
const initializePassport = require('./passport-config')
initializePassport(passport, 
  email => users.find(user => user.email === email), 
  id => users.find(user => user.id ===id )
  )
const indexRouter = require('./routes/index')
const valueRouter = require('./routes/values')
const bookRouter = require('./routes/books')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const port = process.env.PORT || 8080;

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

const mongoose = require('mongoose')
const { request } = require('express')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/values', valueRouter)
app.use('/books', bookRouter)

app.post('/users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = { name: req.body.name, password: hashedPassword }
    users.push(user)
    res.status(201).send()
  } catch {
    res.status(500).send()
  }
})
app.get('/', checkAuthenticated,(req,res) =>{
  res.render('index.ejs')
})
app.get('/login', checkNotAuthenticated, (req,res) => {
  res.render('login.ejs')
})

app.get('/register', checkNotAuthenticated, (req,res) => {
  res.render('register.ejs')
})

app.get('/users', (req, res) => {
  res.json(users)
})
app.post('/users/login', async (req, res) => {
  const user = users.find(user => user.name === req.body.name)
  if (user == null) {
    return res.status(400).send('Cannot find user')
  }
  try {
    if(await bcrypt.compare(req.body.password, user.password)) {
      res.send('Success')
    } else {
      res.send('Not Allowed')
    }
  } catch {
    res.status(500).send()
  }
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect:'/',
  failureRedirect:'/login',
  failureFlash:true
}))

app.post('/register', checkNotAuthenticated, async(req,res) => {
  try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login') 
  } catch{
    res.redirect('/register')
  }
  console.log(users)
})

app.delete('/logout', (req,res) => {
  req.logOut()
  res.redirect('/index')
})

function checkAuthenticated(req,res,next){
  if (req.isAuthenticated()){
    return next()
  }
  res.redirect('/')
}

function checkNotAuthenticated(req,res,next){
  if (req.isAuthenticated()){
     return res.redirect('/')
  }
  next()
}

var reqTimer = setTimeout(function wakeUP() {
  request("https://innerangel.herokuapp.com/", function(){
    console.log("WAKE UP DYNO");
});
return reqTimer = setTimeout(wakeUp, 1200000);
  }, 1200000);

app.listen(port, function() {
  console.log('running');
})

