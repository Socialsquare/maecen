import Immutable from 'seamless-immutable'
import * as ActionTypes from '../constants/constants'

const app = (state = Immutable({
  authUser: null,
  maecenate: null,
  maecenates: [],
  requireAuthorization: false
}), action) => {
  switch (action.type) {
    case ActionTypes.SET_AUTH_USER:
      return state.merge({
        'authUser': action.id,
        'requireAuthorization': false
      })
    case ActionTypes.CLEAR_AUTH_USER:
      return state.set('authUser', null)
    case ActionTypes.SET_MAECENATE:
      return state.set('maecenate', action.id)
    case ActionTypes.SET_MAECENATE_LIST:
      return state.set('maecenates', action.ids)
    case ActionTypes.REQUIRE_AUTHORIZATION:
      const val = action.url ? action.url : true
      return state.set('requireAuthorization', val)
    case ActionTypes.CANCEL_REQUIRE_AUTHORIZATION:
      return state.set('requireAuthorization', false)
    default:
      return state
  }
}

const entities = (state = Immutable({
  users: {}
}), action) => {
  if (action.entities) {
    return state.merge(action.entities, {deep: true})
  }

  return state
}

/*

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.ADD_POST :
      return {
        posts: [{
          name: action.name,
          title: action.title,
          content: action.content,
          slug: action.slug,
          cuid: action.cuid,
          _id: action._id,
        }, ...state.posts],
        post: state.post };

    case ActionTypes.CHANGE_SELECTED_POST :
      return {
        posts: state.posts,
        post: action.slug,
      };

    case ActionTypes.ADD_POSTS :
      return {
        posts: action.posts,
        post: state.post,
      };

    case ActionTypes.ADD_SELECTED_POST :
      return {
        post: action.post,
        posts: state.posts,
      };

    case ActionTypes.DELETE_POST :
      return {
        posts: state.posts.filter((post) => post._id !== action.post._id),
      };

    default:
      return state;
  }
};

*/

export { app }
export { entities }
