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

//get single user
user_router.get('/users/:id', async (req, res) => {
  const uid = req.params.id

  try {
    const user = await user_model.findById(uid)
    if (!user) {
      res.status(404).send()
    }
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send()
  }
})

// update a user
user_router.patch('/users/:id', async (req, res) => {

  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates Parameters Sent!" })
  }
  // is a valid operation
  try {
    const user = await user_model.findById(req.params.id)

    updates.forEach((update) => {
      user[update] = req.body[update]
    })

    await user.save()

    if (!user) { res.status(400).send() }
    res.send(user)

  } catch (error) {
    res.status(400).send(error)
  }
})

//delete a user
user_router.delete("/users/:id", async (req, res) => {

  try {
    const user = await user_model.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).send({ error: "No user found!" })
    }
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send({ error })
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
user_router.post("/users/logoutall" , auth , async (req, res) => {

  try {
    req.user.tokens = []

    await req.user.save()
    res.send({success: "You have successfully logged out on all devices!"})
  } catch (error) {
    res.status(500).send()
  }

})

module.exports = user_router