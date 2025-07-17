const { cloudinary } = require('../cloudinary');
const Campground=require('../models/campground');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
module.exports.index=async (req,res)=>{
    const campgrounds=await Campground.find({});
    const geoCampgrounds = {
  type: 'FeatureCollection',
  features: campgrounds.map(cg => ({
    type: 'Feature',
    geometry: cg.geometry, // Must be a valid GeoJSON geometry
    properties: {
      popUpMarkup: `<strong><a href="/campgrounds/${cg._id}">${cg.title}</a></strong><p>${cg.location}</p>`
    }
  }))
};
    res.render('campgrounds/index',{campgrounds,maptilerApiKey: process.env.MAPTILER_API_KEY,geoCampgrounds})
};
module.exports.renderNewForm=async (req,res)=>{
    
    res.render('campgrounds/new');
};
// module.exports.createCampground=async(req,res)=>{
//     const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
//     const camp = new Campground(req.body.campground);
//     camp.geometry = geoData.body.features[0].geometry;
//     camp.images=req.files.map(f=>({url:f.path, filename: f.filename}))
//     camp.author=req.user._id;
//     await camp.save();
//     console.log(camp);
//     req.flash('success','Successfully made a new campground.')
//     res.redirect(`/campgrounds/${camp._id}`);
    
// };
module.exports.createCampground = async (req, res) => {
    try {
        const response = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
        const geometry = response && response.features && response.features[0] && response.features[0].geometry;
        console.log('GeoData raw response:', JSON.stringify(response, null, 2));

        if (!geometry) {
            req.flash('error', 'Location not found!');
            return res.redirect('/campgrounds/new');
        }

        const camp = new Campground(req.body.campground);
        camp.geometry = geometry;
        camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        camp.author = req.user._id;

        await camp.save();
        console.log(camp);

        req.flash('success', 'Successfully made a new campground.');
        res.redirect(`/campgrounds/${camp._id}`);
    } catch (err) {
        console.error('Error during campground creation:', err);
        req.flash('error', 'Something went wrong while creating the campground.');
        res.redirect('/campgrounds/new');
    }
};


module.exports.showCampground=async (req,res)=>{
    const campgrounds= await Campground.findById(req.params.id).populate('author').populate({
    path: 'reviews',
    populate: { path: 'author' }
  });
        if (!campgrounds) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campgrounds,maptilerApiKey: process.env.MAPTILER_API_KEY });
};

module.exports.renderEditForm=async (req, res) => {
    const campgrounds = await Campground.findById(req.params.id);
    if (!campgrounds) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campgrounds });
};
module.exports.updateCampground=async (req, res) => {
    
    
    const campp = await Campground.findByIdAndUpdate(req.params.id, req.body.campground, { new: true });
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campp.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campp.images.push(...imgs); 
    await campp.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campp.updateOne({$pull: {images:{filename: {$in:req.body.deleteImages}}}})
        console.log(campp)
    }
    req.flash('success','Succesfully Updated Campground!')
    res.redirect(`/campgrounds/${campp._id}`);
};
module.exports.deleteCampground=async(req,res)=>{
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success','Successfully deleted the campground')
    res.redirect(`/campgrounds`);
};