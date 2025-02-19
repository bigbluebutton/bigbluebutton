import React from 'react';
import logger from '/imports/startup/client/logger';

const roveBuilder = (
  selectedRef: React.MutableRefObject<HTMLElement | null>,
  prefixId: string,
) => (ev: React.KeyboardEvent<HTMLDivElement>) => {
  const isActionKey = ev.code === 'Enter' || ev.code === 'Space';
  const isInitialArrowDown = ev.code === 'ArrowDown' && selectedRef.current !== document.activeElement;
  if (isActionKey || isInitialArrowDown) {
    ev.preventDefault();
    ev.stopPropagation();
    if (selectedRef.current && (selectedRef.current === document.activeElement)) {
      selectedRef.current.click();
    } else {
      const userItem = document.getElementById(`${prefixId}-0`);
      if (userItem) {
        /* eslint-disable no-param-reassign */
        selectedRef.current = userItem;
        userItem.focus();
      }
    }
    return;
  }

  if (ev.code === 'ArrowDown' || ev.code === 'ArrowUp') {
    ev.preventDefault();
    ev.stopPropagation();
    const sum = ev.code === 'ArrowDown' ? 1 : -1;
    const el = selectedRef.current;
    if (el) {
      try {
        const currentId = Number.parseInt(el.id.split('-')[2], 10);
        if (Number.isNaN(currentId)) throw new Error('Invalid ID format');

        const nextId = currentId + sum;
        if (nextId < 0) return; // Prevent negative indices

        const nextEl = document.getElementById(`${prefixId}-${nextId}`);
        if (nextEl) {
          /* eslint-disable no-param-reassign */
          selectedRef.current = nextEl;
          nextEl.focus();
        }
      } catch (error) {
        logger.error('Navigation error:', error);
      }
    }
  }
};

export default roveBuilder;
