import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';
import _ from 'lodash';

class Rating extends Component {
  constructor(props) {
    super(props);
    this.clickStar = this.clickStar.bind(this);
  }

clickStar(e) {
    this.props.onRate(e);
}

  renderstars(num) {
    const {
      selected,
    } = this.props;

    const stars = _.range(num).map((item) => {
      const isSelected = selected > item;
      return (
        <button className={styles.button} onClick={() => this.clickStar(item + 1)}>
          <Icon className={isSelected ? styles.starSelected : styles.star} iconName="check" key={_.uniqueId('star-')} />
        </button>
      );
    });
    return stars;
  }

  // <Button
  //   className={isSelected ? styles.starSelected : styles.star}
  //   onClick={() => this.clickStar(item + 1)}
  //   circle
  //   icon='check'
  // />
  // <Icon className={isSelected ? styles.starSelected : styles.star} iconName="check" key={_.uniqueId('star-')} onClick={() => this.clickStar(item + 1)} />
  render() {
    const {
      numberStar,
    } = this.props;
    return (
      <div className={styles.father}>
        {
          this.renderstars(numberStar)
        }
      </div>
    );
  }
}

export default Rating;
