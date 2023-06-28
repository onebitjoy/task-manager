const express = require('express')
const user_router = express.Router()
const user_model = require('../models/user')


// ----------------------- USERS

// create a user
user_router.post('/users', async (req, res) => {
  const user = new user_model(req.body)
  try {
    await user.save()
    res.status(201).send(user)
  } catch (error) {
    res.status(400).send(error)
  }
}
)

// get all users
user_router.get('/users', async (req, res) => {
  try {
    const users = await user_model.find({})
    res.status(200).send(users)
  } catch (error) {
    res.status(500).send()
  }
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

user_router.patch('/users/:id', async (req, res) => {
  /* the new will let us return the updated user, runValidators will let us run all validation */
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
    // const user
    //   = await user_model
    //     .findByIdAndUpdate(
    //       req.params.id, // requesting id
    //       req.body, // new update body
    //       { new: true, runValidators: true } // options to user_routerly
    //     )
    if (!user) { res.status(400).send() }
    res.send(user)

  } catch (error) {
    res.status(400).send(error)
  }
})

user_router.delete("/users/:id", async (req, res) => {

  try {
    const user = await user_model.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).send({ error: "No user found!" })
    }
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send({ error_this: error })
  }

})

user_router.post("/users/login/", async (req, res) => {

  try {
    const user = await user_model.findByCredentials(req.body.username, req.body.password)

    if (!user) {
      return res.status(404).send({ error: "User not found!" })
    }

    res.send(user)

  } catch {
    () => { res.status(400).send() }
  }

})

module.exports = user_router