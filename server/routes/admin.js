const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;
const cloudinary = require('../utils/cloudinary')
const upload = require('../utils/multer')

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
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    req.user = await User.findById(decoded.userId).select('-password');

    next();
  } catch (error) {
    console.log('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

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

  router.post('/add-post', upload.single('cover'),authMiddleware, async (req, res) => {

    try {
    
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
        cover: result.secure_url,
        author: req.user._id // Set the author field with the current user's _id
      });

      await newPost.save();
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    }  const result = await cloudinary.uploader.upload(req.file.path)
      
  });


  router.get('/edit-post/:id',authMiddleware, async (req, res) => {
      try {

        const locals = {
          title: 'Edit a Post',
          description: 'Make Updated Changes to the post'
        }

        const data = await Post.findOne({ _id: req.params.id })

        console.log("Editing Data -- ", data)
     
        res.render('admin/edit-post', {
          locals,
          data,
          layout: adminLayout
        });
  
      } catch (error) {
        console.log(error);
      }
    })

    router.put('/edit-post/:id', upload.single('cover'), authMiddleware, async (req, res) => {
      try {
          // Check if req.file is undefined
          const result = await cloudinary.uploader.upload(req.file.path)
          if (!req.file) {
              return res.status(400).send("No file uploaded");
          }
  
          // Find the post by ID and update its properties
          const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
              title: req.body.title,
              body: req.body.body,
              cover: result.secure_url, // Assuming your file has a 'filename' property
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
    
  router.delete('/delete-post/:id',authMiddleware, async (req, res) => {
    try {
      await Post.deleteOne( { _id: req.params.id });
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error)
    }
  });

    router.get('/logout', (req, res) => {
      res.clearCookie('token');

      res.redirect('/')
    })


module.exports = router;