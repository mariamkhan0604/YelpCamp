const express=require('express');
const router=express.Router({mergeParams:true});
const { reviewSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {validateReview,isAuthor,isLoggedIn,isReviewAuthor}=require('../middleware.js')
const Campground = require('../models/campground');
const Review=require('../models/review')
const reviews=require('../controllers/reviews');

router.post('/',isLoggedIn,validateReview,catchAsync(reviews.newReview));
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview));
module.exports=router;