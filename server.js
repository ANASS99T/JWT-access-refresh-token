const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const randToken = require('rand-token')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const app = express()

var refreshTokens = {}

var secret = "SECRETO_PARA_ENCRIPTACION"

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// using passport
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user.username)
})

passport.deserializeUser((username, done) => {
    done(null, username)
})



// Create refresh token and access token

app.post('/login', (req, res, next) => {
    var username = req.body.username
    var password = req.body.password

    var user = {
        username: username, role: 'Admin'
    }

    var token = jwt.sign(user, secret, { expiresIn: 180 })

    var refreshToken = randToken.uid(256)

    refreshTokens[refreshToken] = username

    console.log(refreshTokens)

    res.json({ token: 'JWT' + token, refreshToken: refreshToken })


})

// Generate new access token using the refresh token
app.post('/token', (req, res, next) => {
    var username = req.body.username
    var refreshToken = req.body.refreshToken

    if (refreshToken in refreshTokens && refreshTokens[refreshToken] == username) {
        var user = {
            username: username,
            role: "Admin"
        }

        var token = jwt.sign(user, secret, { expiresIn: 180 })

        res.json({ token: "JWT" + token, user: user })
    }

    else {
        res.end(401)
    }
})

// Cancle the refresh token

app.post('/token/reject', (req, res, next) => {
    var refreshToken = req.body.refreshToken

    if (refreshToken in refreshTokens) {
        delete refreshTokens[refreshToken]
    }
    res.send(204)
})


app.listen(1234, () => { console.log("server listening on port 1234") })