const express = require('express')
const user_router = express.Router()
const user_model = require('../models/user')
const auth = require("../middleware/auth")


// create a user
user_router.post('/users', async (req, res) => {
  const user = new user_model(req.body)

  try {
    await user.save()
    const token = await user.generateAuthToken()

    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }
}
)

// get all users + middleware
// The arrow func will only be called if inside auth() we execute next()
user_router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

// update a user
user_router.patch('/users/me', auth, async (req, res) => {

  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates Parameters Sent!" })
  }
  // is a valid operation
  try {
    updates.forEach((update) => { req.user[update] = req.body[update] })
    await req.user.save()
    res.send(req.user)
  } catch (error) {
    res.status(400).send(error)
  }
})

//delete a user
user_router.delete("/users/me", auth, async (req, res) => {
  try {
    // await req.user.remove()
    await req.user.deleteOne()
    res.send(req.user)
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
})

// login a user
user_router.post("/users/login", async (req, res) => {

  try {
    const user = await user_model.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch {
    () => { res.status(400).send() }
  }

})

// user logout
user_router.post("/users/logout", auth, async (req, res) => {

  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send()
  }

})

// logout user from everywhere
user_router.post("/users/logoutall", auth, async (req, res) => {

  try {
    req.user.tokens = []

    await req.user.save()
    res.send({ success: "You have successfully logged out on all devices!" })
  } catch (error) {
    res.status(500).send()
  }

})

// --------------------------------- multer
const multer = require("multer")
const upload = multer({
  dest: "avatars",
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please only upload a jpg/jpeg/png file"))
    }
    cb(undefined, true)
  }
})

const fileupload = multer({
  dest: "documents",
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(doc|docx|pdf)$/)) {
      return cb(new Error("Please upload a document in doc/docx/pdf format"))
    }
    cb(undefined, true)
  }
})


// multer upload avatar
user_router.post(
  "/users/me/avatar",
  upload.single("avatar"),
  (req, res) => {
    res.send()
  },
  (error, req, res, next) => {
    res.status(404).send({ error: error.message })
  }
)

//multer file upload
user_router.post(
  "/upload",
  fileupload.single("file"),
  (req, res) => {
    res.send()
  },
  (error, req, res, next) => {
    res.status(404).send({ error: error.message })
  }
)

module.exports = user_router