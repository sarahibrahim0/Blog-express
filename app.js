const express = require("express");
const cors = require('cors');
const xss = require("xss-clean");
const rateLimiting=require("express-rate-limit");
const hpp = require("hpp");
const helmet = require("helmet");
const path = require('path');

require('dotenv/config');

const { errorHandler, notFound } = require("./middlewares/error");


//init app
const app = express();


//middlewares
app.use(express.json());


// setup the logger
app.use(cors())

app.options('*', cors())



//security headers (helmet)
app.use(helmet());

//prevent http param pollution
app.use(hpp());

//prevent xxs attacks (cross site scripting)
app.use(xss());

//rate limiting
// app.use(rateLimiting({
//   windowMs: 15  * 60 * 1000, // 15 minutes
//   max: 200, // limit each IP to 200 requests per windowMs
// }));


//Routes

app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/userRoute"));
app.use("/api/posts", require("./routes/postRoute"));
app.use("/api/comments", require("./routes/commentRoute"));
app.use("/api/categories", require("./routes/categoryRoute"));
app.use("/api/password", require("./routes/passwordRoute"));


//not found middleware
app.use(notFound);

//errorHandler middleware
app.use(errorHandler);


//Running the server

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});





const mongoose = require("mongoose");


//Database
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: "Blog-backend"})
  .then(() => {
    console.log("Database Connection is ready.");
app.listen(8000, ()=>{
  console.log('server is runnin now on 8000')
})

  })
  .catch((err) => {
    console.log(err);
  });


