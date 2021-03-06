// Imports
import React, { Component, PropTypes } from 'react'
import { translate } from 'react-i18next'

// Components
import { Row, Cell } from '../components/Grid'
import { Card, CardContent } from '../components/Card'

// Services
import { fetchStaticContent } from '../lib/staticContent'

class AboutView extends Component {

  constructor (props) {
    super(props)
    this.state = { content: null }
  }

  componentDidMount () {
    const lang = this.context.i18n.language
    fetchStaticContent(lang, 'aboutMaecen')
    .then((content) => {
      this.setState({ content })
    })
  }

  render () {
    return (
      <Row>
        <Cell narrowLayout={true}>
          <Card>
            <CardContent>
              <div dangerouslySetInnerHTML={{__html: this.state.content}} />
            </CardContent>
          </Card>
        </Cell>
      </Row>
    )
  }
}

AboutView.contextTypes = {
  i18n: PropTypes.object.isRequired
}

export default translate()(
  AboutView
)
