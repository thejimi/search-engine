const mongoose = require("mongoose")

const Schema = mongoose.Schema({
    //id is the url
    _id: {
        type: String,
        required: true
    },

    domain: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    updated_at: {
        type: Date,
        required: true
    },
})

module.exports = mongoose.model('result', Schema)