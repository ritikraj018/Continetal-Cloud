const ejs = require("ejs");
var express = require('express'), // "^4.13.4"
    aws = require('aws-sdk'), // ^2.2.41
    bodyParser = require('body-parser'),
    multer = require('multer'), // "multer": "^1.1.0"
    multerS3 = require('multer-s3'); //"^1.4.1"

aws.config.update({
    secretAccessKey: 'MQKlgl9Xu3Dvl4wvv4a/TeOBpXMGrSKHFNQjOxgx',
    accessKeyId: 'AKIATICNI2SOQHY3GO4W',
    region: 'us-east-1'
});



var app = express(),
    s3 = new aws.S3();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static("public"));

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
app.get('/', function (req, res) {
    res.render("\index");
});

app.get('/login', function (req, res) {
    res.render("\login")
})

//used by upload form
app.post('/upload', upload.array('upl', 25), function (req, res, next) {
    res.send({
        message: "Uploaded!",
        urls: req.files.map(function (file) {
            return { url: file.location, name: file.key, type: file.mimetype, size: file.size };
        })
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
