import React from 'react'

let Icons = React.createClass({
  propTypes: {
    icon: React.PropTypes.string.isRequired,
    size: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    style: React.PropTypes.object
  },
  getDefaultProps () {
    return {
      size: 24,
      viewBox: '0 0 24 24'
    }
  },
  _mergeStyles (...args) {
    // This is the m function from 'CSS in JS' and can be extracted to a mixin
    return Object.assign({}, ...args)
  },
  renderGraphic () {
    switch (this.props.icon) {
      case 'maecen-m-only':
        return (
          <path d='M0 124c0-3 2-3 5-3 45 0 112 97 139 138 65 99 156 333 223 333 55 0 176-262 212-326C622 190 733 0 821 0c7 0 11 4 11 12 0 33-57 109-89 150 4 98 10 201 22 291 8 60 26 105 26 167 0 28-17 67-44 67-21 0-31-33-37-55-16-63-23-146-23-224 0-57 13-130 14-186-60 88-124 248-196 350-28 40-73 94-125 94-79 0-157-155-215-270-8 86 11 171-34 251-8 17-26 28-45 27-16 0-39-6-39-22 0-44 43-79 65-318 1-11 0-17 4-25C84 220 0 145 0 124z'/> // eslint-disable-line max-len
        )
      case 'maecen-detail':
        return (
          <path d='M506 906c-3 0-4 0-4-3 0-5 5-28 5-46 0-9-2-16-6-16-15 0-25 57-25 78 0 20 5 34 23 34 34 0 55-62 60-74 8-37 26-69 46-69 25 0 41 33 41 55 0 29-35 34-57 36l-2 29c0 21 4 41 20 41 32 0 72-98 74-112 2-13 14-19 24-19 8 0 14 3 14 10 0 9-10 41-10 63l2 19c6-27 15-44 24-57 5-7 16-10 25-10 6 0 10 2 10 7 0 3-5 13-5 45 0 13 1 24 7 24 13 0 33-38 39-56 1-4 3-6 6-6s6 2 6 6c0 10-31 76-55 76-38 0-26-49-31-60-11 1-20 39-23 59-1 7-10 11-18 11s-15-4-15-12l-1-51c-15 37-41 82-81 82-29 0-43-29-44-66-13 24-34 48-65 48-29 0-42-21-45-47-15 31-41 65-77 65-16 0-27-9-34-23-5 5-10 8-16 8-15 0-25-13-30-25-7 21-17 47-43 47s-41-37-42-70c-12 24-26 46-46 46-14 0-20-18-20-40 0-25 5-53 8-61l-5 3c-9 6-31 56-35 70-2 5-12 16-19 16s-7-25-7-50l-1-17c-13 4-24 56-26 72-1 9-11 14-19 14s-14-4-14-14c0-25-3-58-3-89 0-24 2-35 9-43 8-10 16-13 24-13 4 0 8 1 8 7 0 4-11 61-11 86l1 23c5-28 19-58 30-74 4-6 15-11 23-11 5 0 9 2 9 8 0 7-4 14-6 53 10-26 31-61 40-74 4-6 14-12 23-12 7 0 12 4 12 13 0 8-13 68-13 99 0 8 1 13 4 13 13 0 34-54 41-78 7-26 26-44 48-44 17 0 24 10 31 22 4-5 10-7 15-7 7 0 13 4 13 14 0 8-6 35-6 67 0 11 1 29 6 29s6-12 6-19c0-56 20-126 52-126 25 0 41 33 41 55 0 27-35 34-57 36-1 10-3 19-3 29 0 21 4 41 21 41 27 0 66-75 73-96 9-28 25-50 44-50 23 0 35 20 35 48 0 21-12 33-23 33zm-222-8c0-16-2-41-18-41-21 0-34 44-34 79 0 22 5 43 19 43 19 0 33-45 33-81zm337-43c0-8-1-26-8-26-10 0-18 32-21 49 17 0 29-4 29-23zm-230 0c0-8-2-26-9-26-10 0-16 32-20 49 17 0 29-3 29-23zM0 124c0-3 2-3 5-3 45 0 112 97 139 138 65 99 156 333 223 333 55 0 176-262 212-326C622 190 733 0 821 0c7 0 11 4 11 12 0 33-57 109-89 150 4 98 10 201 22 291 8 60 26 105 26 167 0 28-17 67-44 67-21 0-31-33-37-55-16-63-23-146-23-224 0-57 13-130 14-186-60 88-124 248-196 350-28 40-73 94-125 94-79 0-157-155-215-270-8 86 11 171-34 251a48 48 0 0 1-45 27c-16 0-39-6-39-22 0-44 43-79 65-318 1-11 0-17 4-25C84 220 0 145 0 124z' /> // eslint-disable-line max-len
        )
    }
  },
  render () {
    let styles = {
      fill: 'currentcolor',
      width: this.props.size, // CSS instead of the width attr to support non-pixel units
      height: this.props.size // Prevents scaling issue in IE
    }
    return (
      <svg viewBox={this.props.viewBox}
        preserveAspectRatio='xMidYMid meet'
        style={this._mergeStyles(
          styles,
          this.props.style // This lets the parent pass custom styles
        )}>
          {this.renderGraphic()}
      </svg>
    )
  }
})

export default Icons
