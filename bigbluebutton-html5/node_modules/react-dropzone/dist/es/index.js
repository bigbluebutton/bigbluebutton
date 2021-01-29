var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint prefer-template: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import { isDragDataWithFiles, supportMultiple, fileAccepted, allFilesAccepted, fileMatchSize, onDocumentDragOver, getDataTransferItems as defaultGetDataTransferItem, isIeOrEdge } from './utils';
import styles from './utils/styles';

var Dropzone = function (_React$Component) {
  _inherits(Dropzone, _React$Component);

  function Dropzone(props, context) {
    _classCallCheck(this, Dropzone);

    var _this = _possibleConstructorReturn(this, (Dropzone.__proto__ || Object.getPrototypeOf(Dropzone)).call(this, props, context));

    _this.renderChildren = function (children, isDragActive, isDragAccept, isDragReject) {
      if (typeof children === 'function') {
        return children(_extends({}, _this.state, {
          isDragActive: isDragActive,
          isDragAccept: isDragAccept,
          isDragReject: isDragReject,
          open: _this.open
        }));
      }
      return children;
    };

    _this.composeHandlers = _this.composeHandlers.bind(_this);
    _this.onClick = _this.onClick.bind(_this);
    _this.onDocumentDrop = _this.onDocumentDrop.bind(_this);
    _this.onDragEnter = _this.onDragEnter.bind(_this);
    _this.onDragLeave = _this.onDragLeave.bind(_this);
    _this.onDragOver = _this.onDragOver.bind(_this);
    _this.onDragStart = _this.onDragStart.bind(_this);
    _this.onDrop = _this.onDrop.bind(_this);
    _this.onFileDialogCancel = _this.onFileDialogCancel.bind(_this);
    _this.onInputElementClick = _this.onInputElementClick.bind(_this);
    _this.open = _this.open.bind(_this);

    _this.setRef = _this.setRef.bind(_this);
    _this.setRefs = _this.setRefs.bind(_this);

    _this.isFileDialogActive = false;

    _this.state = {
      draggedFiles: [],
      acceptedFiles: [],
      rejectedFiles: []
    };
    return _this;
  }

  _createClass(Dropzone, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var preventDropOnDocument = this.props.preventDropOnDocument;

      this.dragTargets = [];

      if (preventDropOnDocument) {
        document.addEventListener('dragover', onDocumentDragOver, false);
        document.addEventListener('drop', this.onDocumentDrop, false);
      }
      if (this.fileInputEl != null) {
        this.fileInputEl.addEventListener('click', this.onInputElementClick, false);
      }
      window.addEventListener('focus', this.onFileDialogCancel, false);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var preventDropOnDocument = this.props.preventDropOnDocument;

      if (preventDropOnDocument) {
        document.removeEventListener('dragover', onDocumentDragOver);
        document.removeEventListener('drop', this.onDocumentDrop);
      }
      if (this.fileInputEl != null) {
        this.fileInputEl.removeEventListener('click', this.onInputElementClick, false);
      }
      window.removeEventListener('focus', this.onFileDialogCancel, false);
    }
  }, {
    key: 'composeHandlers',
    value: function composeHandlers(handler) {
      if (this.props.disabled) {
        return null;
      }

      return handler;
    }
  }, {
    key: 'onDocumentDrop',
    value: function onDocumentDrop(evt) {
      if (this.node && this.node.contains(evt.target)) {
        // if we intercepted an event for our instance, let it propagate down to the instance's onDrop handler
        return;
      }
      evt.preventDefault();
      this.dragTargets = [];
    }
  }, {
    key: 'onDragStart',
    value: function onDragStart(evt) {
      evt.persist();
      if (this.props.onDragStart && isDragDataWithFiles(evt)) {
        this.props.onDragStart.call(this, evt);
      }
    }
  }, {
    key: 'onDragEnter',
    value: function onDragEnter(evt) {
      var _this2 = this;

      evt.preventDefault();

      // Count the dropzone and any children that are entered.
      if (this.dragTargets.indexOf(evt.target) === -1) {
        this.dragTargets.push(evt.target);
      }

      evt.persist();

      if (isDragDataWithFiles(evt)) {
        Promise.resolve(this.props.getDataTransferItems(evt)).then(function (draggedFiles) {
          if (evt.isPropagationStopped()) {
            return;
          }

          _this2.setState({
            draggedFiles: draggedFiles,
            // Do not rely on files for the drag state. It doesn't work in Safari.
            isDragActive: true
          });
        });

        if (this.props.onDragEnter) {
          this.props.onDragEnter.call(this, evt);
        }
      }
    }
  }, {
    key: 'onDragOver',
    value: function onDragOver(evt) {
      // eslint-disable-line class-methods-use-this
      evt.preventDefault();
      evt.persist();

      try {
        // The file dialog on Chrome allows users to drag files from the dialog onto
        // the dropzone, causing the browser the crash when the file dialog is closed.
        // A drop effect of 'none' prevents the file from being dropped
        evt.dataTransfer.dropEffect = this.isFileDialogActive ? 'none' : 'copy'; // eslint-disable-line no-param-reassign
      } catch (err) {
        // continue regardless of error
      }

      if (this.props.onDragOver && isDragDataWithFiles(evt)) {
        this.props.onDragOver.call(this, evt);
      }

      return false;
    }
  }, {
    key: 'onDragLeave',
    value: function onDragLeave(evt) {
      var _this3 = this;

      evt.preventDefault();
      evt.persist();

      // Only deactivate once the dropzone and all children have been left.
      this.dragTargets = this.dragTargets.filter(function (el) {
        return el !== evt.target && _this3.node.contains(el);
      });
      if (this.dragTargets.length > 0) {
        return;
      }

      // Clear dragging files state
      this.setState({
        isDragActive: false,
        draggedFiles: []
      });

      if (this.props.onDragLeave && isDragDataWithFiles(evt)) {
        this.props.onDragLeave.call(this, evt);
      }
    }
  }, {
    key: 'onDrop',
    value: function onDrop(evt) {
      var _this4 = this;

      var _props = this.props,
          onDrop = _props.onDrop,
          onDropAccepted = _props.onDropAccepted,
          onDropRejected = _props.onDropRejected,
          multiple = _props.multiple,
          accept = _props.accept,
          getDataTransferItems = _props.getDataTransferItems;

      // Stop default browser behavior

      evt.preventDefault();

      // Persist event for later usage
      evt.persist();

      // Reset the counter along with the drag on a drop.
      this.dragTargets = [];
      this.isFileDialogActive = false;

      // Clear files value
      this.draggedFiles = null;

      // Reset drag state
      this.setState({
        isDragActive: false,
        draggedFiles: []
      });

      if (isDragDataWithFiles(evt)) {
        Promise.resolve(getDataTransferItems(evt)).then(function (fileList) {
          var acceptedFiles = [];
          var rejectedFiles = [];

          if (evt.isPropagationStopped()) {
            return;
          }

          fileList.forEach(function (file) {
            if (fileAccepted(file, accept) && fileMatchSize(file, _this4.props.maxSize, _this4.props.minSize)) {
              acceptedFiles.push(file);
            } else {
              rejectedFiles.push(file);
            }
          });

          if (!multiple && acceptedFiles.length > 1) {
            // if not in multi mode add any extra accepted files to rejected.
            // This will allow end users to easily ignore a multi file drop in "single" mode.
            rejectedFiles.push.apply(rejectedFiles, _toConsumableArray(acceptedFiles.splice(0)));
          }

          // Update `acceptedFiles` and `rejectedFiles` state
          // This will make children render functions receive the appropriate
          // values
          _this4.setState({ acceptedFiles: acceptedFiles, rejectedFiles: rejectedFiles }, function () {
            if (onDrop) {
              onDrop.call(_this4, acceptedFiles, rejectedFiles, evt);
            }

            if (rejectedFiles.length > 0 && onDropRejected) {
              onDropRejected.call(_this4, rejectedFiles, evt);
            }

            if (acceptedFiles.length > 0 && onDropAccepted) {
              onDropAccepted.call(_this4, acceptedFiles, evt);
            }
          });
        });
      }
    }
  }, {
    key: 'onClick',
    value: function onClick(evt) {
      var _props2 = this.props,
          onClick = _props2.onClick,
          disableClick = _props2.disableClick;

      // if onClick prop is given, run it first

      if (onClick) {
        onClick.call(this, evt);
      }

      // if disableClick is not set and the event hasn't been default prefented within
      // the onClick listener, open the file dialog
      if (!disableClick && !evt.isDefaultPrevented()) {
        evt.stopPropagation();

        // in IE11/Edge the file-browser dialog is blocking, ensure this is behind setTimeout
        // this is so react can handle state changes in the onClick prop above above
        // see: https://github.com/react-dropzone/react-dropzone/issues/450
        if (isIeOrEdge()) {
          setTimeout(this.open, 0);
        } else {
          this.open();
        }
      }
    }
  }, {
    key: 'onInputElementClick',
    value: function onInputElementClick(evt) {
      evt.stopPropagation();
      if (this.props.inputProps && this.props.inputProps.onClick) {
        this.props.inputProps.onClick(evt);
      }
    }
  }, {
    key: 'onFileDialogCancel',
    value: function onFileDialogCancel() {
      var _this5 = this;

      // timeout will not recognize context of this method
      var onFileDialogCancel = this.props.onFileDialogCancel;
      // execute the timeout only if the FileDialog is opened in the browser

      if (this.isFileDialogActive) {
        setTimeout(function () {
          if (_this5.fileInputEl != null) {
            // Returns an object as FileList
            var files = _this5.fileInputEl.files;


            if (!files.length) {
              _this5.isFileDialogActive = false;

              if (typeof onFileDialogCancel === 'function') {
                onFileDialogCancel();
              }
            }
          }
        }, 300);
      }
    }
  }, {
    key: 'setRef',
    value: function setRef(ref) {
      this.node = ref;
    }
  }, {
    key: 'setRefs',
    value: function setRefs(ref) {
      this.fileInputEl = ref;
    }
    /**
     * Open system file upload dialog.
     *
     * @public
     */

  }, {
    key: 'open',
    value: function open() {
      this.isFileDialogActive = true;
      this.fileInputEl.value = null;
      this.fileInputEl.click();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props3 = this.props,
          accept = _props3.accept,
          acceptClassName = _props3.acceptClassName,
          activeClassName = _props3.activeClassName,
          children = _props3.children,
          disabled = _props3.disabled,
          disabledClassName = _props3.disabledClassName,
          inputProps = _props3.inputProps,
          multiple = _props3.multiple,
          name = _props3.name,
          rejectClassName = _props3.rejectClassName,
          rest = _objectWithoutProperties(_props3, ['accept', 'acceptClassName', 'activeClassName', 'children', 'disabled', 'disabledClassName', 'inputProps', 'multiple', 'name', 'rejectClassName']);

      var acceptStyle = rest.acceptStyle,
          activeStyle = rest.activeStyle,
          _rest$className = rest.className,
          className = _rest$className === undefined ? '' : _rest$className,
          disabledStyle = rest.disabledStyle,
          rejectStyle = rest.rejectStyle,
          style = rest.style,
          props = _objectWithoutProperties(rest, ['acceptStyle', 'activeStyle', 'className', 'disabledStyle', 'rejectStyle', 'style']);

      var _state = this.state,
          isDragActive = _state.isDragActive,
          draggedFiles = _state.draggedFiles;

      var filesCount = draggedFiles.length;
      var isMultipleAllowed = multiple || filesCount <= 1;
      var isDragAccept = filesCount > 0 && allFilesAccepted(draggedFiles, this.props.accept);
      var isDragReject = filesCount > 0 && (!isDragAccept || !isMultipleAllowed);
      var noStyles = !className && !style && !activeStyle && !acceptStyle && !rejectStyle && !disabledStyle;

      if (isDragActive && activeClassName) {
        className += ' ' + activeClassName;
      }
      if (isDragAccept && acceptClassName) {
        className += ' ' + acceptClassName;
      }
      if (isDragReject && rejectClassName) {
        className += ' ' + rejectClassName;
      }
      if (disabled && disabledClassName) {
        className += ' ' + disabledClassName;
      }

      if (noStyles) {
        style = styles.default;
        activeStyle = styles.active;
        acceptStyle = styles.accepted;
        rejectStyle = styles.rejected;
        disabledStyle = styles.disabled;
      }

      var appliedStyle = _extends({ position: 'relative' }, style);
      if (activeStyle && isDragActive) {
        appliedStyle = _extends({}, appliedStyle, activeStyle);
      }
      if (acceptStyle && isDragAccept) {
        appliedStyle = _extends({}, appliedStyle, acceptStyle);
      }
      if (rejectStyle && isDragReject) {
        appliedStyle = _extends({}, appliedStyle, rejectStyle);
      }
      if (disabledStyle && disabled) {
        appliedStyle = _extends({}, appliedStyle, disabledStyle);
      }

      var inputAttributes = {
        accept: accept,
        disabled: disabled,
        type: 'file',
        style: _extends({
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          opacity: 0.00001,
          pointerEvents: 'none'
        }, inputProps.style),
        multiple: supportMultiple && multiple,
        ref: this.setRefs,
        onChange: this.onDrop,
        autoComplete: 'off'
      };

      if (name && name.length) {
        inputAttributes.name = name;
      }

      // Destructure custom props away from props used for the div element
      /* eslint-disable no-unused-vars */

      var acceptedFiles = props.acceptedFiles,
          preventDropOnDocument = props.preventDropOnDocument,
          disableClick = props.disableClick,
          onDropAccepted = props.onDropAccepted,
          onDropRejected = props.onDropRejected,
          onFileDialogCancel = props.onFileDialogCancel,
          maxSize = props.maxSize,
          minSize = props.minSize,
          getDataTransferItems = props.getDataTransferItems,
          divProps = _objectWithoutProperties(props, ['acceptedFiles', 'preventDropOnDocument', 'disableClick', 'onDropAccepted', 'onDropRejected', 'onFileDialogCancel', 'maxSize', 'minSize', 'getDataTransferItems']);
      /* eslint-enable no-unused-vars */

      /* eslint-disable jsx-a11y/no-static-element-interactions */
      /* eslint-disable jsx-a11y/click-events-have-key-events */


      return React.createElement(
        'div',
        _extends({
          className: className,
          style: appliedStyle
        }, divProps /* expand user provided props first so event handlers are never overridden */
        , {
          onClick: this.composeHandlers(this.onClick),
          onDragStart: this.composeHandlers(this.onDragStart),
          onDragEnter: this.composeHandlers(this.onDragEnter),
          onDragOver: this.composeHandlers(this.onDragOver),
          onDragLeave: this.composeHandlers(this.onDragLeave),
          onDrop: this.composeHandlers(this.onDrop),
          ref: this.setRef,
          'aria-disabled': disabled
        }),
        this.renderChildren(children, isDragActive, isDragAccept, isDragReject),
        React.createElement('input', _extends({}, inputProps /* expand user provided inputProps first so inputAttributes override them */
        , inputAttributes))
      );
    }
  }]);

  return Dropzone;
}(React.Component);

export default Dropzone;

Dropzone.propTypes = {
  /**
   * Allow specific types of files. See https://github.com/okonet/attr-accept for more information.
   * Keep in mind that mime type determination is not reliable across platforms. CSV files,
   * for example, are reported as text/plain under macOS but as application/vnd.ms-excel under
   * Windows. In some cases there might not be a mime type set at all.
   * See: https://github.com/react-dropzone/react-dropzone/issues/276
   */
  accept: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),

  /**
   * Contents of the dropzone
   */
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

  /**
   * Disallow clicking on the dropzone container to open file dialog
   */
  disableClick: PropTypes.bool,

  /**
   * Enable/disable the dropzone entirely
   */
  disabled: PropTypes.bool,

  /**
   * If false, allow dropped items to take over the current browser window
   */
  preventDropOnDocument: PropTypes.bool,

  /**
   * Pass additional attributes to the `<input type="file"/>` tag
   */
  inputProps: PropTypes.object,

  /**
   * Allow dropping multiple files
   */
  multiple: PropTypes.bool,

  /**
   * `name` attribute for the input tag
   */
  name: PropTypes.string,

  /**
   * Maximum file size (in bytes)
   */
  maxSize: PropTypes.number,

  /**
   * Minimum file size (in bytes)
   */
  minSize: PropTypes.number,

  /**
   * className
   */
  className: PropTypes.string,

  /**
   * className to apply when drag is active
   */
  activeClassName: PropTypes.string,

  /**
   * className to apply when drop will be accepted
   */
  acceptClassName: PropTypes.string,

  /**
   * className to apply when drop will be rejected
   */
  rejectClassName: PropTypes.string,

  /**
   * className to apply when dropzone is disabled
   */
  disabledClassName: PropTypes.string,

  /**
   * CSS styles to apply
   */
  style: PropTypes.object,

  /**
   * CSS styles to apply when drag is active
   */
  activeStyle: PropTypes.object,

  /**
   * CSS styles to apply when drop will be accepted
   */
  acceptStyle: PropTypes.object,

  /**
   * CSS styles to apply when drop will be rejected
   */
  rejectStyle: PropTypes.object,

  /**
   * CSS styles to apply when dropzone is disabled
   */
  disabledStyle: PropTypes.object,

  /**
   * getDataTransferItems handler
   * @param {Event} event
   * @returns {Array} array of File objects
   */
  getDataTransferItems: PropTypes.func,

  /**
   * onClick callback
   * @param {Event} event
   */
  onClick: PropTypes.func,

  /**
   * onDrop callback
   */
  onDrop: PropTypes.func,

  /**
   * onDropAccepted callback
   */
  onDropAccepted: PropTypes.func,

  /**
   * onDropRejected callback
   */
  onDropRejected: PropTypes.func,

  /**
   * onDragStart callback
   */
  onDragStart: PropTypes.func,

  /**
   * onDragEnter callback
   */
  onDragEnter: PropTypes.func,

  /**
   * onDragOver callback
   */
  onDragOver: PropTypes.func,

  /**
   * onDragLeave callback
   */
  onDragLeave: PropTypes.func,

  /**
   * Provide a callback on clicking the cancel button of the file dialog
   */
  onFileDialogCancel: PropTypes.func
};

Dropzone.defaultProps = {
  preventDropOnDocument: true,
  disabled: false,
  disableClick: false,
  inputProps: {},
  multiple: true,
  maxSize: Infinity,
  minSize: 0,
  getDataTransferItems: defaultGetDataTransferItem
};