const express = require('express')
require('./db/mongoose')
const user_router = require('./routers/user_router')
const task_router = require('./routers/task_router')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json()) // auto parse the json

// add routers
app.use(user_router)
app.use(task_router)

app.listen(port, () => console.log(`Server app listening on port ${port}!`))

// const task_model = require("./models/task")
// const user_model = require("./models/user")

// const main = async () => {
//   const user = await user_model.findById("649fca3bb8f86daef4ddcaa5")
//   await user.populate("usertasks")
//   console.log(user.usertasks);
// }

// main()