const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.66pkv.mongodb.net/learnPro?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const port = 5065;

app.get("/", (req, res) => {
  res.send("hello from db it's working working");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const courseCollection = client.db("learnPro").collection("courses");
  const makeAdmin = client.db("learnPro").collection("admin");
  const enrollCourseCollection = client.db("learnPro").collection("enrolled");
  const reviewCollection = client.db("learnPro").collection("review");
  app.post("/addNewCourse", (req, res) => {
    console.log(req.files.file);
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const desc = req.body.desc;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    courseCollection.insertOne({ name, price, desc, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/courses", (req, res) => {
    courseCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/makeAdmin", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    makeAdmin.insertOne({ name, email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    makeAdmin.find({ email: email }).toArray((err, doctors) => {
      res.send(doctors.length > 0);
    });
  });

  app.post("/enrollCourse", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const course = req.body.course;

    enrollCourseCollection.insertOne({ name, email, course }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/yourCourse", (req, res) => {
    const email = req.body.email;
    enrollCourseCollection.find({ email: email }).toArray((err, course) => {
      res.send(course);
    });
  });

  app.get("/allStudents", (req, res) => {
    enrollCourseCollection.find({}).toArray((err, students) => {
      res.send(students);
    });
  });

  app.patch('/update/:id', (req, res) => {
    enrollCourseCollection.updateOne({_id: ObjectId(req.params.id)},
    {
      $set: {status: req.body.status, ind: req.body.ind}
    })
    .then (result => {
      res.send(result.modifiedCount > 0)
    })
  });



  app.post("/addReview", (req, res) => {
    console.log(req.files.file);
    const file = req.files.file;
    const name = req.body.name;
    const designation = req.body.designation;
    const desc = req.body.desc;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    reviewCollection.insertOne({ name, designation, desc, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/reviews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });


  // perform actions on the collection object
});

// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// client.connect((err) => {
//   const courseCollection = client.db("learnPro").collection("courses");
//   // perform actions on the collection object

// });

app.listen(process.env.PORT || port);
