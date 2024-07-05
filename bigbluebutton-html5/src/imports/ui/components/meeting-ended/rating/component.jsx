import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { range } from '/imports/utils/array-utils';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import { uniqueId } from '/imports/utils/string-utils';

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

const propTypes = {
  intl: PropTypes.object.isRequired,
  onRate: PropTypes.func.isRequired,
  total: PropTypes.string.isRequired,
};

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
    const { onRate } = this.props;
    onRate(e);
  }

  renderStars(num) {
    const { intl } = this.props;

    return (
      <Styled.StarRating>
        <fieldset>
          <Styled.Legend>{intl.formatMessage(intlMessages.legendTitle)}</Styled.Legend>
          {
            range(0, num)
              .map(i => [
                (
                  <input
                    type="radio"
                    id={`${i + 1}star`}
                    name="rating"
                    value={i + 1}
                    key={uniqueId('star-')}
                    onChange={() => this.clickStar(i + 1)}
                  />
                ),
                (
                  <label
                    htmlFor={`${i + 1}star`}
                    key={uniqueId('star-')}
                    aria-label={`${i + 1} ${intl.formatMessage(intlMessages.starLabel)}`}
                  />
                ),
              ]).reverse()
          }
        </fieldset>
      </Styled.StarRating>
    );
  }

  render() {
    const {
      total,
    } = this.props;
    return (
      <div>
        {
          this.renderStars(total)
        }
      </div>
    );
  }
}

export default injectIntl(Rating);

Rating.propTypes = propTypes;
