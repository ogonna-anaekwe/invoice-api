// this file defines the user model
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Invoice = require('./invoice')

const userSchema = new mongoose.Schema({
    name: { // represents the company's name
        type: String,
        required: true,
        trim: true, 
        lowercase: true
    },
    email: {
        type: String,
        unique: true, // guarantees no two users have the same email
        required: true,
        trim: true,
        lowercase: true,
        default: "sanks.bs@gmail.com",
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            } //else if (value !== "sanks.bs@gmail.com") {
                //throw new Error('Contact admin')
            //}
        }
    },
    password: {
        type: String,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')){
                throw new Error('Enter a stronger password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    phone_number: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "+2348173028603"
    },
    avatar: {
        type: Buffer
    }
}, { timestamps: true })

// shows link between users and collections
// it is not actually stored in the database hence the virtual
userSchema.virtual('collections', {
    ref: 'Invoice', // this is the model that you seek to tie the User model to
    localField: '_id', // this is the ID that you seek to tie to
    foreignField: 'owner' // this is what you're calling the field from the User schema that you want to tie to the Invoice model
})

// this method hides the token and password when the user object is returned
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}
// method functions are accessible on instances of the User, in other words user
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token: token})
    await user.save()
    return token

}
// function to log in users
// static functions are accessible on the model User
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error ('Unable to login')
    }

    return user
}

// hash the plain text password before saving
// specify the middleware. this tells the schema what to do before creating the model
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// delete user collections when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this
    await Invoice.deleteMany({ owner: user._id })
    next()
})

// users invoice model and schema
const User = mongoose.model('User', userSchema)

module.exports = User