const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
const fs = require('fs');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', (req,res,next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    
    Post.find()
        .populate('category')
        .then(posts=>{
        res.render('admin/posts', {posts: posts});
    });
});

router.get('/my-posts', (req, res)=>{
    if (!req.user || !req.isAuthenticated()) {
        return res.redirect('/login'); // Redirect to login for other pages
    }
    
    Post.find({user: req.user.id})
        .populate('category')
        .then(posts=>{
        res.render('admin/posts/my-posts', {posts: posts});
    });
});

router.get('/create', (req, res)=>{
    if (!req.user || !req.isAuthenticated()) {
        return res.redirect('/login'); // Redirect to login for other pages
    }
    Category.find({}).then(categories => {
        res.render('admin/posts/create', {categories: categories});
    });
});

router.post('/create', (req, res)=>{

    let errors = [];

    if (!req.body.title) {
        errors.push({message: 'please add a title'});
    }

    if (!req.body.body) {
        errors.push({message: 'please add a description'});
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        });
        
    } else {
            let filename = 'bmw z4.png';
            if (!isEmpty(req.files)) {        
                let file = req.files.file;
                filename = Date.now() + '-' + file.name;
            
                file.mv('./public/uploads/'+filename, (err)=>{
                    if(err) throw err;
                });
            }
        
            let allowComments = false;
        
            if (req.body.allowComments) {
                allowComments = true;
            }
        
            const newPost = new Post({
                user: req.user.id,
                title: req.body.title,
                status: req.body.status,
                allowComments: allowComments,
                category: req.body.category,
                body: req.body.body,
                file: filename
        
            });
        
            newPost.save().then(savedPost =>{
                req.flash('success_message', `Post ${savedPost.title} was created successfully`);
                res.redirect('/admin/posts');
            });

    }

});

router.get('/edit/:id', (req, res)=>{
    Post.findOne({_id: req.params.id}).then(post=>{
        Category.find({}).then(categories => {
            res.render('admin/posts/edit', {post: post, categories: categories});
        });
    });
    //Not found
});

// POST UPDATING



router.put('/edit/:id', (req, res)=>{

    Post.findOne({_id: req.params.id})

        .then(post=>{
            if(req.body.allowComments){
                allowComments = true;
            } else{
                allowComments = false;
            }

            post.user = req.user.id;
            post.title = req.body.title;
            post.status = req.body.status;
            post.allowComments = allowComments;
            post.body = req.body.body;
            post.category = req.body.category;


            if(!isEmpty(req.files)){

                let file = req.files.file;
                filename = Date.now() + '-' + file.name;
                post.file = filename;

                file.mv('./public/uploads/' + filename, (err)=>{

                    if(err) throw err;

                });

            }

            post.save().then(updatedPost=>{

                req.flash('success_message', 'Post was successfully updated');

                res.redirect('/admin/posts/my-posts');
            });

        }).catch((err)=>{if(err) throw err});

});



router.delete('/:id', (req, res)=>{
    Post.findOne({_id: req.params.id})
    .populate('comments')
    .then(post => {

        
        fs.unlink(uploadDir + post.file, (err)=>{
            if (!post.comments.length < 1) {
                post.comments.forEach(comment => {
                    comment.remove();
                });
            }
            //Is this right??
            post.remove().then(postRemoved=>{
                req.flash('success_message', 'Post was deleted');
                res.redirect('/admin/posts/my-posts');
            });

        });



    });
    //if not found
    //if not removed?
});


module.exports = router;