require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// API calls

app.get('/rover', async (req, res) => {
    const name = req.query.name;
    let date, url;
    // Photos are available only for Curiosity. The end points are refered from another Udacity student repo
    // https://github.com/jeffcad/Udacity-Intermediate-JavaScript-Nanodegree-Project-2/blob/master/src/server/index.js
    if (name === 'Spirit') {
        date = '2010-02-01'
        url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${name}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`
    } else if (name === 'Opportunity') {
        date = '2018-06-04'
        url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${name}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`
    } else if (name === 'Curiosity') {
        url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${name}/latest_photos?api_key=${process.env.API_KEY}`
    } else {
        res.send('Something went Wrong. Make sure the request param is correct!');
    }
    try {
        let roverData = await fetch(url)
            .then(res => res.json());
        // the results are different as the end points are different.
        name === 'Curiosity' ? res.send({ roverData: roverData.latest_photos }) : res.send({ roverData: roverData.photos });
    } catch (error) {
        res.status(500).send("Something went wrong!");
    }
});

app.listen(port, () => console.log(`Mars dashboard app listening on port ${port}!`))