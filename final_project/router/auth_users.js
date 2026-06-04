const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
// Check if username is not empty and is a string
return username && typeof username === 'string' && username.trim().length > 0;
}

const authenticatedUser = (username, password) => { //returns boolean
// Check if username and password match records.
const user = users.find(u => u.username === username && u.password === password);
return user !== undefined;
}

// Only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
  return res.status(400).json({message: "Error logging in."});
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username." });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 * 60 });
    
    // Store access token and username in session
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).send("User successfully logged in.");
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password."});
        }
});

// Add a book review
regd_users.post("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText =req.body.review;
    const username = req.session.authorization.username;

    if (books[isbn]) {
        let reviews = books[isbn].reviews;
        if (!reviews) {
            books[isbn].reviews = {};
        }
        books[isbn].reviews[username] = reviewText;
        return res.status(200).json({ message: "Review successfully added!" });
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

// Modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.body.review;
    const username = req.session.authorization.username;
  
    if (books[isbn]) {
      let reviews = books[isbn].reviews;
      if (reviews && reviews[username]) {
          reviews[username] =reviewText;
          return res.status(200).json({ message: "Review successfully updated!", reviews: books[isbn]. reviews });
    } else {
        return res.status(404).json({ message: "You have not reviewed this book yet." });
    }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!req.session || !req.session.authorization) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const username = req.session.authorization.username;

    if (books[isbn]) {
        let reviews = books[isbn].reviews;
       
        if (reviews && reviews[username]) {
          delete books[isbn].reviews[username];
          return res.status(200).json({ message: "Review successfully removed!" });
        } else {
        return res.status(404).json({ message: "Review not found for this user." });
        }
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
