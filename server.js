/**
 * Created by harshilkumar on 4/25/17.
 */

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var $ = require('jquery');

var fs = require("fs");
var http = require('http');
var path = require('path');

/*============= Not needed in this application========*/
var nodeemail = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodeemail.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    port: 465,
    "secure": true,
    auth: {
        user: 'weddashboard@gmail.com',
        pass: 'harshil123'
    }
}));
/*====================================================*/
var app = express();
//var app = express.createServer();
app.use(bodyParser.json());


var serverDB = {
    "_id": "heroku_snz51hdt.heroku_snz51hdt",
    "user": "admin",
    "db": "heroku_snz51hdt",
    "pass": "admin",
    "roles": [{
        "role": "dbOwner",
        "db": "heroku_snz51hdt"
    }]
}

//mongodb://<dbuser>:<dbpassword>@ds125906.mlab.com:25906/heroku_snz51hdt

var mongoUrl = 'mongodb://' + serverDB.user + ':' + serverDB.pass + '@ds125906.mlab.com:25906/heroku_snz51hdt';

var MongoClient = require('mongodb').MongoClient;
var db;


var localDBUrl = "mongodb://localhost:27017/pvrdatabase";

// Initialize connection once
MongoClient.connect(mongoUrl, function(err, database) {
    if (err) {
        return console.error(err);
    } else {
        db = database;
        console.log("AOI Database connected.");

    }
});

app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, **Authorization**');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.header('Content-Security-Policy', 'default-src "self";script-src "self";object-src "none";img-src "self";media-src "self";frame-src "none";font-src "self" data:;connect-src "self";style-src "self"');
    next();
});

app.listen(3000, function() {
    console.log('Personal Virtual Assistant listening on port 3000!')
})


// Find the first time user data and add
app.post('/storeNewdata', function(req, res) {

    //console.log(JSON.stringify(req.body));

    var _guestUsrKey = req.body.usrkey;
    var _guestData = req.body.usrData;

    //var userjsonData = JSON.stringify(_apusrStockData);

    console.log("Get the user email :" + JSON.stringify(_guestData.email));
    console.log("Get the user data :" + JSON.stringify(_guestData));
    //var testdata = {};

    var emailDraft = {};
    var adminEmail = {};

    db.collection('visitor-info').insertOne({
            "userKey": _guestUsrKey,
            "userData": _guestData
        },
        function(err, result) {
            if (err) {
                console.log('Error updating use: ' + err);
                res.send({ 'error': 'An error has occurred' });
            } else {
                console.log('' + result + ' document(s) updated');
                //res.writeHead('200');
                res.send(result);
            }
        }
    );

    var body_html = '<section id="general-info" class="branding-class" style="padding: 100px 0px;text-align: center;font-size: 2.5rem;font-family: sans-serif;font-variant: common-ligatures;font-weight: 200;color: #6b6c6d;line-height: 3.5rem;">' +
        '<div class="text_branding_companies">Thanks for showing interest in AOI.</div>' +
        '<div class="subtext_style" style="font-size: 1.5rem;font-family: sans-serif;font-variant: common-ligatures;font-weight: 200;color: #6b6b6b;line-height: 3.5rem;">We will reachout to you ASAP.</div>' +
        '</section>';

    emailDraft = {
        from: 'weddashboard@gmail.com',
        to: JSON.stringify(_guestData.email),
        subject: 'AOI Machine Inc - We got your request',
        html: body_html,
        text: 'We got your request. '
    };
    transporter.sendMail(emailDraft, function(error, response) { //callback
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + JSON.stringify(response.message));
        }
        transporter.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
    });

    // This is for admin email.
    adminEmail = {
        from: 'weddashboard@gmail.com',
        to: 'harshilsks263@gmail.com',
        subject: 'AOI Customer query',
        html: '<div>We got customer query.</div>',
        text: 'We got your request. '
    };
    transporter.sendMail(adminEmail, function(error, response) { //callback
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + JSON.stringify(response.message));
        }
        transporter.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
    });

});


// get all data
app.get('/getUsrJson', function(req, res) {
    var testdata = {};
    db.collection('visitor-info', function(err, collection) {
        collection.find().toArray(function(err, items) {
            //console.log(items);
            //testdata = testdata+items;
            res.send(items);
        });
    });
});
/*


//Existing stock edit and save
app.post('/updateExistingdata', function (req, res) {

    //console.log(JSON.stringify(req.body));

    var _guestUsrKey = req.body.guestkey;
    var _guestData = req.body.guestData;

    //var userjsonData = JSON.stringify(_apusrStockData);

    console.log("Seperating the userkey :" + JSON.stringify(_guestUsrKey));
    console.log("Seperating the stockdata :" + JSON.stringify(_guestData));

    //var testdata = {};

    var update = {"$set": {}};

    update.$set["g_data"] = _guestData;
    db.collection('testguestData').updateOne(
        {
            g_name: _guestUsrKey
        },
        update,
        {upsert: true},
        function (err, result) {
            if (err) {
                console.log('Error updating use: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                //res.writeHead('200');
                res.send(result);
            }
        }
    );
});


// find specific guest data
app.get('/getspecificGuest/:id', function (req, res) {

    //console.log(JSON.stringify(req.body));

    var g_userId = req.params.id;
    //var userjsonData = JSON.stringify(_apusrStockData);

    console.log("Userkey to get data :" + JSON.stringify(g_userId));
    //var testdata = {};

    db.collection('testguestData').findOne({
            g_name: g_userId
        },
        function (err, result) {
            if (err) {
                console.log('Error updating use: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                //res.writeHead('200');
                res.send(result);
            }
        }
    );

});

*/
// Find the first time user data and add
app.post('/sendemails', function(req, res) {

    console.log(JSON.stringify(req.body.mailAry));
    console.log(JSON.stringify(req.body.eventKind));

    var emailDraft = {};
    var _guestUsrKey = req.body.mailAry;

    console.log(JSON.stringify(_guestUsrKey));
    //var userjsonData = JSON.stringify(_apusrStockData);

    _guestUsrKey.forEach(function(value) {
        value = value.replace(/^[ ]+|[ ]+$/g, '');
        var encoded = new Buffer(value).toString('base64');
        console.log(encoded);

        /*
        emailDraft = {
            from: 'henrynmkg@gmail.com',
            to: value,
            subject: 'Harshil & Jinail Wedding Invitation',
            html: '<a href="https://henry263.github.io/2-page-invite/?_guestKey=' + encoded + '"><img src="https://i.imgur.com/GpHJUhE.png" alt="Wedding invite" border="0"></a><br />',
            text: 'RSVP here (By clicking on image )'
        };
        transporter.sendMail(emailDraft, function (error, response) {  //callback
            if (error) {
                console.log(error);
            } else {
                console.log("Message sent: " + response.message);
            }
            transporter.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
        });
        */
    });



});