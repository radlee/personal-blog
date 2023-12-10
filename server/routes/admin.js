const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;
const cloudinary = require('../utils/cloudinary')
const upload = require('../utils/multer');


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

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.flash('error', 'Unauthorized. Please Login or Register');
      return res.redirect('/admin');
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      req.flash('error', 'Unauthorized. Please Login or Register');
      return res.redirect('/admin');
    }

    res.locals.user = user; // Make user data available in locals
    next();
  } catch (error) {
    console.log('Authentication error:', error);
    req.flash('error', 'Unauthorized. Please Login or Register');
    return res.redirect('/admin');
  }
};


router.get('/register', async (req, res) => {
    try {
      const locals = {
        title: 'Admin',
        description: "Administration Registration"
      }
  
      res.render("admin/register", { locals, layout: adminLayout });

    } catch (error) {
      console.log(error);
    }
  });

router.get('/admin', async (req, res) => {
    try {
      const locals = {
        title: 'Admin',
        description: "Administration Login"
      }
  
      res.render("admin/index", { locals,  messages: req.flash(), layout: adminLayout });

    } catch (error) {
      console.log(error);
    }
  });

  router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;


        const user = await User.findOne( { username });

        if(!user) {
          req.flash( 'error', 'Email and Password are Required' );
          return res.redirect('/admin')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
          req.flash( 'error', 'Invalid credentials' );
          return res.redirect('/admin')
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        req.flash( 'success', 'Logged In Successfully' );
        res.redirect('/dashboard');
      
    } catch (error) {
      console.log(error);
    }
  });

  router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Dashboard',
        description: 'radBlok',
        user: res.locals.user, // Use user data from locals
      };
  
      const data = await Post.find();
      res.render('admin/dashboard', {
        locals,
        data,
        layout: adminLayout,
      });
    } catch (error) {
      console.log(error);
    }
  });
  

  router.get('/add-post',authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Add New Post',
        description: 'New Post addition Page'
      }

      const data = await Post.find();
      res.render('admin/add-post', {
        locals, layout: adminLayout, messages: req.flash(),
      })
    } catch (error) {
      console.log(error);
    }
  });

  router.post('/add-post', upload.single('cover'),authMiddleware, async (req, res) => {

    try {

      const result = await cloudinary.uploader.upload(req.file.path)
    
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        cover: result.secure_url,
        author: res.locals.user._id // Set the author field with the current user's _id
      });

      await newPost.save();
      req.flash( 'success', 'Post Added Successfully' );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    }  
      
  });


  router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Edit a Post',
            description: 'Make Updated Changes to the post'
        }

        const data = await Post.findOne({ _id: req.params.id });

        // Check if the user is the author of the post
        if (data.author.equals(res.locals.user._id)) {
            res.render('admin/edit-post', {
                locals,
                data,
                layout: adminLayout,
                messages: req.flash(),
            });
        } else {
            // User is not the author, show an error or redirect as needed
            req.flash('error', 'You are not authorized to edit this post');
            res.redirect('/dashboard');
        }

    } catch (error) {
        console.log(error);
    }
});


router.put('/edit-post/:id', upload.single('cover'), authMiddleware, async (req, res) => {
  try {
      // Check if req.file is undefined
      if (!req.file) {
          return res.status(400).send("No file uploaded");
      }

      const result = await cloudinary.uploader.upload(req.file.path);

      // Find the post by ID
      const post = await Post.findById(req.params.id);

      // Check if the user is the author of the post
      if (!post || !post.author.equals(res.locals.user._id)) {
          req.flash('error', 'You are not authorized to edit this post');
          return res.redirect('/dashboard');
      }

      // Update the post's properties
      const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
          title: req.body.title,
          body: req.body.body,
          cover: result.secure_url,
          updatedAt: Date.now()
      }, { new: true });

      // Check if the post was not found
      if (!updatedPost) {
          req.flash('error', 'Post not found');
          return res.redirect('/dashboard');
      }

      req.flash('success', 'Post Updated Successfully');
      res.redirect('/dashboard');

  } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
  }
});

  
  

  router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
          await User.create({ username, password: hashedPassword })
   
        } catch (error) {
          if(error.code === 11000) {
            // Toast Message
            req.flash( 'error', 'User already Exists' );
            res.redirect('/register');
          } 
          // Tost Message
          req.flash( 'success', 'Registered Successfully' );
          res.redirect('/dashboard');
        }
    } catch (error) {
      console.log(error);
    }
  });
    
  router.delete('/delete-post/:id',authMiddleware, async (req, res) => {
    try {
      await Post.deleteOne( { _id: req.params.id });
      req.flash( 'success', 'Post Deleted Successfully' );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error)
    }
  });

    router.get('/logout', (req, res) => {
      res.clearCookie('token');
      req.flash('success', 'Logged Out Successfully');
      res.redirect('/admin'); // Redirect to the home page or login page
    });


module.exports = router;