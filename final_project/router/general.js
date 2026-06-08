const express = require('express');
const axios = require('axios');
const books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    if (!Array.isArray(users)) return false;
    const searchUser = username?.toLowerCase().trim();
    return users.some(user => user?.username?.toLowerCase().trim() === searchUser);
};

//Register a new user
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log("Register endpoint hit");
    console.log("Request body:", req.body);

    console.log("Username:", username, "Password:", password);

    let registerPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Promise resolved")
        }, 6000)})

    console.log("Before calling promise");
    registerPromise.then((successMessage) => {
        console.log("From Callback " + successMessage)
    })

    console.log("After calling promise")

    //Check if both username and password are provided
    if (username && password) {
        // Check if the use does not already exist
        if (!doesExist(username)) {
            if (!Array.isArray(users)) {
                users = [];  // Initialize if undefined
            }
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can log in." });
        } else {
        return res.status(400).json({ message: "User already exists." });
        }
    }
    // Return error if username or password is missing
    return res.status(400).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //  Send JSON response with formatted book data
  res.send(JSON.stringify(books,null,3));
  return res.status(300).json({message: "Multiple books have been found, please choose a book."});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  // Retrieve the ISBN parameter from the request URL and send the corresponding ISBN's details
  const isbn = req.params.isbn;
  
  try {
  // Make an axios request (e.g., to an external API)
  const response = await axios.get(`http://localhost:5000/books/${isbn}`);
  const book = response.data;
  
  if (book) {
  // Return immediately so the function ends here
  return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
  // Return immediately if not found
    res.status(404).send("Book not found.");
  }
} catch (error) {
  res.status(500).json({ message: "Error fetching book", error: error.message })
}
});
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  // Retrieve the author parameter from the request URL and send the corresponding author details
  const author = req.params.author.toLowerCase().trim();
  try {
  // Make an axios request to an external API
  const response = await axios.get(`http://localhost:5000/authors/${author}`);
  const booksByAuthor = response.data;

  if (booksByAuthor && booksByAuthor.length > 0) {
    // Return immediately so the function ends here
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    // Return immediately if not found
  return res.status(404).send("No books found for this author.");
  }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  //  Retrieve the title parameter from the request URL and send the corresponding title details
  const title = req.params.title.toLowerCase().trim();

  try {
    const response = await axios.get(`http://localhost:5000/books/title/${title}`);
    const booksByTitle = response.data;

  if (booksByTitle && booksByTitle.length > 0) {
    // Return immediately so the function ends here
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } else {
    // Return immediately if not found
  return res.status(404).send("No books found with this title.");
  }
  } catch (error) {
    res.status(500).json({ message: "Error fetching book", error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Retrieve the review parameter from the request URL and send the corresponding review details
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews && Object.keys(book.reviews).length > 0) {
    // Return immediately so the function ends here
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    // Return immediately if not found
  return res.status(200).send("");
  }
});

module.exports.general = public_users;
module.exports.public_users = public_users;
