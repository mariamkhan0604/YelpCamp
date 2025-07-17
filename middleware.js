const ExpressError = require('./utils/ExpressError');
const { campgroundSchema,reviewSchema} = require('./schemas.js');
const Campground=require('./models/campground');
const Review=require('./models/review');

module.exports.validateReview=(req, res, next) =>{
     req.body.review.rating = Number(req.body.review.rating);
    const {error}=reviewSchema.validate(req.body);
     if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
module.exports.validateCampground = (req, res, next) => {
    console.log("BODY:", req.body);
    if (!req.body.campground) {
        throw new ExpressError('Missing campground object in form submission', 400);
    }
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params;
    const  campp= await Campground.findById(id);
    if(!campp.author.equals(req.user._id)){
        req.flash('error','Hey you dont have permission!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params;
    const  review= await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','Hey you dont have permission!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.storeReturnTo=(req,res,next)=>{
    if(req.session.returnTo){
         res.locals.returnTo=req.session.returnTo;
    }
    next();
}
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        //if they are not authentictaed we store the url they are requesting
        req.session.returnTo=req.originalUrl;
        req.flash('error','Please sign up first');
        return res.redirect('/login');
    }
    next();
}
