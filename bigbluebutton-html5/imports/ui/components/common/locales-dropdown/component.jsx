import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

const DEFAULT_VALUE = 'select';
const DEFAULT_KEY = -1;

const propTypes = {
  allLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  value: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  elementId: PropTypes.string.isRequired,
  selectMessage: PropTypes.string.isRequired,
};

const defaultProps = {
  value: null,
};

class LocalesDropdown extends PureComponent {
  // returns an array with the base language list + variations of currently selected language
  filterLocaleVariations(value) {
    const { allLocales } = this.props;
    if (allLocales) {
      if (Meteor.settings.public.app.showAllAvailableLocales) {
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
      value, handleChange, elementId, selectMessage, ariaLabel, intl,
    } = this.props;
    const defaultLocale = value || DEFAULT_VALUE;

    const availableLocales = this.filterLocaleVariations(value);

    return (
      <select
        id={elementId}
        onChange={handleChange}
        value={defaultLocale}
        aria-label={ariaLabel||''}
      >
        <option disabled key={DEFAULT_KEY} value={DEFAULT_VALUE}>
          {selectMessage}
        </option>
        {availableLocales.map((localeItem) => {
          const localizedName = localeItem.locale !== value && intl.formatMessage({
            id: `app.submenu.application.localeDropdown.${localeItem.locale}`,
            defaultMessage: ``,
          });

          return (
            <option key={localeItem.locale} value={localeItem.locale}>
              {localeItem.name}{localizedName && ` - ${localizedName}`}
            </option>
          );
        })}
      </select>
    );
  }
}

LocalesDropdown.propTypes = propTypes;
LocalesDropdown.defaultProps = defaultProps;

export default injectIntl(LocalesDropdown);
