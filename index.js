const express = require("express");
const fileupload = require("express-fileupload");
const fs = require('fs-extra');  // file-upload;
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// ===================================
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbcvbmv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// ===================================

const port = 30000;
const app = express();
// ====  middleware  ====
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('doctors'));  // doctors naame ekta folder create file-gulo rakhbe;
app.use(fileupload());
// ===================================



app.get('/', (req, res) =>{
    res.send('hello John! John..hello!')
})

// ==========================================

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointments");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");
  // use mongodb@4.9.1 version to work without errors;  
  
  app.post('/addAppointment', (req,res) =>{
    const appointment = req.body;
    appointmentCollection.insertOne(appointment)
    .then(result =>{
      res.send(result.insertedCount > 0 )
    })
  })
  app.post('/appointmentByDate', (req,res) =>{  // vid: 55_5.2;
    const date = req.body;
    const email = req.body.email;
    doctorCollection.find({email: email})
    .toArray((err, documents) =>{
      const filter = {appointDate: date.date};
      if(documents.length === 0){
        filter.email = email;  // jodi doctor nahoy tahole email die filter kore normal email match filter korbe; tokhon email & date die check korbe;
      }
      appointmentCollection.find(filter)  // appointDate(DB er theke, r date.date (req.body)-r theke bujhe naw)
      .toArray((err, documents) =>{
        res.send(documents)
      })
    })
  })

  app.post('/addDoctor', (req, res) =>{
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const filePath = `${__dirname}/doctors/${file.name}`;


    // file.mv(filePath, err =>{  // locally image save korchi;  // esob cancel kora vid: 56.1;
    //   if(err){
    //     console.log(err);
    //     res.status(500).send({msg: ' Failed To Upload Image'})
    //   }
      // const newImg = fs.readFileSync(filePath);  // vid: 55_5.4;  large file er jonno GridFS, multer use kora jabe;
      const newImg = req.files.file.data;  // loaclly save kore pore DB te pathanor bodole direct DB te save kora;
      const encodeImg = newImg.toString('base64');
      
      var image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        // img: Buffer(encodeImg, 'base64')  // locally korle shudhu Buffer
        img: Buffer.from(encodeImg, 'base64')  // direct korle Buffer.from;
      };

      doctorCollection.insertOne({name, email, image})
      .then(result =>{
        // fs.remove(filePath, error => {  // local file system theke remove korchi;  direct save koray remove o korte hocche na local theke;
        //   if(error){
        //     console.log(error)
        //     res.status(500).send({msg: ' Failed To Upload Image'})
        //   }
          res.send(result.insertedCount > 0 )
        // }) 
        // res.send({name: file.name, path: `/${file.name}`})
        // res.send(result.insertedCount > 0 )
      })
    // })
    
  })

  app.get('/doctors', (req,res) =>{
    const date = req.body;
    doctorCollection.find({})
    .toArray((err, documents) =>{
      res.send(documents)
    })
  })

  
  app.post('/isDoctor', (req,res) =>{
    const email = req.body.email;
    doctorCollection.find({email: email})
    .toArray((err, documents) =>{
      res.send(documents.length > 0)
    })
  })
});


app.listen(process.env.PORT || port);