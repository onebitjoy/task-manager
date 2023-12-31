const express = require('express')
const user_router = express.Router()
const user_model = require('../models/user')
const auth = require("../middleware/auth")
const sharp = require("sharp")
const mailer = require("../mail/mailer")

// create a user
user_router.post('/users', async (req, res) => {
  const user = new user_model(req.body)

  try {
    await user.save()
    const token = await user.generateAuthToken()
    mailer("Welcome to the task manager app!", "This email is an invitation email sent when you create an account with us.", user.email)
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
    mailer("Your account is being deleted!", "Thank you for your time on our website. We hope that you be back soon on our service. Good Bye.", req.user.email)
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
  // dest: "avatars", <- this won't be needed as we are storing data in the db
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
user_router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {

  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
},
  (error, req, res, next) => {
    res.status(404).send({ error: error.message })
  }
)

user_router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
})

user_router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await user_model.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set("Content-Type", "image/png")
    res.send(user.avatar)

  } catch (error) {
    res.status(404).send()
  }
})

//multer file upload
user_router.post("/upload", auth, fileupload.single("file"), (req, res) => {
  res.send()
},
  (error, req, res, next) => {
    res.status(404).send({ error: error.message })
  }
)

module.exports = user_router