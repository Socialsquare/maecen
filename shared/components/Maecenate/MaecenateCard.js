import React, { PropTypes } from 'react'

import styleVariables from '../styleVariables'
import { Card, CardContent, CardBigTitle } from '../Card'
import Media from '../Media/Media'

function MaecenateCard (props, context) {
  const {
    title, logo, cover, teaser
  } = props.maecenate

  if (!logo || !cover) return null

  return (
    <Card style={style.card}>
      <CardContent>
        <Media type={cover.type} url={cover.url} fixedRatio={true} />
      </CardContent>
      <CardBigTitle style={style.title}>{title}</CardBigTitle>
      <CardContent style={style.description}>
        {teaser}
      </CardContent>
    </Card>
  )
}

const descriptionLineCount = 3
const descriptionHeight =
  styleVariables.font.lineHeight.body * descriptionLineCount - 0.2 + 'em'
const { spacer, color, border } = styleVariables
const style = {
  avatar: {
    marginTop: spacer.base,
    marginBottom: spacer.base,
    marginLeft: spacer.base,
    marginRight: '0px'
  },
  card: {
    boxShadow: 'none',
    cursor: 'pointer',
    marginBottom: spacer.base,
    paddingBottom: spacer.base,
    borderRadius: border.radius
  },
  description: {
    height: descriptionHeight,
    display: 'block',
    overflow: 'hidden',
    padding: '0px',
    marginTop: spacer.base,
    marginRight: spacer.base,
    marginLeft: spacer.base,
    marginBottom: '0px'
  },
  title: {
    margin: `0 ${spacer.base}`,
    textAlign: 'center',
    borderTop: `${border.thickness} solid ${color.background}`,
    borderBottom: `${border.thickness} solid ${color.background}`,
    padding: `${spacer.quart} 0`
  }
}

MaecenateCard.propTypes = {
  maecenate: PropTypes.shape({
    title: PropTypes.string,
    logo: PropTypes.object,
    cover: PropTypes.object
  }).isRequired
}

export default MaecenateCard
