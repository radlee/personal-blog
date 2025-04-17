const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const authMiddleware = require('../middlewares/authMiddleware');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// ------------------ Admin Routes ------------------ //

router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: 'Admin',
      description: 'Administration Login',
    };
    res.render('admin/index', {
      locals,
      messages: req.flash(),
      layout: adminLayout,
    });
  } catch (error) {
    console.error(error);
  }
});

router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/admin');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/admin');
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });
    req.flash('success', 'Logged In Successfully');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Login failed');
    res.redirect('/admin');
  }
});

router.get('/register', async (req, res) => {
  try {
    const locals = {
      title: 'Admin',
      description: 'Administration Registration',
    };
    res.render('admin/register', { locals, layout: adminLayout });
  } catch (error) {
    console.error(error);
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await User.create({ username, password: hashedPassword });
      req.flash('success', 'Registered Successfully');
      res.redirect('/dashboard');
    } catch (error) {
      if (error.code === 11000) {
        req.flash('error', 'User already exists');
        return res.redirect('/register');
      }
      req.flash('error', 'Registration failed');
      res.redirect('/register');
    }
  } catch (error) {
    console.error(error);
  }
});

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(res.locals.user._id).select('-password');
    const data = await Post.find({ author: user._id }).sort({ createdAt: -1 });

    const locals = {
      title: 'Dashboard',
      description: 'radBlok',
      user,
    };

    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/management', async (req, res) => {
  try {
    const locals = {
      title: 'Management',
      description: 'Data Entry - Management',
    };
    res.render('admin/manage', { locals, layout: adminLayout });
  } catch (error) {
    console.error(error);
  }
});

router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add New Post',
      description: 'New Post addition Page',
    };
    res.render('admin/add-post', {
      locals,
      layout: adminLayout,
      messages: req.flash(),
    });
  } catch (error) {
    console.error(error);
  }
});

router.post('/add-post', upload.single('cover'), authMiddleware, async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
      cover: result.secure_url,
      author: res.locals.user._id,
    });

    await newPost.save();
    req.flash('success', 'Post Added Successfully');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const data = await Post.findOne({ _id: req.params.id });

    if (data.author.toString() !== res.locals.user._id.toString()) {
      req.flash('error', 'You are not authorized to edit this post');
      return res.redirect('/dashboard');
    }

    const locals = {
      title: 'Edit a Post',
      description: 'Make Updated Changes to the post',
    };

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout,
      messages: req.flash(),
    });
  } catch (error) {
    console.error(error);
  }
});

router.put('/edit-post/:id', upload.single('cover'), authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const result = req.file ? await cloudinary.uploader.upload(req.file.path) : null;

    if (result && post.cover) {
      const match = post.cover.match(/\/([^/]+)(\.\w+)?(\?.*)?$/);
      if (match && match[1]) {
        await cloudinary.uploader.destroy(match[1]);
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        body: req.body.body,
        cover: result ? result.secure_url : post.cover,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedPost) {
      req.flash('error', 'Post not found');
      return res.redirect('/dashboard');
    }

    req.flash('success', 'Post Updated Successfully');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/dashboard');
    }

    if (post.author.toString() !== res.locals.user._id.toString()) {
      req.flash('error', 'You are not authorized to delete this post');
      return res.redirect('/dashboard');
    }

    if (post.cover) {
      const match = post.cover.match(/\/([^/]+)(\.\w+)?(\?.*)?$/);
      if (match && match[1]) {
        await cloudinary.uploader.destroy(match[1]);
      }
    }

    await Post.deleteOne({ _id: req.params.id });
    req.flash('success', 'Post Deleted Successfully');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.flash('success', 'Logged Out Successfully');
  res.redirect('/admin');
});

module.exports = router;
