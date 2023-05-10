var express = require("express");
var app = express();
var path = require("path");
//const blogService = require("./blog-service.js");
const HTTP_PORT = process.env.PORT || 5050;
//const multer = require("multer");
const cloudinary = require("cloudinary").v2;
//const streamifier = require("streamifier");
const { redirect } = require("express/lib/response");
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
// const upload = multer(); 
const authData = require("./auth-service.js");
const clientSessions = require("client-sessions");

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      console: function (context) {
        return console.log(context);
      },
    },
  })
);

// Load styles from public folder
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", ".hbs");

cloudinary.config({
    cloud_name: "dp7mrakws",
    api_key: "599746727269947",
    api_secret: "d_aBDaSwW0lDd6Bf5CqDAFBkksE",
    secure: true,
  });

  app.use(
    clientSessions({
      cookieName: "session",
      secret: "RuchiPortfolio",
      duration: 2 * 60 * 1000,
      activeDuration: 1000 * 60,
    })
  );
  
  function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }
  
  app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
  });
  
  app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute =
      route == "/" ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
  });
  
  app.get("/",ensureLogin,  (req, res) => {
    res.render(path.join(__dirname, "/views/layouts/main.hbs"));
  });

  app.get("/about",  (req, res) => {
    res.render(path.join(__dirname, "./views/about.hbs"));
  });

  // app.get("/about", (req, res) => {
  //   res.redirect("./views/about.hbs");
  // });

  app.get("/login", (req, res) => {
    res.render("login");
  });
  
  app.get("/register", (req, res) => {
    res.render("register");
  });
  
  app.post("/register", (req, res) => {
    authData
      .registerUser(req.body)
      .then((user) => {
        res.render("register", { successMessae: "User created successfully" });
      })
      .catch((err) => {
        res.render("register", {
          errorMessage: err,
          userName: req.body.userName,
        });
      });
  });
  
  app.post("/login", (req, res) => {
    req.body.userAgent = req.get("User-Agent");
    authData
      .checkUser(req.body)
      .then((user) => {
        req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory,
        };
        res.redirect("/");
      })
      .catch((err) => {
        res.render("login", { errorMessage: err, userName: req.body.userName });
      });
  });
  
  app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
  });
  
  app.get("/userHistory", (req, res) => {
    res.render("userHistory");
  });
  
  authData.initialize()
  .then(() => {
    // Start the server if the initialize() method is successful
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port" + HTTP_PORT);
    });
  })
  .catch((error) => {
    // If the initialize() method returns an error, don't start the server
    console.error(`Error initializing the auth-service module: ${error}`);
  });

  app.use(function(req,res){
    res.sendFile(path.join(__dirname,'./views/404.html'));
});
  

  