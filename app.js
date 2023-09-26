const express = require("express");
require('dotenv/config');

const { errorHandler, notFound } = require("./middlewares/error");


//init app
const app = express();

//middlewares

app.use(express.json());

//Routes

app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/userRoute"));
app.use("/api/posts", require("./routes/postRoute"));
app.use("/api/comments", require("./routes/commentRoute"));
app.use("/api/categories", require("./routes/categoryRoute"));


//not found middleware
app.use(notFound);

//errorHandler middleware
app.use(errorHandler);


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


