//==============================================
//  Dependencies
//==============================================
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

// Import user data
const { users } = require('./router/auth_users.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

//==============================================
//  Helper Functions
//==============================================

// Check if a user already exists in the database
const doesExist = (username) => {
    if (!Array.isArray(users)) return false;
    const searchUser = username?.toLowerCase().trim();
    return users.some(user => user?.username?.toLowerCase().trim() === searchUser);
};

// Authenticate user credentials
const authenticatedUser = (username, password) => {
    const searchUser = username?.toLowerCase().trim();
    const user = users.find(u => u.username?.toLowerCase().trim() === searchUser && u.password === password);
    return user !== undefined;
};

//==============================================
//  App Initialization
//==============================================
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

//==============================================
//  Session Management
//==============================================
// Initialize session globally to handle user states
app.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

//==============================================
//  Authentication Middleware
//==============================================

// Authentication Middleware for protected customer routes
app.use("/auth/*", function auth(req, res, next) {
    if (req.session && req.session.authorization) {
        let token = req.session.authorization['accessToken'];
    
        //  Verify JWT token for authenticate users
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); //  Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated"});
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});    

//  Middleware for protected review routes
app.use("/review/*", function auth(req, res, next){
    if (req.session && req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        
        //  Verify JWT token for reviews
        jwt.verify(token, "access", (err,user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated."});
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in." });
    }
});    

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = { accessToken, username };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password." });
    }
});

//==============================================
//  Routers
//==============================================
// Mount the general routes at the root path
app.use("/customer", customer_routes);

// Mount authenticated customer routes
app.use("/", customer_routes);
app.use("/", genl_routes);

//==============================================
//  Server Setup
//==============================================
const PORT =5000;
app.listen(PORT,()=>console.log("Server is running"));
