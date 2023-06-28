const express = require('express')
const task_router = express.Router()
const task_model = require('../models/task')

// ------------------- TASK

// create a task
task_router.post('/tasks', async (req, res) => {
  const task = new task_model(req.body)

  try {
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).send(error)
  }

})
// get all tasks
task_router.get('/tasks', async (req, res) => {
  try {
    const tasks = await task_model.find({})
    res.status(200).send(tasks)
  } catch (error) {
    res.status(400).send()
  }
})

// get a single task
task_router.get('/tasks/:taskId', async (req, res) => {
  const task_id = req.params.taskId

  try {
    const task = await task_model.findById(task_id)
    if (!task) { res.status(404).send() }
    res.status(200).send(task)
  } catch (error) {
    res.status(500).send()
  }
})

// update a tas
task_router.patch("/tasks/:taskid", async (req, res) => {

  const updates = Object.keys(req.body)
  const allowedUpdates = ["description", "completed"]
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid update parameter!" })
  }

  try {
    const task = await task_model.findByIdAndUpdate(req.params.taskid, req.body, { new: true, runValidators: true })
    if (!task) {
      return res.status(404).send({ error: "Task not found! Please create one." })
    }
    res.status(200).send(task)
  } catch (error) {
    res.status(500).send(error)
  }

})

// delete task
task_router.delete("/tasks/:id", async (req, res) => {

  try {
    const task = await task_model.findByIdAndDelete(req.params.id)
    if (!task) {
      return res.status(404).send({ error: "No task found!" })
    }
    res.status(200).send(task)
  } catch (error) {
    res.status(500).send({ error})
  }

})

module.exports = task_router