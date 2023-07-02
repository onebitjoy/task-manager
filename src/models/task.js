const mongoose = require('mongoose')
const Task_schema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user"
    }
  },
  { timestamps : true }
)

const Task_model = mongoose.model('task', Task_schema)
module.exports = Task_model