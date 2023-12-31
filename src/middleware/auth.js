const jwt = require('jsonwebtoken');
const user_model = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1]
    const decoded = jwt.verify(token, process.env.decodingkey)
    const user = await user_model.findOne({ _id: decoded._id, 'tokens.token': token })

    if (!user) {
      throw new Error()
    }

    req.token = token
    req.user = user
    next()

  } catch (error) {
    res.status(401).send({ err: error + "Please authenticate!" })
  }
}

module.exports = auth