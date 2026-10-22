import React from 'react';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Button from '/imports/ui/components/common/button/component';
import { PluginButtonIcon } from '/imports/ui/components/plugins/plugin-icon/styles';
import { OverflowMenuEntry, OverflowMenuOptionEntry } from '../types';
import { isActionableEntry, isSeparatorEntry, normalizeSeparators } from '../service';

type MenuOptions = Record<string, unknown>;

interface OverflowMenuButtonTrigger {
  label: string;
  dataTest: string;
  className?: string;
  size?: 'md' | 'lg';
  color?: string;
  accessKey?: string;
  icon?: string;
  // Lets a caller keep its own styled Button (e.g. the nav bar's DropdownButton).
  component?: React.ElementType;
  state?: 'open' | 'closed';
}

interface OverflowMenuButtonProps {
  entries: OverflowMenuEntry[];
  trigger: OverflowMenuButtonTrigger;
  menuOpts?: MenuOptions;
  customStyles?: object | null;
  overrideMobileStyles?: boolean;
}

const noop = () => {};

type ActionableEntry = OverflowMenuOptionEntry & { onClick: () => void };

const getButtonIconProps = (icon: unknown): { icon?: string; customIcon?: React.ReactNode } => {
  if (typeof icon === 'string') return { icon };
  if (icon && typeof icon === 'object') {
    if ('iconName' in icon) return { icon: (icon as { iconName: string }).iconName };
    if ('svgContent' in icon) {
      return {
        customIcon: (
          <PluginButtonIcon>
            {(icon as { svgContent: React.ReactNode }).svgContent}
          </PluginButtonIcon>
        ),
      };
    }
  }
  return {};
};

const OverflowMenuButton: React.FC<OverflowMenuButtonProps> = ({
  entries,
  trigger,
  menuOpts,
  customStyles,
  overrideMobileStyles,
}) => {
  const normalized = normalizeSeparators(entries);
  const actionable = normalized.filter(isActionableEntry);

  if (actionable.length === 0) return null;

  const {
    label, dataTest, className, size, color, accessKey, icon = 'more', component: TriggerButton = Button, state,
  } = trigger;

  const hasTextEntries = normalized.some((entry) => !isSeparatorEntry(entry) && !isActionableEntry(entry));

  const onlyEntry = actionable.length === 1 && !hasTextEntries
    ? actionable[0] as ActionableEntry
    : null;

  if (onlyEntry && !onlyEntry.keepInMenu) {
    const { icon: entryIcon, customIcon } = getButtonIconProps(onlyEntry.icon);
    // A direct button never opens a menu, so a trigger that shows its open state stays closed.
    const directButtonState = state === undefined ? undefined : 'closed';
    return (
      <TriggerButton
        state={directButtonState}
        label={onlyEntry.label}
        tooltipLabel={onlyEntry.label}
        data-test={onlyEntry.dataTest}
        color={color}
        size={size}
        circle
        hideLabel
        disabled={onlyEntry.disabled}
        style={onlyEntry.customStyles}
        onClick={onlyEntry.onClick}
        icon={entryIcon}
        customIcon={customIcon}
      />
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-access-key
    <BBBMenu
      accessKey={accessKey}
      customStyles={customStyles}
      trigger={(
        <TriggerButton
          className={className}
          state={state}
          label={label}
          icon={icon}
          data-test={dataTest}
          color={color}
          size={size}
          circle
          hideLabel
          // BBBMenu opens from its own wrapper; Button just requires a click handler.
          onClick={noop}
        />
      )}
      actions={normalized}
      overrideMobileStyles={overrideMobileStyles}
      opts={menuOpts}
    />
  );
};

export default OverflowMenuButton;
