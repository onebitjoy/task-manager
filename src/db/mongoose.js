const mongoose = require("mongoose")

const url = "mongodb+srv://taskmanagerapi:" + process.env.password + "@cluster0.y6ksghh.mongodb.net/"
mongoose.connect(url)
