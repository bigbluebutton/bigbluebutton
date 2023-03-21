import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ModalScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import { borderRadius } from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly, mediumUp } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const BaseModal = styled(ModalScrollboxVertical)`
  max-width: 60vw;
  max-height: 100%;
  border-radius: ${borderRadius};
  background: ${colorWhite};
  overflow: auto;

  @media ${smallOnly} {
    max-width: 95vw;
  }

  @media ${mediumUp} {
    max-width: 80vw;
  }
`;

export default {
  BaseModal: (props) => 
  { 
    const { setIsOpen, modalName, children } = props;

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
    return (<BaseModal
      portalClassName={`modal-${priority}`}
      parentSelector={()=>document.querySelector('#modals-container')}
      {...props}
    >
      {children}
    </BaseModal>
    )},
};
