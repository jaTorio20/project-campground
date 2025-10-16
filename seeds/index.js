if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// mongoose.connect('mongodb://localhost:27017/campground');
mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/campground') //for production
// mongoose.connect('mongodb://localhost:27017/campground')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 30; i++) {
        const price = Math.floor(Math.random() * 2000) + 100;
        const random1000 = Math.floor(Math.random() * cities.length);
        const camp = new Campground({
            //Own USER ID author
            author: '68f089aa9d70c6cd9307e24b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eaque tempora placeat quasi similique dolores, ratione saepe enim esse at tempore soluta sunt asperiores officiis pariatur. Mollitia laborum possimus repellendus iure!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            },
            images: [
                    {
                url: 'https://res.cloudinary.com/dr8nraigy/image/upload/v1760354351/PinoyCampground/xsmpcxduviopurx1khnj.jpg',
                filename: 'PinoyCampground/xsmpcxduviopurx1khnj'
                },
                {
                url: 'https://res.cloudinary.com/dr8nraigy/image/upload/v1760354351/PinoyCampground/xsmpcxduviopurx1khnj.jpg',
                filename: 'PinoyCampground/xsmpcxduviopurx1khnj'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})