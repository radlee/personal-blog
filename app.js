// Import required modules and packages
require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const moment = require('moment');
const path = require('path');

// Import other required files and models
const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

// Create an Express application
const app = express();
app.locals.moment = moment;

app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({limit: '50mb', extended: true}));

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


// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});
