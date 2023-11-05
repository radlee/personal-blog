require('dotenv').config();

const express = require('express');
const bodyparser = require('body-parser');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multiparty = require('connect-multiparty');
const MultipartyMiddleware = multiparty({uploadDir: './uploads'})
const morgan = require('morgan');
const MongoStore = require('connect-mongo');
var moment = require('moment');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator


const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');
const Image = require('./server/models/Image');

const app = express();
app.locals.moment = require('moment');
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

const PORT = 5000 || process.env.PORT;


//Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'we cant share',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}))

app.use(express.static('public'));

//Templating Engine (EJS)
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;
app.use('/uploads', express.static(__dirname+'uploads'));

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.post('/uploads', MultipartyMiddleware, async (req, res) => {
    const file = req.files.upload;
    if(!file) {
        return res.status(400).send('Nofile uploaded');
    }

    //Save The Image file to a directory on your server
    const originalFileName = `/uploads/${file.originalFilename}`;
    const filePath = `/uploads/${file.path}`;

    
    console.log("File Name: ", originalFileName);
    console.log("File Path: ", filePath);

    // Create a new image document and save it to the MongoDB
    const newImage = new Image({
        originalFilename: originalFileName,
        path: filePath,
    });

    try {
        await newImage.save();
        res.status(201).json(newImage);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving the image to the database.');
    }
})

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
});