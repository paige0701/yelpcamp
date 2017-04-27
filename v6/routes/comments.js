var express = require("express")
var router = express.Router({mergeParams:true})
var Campground = require("../models/campground")
var Comment = require("../models/comment")

// ================
// Comment routes
// ================

// Comments Form/ New
router.get('/new', isLoggedin, function(req,res){
    
    // found campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err)
        }else{
            
            res.render('comments/new', {campground:campground} )
        }
        
        
    })
    
})

// Comments Create
router.post('/', isLoggedin, function(req,res){
    // look up campground using id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        }else{
            // create new connect
            console.log(req.body.comment['text'])
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err)
                }else{
                    
                    // add username and id to comment
                     comment.author.id = req.user._id;
                     comment.author.username = req.user.username;
                     comment.save()
                     // connect comment and campground
                     console.log(comment)
                     campground.comments.push(comment);
                     campground.save();
                      //redirect campground showpage
                     res.redirect('/campgrounds/'+ campground._id)
                }
                
            })
        }
    });
   
});

// comment edit
router.get('/:comment_id/edit', checkCammentOwnership,function(req,res){
    
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect('back')
            
        }else{
            res.render('comments/edit', {campground_id:req.params.id,comment:foundComment })        
        }
        
        
    });
    
});

// update comment
router.put('/:comment_id', checkCammentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect('back')
        }else{
            res.redirect('/campgrounds/'+req.params.id)
        }
    })
})


router.delete('/:comment_id', checkCammentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, comment){
        if(err){
            res.redirect('back')
        }else{
            res.redirect('/campgrounds/'+req.params.id)
        }
    })
})



// middleware
function isLoggedin(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
    
}

function checkCammentOwnership(req,res,next){
    // is user is logged inㅣㄴ
    if(req.isAuthenticated()){
        
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect('back')
                
            }else{
                // does user own post ?
                if(foundComment.author.id.equals(req.user._id)) {
                    next()
                }else{
                    res.redirect('back')
                }
            }
        })
    }else{
        // console.log('need to be logged in')
        res.redirect("back")
    }    
}

module.exports = router 