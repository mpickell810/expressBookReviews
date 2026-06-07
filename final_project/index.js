const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { users } = require('./router/auth_users.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const doesExist = (username) => {
    if (!Array.isArray(users)) return false;
    const searchUser = username?.toLowerCase().trim();
    return users.some(user => user?.username?.toLowerCase().trim() === searchUser);
};

const authenticatedUser = (username, password) => {
    const searchUser = username?.toLowerCase().trim();
    const user = users.find(u => u.username?.toLowerCase().trim() === searchUser && u.password === password);
    return user !== undefined;
};

const app = express();
app.use(express.json());

// Initialize session globally
app.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Authentication Middleware for protected customer routes
app.use("/auth/*", function auth(req, res, next) {
    if (req.session && req.session.authorization) {
        let token = req.session.authorization['accessToken'];

app.use("/review/*", function auth(req, res, next){
    if (req.session && req.session.authorization) {
        let token = req.session.authorization['accessToken'];
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

        //  Verify JWT token
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

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
