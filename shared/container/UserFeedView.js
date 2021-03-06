// Imports
import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

// Actions & Selectors
import { getPosts } from '../selectors/post'
import * as Actions from '../actions'

// Components
import Link from '../components/Link'
import Button from '../components/Form/Button'
import Post from '../components/Post/Post'
import styleVariables from '../components/styleVariables'
import SearchIcon from 'material-ui/svg-icons/action/search'

class UserFeedView extends Component {
  componentDidMount () {
    const { dispatch } = this.props
    dispatch(Actions.fetchUserFeed())
  }

  gotoAllMaecenates () {
    browserHistory.push('/maecenates')
  }

  render () {
    const { posts, t } = this.props

    return (
      <div style={style.container}>
        <h1 style={style.h1}>{t('feed.yourNews')}</h1>
        { posts.length !== 0
          ? posts.map(post =>
              <Post
                key={post.id}
                post={post}
                maecenate={post.maecenate}
              />
            )
          : <div>
              <div style={style.getStarted}>{t('feed.getStarted')}</div>
              <Link to='/maecenate/create'>
                <Button
                  label={t('maecenate.create')}
                  primary={true}
                />
              </Link>
            </div>
          }
      </div>
    )
  }
}

const style = {
  container: {
    width: '100%'
  },
  h1: {
    fontSize: styleVariables.font.size.h1Big,
    marginTop: '0'
  },
  getStarted: {
    color: styleVariables.color.bodyText,
    lineHeight: styleVariables.font.lineHeight.body,
    marginBottom: styleVariables.spacer.base,
    verticalAlign: 'middle'
  },
  findMaecenate: {
    color: styleVariables.color.bodyText,
    lineHeight: styleVariables.font.lineHeight.body,
    verticalAlign: 'top',
    marginTop: styleVariables.spacer.base,
    display: 'inline-block'
  },
  icon: {
    width: styleVariables.icon.size.xl,
    height: styleVariables.icon.size.xl
  }
}

function mapStateToProps (state, props) {
  return {
    posts: getPosts(state, props)
  }
}

export default translate(['common'])(
  connect(mapStateToProps)(UserFeedView)
)
