// Create a new router
const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const saltRounds = 10;
const db = global.db;

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/users/login"); // redirect to the login page
  } else {
    next(); // move to the next middleware function
  }
};

router.get("/register", function (req, res, next) {
  res.render("register.ejs");
});

router.post("/registered", function (req, res, next) {
  const plainPassword = req.body.password;

  bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
    if (err) {
      return next(err);
    }

    let sqlquery =
      "INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?,?,?,?,?)";

    let newrecord = [
      req.body.username,
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      hashedPassword,
    ];

    db.query(sqlquery, newrecord, (err, result) => {
      if (err) {
        next(err);
      } else {
        let output =
          "Hello " +
          req.body.firstName +
          " " +
          req.body.lastName +
          " you are now registered!  We will send an email to you at " +
          req.body.email;

        output +=
          "<br>Your password is: " +
          req.body.password +
          "<br>And your hashed password is: " +
          hashedPassword;

        res.send(output);
      }
    });
  });
});

// Route for list of users in database (no passwords shown)
router.get("/list", function (req, res, next) {
  let sqlquery = "SELECT username, firstName, lastName, email FROM users";

  db.query(sqlquery, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.render("userslist.ejs", { users: result });
    }
  });
});

// Login Route - Shows login form
router.get("/login", function (req, res, next) {
  res.render("login.ejs");
});

// LoggedIn Route - When user logs in
router.post("/loggedin", function (req, res, next) {
  const username = req.body.username;
  const plainPassword = req.body.password;

  const sqlquery = "SELECT * FROM users WHERE username = ?";

  db.query(sqlquery, [username], function (err, results) {
    if (err) {
      return next(err);
    }

    // No user found
    if (results.length === 0) {
      // insert audit log entry for failed login (no such user)
      const auditSql =
        "INSERT INTO audit_log (username, success, message) VALUES (?, ?, ?)";
      db.query(
        auditSql,
        [username, 0, "Failed login: user not found"],
        function (auditErr) {
          if (auditErr) console.error("Audit insert error:", auditErr);
        }
      );

      return res.send("Login failed: user not found.");
    }

    const user = results[0];
    const hashedPassword = user.hashedPassword;

    // Compare password
    bcrypt.compare(plainPassword, hashedPassword, function (err, isMatch) {
      if (err) {
        return next(err);
      }

      const auditSql =
        "INSERT INTO audit_log (username, success, message) VALUES (?, ?, ?)";

      if (isMatch === true) {
        // Successful login
        db.query(
          auditSql,
          [username, 1, "Successful login"],
          function (auditErr) {
            if (auditErr) console.error("Audit insert error:", auditErr);
          }
        );

        // you can store username, user.id, or both
        req.session.userId = username;

        // ✅ Redirect to a protected page
        return res.redirect("/books/list");

        // res.send(
        //   "Login successful! Welcome " +
        //     user.firstName +
        //     " " +
        //     user.lastName +
        //     "."
        // );
      } else {
        // Failed login: bad password
        db.query(
          auditSql,
          [username, 0, "Failed login: incorrect password"],
          function (auditErr) {
            if (auditErr) console.error("Audit insert error:", auditErr);
          }
        );

        res.send("Login failed: incorrect password.");
      }
    });
  });
});

router.get("/logout", redirectLogin, function (req, res, next){
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/"); // something went wrong, go home
    }
    res.send('You are now logged out. <a href="/">Home</a>');
  });
});

// Audit Route - Shows a list of all login attempts
router.get("/audit", redirectLogin, function (req, res, next) {
  const sqlquery =
    "SELECT username, success, message, created_at FROM audit_log ORDER BY created_at DESC";
  db.query(sqlquery, function (err, results) {
    if (err) {
      return next(err);
    }
    res.render("audit.ejs", { logs: results });
  });
});

// Export the router object so index.js can access it
module.exports = router;
