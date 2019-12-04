import { Tracker } from 'meteor/tracker';
import React, { PureComponent } from 'react';

const currentModal = {
  component: null,
  tracker: new Tracker.Dependency(),
};

const showModal = (component) => {
  if (currentModal.component !== component) {
    currentModal.component = component;
    currentModal.tracker.changed();
  }
};

export const getModal = () => {
  currentModal.tracker.depend();
  return currentModal.component;
};

export const withModalMounter = ComponentToWrap =>
  class ModalMounterWrapper extends PureComponent {
    static mount(modalComponent) {
      showModal(null);
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
