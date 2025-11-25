// Create a new router
const express = require("express");
const router = express.Router();

// use the global db defined in index.js
const db = global.db;

// Auth middleware – copy of what you used in users.js, but with correct path
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/users/login");
  }
  next();
};

router.get("/search", function (req, res) {
  res.render("search.ejs");
});

// Route for Search Results - Returns to searchresults.ejs
router.get("/searchresults", function (req, res, next) {
  let keyword = req.query.keyword;
  let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
  let search = `%${keyword}%`;

  db.query(sqlquery, [search], (err, result) => {
    if (err) {
      return next(err);
    } else {
      res.render("searchresults.ejs", {
        keyword: keyword,
        books: result,
      });
    }
  });
});

// Route for List of books in database
router.get("/list", redirectLogin, function (req, res, next) {
  let sqlquery = "SELECT * FROM books";

  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render("list.ejs", { availableBooks: result });
    }
  });
});

// Route to add book page
router.get("/addbook", redirectLogin, function (req, res) {
  res.render("addbook.ejs");
});


// Route for confirmation of book being added
router.post("/bookadded", redirectLogin, function (req, res, next) {
  // saving data in database
  let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
  // execute sql query
  let newrecord = [req.body.name, req.body.price];
  db.query(sqlquery, newrecord, (err, result) => {
    if (err) {
      next(err);
    } else
      res.send(
        " This book is added to database, name: " +
          req.body.name +
          " price " +
          req.body.price
      );
  });
});

// Route for Bargain Books - Books less then £20
router.get("/bargainbooks", redirectLogin,  function (req, res, next) {
  let sqlquery = "SELECT * FROM books WHERE price < 20";
  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render("bargainbooks.ejs", { availableBooks: result });
    }
  });
});

// Export the router object so index.js can access it
module.exports = router;
