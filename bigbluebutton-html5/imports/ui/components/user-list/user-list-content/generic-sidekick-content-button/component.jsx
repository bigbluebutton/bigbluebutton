import React, { useContext } from 'react';
import { GenericContentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-content-item/enums';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';

const GenericSidekickContentNavButton = ({ sidebarContentPanel, layoutContextDispatch }) => {
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let genericSidekickContentExtensibleArea = [];

  if (pluginsExtensibleAreasAggregatedState.genericContentItems) {
    const genericMainContent = pluginsExtensibleAreasAggregatedState.genericContentItems
      .filter((g) => g.type === GenericContentType.SIDEKICK_AREA);
    genericSidekickContentExtensibleArea = [...genericMainContent];
  }

  const genericSidekickContentId = (id) => PANELS.GENERIC_CONTENT_SIDEKICK + id;

  if (genericSidekickContentExtensibleArea.length === 0) return null;
  const genericSidekickContentNavButtons = genericSidekickContentExtensibleArea.map((gsc) => (
    <Styled.Section>
      <Styled.Container>
        <Styled.SmallTitle>
          {gsc.section}
        </Styled.SmallTitle>
      </Styled.Container>
      <Styled.ScrollableList>
        <Styled.List>
          <Styled.ListItem
            role="button"
            tabIndex={0}
            active={sidebarContentPanel === genericSidekickContentId(gsc.id)}
            onClick={() => {
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: sidebarContentPanel !== genericSidekickContentId(gsc.id),
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: sidebarContentPanel === genericSidekickContentId(gsc.id)
                  ? PANELS.NONE
                  : genericSidekickContentId(gsc.id),
              });
            }}
          >
            <Icon iconName={gsc.buttonIcon} />
            <span>
              {gsc.name}
            </span>
          </Styled.ListItem>
        </Styled.List>
      </Styled.ScrollableList>
    </Styled.Section>
  ));
  return <>{genericSidekickContentNavButtons}</>;
};

export default GenericSidekickContentNavButton;
