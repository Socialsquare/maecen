// Imports
import React, { Component } from 'react'
import { translate } from 'react-i18next'
import { connect } from 'react-redux'
import axios from 'axios'
import { browserHistory } from 'react-router'

import EpayWindow from '../lib/EpayWindow'
import * as Epay from '../lib/epay'
import styleVariables from '../components/styleVariables'

// Actions
import * as Actions from '../actions'

// Selectors
import {
  isAuthorized,
  getAuthUser,
  hasSavedPaymentCard
} from '../selectors/user'
import { getMaecenateBySlug } from '../selectors/maecenate'
import { isAuthUserMaecenateSupporter } from '../selectors/support'

// Components
import HappyIcon from 'material-ui/svg-icons/social/mood'
import Checkbox from 'material-ui/Checkbox'
import { TextLink } from '../components/Link'
import { Table, TableBody, TableRow, TableRowColumn } from '../components/Table'
import Card, { CardContent, CardError, CardTitle } from '../components/Card'
import { Button, TextField } from '../components/Form'
import { Row, Cell } from '../components/Grid'
import ChangeCreditCardDialog from '../components/Dialog/ChangeCreditCardDialog'

class MaecenateSupportView extends Component {
  constructor (props) {
    super(props)

    this.state = {
      amount: '',
      amountError: null,
      feeAmount: '',
      totalAmount: '',
      errors: {},
      success: false,
      display: 'amount', // amount | confirm
      paymentWindowReady: false,
      isSubmitting: false,
      isChangeCreditCardDialogOpen: false,
      acceptedTerms: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.gotoContent = this.gotoContent.bind(this)
    this.paymentComplete = this.paymentComplete.bind(this)
    this.triggerAcceptTerms = this.triggerAcceptTerms.bind(this)
    this.openChangeCreditCardDialog = this.openChangeCreditCardDialog.bind(this)
    this.closeChangeCreditCardDialog = this.closeChangeCreditCardDialog.bind(this)
    this.supportNewCard = this.supportNewCard.bind(this)
  }

  componentDidMount () {
    const { dispatch, params } = this.props
    dispatch(this.constructor.need[0](params))
    dispatch(this.constructor.need[1](params))

    this.paymentWindow = new EpayWindow()
    this.paymentWindow.onReady = () =>
      this.setState({ paymentWindowReady: true })
    this.paymentWindow.load()
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.hasAuth !== nextProps.hasAuth) {
      this.setState({ amountError: null })
    }
  }

  openChangeCreditCardDialog () {
    this.setState({ isChangeCreditCardDialogOpen: true })
  }

  closeChangeCreditCardDialog () {
    this.setState({ isChangeCreditCardDialogOpen: false })
  }

  triggerAcceptTerms (e, isChecked) {
    this.setState({ acceptedTerms: isChecked })
  }

  isValid () {
    if (this.state.acceptedTerms &&
    this.state.amount >= this.props.maecenate.monthly_minimum) {
      return true
    } else {
      return false
    }
  }

  paymentComplete () {
    return this.props.dispatch(Actions.fetchMaecenate(this.props.params.slug))
  }

  gotoContent () {
    const { slug } = this.props.maecenate
    browserHistory.push(`/${slug}`)
  }

  handleChange (e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  supportNewCard () {
    this.setupSubscription(true)
    this.closeChangeCreditCardDialog()
  }

  handleSubmit (e) {
    e.preventDefault()
    this.setupSubscription(false)
  }

  setupSubscription (setupNewCard) {
    const { dispatch, maecenate, hasAuth, hasSavedPaymentCard, t } = this.props
    const { display } = this.state

    if (!this.isValid()) {
      return
    }

    if (hasSavedPaymentCard && display === 'amount') {
      // We need to prive amount in cents
      const centAmount = this.state.amount * 100
      const { user } = this.props
      const fee = Epay.calculateFee(user.payment_card_issuer, centAmount)
      this.setState({
        display: 'confirm',
        feeAmount: fee,
        totalAmount: fee + centAmount
      })
      return
    }

    if (this.state.amount < maecenate.monthly_minimum) {
      this.setState({
        amountError: t('support.belowMin')
      })
      return
    }

    if (hasAuth === true) {
      this.setState({isSubmitting: true})
      axios.post('/api/maecenates/initiate-payment', {
        maecenateId: maecenate.id,
        amount: Math.round(Number(this.state.amount)) * 100,
        setupNewCard
      }).then(res => {
        this.setState({ errors: {} })
        return res.data
      }).then((data) => {
        if (data.paymentComplete === true) {
          return this.paymentComplete()
        } else {
          return this.paymentWindow.open(data.epayPaymentParams)
            .then(() => this.paymentComplete())
        }
      }).catch(err => {
        if (err.data && err.data.errors) {
          this.setState({ errors: err.data.errors })
        } else {
          console.error(err)
        }
      }).then(() => {
        this.setState({isSubmitting: false})
      })
    } else {
      dispatch(Actions.requireAuth())
    }
  }

  render () {
    const { isSupporter } = this.props

    return (isSupporter
      ? this.renderSuccess()
      : this.renderPayment()
    )
  }

  renderPayment () {
    const { maecenate, hasAuth, t, user } = this.props
    const { totalAmount, feeAmount, amount } = this.state
    const continueLabel = hasAuth
      ? t('support.continueToPayment')
      : t('action.continue')
    const cardTitle = this.state.display === 'amount'
      ? t('support.joinMaecenate', { title: maecenate.title })
      : t('support.confirmSupport')

    const disableSubmit = !this.state.paymentWindowReady ||
      this.state.isSubmitting || !this.isValid()

    return (
      <Row>
        <ChangeCreditCardDialog
          open={this.state.isChangeCreditCardDialogOpen}
          onAccept={this.supportNewCard}
          onCancel={this.closeChangeCreditCardDialog}
        >
          {t('support.changeCardHelpText')}
        </ChangeCreditCardDialog>

        <Cell narrowerLayout={true}>
          <Card>
            <CardTitle
              title={cardTitle}
            />
            {Object.keys(this.state.errors).length > 0 &&
              <CardError>
                {this.state.errors._}
              </CardError>
            }

            {this.state.display === 'amount' &&
              <CardContent>
                {t('support.subscriptionExplanation')}
                <form
                  onSubmit={this.handleSubmit}>
                  <TextField
                    value={this.state.amount}
                    name='amount'
                    onChange={this.handleChange}
                    label={t('support.howMuch')}
                    placeholder={t('support.minimumAmount', {
                      context: 'DKK',
                      count: maecenate.monthly_minimum
                    })}
                    type='number'
                    min={maecenate.monthly_minimum}
                    floatingLabelFixed={true}
                    floatingLabelStyle={style.fixedLabel}
                    autoComplete='off'
                    error={this.state.amountError}
                  />
                  <Row style={style.acceptTermsCheck}>
                    <Cell sm={1}>
                      <Checkbox onCheck={this.triggerAcceptTerms} />
                    </Cell>
                    <Cell sm={9} style={style.acceptTermsLabel}>
                      <TextLink to='/terms' target='_blank' style={style.termsLink}>
                        {t('support.acceptTerms')}
                      </TextLink>
                    </Cell>
                  </Row>
                  <div style={style.amountButton}>
                    <Button label={continueLabel}
                      type='submit'
                      secondary={true}
                      last={true}
                      disabled={disableSubmit}
                    />
                  </div>
                </form>
                <div id='payment-holder' />
              </CardContent>
            }

            {this.state.display === 'confirm' &&
              <CardContent>
                <Table selectable={false}>
                  <TableBody displayRowCheckbox={false}>
                    <TableRow>
                      <TableRowColumn>
                        {t('maecenateName')}
                      </TableRowColumn>
                      <TableRowColumn>
                        {maecenate.title}
                      </TableRowColumn>
                    </TableRow>
                    <TableRow>
                      <TableRowColumn>
                        {t('support.monthlySupport')}
                      </TableRowColumn>
                      <TableRowColumn>
                        {t('currency.amount', {count: Number(amount), context: 'DKK'})}
                      </TableRowColumn>
                    </TableRow>
                    <TableRow>
                      <TableRowColumn>
                        {t('support.monthlyFee')}
                      </TableRowColumn>
                      <TableRowColumn>
                        {t('currency.amount', {count: feeAmount / 100, context: 'DKK'})}
                      </TableRowColumn>
                    </TableRow>
                    <TableRow>
                      <TableRowColumn style={{ fontWeight: 'bold' }}>
                        {t('support.monthlyTotal')}
                      </TableRowColumn>
                      <TableRowColumn>
                        {t('currency.amount', {count: totalAmount / 100, context: 'DKK'})}
                      </TableRowColumn>
                    </TableRow>
                    <TableRow>
                      <TableRowColumn>
                        {t('creditCard')}
                      </TableRowColumn>
                      <TableRowColumn>
                        {user.payment_card}
                      </TableRowColumn>
                    </TableRow>
                  </TableBody>
                </Table>
                <div style={style.amountButton}>
                  <Button label={t('support.confirmSupportNewCard')}
                    flat={true}
                    primary={true}
                    disabled={disableSubmit}
                    onClick={this.openChangeCreditCardDialog}
                  />
                  <Button label={t('support.confirmSupport')}
                    type='submit'
                    secondary={true}
                    last={true}
                    onClick={this.handleSubmit}
                    disabled={disableSubmit} />
                </div>
              </CardContent>
            }
          </Card>
        </Cell>
      </Row>
    )
  }

  renderSuccess () {
    const { maecenate, t } = this.props

    return (
      <Card style={style.card}>
        <div>
          <HappyIcon
            style={style.smiley}
            color={styleVariables.color.gray}
          />
        </div>
        <CardTitle
          title={t('support.congratulations')}
          subtitle={t('support.success', { title: maecenate.title })}
        />
        <CardContent style={style.content}>
          <Button
            primary={true}
            label={t('maecenate.seeWithContent', { title: maecenate.title })}
            onClick={this.gotoContent}
          />
        </CardContent>
      </Card>
    )
  }
}

const spacer = styleVariables.spacer
const style = {
  card: {
    textAlign: 'center',
    display: 'inline-block',
    margin: '0 auto',
    alignSelf: 'flex-start'
  },
  smiley: {
    width: '100px',
    height: '100px',
    paddingTop: spacer.base
  },
  content: {
    padding: `0 ${spacer.double} ${spacer.base}`
  },
  amountButton: {
    textAlign: 'right',
    marginTop: spacer.base
  },
  amountTextField: {
    marginTop: `-${spacer.base}`
  },
  fixedLabel: {
    color: styleVariables.color.cardText
  },
  acceptTermsCheck: {
    marginTop: '12px'
  },
  acceptTermsLabel: {
    marginTop: '-2px'
  },
  termsLink: {
    textDecoration: 'underline'
  },
  editCardButton: {
    float: 'right',
    lineHeight: '20px',
    height: '20px',
    minWidth: 'auto',
    marginRight: `-${spacer.half}`,
    marginTop: '-2px'
  }
}

MaecenateSupportView.need = [(params) => {
  return Actions.fetchMaecenate(params.slug)
}, (params) => {
  return Actions.fetchAuthUser()
}]

function mapStateToProps (state, props) {
  const isSupporter = isAuthUserMaecenateSupporter(getMaecenateBySlug)
  const userHasSavedPaymentCard = hasSavedPaymentCard(getAuthUser)

  return {
    hasAuth: isAuthorized(state),
    user: getAuthUser(state),
    maecenate: getMaecenateBySlug(state, props),
    isSupporter: isSupporter(state, props),
    hasSavedPaymentCard: userHasSavedPaymentCard(state, props)
  }
}

export default connect(mapStateToProps)(
  translate(['common'])(MaecenateSupportView)
)
