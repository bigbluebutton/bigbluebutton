import React, { useCallback, useEffect } from 'react';
import Styled from './styles';

const BaseModal = (props) => { 
  const { setIsOpen, modalName, children,
    isOpen, onRequestClose, className, overlayClassName,
  } = props;

  const closeEventHandler = useCallback (() => {
      setIsOpen(false);
  } , []);
  useEffect( () => {
    // Only add event listener if name is specified
    if(!modalName) return;

    const closeEventName = `CLOSE_MODAL_${modalName.toUpperCase()}`;

    // Listen to close event on mount
    document.addEventListener(closeEventName, closeEventHandler);

    // Remove listener on unmount
    return () => {
        document.removeEventListener(closeEventName, closeEventHandler);
    };
  }, []);
  const priority = props.priority ? props.priority : "low"
  return (<Styled.BaseModal
    portalClassName={`modal-${priority}`}
    parentSelector={()=>document.querySelector('#modals-container')}
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    className={className}
    overlayClassName={overlayClassName}
  >
    {children}
  </Styled.BaseModal>
)}

export default { BaseModal };
