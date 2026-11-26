import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import MenuItem from '@mui/material/MenuItem';
import { BBBSelect } from '@bigbluebutton/bbb-ui-components-react';

const DEFAULT_VALUE = 'select';
const DEFAULT_KEY = -1;

const propTypes = {
  allLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  value: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  selectMessage: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  dataTest: PropTypes.string,
};

const defaultProps = {
  value: null,
  dataTest: undefined,
};

class LocalesDropdown extends PureComponent {
  // returns an array with the base language list + variations of currently selected language
  filterLocaleVariations(value) {
    const { allLocales } = this.props;
    if (allLocales) {
      if (window.meetingClientSettings.public.app.showAllAvailableLocales) {
        return allLocales;
      }

      // splits value if not empty
      const splitValue = (value) ? value.split('-')[0] : '';

      const allLocaleCodes = [];
      allLocales.map((item) => allLocaleCodes.push(item.locale));

      /*
        locales show if:
        1. it is a general version of a locale with no specific locales
        2. it is a specific version of a selected locale with many specific versions
        3. it is a specific version of a locale with no general locale
      */
      return allLocales.filter(
        (locale) => (!locale.locale.includes('-') || locale.locale.split('-')[0] === splitValue || !allLocaleCodes.includes(locale.locale.split('-')[0])),
      );
    }
    return [];
  }

  render() {
    const {
      value, handleChange, selectMessage, ariaLabel, intl, dataTest,
    } = this.props;
    const defaultLocale = value || DEFAULT_VALUE;

    const availableLocales = this.filterLocaleVariations(value);

    return (
      <BBBSelect
        onChange={handleChange}
        value={defaultLocale}
        ariaLabel={ariaLabel}
        data-test={dataTest}
      >
        <MenuItem disabled key={DEFAULT_KEY} value={DEFAULT_VALUE}>
          {selectMessage}
        </MenuItem>
        {availableLocales.map((localeItem) => {
          const localizedName = localeItem.locale !== value && intl.formatMessage({
            id: `app.submenu.application.localeDropdown.${localeItem.locale}`,
            defaultMessage: '-',
          });

          return (
            <MenuItem key={localeItem.locale} value={localeItem.locale} lang={localeItem.locale}>
              {localeItem.name}{localizedName && localizedName !== '-' && ` - ${localizedName}`}
            </MenuItem>
          );
        })}
      </BBBSelect>
    );
  }
}

LocalesDropdown.propTypes = propTypes;
LocalesDropdown.defaultProps = defaultProps;

export default injectIntl(LocalesDropdown);
