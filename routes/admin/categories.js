const express = require('express');
const router = express.Router();
const faker = require('faker');
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*',(req,res,next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    if (!req.user || !req.isAuthenticated()) {
        return res.redirect('/login'); // Redirect to login for other pages
    }
    Category.find({}).then(categories=>{
        res.render('admin/categories/index', {categories: categories});
    });
});

router.post('/create', (req, res)=>{
    const newCategory = new Category({
        name: req.body.name
    });
    newCategory.save().then(savedCategory=>{
        res.redirect('/admin/categories');
    });
    //No error treatment
});

router.get('/edit/:id', (req, res)=>{
    Category.findOne({_id:req.params.id}).then(category=>{
        res.render('admin/categories/edit', {category: category});
    });
});

router.put('/edit/:id', (req, res)=>{
    Category.findOne({_id:req.params.id}).then(category=>{
        category.name = req.body.name;
        category.save().then(categorySaved=>{
            res.redirect('/admin/categories');
        });
    });
});
router.delete('/:id', (req, res)=>{
    Category.remove({_id:req.params.id}).then(result=>{
        res.redirect('/admin/categories');
    });
});


module.exports = router;