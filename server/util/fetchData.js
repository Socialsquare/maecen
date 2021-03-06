/* This was inspired from https://github.com/caljrimmer/isomorphic-redux-app/blob/73e6e7d43ccd41e2eb557a70be79cebc494ee54b/src/common/api/fetchComponentDataBeforeRender.js */
import { sequence } from './promiseUtils'

export function fetchComponentData (store, components, params) {
  const needs = components.reduce((prev, current) => {
    return (current.need || [])
      .concat((current.WrappedComponent &&
        (current.WrappedComponent.need !== current.need)
        ? current.WrappedComponent.need : []) || [])
      .concat(prev)
  }, [])

  return sequence(needs, need => store.dispatch(need(params, store.getState())))
}

export function getToken (req) {
  if (req.cookies.id_token) {
    return req.cookies.id_token
  } else if (req.headers.authorization) {
    return req.headers.authorization.replace(/^Token /, '')
  } else if (req.query.token) {
    return req.query.token
  }
  return null
}
