const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const price = Math.floor(Math.random() * 2000) + 100;
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            //Own USER ID author
            author: '68de09be0b8c499a8962fa99',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eaque tempora placeat quasi similique dolores, ratione saepe enim esse at tempore soluta sunt asperiores officiis pariatur. Mollitia laborum possimus repellendus iure!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [120.58851, 15.487245]
            },
            images: [
                    {
                url: 'https://res.cloudinary.com/dr8nraigy/image/upload/v1759552203/PinoyCampground/luzlbifzmzbzrpupb6m3.png',
                filename: 'PinoyCampground/luzlbifzmzbzrpupb6m3'
                },
                {
                url: 'https://res.cloudinary.com/dr8nraigy/image/upload/v1759552204/PinoyCampground/pdksejzuzdxc5fx3mh3j.png',
                filename: 'PinoyCampground/pdksejzuzdxc5fx3mh3j'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})