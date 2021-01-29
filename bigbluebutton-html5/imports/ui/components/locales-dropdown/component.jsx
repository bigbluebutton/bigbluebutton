import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_VALUE = 'select';
const DEFAULT_KEY = -1;

const propTypes = {
  allLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  value: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  elementId: PropTypes.string.isRequired,
  selectMessage: PropTypes.string.isRequired,
  elementClass: PropTypes.string.isRequired,
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

      return allLocales.filter(
        locale => (!locale.locale.includes('-') || locale.locale.split('-')[0] === splitValue),
      );
    }
    return [];
  }

  render() {
    const {
      value, handleChange, elementId, selectMessage, elementClass,
    } = this.props;
    const defaultLocale = value || DEFAULT_VALUE;

    const availableLocales = this.filterLocaleVariations(value);

    return (
      <select
        id={elementId}
        onChange={handleChange}
        value={defaultLocale}
        className={elementClass}
      >
        <option disabled key={DEFAULT_KEY} value={DEFAULT_VALUE}>
          {selectMessage}
        </option>
        {availableLocales.map(localeItem => (
          <option key={localeItem.locale} value={localeItem.locale}>
            {localeItem.name}
          </option>
        ))}
      </select>
    );
  }
}

LocalesDropdown.propTypes = propTypes;
LocalesDropdown.defaultProps = defaultProps;

export default LocalesDropdown;
