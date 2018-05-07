var express = require('express');
const bodyParser= require('body-parser');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.listen(8080, function(){console.log('listening for requests on port 8080,');});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var DonorSchema = mongoose.Schema({
  success: {
    type: Boolean, default: false
  },
  rfname: {
    type: String,
    required: true,
  },
  rlname: {
    type: String,
    required: true,
  },
  re: {
    type: String,
    required: true,
  },
  rs: {
    type: String,
    required: true,
  },
  ra: {
    type: String,
    required: true,
  },
  fi: {
    type: String,
    required: true,
  }, 
  resolution: {
    type: String, default: 'NO ID'
  }
});

var InstrumentSchema = mongoose.Schema({
  dfname: {
    type: String,
    required: true,
  },
  dlname: {
    type: String,
    required: true,
  },
  de: {
    type: String,
    required: true,
  },
  da: {
    type: String,
    required: true,
  },
  di: {
    type: String,
    required: true,
  }, 
  repairq: {
    type: String
  },
  idesc: {
    type: String,
    required: true
  },
  resolution :{
    type: String, default: 'NO ID PAIRED YET'
  }
});

var Instrument = mongoose.model('Instrument', InstrumentSchema);
var Request = mongoose.model('Request', DonorSchema);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/instruments').catch(err => console.error(err));;
mongoose.connection.on('open', function () {  
  console.log("Mongoose open event"); 
});
mongoose.connection.on('close', function () {  
  console.log("Mongoose close event"); 
});
mongoose.connection.on('connected', function () {  
  console.log("Mongoose connected event");
}); 
mongoose.connection.on('disconnected', function () {  
  console.log("Mongoose disconnected event"); 
});
mongoose.connection.on('error',function (err) {  
  console.log("Mongoose error event:");
  console.log(err)
}); 
app.use(express.static(__dirname + '/stylesheets'));
app.get('/', function(req, res, next){
   console.log('connection successful');
   res.render(__dirname + '/getstarted.ejs');
});

app.post('/postrequest', function(req, res, next){
   var request = req.body;
   console.log(request)
   var newRequest = new Request(request);
   newRequest.save(function(err,nrequest) {
     if(err) {
       res.render(__dirname + '/getstarted.ejs', {donormessage: "Please fill out all forms"})
     } else {
       res.render(__dirname + '/rsuccess.ejs', {id: nrequest._id})
     }
   })
});

app.post('/postdonate', function(req, res, next){
   var instrument = req.body;
   console.log(instrument)
   var newInstrument = new Instrument(instrument);
   newInstrument.save(function(err, ninstrument) {
     if(err) {
       console.log(err)
       res.render(__dirname + '/getstarted.ejs', {donatemessage: "Please fill out all forms"})
     } else {
       res.render(__dirname + '/dsuccess.ejs', {id: ninstrument._id})
     }
   })
});

app.get('/search', function(req, res, next){
  console.log(req.query.id)
  Request.findOne({_id: req.query.id, success: true }, function(err, request){
    if(request == null){
      Instrument.findOne({_id: req.query.id, resolution: {$ne: 'NO ID PAIRED YET' } }, function(err, instrument){
        if(instrument == null){
          res.render(__dirname + '/search.ejs', {error: true})
        } else {
          Request.findOne({_id: instrument.resolution}, function(err, instrumentrequest){
            res.render(__dirname + '/search.ejs', {address: instrumentrequest.da})
          });
        }
      });
    } else {
      console.log(request)
      Instrument.findOne({_id: request.resolution}, function(err, requestedinstrument){
        res.render(__dirname + '/search.ejs', {instrument: requestinstrument.di, idesc: requestinstrument.idesc, repair: requestinstrument.repair })
      });
    }
  })
});



app.get('/admin', function(req, res, next){
  res.render(__dirname + '/adminlogin.ejs'); 
});

app.post('/admin', function(req, res, next) {
   if(req.body.password == 'dontusethissite') {
     
     
     Request.find({success: false}, function(err, request) {
        console.log(request)
        res.render(__dirname + '/admin.ejs', {requests: request}); 
     });
     
     
     
     
     
   } else {
    res.render(__dirname + '/adminlogin.ejs'); 
   }
});

