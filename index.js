const express = require('express')
const app = express()
const port = 3000

require('dotenv').config()

const mongoose =  require('mongoose');
mongoose.set('strictQuery', false)

mongoose.connect(process.env.MONGO, {
}).then(() => {
    console.log("connected with the database")
}).catch((err) => {
    console.log(`whoops: ${err}`)
});

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

const model_result = require('./data/model_result')

app.get('/search', async (req, res) => {
  const results = await model_result.find(
    {
      "$or":[
        {domain:{$regex:req.query.query}},
        {title:{$regex:req.query.query}},
        {description:{$regex:req.query.query}},
        {_id:{$regex:req.query.query}}
      ]
    }
  )

  // res.json(results)

  res.render('results', {query:req.query.query, results:results})
})

app.get('/all', async (req, res) => {
    const all = await model_result.find({})
    res.json(all)
})

app.get('/delall', async (req, res) => {
  await model_result.deleteMany({}).then(h => {res.json(h)})
})

app.listen(port, () => {
  console.log(`app running on port ${port}`)
})