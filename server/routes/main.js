const express = require('express');
const router = express.Router();
const Post = require('../models/Post');


router.get('/active-kiosks', (req, res) => {
    res.render('active-kiosks', { currentRoute: '/active-kiosks'});
});


router.get('/about', (req, res) => {
    res.render('about', { currentRoute: '/about'});
});

router.get('/', async (req, res) => {
    try {
        const locals = {
            title: 'radBlok',
            description: 'Bloggers Republic',
            user: res.locals.user, // Use user data from locals,
        }

        let perPage = 10;
        let page = req.query.page || 1;

        // Use populate to retrieve posts with associated author information
        const data = await Post.find().sort({ createdAt: -1 })
            .skip(perPage * page - perPage)
            .limit(perPage)
            .populate('author') 
            .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;

        const data = await Post.findById({ _id: slug });

        const locals = {
            title: data.title,
            description: 'Online Platform for publishing written content.',
            user: res.locals.user, // Use user data from locals,
        }

        res.render('post', { 
            locals,
            data,
            currentRoute: `/post/${slug}`,
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: 'radBlok Search',
            description: "Try and search something..",
            user: res.locals.user, // Use user data from locals,
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        })

        res.render("search", {
            data,
            locals,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
