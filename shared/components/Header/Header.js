import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { translate } from 'react-i18next'
import {Grid} from 'react-flexbox-grid/lib'

import s from './Header.scss'
import Button from '../Form/Button'
import Icon from '../Graphics/Icon'

function Header (props, context) {
  const {
    hasAuth,
    t,
    loginAction,
    createMaecenateAction } = props

  return (
    <header className={s.main}>
      <Grid>
        <Link to='/'>
          <Icon size='4rem'
            viewBox='0 0 832 997'
            icon='maecen-detail'
          />
        </Link>
        <div className={s.rightmenu}>
          <Button
            label={t('mc.create')}
            primary={true}
            className={s.marginright}
            onClick={createMaecenateAction}
          />

          { hasAuth === false
            ? <Button label={t('login')} primary={true} onClick={loginAction} />
            : <Link to='/profile'><Button primary={true} label={t('profile')} /></Link>
          }
        </div>
      </Grid>
    </header>
  )
}

Header.propTypes = {
  hasAuth: PropTypes.bool.isRequired,
  loginAction: PropTypes.func.isRequired,
  createMaecenateAction: PropTypes.func.isRequired
}

export default translate(['common'])(
  Header
)
