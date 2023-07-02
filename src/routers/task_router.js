const express = require('express')
const task_router = express.Router()
const auth = require("../middleware/auth")
const task_model = require('../models/task')

// ------------------- TASK

// create a task
task_router.post('/tasks', auth, async (req, res) => {
  const task = new task_model(
    {
      ...req.body,
      owner: req.user._id
    }
  )

  try {
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error)
  }

})
// get all tasks
task_router.get('/tasks', auth, async (req, res) => {
  try {

    const match = {}
    const sort = {}

    if( req.query.completed ) {
      match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy){
      const parts = req.query.sortBy.split(":")
      sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }
    await req.user.populate({
      path: "usertasks",  
      match: match,
      options: {
        limit : parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort : sort
      }
    })
    res.status(200).send(req.user.usertasks)
  } catch (error) {
    res.status(400).send()
  }
})

// get a single task
task_router.get('/tasks/:taskId', auth, async (req, res) => {

  const _id = req.params.taskId

  try {
    const task = await task_model.findOne({ _id, owner: req.user._id })

    if (!task) { res.status(404).send() }
    res.status(200).send(task)
  } catch (error) {
    res.status(500).send()
  }
})

// update a task
task_router.patch("/tasks/:taskid", auth, async (req, res) => {

  const updates = Object.keys(req.body)
  const allowedUpdates = ["description", "completed"]
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid update parameter!" })
  }

  try {
    const task = await task_model.findOne({ _id: req.params.taskid, owner: req.user._id })

    if (!task) {
      return res.status(404).send({ error: "Task not found! Please create one." })
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()
    res.status(200).send(task)
  } catch (error) {
    res.status(500).send(error)
  }

})

// delete task
task_router.delete("/tasks/:id", auth, async (req, res) => {

  try {
    const task = await task_model.findByIdAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!task) {
      return res.status(404).send({ error: "No task found!" })
    }
    res.status(200).send(task)
  } catch (error) {
    res.status(500).send({ error })
  }

})

module.exports = task_router