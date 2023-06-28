const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require('bcryptjs')

const User_Schema = mongoose.Schema(
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
    }

  }
)


//login user
User_Schema.statics.findByCredentials = async (email, password) => {
  
    const user = await User_Model.findOne({ email: email })
    
    if(!user){
      throw new Error("Unable to login!")
    }

    const isMatch = bcrypt.compare(password, user.password)

    if(!isMatch) {
      throw new Error("Unable to login!")
    }

    return user
}

// hash password
User_Schema.pre('save', async function (next) {

  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 12)
  }

  next()

})

const User_Model = mongoose.model('user', User_Schema)
module.exports = User_Model