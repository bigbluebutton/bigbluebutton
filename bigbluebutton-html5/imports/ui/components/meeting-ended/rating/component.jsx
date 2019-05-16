import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  legendTitle: {
    id: 'app.meeting-ended.rating.legendLabel',
    description: 'label for star feedback legend',
  },
  starLabel: {
    id: 'app.meeting-ended.rating.starLabel',
    description: 'label for feedback stars',
  },
});

class Rating extends Component {
  constructor(props) {
    super(props);
    this.clickStar = this.clickStar.bind(this);
  }

  shouldComponentUpdate() {
    // when component re render lost checked item
    return false;
  }

  clickStar(e) {
    this.props.onRate(e);
  }

  renderStars(num) {
    const { intl } = this.props;

    return (
      <div className={styles.starRating}>
        <fieldset>
          <legend className={styles.legend}>{intl.formatMessage(intlMessages.legendTitle)}</legend>
          {
            _.range(num)
              .map(i => [
                (
                  <input
                    type="radio"
                    id={`${i + 1}star`}
                    name="rating"
                    value={i + 1}
                    key={_.uniqueId('star-')}
                    onChange={() => this.clickStar(i + 1)}
                  />
                ),
                (
                  <label
                    htmlFor={`${i + 1}star`}
                    key={_.uniqueId('star-')}
                  >
                    {`${i + 1} ${intl.formatMessage(intlMessages.starLabel)}`}
                  </label>
                ),
              ]).reverse()
          }
        </fieldset>
      </div>
    );
  }

  render() {
    const {
      total,
    } = this.props;
    return (
      <div className={styles.father}>
        {
          this.renderStars(total)
        }
      </div>
    );
  }
}

export default injectIntl(Rating);
