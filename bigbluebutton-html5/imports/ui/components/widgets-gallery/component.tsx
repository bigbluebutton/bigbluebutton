import React, { memo, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { WidgetsGalleryProps } from './types';
import Icon from '/imports/ui/components/common/icon/component';
import { layoutDispatch, layoutSelect } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import Header from '/imports/ui/components/common/control-header/component';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import Styled from './styles';
import TooManyPinnedWidgetsModal from './modal/component';

const intlMessages = defineMessages({
  widgetsGalleryTitle: {
    id: 'app.widgets.title',
    description: 'Label for the widgets gallery panel title',
  },
  closeWidgetsGalleryLabel: {
    id: 'app.widgets.close',
    description: 'Label for the close widgets gallery button',
  },
  pinnedWidgets: {
    id: 'app.widgets.maxPinnedWidgets',
    description: 'Widgets panel text that informs users about max current pinned widgets and maximum allowed pinned widgets',
  },
  pinnedWidgetsContinue: {
    id: 'app.widgets.maxPinnedWidgetsContinue',
    description: 'Last part of warning about pinned widgets',
  },
});

const WidgetsGallery: React.FC<WidgetsGalleryProps> = ({ registeredWidgets, pinnedWidgets }) => {
  const MAX_PINNED_WIDGETS = window.meetingClientSettings.public.app.widgets.maxPinnedWidgets;
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const intl = useIntl();
  const title = intl.formatMessage(intlMessages.widgetsGalleryTitle);
  const [error, setError] = useState(false);

  const renderWidget = (widgetKey: string, name: string, icon: string, isPinned: boolean) => {
    const togglePinWidget = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (!isPinned && pinnedWidgets.length >= MAX_PINNED_WIDGETS) {
        setError(true);
        return;
      }
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_WIDGET,
        value: {
          panel: widgetKey,
          pin: !isPinned,
        },
      });
    };
    const openWidgetPanel = () => {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: widgetKey,
      });
    };
    return (
      <Styled.RegisteredWidgetWrapper
        onClick={openWidgetPanel}
      >
        <Styled.OpenButton
          key={`OPEN${widgetKey}`}
          color="primary"
          type="button"
          onClick={openWidgetPanel}
          icon={icon}
          pinned={isPinned}
        />
        <Styled.RegisteredWidgetContent>
          <Styled.WidgetTitle>
            {name}
          </Styled.WidgetTitle>
          <Styled.PinWidget
            key={`PIN${widgetKey}`}
            role="button"
            onClick={togglePinWidget}
            onKeyDown={togglePinWidget}
            tabIndex={0}
            pinned={isPinned}
          >
            <Icon iconName={isPinned ? 'pin-video_on' : 'pin-video_off'} />
          </Styled.PinWidget>
        </Styled.RegisteredWidgetContent>
      </Styled.RegisteredWidgetWrapper>
    );
  };

  const renderedPinnedWidgets = useMemo(() => (
    pinnedWidgets.map((pinnedWidgetKey) => {
      const { name, icon } = registeredWidgets[pinnedWidgetKey];
      return renderWidget(pinnedWidgetKey, name, icon, true);
    })
  ), [registeredWidgets, pinnedWidgets]);

  const renderedUnpinnedWidgets = useMemo(() => (
    Object.keys(registeredWidgets)
      .filter((registeredObjectKey) => !pinnedWidgets.includes(registeredObjectKey))
      .map((unpinnedWidgetKey) => {
        const { name, icon } = registeredWidgets[unpinnedWidgetKey];
        return renderWidget(unpinnedWidgetKey, name, icon, false);
      })
  ), [registeredWidgets, pinnedWidgets]);

  return (
    <Styled.Content>
      { error && (
        <TooManyPinnedWidgetsModal
          setError={setError}
          pinnedWidgetsNumber={pinnedWidgets.length}
        />
      )}
      <Header
        isRTL={isRTL}
        data-test="widgetsGalleryTitle"
        title={title}
        leftButtonProps={{}}
        rightButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.closeWidgetsGalleryLabel),
          'data-test': 'hideWidgetsGallery',
          icon: 'close',
          label: intl.formatMessage(intlMessages.closeWidgetsGalleryLabel),
          onClick: () => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.NONE,
            });
          },
        }}
        customRightButton={null}
      />
      <Styled.Separator />

      <Styled.Wrapper>
        <Styled.PinnedWidgetsWrapper>
          <div>
            <Styled.BoldText>
              {intl.formatMessage(intlMessages.pinnedWidgets, { 0: pinnedWidgets.length, 1: MAX_PINNED_WIDGETS })}
            </Styled.BoldText>
            {intl.formatMessage(intlMessages.pinnedWidgetsContinue)}
          </div>
          {renderedPinnedWidgets}
        </Styled.PinnedWidgetsWrapper>
        <Styled.UnpinnedWidgetsWrapper>
          {renderedUnpinnedWidgets}
        </Styled.UnpinnedWidgetsWrapper>
      </Styled.Wrapper>
    </Styled.Content>
  );
};

export default memo(WidgetsGallery);
