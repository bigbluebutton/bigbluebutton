import React, { useCallback, useRef, useState } from 'react';
import Styled from './styles';

export interface PanelTab {
  id: string;
  label: string;
  dataTest: string;
  content: React.ReactNode;
}

interface PanelTabsProps {
  tabs: PanelTab[];
  // Names the tab list for assistive technology.
  label: string;
  // Off outside a phone: no tab list, and the wrappers stay out of the
  // layout, so the panels sit in the page as if they were not wrapped.
  tabbed: boolean;
}

/**
 * The pre-flight's panels as tabs, for a phone. Every panel stays mounted and
 * is only hidden: the setup panel holds a live camera preview and the user's
 * picks, which a remount would drop. For the same reason the setup panel is
 * always rendered through here, at every width: crossing the phone
 * breakpoint, a rotation included, only turns the tabs on or off.
 *
 * With a single panel there are no tabs at all, neither drawn nor announced,
 * but the panel keeps its place in the tree, so a second panel arriving later
 * (the moderator's, once the room mode is read) does not remount it. That is
 * why the tab semantics are written here rather than taken from react-tabs,
 * whose panels always announce themselves as tab panels.
 */
const PanelTabs: React.FC<PanelTabsProps> = ({ tabs, label, tabbed }) => {
  const [selectedId, setSelectedId] = useState(tabs[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hasTabs = tabbed && tabs.length > 1;
  const selected = tabs.find((tab) => tab.id === selectedId) ?? tabs[0];

  // Arrow keys move along the tab list and select, as the tabs pattern does.
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.id === selected?.id);
    const next = tabs[(index + step + tabs.length) % tabs.length];
    setSelectedId(next.id);
    tabRefs.current[next.id]?.focus();
  }, [tabs, selected]);

  return (
    <Styled.Tabs $flat={!tabbed}>
      {hasTabs && (
        <Styled.TabList role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
          {tabs.map((tab) => {
            const isSelected = tab.id === selected?.id;
            return (
              <Styled.Tab
                key={tab.id}
                ref={(element) => { tabRefs.current[tab.id] = element; }}
                id={`preFlightTab-${tab.id}`}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`preFlightTabPanel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                $selected={isSelected}
                onClick={() => setSelectedId(tab.id)}
                data-test={tab.dataTest}
              >
                {tab.label}
              </Styled.Tab>
            );
          })}
        </Styled.TabList>
      )}
      {tabs.map((tab) => {
        const isSelected = tab.id === selected?.id;
        return (
          <Styled.TabPanel
            key={tab.id}
            $flat={!tabbed}
            id={`preFlightTabPanel-${tab.id}`}
            role={hasTabs ? 'tabpanel' : undefined}
            aria-labelledby={hasTabs ? `preFlightTab-${tab.id}` : undefined}
            hidden={!isSelected}
          >
            {tab.content}
          </Styled.TabPanel>
        );
      })}
    </Styled.Tabs>
  );
};

export default PanelTabs;
