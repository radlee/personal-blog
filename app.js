// Import required modules and packages
require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multiparty = require('connect-multiparty');
const MultipartyMiddleware = multiparty({ uploadDir: './uploads' });
const morgan = require('morgan');
const MongoStore = require('connect-mongo');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

// Import other required files and models
const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');
const Image = require('./server/models/Image');

// Create an Express application
const app = express();
app.locals.moment = moment;
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// Define the port for the application
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Set up various middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

// Configure session
app.use(session({
    secret: 'we cant share',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Set up the Templating Engine (EJS)
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Add a global helper function
app.locals.isActiveRoute = isActiveRoute;

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define your routes
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

// Statict files
app.use(express.static("uploaded"));

// Handle file uploads
app.post('/upload', MultipartyMiddleware, (req, res) => {
    console.log(req.files.upload);
    const TempFile = req.files.upload;
    const TempPathfile = TempFile.path;

    const targetPathUrl = path.join(__dirname, './uploaded/' + TempFile.name);

    if (path.extname(TempFile.originalFilename).toLowerCase() === '.png' ||
        path.extname(TempFile.originalFilename).toLowerCase() === '.jpg') {
        fs.rename(TempPathfile, targetPathUrl, err => {
            if (err) {
                res.status(500).json({
                    error: 'File upload failed'
                });
                return console.log(err);
            }

            res.status(200).json({
                uploaded: true,
                url: `${TempFile.originalFilename}`
            });
        });
    } else {
        res.status(400).json({
            error: 'Invalid file type'
        });
    }

    console.log('Target Path Url - ', targetPathUrl);
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});
