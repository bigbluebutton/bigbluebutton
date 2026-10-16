// Stands in for the autoplay modal's styled-components, which pull in
// ModalSimple and the whole styling stack. Children render only while open,
// as the real modal does.
import React from 'react';

const LKAutoplayModal = ({ isOpen, children }) => (
  isOpen ? React.createElement('div', { 'data-test': 'lkAutoplayModal' }, children) : null
);

const LKAutoplayModalContent = ({ children }) => React.createElement('div', null, children);

export default { LKAutoplayModal, LKAutoplayModalContent };
