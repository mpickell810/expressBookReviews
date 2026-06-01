const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //  Send JSON response with formatted book data
  res.send(JSON.stringify(books,null,3));
  return res.status(300).json({message: "Multiple books have been found, please choose a book."});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve the ISBN parameter from the request URL and send the corresponding ISBN's details
  const isbn = req.params.isbn;
  const book = books[isbn]; 
  
  if (book) {
  // Return immediately so the function ends here
  return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
  // Return immediately if not found
    res.status(404).send("Book not found.");
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Retrieve the author parameter from the request URL and send the corresponding author details
  const author = req.params.author;
  const book = books[author];

  if (book) {
    // Return immediately so the function ends here
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    // Return immediately if not found
  return res.status(404).send("Book not found.");
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //  Retrieve the title parameter from the request URL and send the corresponding title details
  const title = req.params.title;
  const book = books[title];

  if (book) {
    // Return immediately so the function ends here
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    // Return immediately if not found
  return res.status(404).send("Book not found.");
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Retrieve the review parameter from the request URL and send the corresponding review details
  const review = req.params.title;
  const book = books[review];

  if (book) {
    // Return immediately so the function ends here
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    // Return immediately if not found
  return res.status(404).send("No reviews found for this book.");
  }
});

module.exports.general = public_users;
