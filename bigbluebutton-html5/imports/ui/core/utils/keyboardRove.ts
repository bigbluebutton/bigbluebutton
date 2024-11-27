import React from 'react';

const roveBuilder = (
  selectedRef: React.MutableRefObject<HTMLElement | null>,
  prefixId: string,
) => (ev: React.KeyboardEvent<HTMLDivElement>) => {
  ev.preventDefault();
  ev.stopPropagation();
  if (ev.code === 'Enter' || ev.code === 'Space' || (ev.code === 'ArrowDown' && selectedRef.current !== document.activeElement)) {
    if (selectedRef.current && (selectedRef.current === document.activeElement)) {
      selectedRef.current.click();
    } else {
      const userItem = document.getElementById(`${prefixId}-0`);
      // eslint-disable-next-line
      selectedRef.current = userItem;

      if (selectedRef.current) {
        selectedRef.current.focus();
      }
    }
    return;
  }

  if (ev.code === 'ArrowDown' || ev.code === 'ArrowUp') {
    const sum = ev.code === 'ArrowDown' ? 1 : -1;
    const el = selectedRef.current;
    if (el) {
      const nextId = Number.parseInt(el.id.split('-')[2], 10) + sum;
      const nextEl = document.getElementById(`${prefixId}-${nextId}`);
      if (nextEl) {
        // eslint-disable-next-line
        selectedRef.current = nextEl;
        nextEl.focus();
      }
    }
  }
};

export default roveBuilder;
