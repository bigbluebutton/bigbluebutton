
import React from 'react';
import { styles } from './styles';

const CustomLogo = props => (
  <div>
    <div className={styles.branding} data-test="brandingArea">
      <img src={props.CustomLogoUrl} alt="custom branding logo" />
    </div>
    <div className={styles.separator} />
  </div>
);

export default CustomLogo;
