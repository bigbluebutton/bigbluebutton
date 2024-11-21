import React, { memo, useMemo } from 'react';
import { WidgetsGalleryProps } from './types';
import Icon from '/imports/ui/components/common/icon/component';
import { layoutDispatch } from '../layout/context';
import { ACTIONS } from '../layout/enums';

const WidgetsGallery: React.FC<WidgetsGalleryProps> = ({ registeredWidgets, pinnedWidgets }) => {
  const layoutContextDispatch = layoutDispatch();
  return useMemo(() => (
    Object.keys(registeredWidgets).map((registeredWidgetKey) => {
      const { name, icon } = registeredWidgets[registeredWidgetKey];
      const isWidgetPinned = pinnedWidgets.includes(registeredWidgetKey);
      return (
        <button
          key={registeredWidgetKey}
          type="button"
          onClick={() => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_WIDGET,
              value: {
                panel: registeredWidgetKey,
                pin: !isWidgetPinned,
              },
            });
          }}
        >
          <Icon iconName={icon} />
          <span>{name}</span>
          <Icon iconName={isWidgetPinned ? 'pin-video_off' : 'pin-video_on'} />
        </button>
      );
    })
  ), [registeredWidgets, pinnedWidgets]);
};

export default memo(WidgetsGallery);
