const mongoose = require("mongoose")

const url = "mongodb+srv://taskmanagerapi:" + process.env.password + "@cluster0.y6ksghh.mongodb.net/?authMechanism=DEFAULT"
mongoose.connect(url)
  .then(() => console.log("MongoDB is running"))
  .catch((err) => console.log(err))