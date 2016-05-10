import React, { Component } from 'react'
import HeaderContainer from './HeaderContainer'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'

class HomeContainer extends Component {
  render () {
    const { t } = this.props

    return (
      <div>
        <HeaderContainer />
        <div className='container'>
          Maecen <br />
          {t('tagline')}
          <Link to='/maecenates'>{t('maecenate.seeAll')}</Link>
        </div>
      </div>
    )
  }
}

HomeContainer.need = []
HomeContainer.contextTypes = {
  router: React.PropTypes.object
}

function mapStateToProps (store) {
  return { }
}

export default translate(['common'])(
  connect(mapStateToProps)(HomeContainer)
)

