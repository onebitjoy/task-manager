const express = require('express')
require('./db/mongoose')
const user_router = require('./routers/user_router')
const task_router = require('./routers/task_router')

const app = express()
const port = process.env.PORT || 3000


//middleware function
// app.use((req, res, next) => {
//   // console.log(req.method, req.path)
//   next()
// })

app.use(express.json()) // auto parse the json

// add routers
app.use(user_router)
app.use(task_router)

app.listen(port, () => console.log(`Server app listening on port ${port}!`))