const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const task_model = require("./task")

const User_Schema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true, // will always require this property
      trim: true
    },
    age: {
      type: Number,
      // required: true, why would you require if there's a default
      default: 0,
      validate(value) {
        if (value < 0) { throw new Error("Age can't be negative") }
      }
    },
    email: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email!")
        }
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("The password can't contain 'password' in itself for security measures!");
        }
      }
    },
    tokens: [{
      token: {
        type: String,
        required: true
      }
    }],
    avatar: {
      type: Buffer
    }
  },

  { timestamps: true }
)

/* Models are accessible only to the instance of user_model, while statics can be used over the Schema itself */
//generate auth token
User_Schema.methods.generateAuthToken = async function () {
  const user = this
  const token = await jwt.sign({ _id: user._id.toString() }, 'secretkey')

  user.tokens = user.tokens.concat({ token: token })
  await user.save()

  return token
}

// generate a public profile
User_Schema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  // delete private info before sending
  delete userObject.password
  delete userObject.tokens

  return userObject
}

//login user
User_Schema.statics.findByCredentials = async (email, password) => {

  const user = await User_Model.findOne({ email: email })

  if (!user) {
    throw new Error("Unable to login!")
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error("Unable to login!")
  }

  return user
}

// hash password
User_Schema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10)
  }
  next()
})

// create a virtual property
User_Schema.virtual('usertasks', {
  ref: 'task',
  localField: "_id",
  foreignField: "owner"
})

// middleware to remove all the tasks if the user is deleted

User_Schema.pre('deleteOne', { document: true }, async function (next) {
  const user = this
  await task_model.deleteMany({ owner: user._id })
  console.log("all the tasks are deleted!");
  next()
})

const User_Model = mongoose.model('user', User_Schema)
module.exports = User_Model