import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import sumBy from 'lodash/sumBy'

import * as Actions from '../../actions'
import { getMaecenateBySlug } from '../../selectors/maecenate'
import { getSupportingUsers } from '../../selectors/user'

import { Card, CardHeader, CardContent } from '../../components/Card'
import { List, ListItem } from 'material-ui/List'
import Button from '../../components/Form/Button'
import Subheader from 'material-ui/Subheader'
import Divider from 'material-ui/Divider'
import cropCloudy from '../../lib/cropCloudy'

class MaecenateDashboardView extends Component {

  componentDidMount () {
    const { dispatch, params } = this.props
    dispatch(this.constructor.need[0](params))
    dispatch(this.constructor.need[1](params))
  }

  gotoMaecenatePresentation (slug, e) {
    browserHistory.push(`/maecenate/${slug}/presentation`)
    event.stop
  }

  linkToParent (slug) {
    // Have to check - otherwise it fails when refreshing the page
    let canUseDOM = !!(
      (typeof window !== 'undefined' &&
      window.document && window.document.createElement)
    )
    if (canUseDOM) {
      let rootDir = window.location.hostname
      let maecenatesDir = '/maecenate/'
      return rootDir + maecenatesDir + slug
    }
  }

  render () {
    const { users, maecenate, t } = this.props

    const totalAmount = sumBy(users, o => o.support.amount)
    const totalString = t('maecenate.totalAmount', { total: totalAmount })

    return (
      <Card>
        <CardHeader
          title={maecenate.title}
          subtitle={t('maecenate.dashboard')}
          avatar={maecenate.logo && cropCloudy(maecenate.logo.url, 'logo-tiny')}
        />

        <CardContent>
          <Button
            label={t('maecenate.viewPresentation')}
            primary={true}
            onClick={this.gotoMaecenatePresentation.bind(this, maecenate.slug)}
          />
          <br />
          <p>
            {t('maecenate.linkToPresentation')}
            <br />
            {this.linkToParent(maecenate.slug)}
          </p>
        </CardContent>
        <Divider />
        <List>
          <Subheader>{t('user.yourMaecenes')}</Subheader>
          {
            users.map(user => (
              <ListItem key={user.id}>
                {user.first_name} {user.support.amount}
              </ListItem>
            ))
          }
          { users.length > 0
            ? <ListItem
                key='total'
                primaryText={totalString} />
            : <ListItem
              primaryText={t('user.yourNoMaecenes')} />
          }
        </List>
      </Card>
    )
  }
}

MaecenateDashboardView.need = [(params) => {
  return Actions.fetchMaecenate(params.slug)
}, (params) => {
  return Actions.fetchMaecenateSupporter(params.slug)
}]

function mapStateToProps (state, props) {
  const getUsers = getSupportingUsers(getMaecenateBySlug)
  return {
    maecenate: getMaecenateBySlug(state, props),
    users: getUsers(state, props)
  }
}

export default translate(['common'])(
 connect(mapStateToProps)(MaecenateDashboardView)
)
