import React, {useState} from 'react';
import ReactModal from 'react-modal';
import './WhiteboardToolbarButton.css';

function WhiteboardToolbarButton({ pluginName }) {
  const [ showModal, setShowModal] = useState(false);
  window.bbb_plugins[pluginName] = {
    getWhiteboardToolbarButtons: () => [{
      name: pluginName,
      label: "click me",
      tooltip: "this is a button injected by plugin",
      onClick: () => {
        setShowModal(true);
      },
    }]
  };

  return (
    <ReactModal
      className="plugin-modal"
      overlayClassName="modal-overlay"
      isOpen={showModal}
      onRequestClose={() => setShowModal(false)}
    >
      <div
        style={{width: '100%', height: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column'}}
      >
        <h1>Hey, I am a modal sample</h1>
        <button
          onClick={() => {setShowModal(false)}}
        >
          Close Modal
        </button>
      </div>
    </ReactModal>
  );
}

export default WhiteboardToolbarButton;
