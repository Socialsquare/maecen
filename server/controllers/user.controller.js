import { apiURL } from '../../shared/config'
import { normalizeResponse } from '../util/ctrlHelpers'
import { getToken } from '../util/fetchData'
import * as service from '../services/users'
import * as postService from '../services/posts'
import * as maecenateService from '../services/maecenates'
import * as epayUtil from '../../shared/lib/epay'
import User from '../models/User'
import { emailForgotPassword } from '../services/emailSender'

export function createUser (req, res, next) {
  let { user: data } = req.body
  if (data.email) {
    data.email = data.email.toLowerCase()
  }
  data.language = req.language

  let user = new User(data)
  user.generateId()

  user.save(null, { method: 'insert' }).then((model) => {
    const token = createUserAuthTokenInRes(model, res)
    const response = normalizeResponse({ users: model })
    return res.json({
      ...response, token
    })
  }).catch(next)
}

export function updateAuthUser (req, res, next) {
  if (!req.user) return res.status(401).json()

  const { userId } = req.user
  let data = req.body.user
  if (data.new_password) {
    data.password = data.new_password
  }
  delete data.new_password
  delete data.payment_card_issuer
  delete data.payment_card

  return User.where('id', userId).fetch().then(user => {
    user.set(data)
    if (data.password) {
      return user.hashPassword().then(() => {
        return user.save()
      })
    } else {
      return user.save()
    }
  }).then(user => {
    return res.json(normalizeResponse({ users: user }))
  }).catch(next)
}

export function getAuthUser (req, res, next) {
  const { knex } = req.app.locals
  const { userId } = req.user

  return service.fetchUser(knex, userId).then(user => {
    return res.json(normalizeResponse({ users: user }))
  }).catch(next)
}

export function authUser (req, res, next) {
  const { credentials } = req.body
  const email = (credentials.email || '').toLowerCase()
  const password = credentials.password || ''

  User.authenticate(email, password).then(user => {
    const token = createUserAuthTokenInRes(user, res)
    const response = normalizeResponse({ users: user })
    let languageChanged = false
    if (user.get('language') !== req.language) {
      setUserLanguageCookie(user.get('language'), res)
      languageChanged = true
    }
    return res.json({
      ...response, token, languageChanged
    })
  }).catch(next)
}

export function authWithAccessToken (req, res, next) {
  const { token } = req.query
  const { knex } = req.app.locals

  service.fetchUserByValidAccessToken(knex, token)
  .then((user) => {
    createUserAuthTokenInRes(user, res)
    if (user.language !== req.language) {
      setUserLanguageCookie(user.language, res)
    }
    res.redirect('/profile')
    return service.expireAccessToken(knex, token)
  }).catch(next)
}

export function clearAuth (req, res, next) {
  res.clearCookie('id_token', { httpOnly: true })
  return res.json({success: true})
}

export function setUserLanguage (req, res, next) {
  const { knex } = req.app.locals
  const userId = req.user && req.user.userId || null
  const {lng: language} = req.body
  if (userId) {
    service.saveUserLangueage(knex, userId, language).then(() => {})
  }
  setUserLanguageCookie(language, res)
  return res.json({success: true})
}

export function forgotPassword (req, res, next) {
  const { knex } = req.app.locals
  const { email } = req.body

  return service.createAccessToken(knex, email)
  .then(({token, userId}) =>
    emailForgotPassword(knex, token, userId)
    .then(() => res.json({ success: true }))
  ).catch(next)
}

export function hasPermission (req, res, next) {
  const { knex } = req.app.locals
  const userId = req.user && req.user.userId || null
  const { area, id } = req.params

  let permissionPromise = null

  switch (area) {
    case 'maecenateAdmin':
      permissionPromise = maecenateService.userIsAdminBySlug(knex, id, userId)
      .then(res => Boolean(res))
      break
  }

  return permissionPromise.then(hasPermission => {
    if (hasPermission === true) {
      return res.json({ hasPermission })
    } else {
      return res.status(401).json({ hasPermission })
    }
  }).catch(next)
}

export function getAdminMaecenates (req, res, next) {
  const { userId } = req.params
  return maecenateService.fetchMaecenates({ creator: userId })
  .then((maecenates) => {
    return res.json(normalizeResponse({
      maecenates
    }))
  })
  .catch(next)
}

export function getSupportedMaecenates (req, res, next) {
  const { userId } = req.user

  return maecenateService.fetchSupportedMaecenates(userId)
  .then(result => {
    const { maecenates, supports } = result
    return res.json(normalizeResponse({
      maecenates,
      supports
    }, 'maecenates'))
  })
  .catch(next)
}

export function getFeed (req, res, next) {
  const { userId } = req.user
  postService.fetchSupportedMaecenatePosts(userId).then((result) => {
    const { maecenates, posts, supports } = result
    res.json(normalizeResponse({
      maecenates,
      posts,
      supports
    }, 'posts'))
  })
}

export function getNewCardParams (req, res, next) {
  const token = getToken(req)

  res.json({
    merchantnumber: process.env.EPAY_MERCANT_NUMBER,
    amount: '0',
    currency: 'DKK',
    windowid: String(process.env.EPAY_WINDOW_ID),
    paymentcollection: '1',
    lockpaymentcollection: '1',
    instantcallback: '1',
    subscription: '1',
    instantcapture: '1',
    callbackurl: `${apiURL}/users/me/new-card-callback?token=${token}`
  })
}

export function newCardCallback (req, res, next) {
  const { userId } = req.user
  const { knex } = req.app.locals
  const { subscriptionid, cardno, paymenttype } = req.query
  const bin = req.query.cardno.substr(0, 6)

  return epayUtil.getIssuerFromPaymentTypeAndBin(
    Number(paymenttype),
    bin
  )
  .then((cardIssuer) => {
    return service.savePaymentInfo(knex, userId, subscriptionid, cardno, cardIssuer)
    .then(() => res.json({ success: true }))
  })
  .catch(next)
}

// Helper functions (not exported)
// ===============================
function createUserAuthTokenInRes (user, res) {
  const expiresIn = 60 * 60 * 24 * 30 // 30 days
  const token = User.createToken(user.id, expiresIn)
  res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true })
  return token
}

function setUserLanguageCookie (language, res) {
  const expire = 365 * 24 * 60 * 60 // in 1 year
  res.cookie('i18n', language, { maxAge: 1000 * expire, httpOnly: true })
}
