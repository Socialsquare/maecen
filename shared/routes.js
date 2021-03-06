import { Route, IndexRoute } from 'react-router'
import React from 'react'
import App from './container/App/App'

import HomeView from './container/HomeView'
import CreateMaecenateView from './container/Maecenate/CreateMaecenateView'
import EditMaecenateView from './container/Maecenate/EditMaecenateView'
import MaecenateOverviewView from './container/MaecenateOverviewView'
import MaecenateView from './container/MaecenateView'
import MaecenateSupportView from './container/MaecenateSupportView'
import TermsView from './container/TermsView'
import AboutView from './container/AboutView'

import CreatePostView from './container/Post/CreatePostView'
import EditPostView from './container/Post/EditPostView'

import MaecenateDashboardView from './container/MaecenateDashboardView'
import MyPageView from './container/MyPage/MyPageView'
import { apiURL } from '../shared/config'
import { isAuthorized, getAuthToken } from './selectors/user'
import request from './lib/request'

const requiresAuthFn = (store, nextState, replaceState, cb) => {
  const hasAuth = isAuthorized(store.getState())
  if (hasAuth === false) {
    replaceState('/')
    cb()
  } else {
    cb()
  }
}

const requiresMaecenateAdminFn = (store, nextState, replaceState, cb) => {
  const token = getAuthToken(store.getState())
  const slug = nextState.params.slug
  request(`${apiURL}/users/me/has-permission/maecenateAdmin/${slug}`, { token })
  .then(res => {
    cb()
  }).catch((err) => {
    console.log('error', err.stack)
    replaceState('/')
    cb()
  })
}

const getRoutes = (store) => {
  const connect = (fn) => (nextState, replaceState, cb) => (
    fn(store, nextState, replaceState, cb)
  )

  const requiresAuth = connect(requiresAuthFn)
  const requiresMaecenateAdmin = connect(requiresMaecenateAdminFn)

  return (
    <Route path='/' component={App}>
      <IndexRoute component={HomeView} />
      <Route path='profile'
        component={MyPageView}
        showLangSwitch={true}
        onEnter={requiresAuth}
      />
      <Route path='terms' component={TermsView} />
      <Route path='about' component={AboutView} />
      <Route path='post/create'
        component={CreatePostView}
        hideFab={true}
      />
      <Route path='maecenate/:slug/post/:postId/edit'
        component={EditPostView}
        hideFab={true}
        onEnter={requiresMaecenateAdmin}
      />

      <Route path='maecenates'
        component={MaecenateOverviewView}
      />
      <Route path='maecenate/create'
        component={CreateMaecenateView}
        hideFab={true}
        onEnter={requiresAuth}
      />
      <Route path='maecenate/:slug/edit'
        component={EditMaecenateView}
        hideFab={true}
        onEnter={requiresMaecenateAdmin}
      />

      <Route path='maecenate/:slug/dashboard'
        component={MaecenateDashboardView}
        onEnter={requiresMaecenateAdmin}
      />

      {/* User friendly maecenate urls */}
      <Route path=':slug'
        component={MaecenateView}
        noTitleOnPosts={true}
      />
      <Route path=':slug/presentation'
        component={MaecenateView}
        presentation={true}
      />
      <Route path=':slug/support'
        component={MaecenateSupportView}
      />
    </Route>
  )
}

export default getRoutes
