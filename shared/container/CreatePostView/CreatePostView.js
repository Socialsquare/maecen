import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import axios from 'axios'
import Immutable from 'seamless-immutable'
import ContentWrapper from '../../components/ContentWrapper/ContentWrapper'
import * as Actions from '../../actions/actions'

import { getMaecenateBySlug } from '../../selectors/maecenate.selectors'
import { getAuthUser } from '../../selectors/user.selectors'
import { Card, CardContent, CardTitle, CardActions } from '../../components/Card'
import Form from '../../components/Form/Form'
import TextField from '../../components/Form/TextField'
import Button from '../../components/Form/Button'

class CreatePostView extends Component {

  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.updateModel = this.updateModel.bind(this)
    this.state = {
      post: Immutable({ }),
      errors: null,
      isSubmitting: false
    }
  }

  componentDidMount () {
    const { dispatch, params } = this.props
    dispatch(this.constructor.need[0](params))
    this.setAuthorAlias(this.props)
  }

  updateModel (path, value) {
    this.setState({ post: this.state.post.setIn(path, value) })
  }

  setAuthorAlias (props) {
    // We set the author_alias if it's not set but the user has a default
    if (!this.state.author_alias) {
      this.setState({
        post: this.state.post.set('author_alias', getDefaultAlias(props))
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setAuthorAlias(nextProps)
  }

  handleSubmit (e) {
    e.preventDefault()
    const { dispatch, maecenate } = this.props
    const { post: data } = this.state

    const post = data.set('maecenate', maecenate.id)

    this.setState({ isSubmitting: true })

    axios.post('/api/createPost', { post })
      .then(res => res.data)
      .then((data) => {
        this.setState({ errors: null, isSubmitting: false })
        dispatch(Actions.createMaecenatePostSuccess(data))
        setDefaultAlias(this.props, post.author_alias)
        browserHistory.push(`/maecenate/${maecenate.slug}/content`)
      }).catch((res) => {
        this.setState({ errors: null })
        this.setState({ errors: res.data.errors, isSubmitting: false })
      })
  }

  render () {
    const { maecenate } = this.props
    const { post } = this.state

    return (
      <ContentWrapper>
        {maecenate
          ? <Card>
              <CardTitle title='Create new post' />
              <Form onSubmit={this.handleSubmit} model={post}
                updateModel={this.updateModel} errors={this.state.errors}>
                <CardContent>

                    <TextField
                      path={['title']}
                      placeholder='Post title' />

                    <TextField
                      path={['content']}
                      placeholder='Post content'
                      multiLine={true}
                      rows={2} />

                    <TextField
                      path={['author_alias']}
                      placeholder='Alias'
                      fullWidth={false} />

                </CardContent>
                <CardActions>
                  <Button
                    type='submit'
                    label='Create Post'
                    primary={true}
                    disabled={this.state.isSubmitting === true} />
                </CardActions>
              </Form>
            </Card>
          : <div>Loading...</div>
        }
      </ContentWrapper>
    )
  }
}

CreatePostView.need = [(params) => {
  return Actions.fetchMaecenate(params.slug)
}]

function getDefaultAlias (props) {
  const { authUser, maecenate: { id } } = props
  let alias = null
  if (window && window.localStorage) {
    alias = window.localStorage.getItem(`alias-for-${id}`, alias)
  }

  if (!alias && authUser && authUser.alias) {
    alias = authUser.alias
  }

  return alias
}

function setDefaultAlias (props, alias) {
  const { maecenate: { id } } = props
  if (window && window.localStorage) {
    window.localStorage.setItem(`alias-for-${id}`, alias)
  }
}

function mapStateToProps (state, props) {
  return {
    maecenate: getMaecenateBySlug(state, props),
    authUser: getAuthUser(state, props)
  }
}

export default connect(mapStateToProps)(CreatePostView)
