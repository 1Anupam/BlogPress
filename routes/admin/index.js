const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*',(req,res,next)=>{
    if (!req.user || !req.isAuthenticated()) {
        return res.redirect('/login'); // Redirect to login for other pages
    }
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    // Assuming req.user contains the authenticated user's data

    const promises = [
        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()
    ];
    
    Promise.all(promises).then(([postCount, categoryCount, commentCount])=>{
        res.render('admin/index',{
            postCount: postCount,
            categoryCount: categoryCount,
            commentCount: commentCount});
    });
    // Post.count({}).then(postCount=>{
    //     Comment.count({}).then(commentCount=>{
    //         res.render('admin/index',{postCount: postCount, commentCount: commentCount});
    //     });
    // });
});

router.post('/generate-fake-posts', (req, res)=>{

    for (let index = 0; index < req.body.amount; index++) {
        let post = new Post();

        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.sentence();
        post.slug = faker.name.title();
        post.save().then(postSaved=>console.log(postSaved)).catch(err => {throw err});
    }
    res.redirect('/admin/posts');

});

module.exports = router;