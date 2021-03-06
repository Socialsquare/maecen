import React, { Component, PropTypes } from 'react'
import Button from './Button'
import styleVariables from '../styleVariables'

import { isBrowser } from '../../config'

class FileDropzone extends Component {
  constructor (props) {
    super(props)
    let src = null
    let message = ''

    const mediaIsImage = props.media && props.media.type.match('image.*')

    // If we're given a single image, then let's display it.
    if(mediaIsImage) {
      src = props.media.url;
    } else if (props.media && props.media.filename) {
      message = props.media.filename;
    }

    this.state = {
      isDragActive: false,
      message,
      src
    }
    this.onClick = this.onClick.bind(this)
    this.onDrop = this.onDrop.bind(this)
    this.onDragOver = this.onDragOver.bind(this)
    this.onDragLeave = this.onDragLeave.bind(this)

    if(isBrowser) {
      this.reader = new window.FileReader()
      this.reader.onloadend = this.updateSrc.bind(this)
    }
  }

  onDragLeave (e) {
    this.setState({
      isDragActive: false
    })
  }

  onDragOver (e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'

    this.setState({
      isDragActive: true
    })
  }

  onDrop (e) {
    e.preventDefault()

    this.setState({
      isDragActive: false
    })

    let files
    if (e.dataTransfer) {
      files = e.dataTransfer.files
    } else if (e.target) {
      files = e.target.files
    }

    if (files.length === 0) {
      this.setState({ message: '', src: null })
    } else if (files.length === 1) {
      let newState = { message: files[0].name }

      // If we're not dealing with an image, let's remove the src.
      if(!this.checkForAndGenerateThumbnail(files[0])) {
        newState.src = ''
      }

      this.setState(newState)
    } else if (files.length > 1) {
      this.setState({ message: `${files.length} files picked`, src: null })
    }

    if (this.props.onChange) {
      this.props.onChange(files)
    }

  }

  onClick () {
    this.refs.fileInput.click()
  }

  checkForAndGenerateThumbnail(file) {
    if(this.reader && file.type.match('image.*')) {
      this.reader.readAsDataURL(file)
      return true
    }
    return false
  }

  updateSrc() {
    this.setState({src: this.reader.result})
  }

  render () {
    const label = this.props.label || 'Upload File'
    const { error, width, height } = this.props
    const { src } = this.state
    const size = this.dropzone ? this.dropzone.getBoundingClientRect() : null;
    const landscapeMode = size ? size.width > size.height : false

    const style = {
      dropZone: {
        cursor: 'pointer',
        display: 'inline-block',
        marginBottom: styleVariables.spacer.half,
        marginTop: styleVariables.spacer.base,
        width: width
      },
      error: {
        color: styleVariables.color.alert,
        fontSize: styleVariables.font.size.bodySmall,
        marginTop: styleVariables.spacer.half
      },
      input: {
        display: 'none'
      },
      buttonWrapper: {
        overflow: 'hidden',
        position: 'relative',
        padding: '1px 0 1px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      image: {
        width: landscapeMode ? '100%' : 'auto',
        height: landscapeMode ? 'auto' : '100%',
        position: 'absolute'
      },
      button: {
        border: '1px solid #e0e0e0',
        borderRadius: '3px',
        height: height,
        width: '100%',
      }
    }
    return (
      <div
        style={style.dropZone}
        onClick={this.onClick}
        onDragLeave={this.onDragLeave}
        onDragOver={this.onDragOver}
        onDrop={this.onDrop}
        ref={dropzone => this.dropzone = dropzone }
      >

        <input style={style.input}
          type='file'
          multiple={this.props.multiple}
          accept={this.props.accept}
          ref='fileInput'
          onChange={this.onDrop}
        />
        { this.props.children ||
          <div style={style.buttonWrapper}>
            { src &&
              <img src={src} style={ style.image } alt='Preview'/>
            }
            <Button label={src ? ' ' : label} flat={true} last style={style.button} />
          </div>
        }

        {error
          ? <div style={style.error}>
              {error}
            </div>
          : <span>
              {!src && this.state.message}
            </span>
        }
      </div>
    )
  }
}

FileDropzone.defaultProps = {
  multiple: true,
  height: '40px',
  width: 'auto'
}

FileDropzone.propTypes = {
  multiple: PropTypes.bool,
  label: PropTypes.string,
  error: PropTypes.string,
  accept: PropTypes.string,
  onChange: PropTypes.func,
  children: PropTypes.node,
  height: PropTypes.string,
  width: PropTypes.string,
  src: PropTypes.string
}

export default FileDropzone
