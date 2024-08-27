const mongoose = require('mongoose') ;
const post = require("./post")


mongoose.connect('mongodb://127.0.0.1:27017/miniprojects',);  

 let userschema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    profilepic:{
        type: String,
        default:"default.png"
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'
        }
    ]
})

module.exports = mongoose.model('user',userschema)
