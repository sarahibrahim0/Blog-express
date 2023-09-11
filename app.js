const express = require("express");
require('dotenv/config');



//init app
const app = express();

//middlewares

app.use(express.json());

//Routes

app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/userRoute"));



//Running the server

const PORT = process.env.PORT || 3000;




const mongoose = require("mongoose");


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


