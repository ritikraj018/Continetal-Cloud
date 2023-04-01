require('dotenv').config();
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");
var express = require('express'), // "^4.13.4"
    aws = require('aws-sdk'), // ^2.2.41
    bodyParser = require('body-parser'),
    multer = require('multer'), // "multer": "^1.1.0"
    multerS3 = require('multer-s3'); //"^1.4.1"

aws.config.update({
    secretAccessKey: process.env.A_SKEYID,
    accessKeyId: process.env.A_KEYID,
    region: process.env.REGION
});

console.log(process.env.API_KEY);

var app = express(),
    s3 = new aws.S3();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connect db
mongoose.connect("mongodb://localhost:27017/userDB1", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

var upload = multer({
    storage: multerS3({
        s3: s3,
        //acl: 'public-read',
        bucket: 'bucket1234321',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname); //use Date.now() for unique file keys
        }
    })
});

//open in browser to see upload form

app.get("/", function (req, res) {
    res.render("home");
});

app.get('/login', function (req, res) {
    res.render("login")
});

app.get('/signup', function (req, res) {
    res.render("signup")
});

//used by upload form
app.post('/upload', upload.array('upl', 25), function (req, res, next) {
    res.send({
        message: "Uploaded!",
        urls: req.files.map(function (file) {
            res.render("load");
        })
    });
});

app.post("/signup", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save()
        .then(() => {
            // Do something else
            res.render("index");
        })
        .catch((err) => {
            console.error(err);
        });

});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username })
        .exec()
        .then(foundUser => {
            if (foundUser && foundUser.password === password) {
                res.render("index");
            }
            else {
                res.render("wrong");
            }
        })
        .catch(err => {
            console.error(err);
        });

})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
