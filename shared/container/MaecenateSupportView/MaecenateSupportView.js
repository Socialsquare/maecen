import React from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import axios from 'axios'
import { browserHistory } from 'react-router'

import * as Actions from '../../actions/actions'
import {
  isAuthorized, getAuthUser
} from '../../selectors/User.selectors'
import {
  getMaecenateBySlug
} from '../../selectors/Maecenate.selectors'

import ContentWrapper from '../../components/ContentWrapper/ContentWrapper'
import Card from '../../components/Card'
import { Button, TextField } from '../../components/Form'

class MaecenateSupportView extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.gotoContent = this.gotoContent.bind(this)

    this.state = {
      amount: '',
      amountError: null,
      errors: {},
      success: false
    }
  }

  componentDidMount () {
    const { dispatch, params } = this.props
    dispatch(this.constructor.need[0](params))
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.hasAuth !== nextProps.hasAuth) {
      this.setState({ amountError: null })
    }
  }

  gotoContent () {
    const { slug } = this.props.maecenate
    browserHistory.push(`/maecenate/${slug}/content`)
  }

  handleChange (e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit (e) {
    e.preventDefault()
    const { dispatch, maecenate, hasAuth } = this.props

    if (this.state.amount < 5) {
      this.setState({ amountError: 'The minimum amount is 5 dkk' })
      return
    }

    if (hasAuth === true) {
      axios.post('/api/supportMaecenate', {
        maecenateId: maecenate.id,
        amount: Math.round(Number(this.state.amount))
      }).then(res => {
        return res.data
      }).then(data => {
        dispatch(Actions.updateEntities(data.entities))
        this.setState({ success: true })
      }, res => {
        this.setState({ errors: res.data.errors })
      })
    } else {
      dispatch(Actions.requireAuth())
    }
  }

  render () {
    const { maecenate, hasAuth } = this.props
    const continueLabel = hasAuth ? 'Continue to Payment' : 'Continue'

    return (
      <ContentWrapper>
        <Card>
          <h2>{`Become a ${maecenate.title} maecen`}</h2>

          {this.state.success &&
            <div>
              Success!
              <Button label='To content' onClick={this.gotoContent} />
            </div>
          }

          {Object.keys(this.state.errors).length > 0 &&
            <div>
              {this.state.errors._}
            </div>
          }

          {!this.state.success &&
            <div>
              How much would you support with?
              <TextField
                value={this.state.amount}
                name='amount'
                onChange={this.handleChange}
                label='Value in DKK'
                error={this.state.amountError}
              />

              <Button label={continueLabel}
                onClick={this.handleSubmit}
                secondary={true} />
            </div>
          }
        </Card>
      </ContentWrapper>
    )
  }
}

MaecenateSupportView.need = [(params) => {
  return Actions.fetchMaecenate(params.slug)
}]

function mapStateToProps (state, props) {
  return {
    hasAuth: isAuthorized(state),
    user: getAuthUser(state),
    maecenate: getMaecenateBySlug(state, props)
  }
}

export default connect(mapStateToProps)(
  translate(['common'])(MaecenateSupportView)
)