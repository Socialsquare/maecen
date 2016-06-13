import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { translate } from 'react-i18next'

import s from './Header.scss'
import Button from '../Form/Button'
import Icon from '../Graphics/Icon'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'

function Header (props, context) {
  const {
    hasAuth,
    t,
    loginAction
  } = props

  return (
    <header className={s.main}>
      <Link to='/'>
        <Icon size='3rem'
          viewBox='0 0 832 687'
          icon='maecen-m-only'
        />
      </Link>
      <div className={s.rightmenu}>

        { hasAuth === false
          ? <Button label={t('login')} primary={true} last={true} onClick={loginAction} />
          : <Link to='/profile'><Button primary={true} last={true} label={t('profile')} /></Link>
        }
      </div>
      <div className={s.fabWrap}>
        <FloatingActionButton
          className={s.fab}
          style={{backgroundColor: 'transparent'}}
        >
          <ContentAdd />
        </FloatingActionButton>
      </div>
    </header>
  )
}

Header.propTypes = {
  hasAuth: PropTypes.bool.isRequired,
  loginAction: PropTypes.func.isRequired
}

export default translate(['common'])(
  Header
)
