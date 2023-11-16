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

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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
    const TempFile = req.files.upload;
    const TempPathfile = TempFile.path;
  
    if (
      path.extname(TempFile.originalFilename).toLowerCase() === '.png' ||
      path.extname(TempFile.originalFilename).toLowerCase() === '.jpg'
    ) {
      // Read the image file
      fs.readFile(TempPathfile, (err, data) => {
        if (err) {
          res.status(500).json({
            error: 'File read failed',
          });
          return console.log(err);
        }
  
        // Create a new image document in MongoDB
        const newImage = new Image({
          name: TempFile.originalFilename,
          data: data,
          contentType: 'image/' + path.extname(TempFile.originalFilename).slice(1),
        });
  
        // Save the image document
        newImage.save((error, savedImage) => {
          if (error) {
            res.status(500).json({
              error: 'Image save failed',
            });
            return console.log(error);
          }
  
          // Respond with the saved image's ID or other details
          res.status(200).json({
            uploaded: true,
            imageId: savedImage._id,
          });
        });
      });
    } else {
      res.status(400).json({
        error: 'Invalid file type',
      });
    }
  });


  app.get('/image/:id', (req, res) => {
    const imageId = req.params.id;
    Image.findById(imageId, (error, image) => {
      if (error) {
        return res.status(404).json({ error: 'Image not found' });
      }
  
      // Set the appropriate response content type
      res.contentType(image.contentType);
  
      // Send the image data as the response
      res.send(image.data);
    });
  })
  

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});
