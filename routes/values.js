const express = require('express')
const router = express.Router()
const Value = require('../models/value')
const Book = require('../models/book')

// All values Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const values = await Value.find(searchOptions)
    res.render('values/index', {
      values: values,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New value Route
router.get('/new', (req, res) => {
  res.render('values/new', { value: new Value() })
})

// Create value Route
router.post('/', async (req, res) => {
  const value = new Value({
    name: req.body.name
  })
  try {
    const newValue = await value.save()
    res.redirect(`values/${newValue.id}`)
  } catch {
    res.render('values/new', {
      value: value,
      errorMessage: 'Error creating value'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const value = await Value.findById(req.params.id)
    const books = await Book.find({ value: value.id }).limit(6).exec()
    res.render('values/show', {
      value: value,
      booksByValue: books
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const value = await Value.findById(req.params.id)
    res.render('values/edit', { value: value })
  } catch {
    res.redirect('/values')
  }
})

router.put('/:id', async (req, res) => {
  let value
  try {
    value = await Value.findById(req.params.id)
    value.name = req.body.name
    await value.save()
    res.redirect(`/values/${value.id}`)
  } catch {
    if (value == null) {
      res.redirect('/')
    } else {
      res.render('values/edit', {
        value: value,
        errorMessage: 'Error updating value'
      })
    }
  }
})

router.delete('/:id', async (req, res) => {
  let value
  try {
    value = await Value.findById(req.params.id)
    await value.remove()
    res.redirect('/values')
  } catch {
    if (value == null) {
      res.redirect('/')
    } else {
      res.redirect(`/values/${value.id}`)
    }
  }
})

module.exports = router