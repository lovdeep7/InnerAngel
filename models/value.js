const mongoose = require('mongoose')
const Book = require('./book')

const valueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

valueSchema.pre('remove', function(next) {
  Book.find({ value: this.id }, (err, books) => {
    if (err) {
      next(err)
    } else if (books.length > 0) {
      next(new Error('This value has books still'))
    } else {
      next()
    }
  })
})

module.exports = mongoose.model('Value', valueSchema)