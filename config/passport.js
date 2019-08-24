var passport = require('passport')
var User = require('../models/user')
var LocalStrategy = require('passport-local').Strategy
const { sendWelcomeEmail, sendCancelEmail } = require('../models/email')
const {sendWelcomeSms}=require('../models/sms')


passport.serializeUser(function (user, done) {
	done(null, user.id)
})

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user)
	})
})

passport.use(
	'local.signup',
	new LocalStrategy(
		{	
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function (req,email, password, done) {
			req
				.checkBody('name', 'Invalid name')
				.notEmpty()
				.isLength({ min: 2 })

			req
				.checkBody('mobile', 'Invalid number')
				.notEmpty()
				.isLength({ min: 10 })	
			req
				.checkBody('email', 'Invalid email')
				.notEmpty()
				.isEmail()
			req
				.checkBody('password', 'Invalid password')
				.notEmpty()
				.isLength({ min: 4 })

					
			var errors = req.validationErrors()
			if (errors) {
				var messages = []
				errors.forEach(function (error) {
					messages.push(error.msg)
				})
				return done(null, false, req.flash('error', messages))
			}
			User.findOne({ email: email }, function (err, user) {
				if (err) {
					return done(err)
				}
				if (user) {
					return done(null, false, { message: 'Email is already in use.' })
				}
				var newUser = new User()

				newUser.name=req.body.name
				newUser.mobile=req.body.mobile
				newUser.email = email
				newUser.password = newUser.encryptPassword(password)
				newUser.save(function (err, result) {
					if (err) {
						return done(err)
					}
					sendWelcomeEmail(newUser.email,newUser.name)
					sendWelcomeSms(newUser.name,newUser.mobile)
					return done(null, newUser)
				})
				console.log(newUser);
			})
		}
	)
)

passport.use(
	'local.signin',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function (req, email, password, done) {
			req
				.checkBody('email', 'Invalid email')
				.notEmpty()
				.isEmail()
			req.checkBody('password', 'Invalid password').notEmpty()
			var errors = req.validationErrors()
			if (errors) {
				var messages = []
				errors.forEach(function (error) {
					messages.push(error.msg)
				})
				return done(null, false, req.flash('error', messages))
			}
			User.findOne({ email: email }, function (err, user) {
				if (err) {
					return done(err)
				}
				if (!user) {
					return done(null, false, { message: 'No user found' })
				}
				if (!user.validPassword(password)) {
					return done(null, false, { message: 'wrong password' })
				}

				return done(null, user)
			})

		}
	)
)
