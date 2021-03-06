import React, { PropTypes } from 'react'
import { startsWith } from 'strman'
import cropCloudy from '../../lib/cropCloudy'
import styleVariables from '../styleVariables'

const style = {
  cover: {
    position: 'relative',
    paddingBottom: '56.25%',
    height: '0px',
    lineHeight: '0px',
    overflow: 'hidden',
    marginBottom: styleVariables.spacer.quart
  },
  coverMedia: {
    height: '100%',
    left: '0px',
    position: 'absolute',
    top: '0px',
    width: '100%'
  },
  mediaDefault: {
    maxWidth: '100%',
    display: 'block',
    maxHeight: '90vh'
  },
  video: {
    backgroundColor: 'black'
  }
}

export default function Media (props, context) {
  if (props.fixedRatio) {
    return (
      <div style={style.cover}>
        {props.url && startsWith(props.type, 'video')
          ? <video
              style={{...style.coverMedia, ...style.video}}
              src={cropCloudy(props.url, 'video')}
            controls />
          : <img
              style={style.coverMedia}
              src={cropCloudy(props.url, 'cover')}
            />
        }
      </div>
    )
  } else {
    return (
      startsWith(props.type, 'video')
        ? <video src={cropCloudy(props.url, 'video')} controls
          style={{...style.mediaDefault, ...style.video}}/>
        : <img src={cropCloudy(props.url, 'post')}
          style={style.mediaDefault} />
    )
  }
}

Media.propTypes = {
  url: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  fixedRatio: PropTypes.bool
}

Media.defaultProps = {
  fixedRatio: false
}
