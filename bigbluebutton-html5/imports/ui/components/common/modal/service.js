import { Tracker } from 'meteor/tracker';
import React, { PureComponent } from 'react';
import { MODAL_TYPES } from '/imports/ui/components/common/modal/enums'

const currentModal = {
  component: null,
  tracker: new Tracker.Dependency(),
};

export const showModal = (component) => {
  if (currentModal.component !== component) {
    currentModal.component = component;
    currentModal.tracker.changed();
  }
  if (component == null) {
    Session.set('modalInfo', {isModalOpen: false});
  }
};

export const getModal = () => {
  currentModal.tracker.depend();
  return currentModal.component;
};

export const withModalMounter = ComponentToWrap =>
  class ModalMounterWrapper extends PureComponent {

    componentDidMount(){
      // needs to ne executed as initialization
      currentModal.tracker.changed();
    }

    static mount(modalComponent, modalType=MODAL_TYPES.DEFAULT) {
      showModal(null);
      
      Session.set('modalInfo', {isModalOpen: true, typeOfModal: modalType});
      // defer the execution to a subsequent event loop
      setTimeout(() => showModal(modalComponent), 0);
    }

    render() {
      return (<ComponentToWrap
        {...this.props}
        mountModal={ModalMounterWrapper.mount}
      />);
    }
  };
