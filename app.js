// if(process.env.NODE_ENV!=="production"){
//     require('dotenv').config();
// }
require('dotenv').config();
console.log("DATABASE_URL from .env:", process.env.DATABASE_URL);
const express=require('express')
const app=express();
app.set('query parser', 'extended');
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const { campgroundSchema,reviewSchema } = require('./schemas.js');
const joi=require('joi');
const catchAsync=require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review=require('./models/review')
const methodOverride=require('method-override');
const session =require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash=require('connect-flash')
const passport=require('passport');
const LocalStrategy=require('passport-local')
const User=require('./models/user.js')
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const helmet=require('helmet');
mongoose.connect(process.env.DATABASE_URL)
console.log("Mongoose trying to connect to:", process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const secret = process.env.SECRET; 
const store = new MongoDBStore({
    mongooseConnection: mongoose.connection,
    collection: 'sessions',
    secret: secret,
    touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR",e)
})
const sessionConfig={
    store,
    name:'session',
    secret: process.env.SESSION_SECRET ,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        secure:true, 
        sameSite: 'lax',
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
const campgroundRoutes=require('./routes/campgrounds')
const reviewRoutes=require('./routes/reviews')
const userRoutes=require('./routes/users.js');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(sanitizeV5({ replaceWith: '_' }));
app.use(flash());
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/", 
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlwjselga/", 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
app.use((req,res,next)=>{
    console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/',userRoutes);
app.get('/',(req,res)=>{
    res.render('home.ejs')
})
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})
app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message) err.message="Oh Boy , Something went wrong";
    res.status(statusCode).render('error',{err})
})
app.listen(3000,()=>{
    console.log('Server is listening on port 3000!')
})