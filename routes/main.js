// Create a new router
const express = require("express");
const router = express.Router();


const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    // res.redirect("../users/login"); // redirect to the login page
    return res.redirect("./login");
  } else {
    next(); // move to the next middleware function
  }
};

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});



router.get("/about", function (req, res, next) {
  res.render("about.ejs");
});

// Export the router object so index.js can access it
module.exports = router;
