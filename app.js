const express = require("express");



//init app
const app = express();

//middlewares

app.use(express.json());

//Running the server

const PORT = process.env.PORT || 3000;




const mongoose = require("mongoose");

require('dotenv/config');

//Database
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: "Blog-backend"})
  .then(() => {
    console.log("Database Connection is ready.");
app.listen(3000, ()=>{
  console.log('server is runnin now on 3000')
})

  })
  .catch((err) => {
    console.log(err);
  });


