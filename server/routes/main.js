// main.js
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose'); // Add this line
const authMiddleware = require('../middlewares/authMiddleware');
const Post = require('../models/Post');
const app = express();
app.use(cookieParser());
router.use(authMiddleware);


router.get('/active-kiosks', (req, res) => {
    res.render('active-kiosks', { currentRoute: '/active-kiosks', user: res.locals.user });
});

router.get('/about', (req, res) => {
    res.render('about', { currentRoute: '/about', user: res.locals.user });
});

router.get('/', async (req, res) => {
    
    try {
        const locals = {
            title: 'Dashboard',
            description: 'radBlok',
            user: res.locals.user,
        };

        let perPage = 10;
        let page = req.query.page || 1;

        let data = await Post.find().sort({ createdAt: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .populate('author')
            .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        const viewData = {
            currentRoute: '/',
            user: res.locals.user,
            title: 'radBlok',
            description: 'Blogger\'s Republic',
            data: data || [],
            current: page,
            nextPage: hasNextPage ? nextPage : null,
        };

        res.render('index', viewData);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;

        const data = await Post.findById({ _id: slug }).populate('author');

        if (!data.author) {
            console.log('Author not found for post:', slug);
            return res.status(404).send('Post not found');
        }

        res.render('post', {
            title: data.title,
            description: data.title,
            user: res.locals.user,
            data,
            currentRoute: `/post/${slug}`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/search', async (req, res) => {
    try {
        const searchTerm = req.body.searchTerm;
        console.log('Search Term:', searchTerm);

        const data = await Post.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { body: { $regex: searchTerm, $options: 'i' } },
            ],
        }).populate('author');

        console.log('Search Result:', data);

        res.render('search', {
            title: 'radBlok Search',
            description: 'Try and search something..',
            user: res.locals.user,
            data,
            currentRoute: '/',
        });
    } catch (error) {
        console.log(error);
    }
});






module.exports = router;
