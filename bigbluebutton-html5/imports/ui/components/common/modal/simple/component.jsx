import React from 'react';
import PropTypes from 'prop-types';
import GenericModal from '/imports/ui/components/common/modal/generic/component';

const propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  contentLabel: PropTypes.string,
  dismiss: PropTypes.shape({
    callback: PropTypes.func,
  }),
  shouldCloseOnOverlayClick: PropTypes.bool,
  shouldCloseOnEsc: PropTypes.bool,
  modalIsOpen: PropTypes.bool,
  isOpen: PropTypes.bool,
  onRequestClose: PropTypes.func,
  priority: PropTypes.string,
  'data-test': PropTypes.string,
  children: PropTypes.node,
  documentTitle: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
  ]),
};

const defaultProps = {
  id: 'simpleModal',
  title: '',
  contentLabel: undefined,
  dismiss: { callback: null },
  shouldCloseOnOverlayClick: true,
  shouldCloseOnEsc: true,
  modalIsOpen: false,
  isOpen: false,
  onRequestClose: null,
  priority: undefined,
  'data-test': undefined,
  children: null,
  documentTitle: false,
};

const ModalSimple = ({
  id,
  title,
  contentLabel,
  dismiss,
  shouldCloseOnOverlayClick,
  shouldCloseOnEsc,
  modalIsOpen,
  isOpen,
  onRequestClose,
  priority,
  'data-test': dataTest,
  children,
  // legacy props — intentionally ignored (handled by GenericModal/BBBModal internally)
  // eslint-disable-next-line no-unused-vars
  shouldShowCloseButton,
  // eslint-disable-next-line no-unused-vars
  hideBorder,
  // eslint-disable-next-line no-unused-vars
  headerPosition,
  // eslint-disable-next-line no-unused-vars
  width,
  // eslint-disable-next-line no-unused-vars
  height,
  // eslint-disable-next-line no-unused-vars
  padding,
  anchorElement,
  // eslint-disable-next-line no-unused-vars
  setIsOpen,
  ...otherProps
}) => {
  const open = modalIsOpen || isOpen || false;
  const handleClose = onRequestClose || dismiss?.callback || (() => {});

  return (
    <GenericModal
      id={id}
      isOpen={open}
      onRequestClose={handleClose}
      title={title}
      contentLabel={contentLabel || title}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      shouldCloseOnEsc={shouldCloseOnEsc}
      priority={priority}
      data-test={dataTest}
      anchorElement={anchorElement}
      {...otherProps}
    >
      {children}
    </GenericModal>
  );
};

ModalSimple.propTypes = propTypes;
ModalSimple.defaultProps = defaultProps;

export default ModalSimple;
