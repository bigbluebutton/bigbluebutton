import React, { useCallback, useEffect } from 'react';
import Styled from './styles';

const BaseModal = (props) => {
  const {
    setIsOpen,
    modalName,
    children,
    isOpen,
    onRequestClose,
    className,
    overlayClassName,
    dataTest,
    priority,
  } = props;

  const closeEventHandler = useCallback(() => {
    setIsOpen(false);
  }, []);
  useEffect(() => {
    // Only add event listener if name is specified
    if (!modalName) return () => null;

    const closeEventName = `CLOSE_MODAL_${modalName.toUpperCase()}`;

    // Listen to close event on mount
    document.addEventListener(closeEventName, closeEventHandler);

    // Remove listener on unmount
    return () => {
      document.removeEventListener(closeEventName, closeEventHandler);
    };
  }, []);
  const priorityValue = priority || 'low';

  return (
    <Styled.BaseModal
      portalClassName={`modal-${priorityValue}`}
      parentSelector={() => document.querySelector('#modals-container')}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={className}
      overlayClassName={overlayClassName}
      shouldReturnFocusAfterClose={false}
      data={{
        test: dataTest,
      }}
      {...props}
    >
      {children}
    </Styled.BaseModal>
  );
};

export default { BaseModal };
