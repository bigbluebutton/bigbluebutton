import React from 'react';
import { styles } from './styles';

const PadContent = ({
  content,
}) => {

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default PadContent;
