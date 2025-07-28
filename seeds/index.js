require('dotenv').config();
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Review = require('../models/review');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

console.log('Mongo URI:', process.env.DATABASE_URL);

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection failed:", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '68870ffe8788b581aeee5715',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dlwjselga/image/upload/v1753629390/image_qcdkrg.jpg',
                    filename: 'YelpCamp/vfp239rpm4kmbdcanjnk',
                },
                {
                    url: 'https://res.cloudinary.com/dlwjselga/image/upload/v1753629392/nearme_under50_ngeevs_utfafi.webp',
                    filename: 'YelpCamp/rlduojgcblycgrghowfi',
                }
            ],
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit...",
            price
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
