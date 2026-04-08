import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';

export const Modal = ({ isOpen, children }) => {
  const container = useRef(null);
  const activeElementAfterOpening = useRef(null);

  useEffect(() => {
    if (isOpen) {
      activeElementAfterOpening.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      container.current.getElementsByTagName('button')[0]?.focus();
    } else {
      activeElementAfterOpening.current = null;
      document.body.style.overflow = 'auto';
    }
    const handleFocus = (event) => {
      if (container.current && !container.current.contains(event.target)) {
        container.current.getElementsByTagName('button')[0]?.focus();
      }
    };
    document.body.addEventListener('focus', handleFocus, true);
    return () => {
      document.body.style.overflow = 'auto';
      document.body.removeEventListener('focus', handleFocus, true);
      activeElementAfterOpening.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    ReactDOM.createPortal(
      <div
        role="dialog"
        className="bg-black/50 grow fixed inset-0 z-50 flex items-center justify-center"
        ref={container}
      >
        {children}
      </div>,
      document.getElementById('modal-container') || document.body,
    )
  );
};

export const ModalTitle = ({ children }) => (
  <h2 className="text-xl font-bold text-black p-6 pb-0">{children}</h2>
);

export const ModalContent = ({ children }) => (
  <div className="w-full max-h-[calc(100%-50px)] md:w-2/3 bg-gray-100 relative rounded flex flex-col">{children}</div>
);

export const ModalDismissButton = ({ onClick }) => (
  <button
    type="button"
    className="absolute top-0 right-0 -translate-x-2 translate-y-2 text-gray-800 hover:text-gray-500 focus:outline-none focus:ring focus:ring-gray-500 focus:ring-opacity-50 hover:text-black/50 active:text-black/75 rounded-md"
    onClick={onClick}
  >
    <span className="sr-only">
      <FormattedMessage
        id="app.learningDashboard.closeHelpModal"
        defaultMessage="Close dashboard help modal"
      />
    </span>
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

export const ModalBody = ({ children }) => (
  <div className="p-6 overflow-auto h-full">
    {children}
  </div>
);
