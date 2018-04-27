import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { styles } from './styles';

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
    return (
      <div className={styles.starRating}>
        <fieldset>

          {
              _.range(num)
                .map(i =>
            [(<input type="radio" id={`star ${i + 1}`} name="rating" value={i + 1} key={_.uniqueId('star-')} onChange={() => this.clickStar(i + 1)} />),
             (<label htmlFor={`star ${i+1}`} title={`star ${i+1}`} key={_.uniqueId('star-')}>star {i + 1}</label>)
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

export default Rating;
