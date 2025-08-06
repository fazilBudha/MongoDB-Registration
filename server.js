const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const port = 3020
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)


const app = express()
app.use(express.static(__dirname))
app.use(express.urlencoded({extended:true}))

mongoose.connect('mongodb+srv://admin:qogCKauKSIEgQOT9@cluster0.m66exyz.mongodb.net/students?retryWrites=true&w=majority')
const db = mongoose.connection
db.once('open', ()=> {
    console.log("Mongodb connection successful");
    
})

const UserSchema = new mongoose.Schema({
    fullname:String,
    email:String,
    password:String,
    confirm:String
})

const Users = mongoose.model("data", UserSchema)

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.post('/post', async (req, res) => {
    console.log("✔ POST /post hit");

    const { fullname, email, password, confirm } = req.body;

    if (password !== confirm) {
        return res.status(400).send("Passwords do not match");
    }

    const user = new Users({ fullname, email, password });
    await user.save();
    console.log("✔ User saved");
    res.send("Form Submission Successful");
});

app.listen(port,()=> {
    console.log("Server Started");
    
})