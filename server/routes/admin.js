const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const methodOverride = require('method-override');
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;
const multer = require('multer');
const app = express();

//Image Upload - Multer 
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "_"+ Date.now() + "_" + file.originalname)
  }
});

var upload = multer({
  storage: storage,
}).single('image');

app.use(methodOverride('_method'));
/**
 * GET
 * Admin - Kiosks
 */
router.get('/management', async (req, res) => {
  try {
    const locals = {
      title: 'Management',
      description: "Data Entry - Management"
    }

    res.render("admin/manage", { locals, layout: adminLayout });

  } catch (error) {
    console.log(error);
  }
});

/**
 * GET
 * Check  Login
 */

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded token:', decoded);

    req.user = await User.findById(decoded.userId).select('-password');
    console.log('User information:', req.user);

    next();
  } catch (error) {
    console.log('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

  /**
 * GET
 * Admin - Register Page
 */

router.get('/register', async (req, res) => {
    try {
      const locals = {
        title: 'Admin',
        description: "Learning and Development Admin"
      }
  
      res.render("admin/register", { locals, layout: adminLayout });

    } catch (error) {
      console.log(error);
    }
  });

  /**
 * GET
 * Admin - Login Page
 */

router.get('/admin', async (req, res) => {
    try {
      const locals = {
        title: 'Admin',
        description: "Learning and Development Admin"
      }
  
      res.render("admin/index", { locals, layout: adminLayout });

    } catch (error) {
      console.log(error);
    }
  });

  /**
 * POST
 * Admin - Check Login
 */

  router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;


        const user = await User.findOne( { username });

        if(!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
      
    } catch (error) {
      console.log(error);
    }
  });

    /**
 * GET
 * Admin - Dashboard
 */
  router.get('/dashboard', authMiddleware, async (req, res) => {

    try {
      const locals = {
        title: 'Dashboard',
        description: 'radBlok'
      }

      const data = await Post.find();
      res.render('admin/dashboard', {
        locals,
        data,
        layout: adminLayout
      });
    } catch (error) {
      console.log(error);
    }
  });

  /**
 * GET
 * Admin - Create New Post  
 */


  router.get('/add-post',authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Add New Post',
        description: 'New Post addition Page'
      }

      const data = await Post.find();
      res.render('admin/add-post', {
        locals, layout: adminLayout
      })
    } catch (error) {
      console.log(error);
    }
  });

  /**
 * POST
 * Admin - Create New Post  
 */

  router.post('/add-post', upload, authMiddleware, async (req, res) => {

    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        image: req.file.filename,
        author: req.user._id // Set the author field with the current user's _id
      });

      await newPost.save();
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    }
  });

  /**
 * GET
 * Admin - Edit a Post/radBlok  
 */

    router.get('/edit-post/:id',authMiddleware, async (req, res) => {
      try {

        const locals = {
          title: 'Edit a Post',
          description: 'Make Updated Changes to the post'
        }

        const data = await Post.findOne({ _id: req.params.id })


     
        res.render('admin/edit-post', {
          locals,
          data,
          layout: adminLayout
        });
  
      } catch (error) {
        console.log(error);
      }
    })

  /**
 * PUT
 * Admin - Update a Post/Post  
 */

  router.put('/edit-post/:id', authMiddleware,upload, async (req, res) => {
    try {
      
        // Find the post by ID and update its properties
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            image: req.file.filename,
            updatedAt: Date.now()
        }, { new: true });

        // Check if the post was not found
        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }

        // Redirect to the updated post or handle it as needed
        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

  /**
 * POST
 * Admin - Register
 */

  router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
          const user = await User.create({ username, password: hashedPassword })
          res.status(201).json({ message: 'User Created Successfully.', user })
        } catch (error) {
          if(error.code === 11000) {
            res.status(409).json({ message: 'User already in use.' })
          }
          res.status(500).json({ message: 'Internal Server Error.' })
        }
    } catch (error) {
      console.log(error);
    }
  });
    
  /**
 * DELETE
 * Admin - Delete a Post  
 */

  router.delete('/delete-post/:id',authMiddleware, async (req, res) => {
    try {
      await Post.deleteOne( { _id: req.params.id });
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error)
    }
  });

    /**
 * GET
 * Admin - Admin Logout
 */

    router.get('/logout', (req, res) => {
      res.clearCookie('token');

      res.redirect('/')
    })


module.exports = router;