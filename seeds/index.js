const mongoose=require('mongoose');
const Campground = require('../models/campground');
const Review = require('../models/review');
const cities=require('./cities')
const {places,descriptors}=require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp');


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const sample=(array)=>array[Math.floor(Math.random()*array.length)];
const seedDB=async ()=>{
    await Campground.deleteMany({});
    await Review.deleteMany({});
   for(let i=0;i<50;i++){
    const random1000=Math.floor(Math.random()*1000);
    const price=Math.floor(Math.random()*20)+10;
    const camp=new Campground({
        author:'6876455df3788fe558ca5524',
        location:`${cities[random1000].city},${cities[random1000].state}`,
        title:`${sample(descriptors)} ${sample(places)}`,
        geometry: {
        "type": "Point",
        "coordinates": [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ]
      },
        images: [
    {
      url: 'https://res.cloudinary.com/dlwjselga/image/upload/v1752578751/YelpCamp/vfp239rpm4kmbdcanjnk.png',
      filename: 'YelpCamp/vfp239rpm4kmbdcanjnk',
      
    },
    {
      url: 'https://res.cloudinary.com/dlwjselga/image/upload/v1752578752/YelpCamp/rlduojgcblycgrghowfi.png',
      filename: 'YelpCamp/rlduojgcblycgrghowfi',
    }
  ],
        description:"    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Mollitia, pariatur veniam delectus possimus ullam totam itaque assumenda necessitatibus hic. Necessitatibus dicta atque pariatur enim, autem itaque dignissimos molestiae blanditiis odit.",
        price

    })
    await camp.save();
   }
}
seedDB().then(()=>{
    mongoose.connection.close();
})