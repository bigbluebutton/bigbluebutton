import React from 'react';

const Button = ({
    size, bgColor, textColor, children,
}) => (

        <button type="button" className={classnames('bg-${bgColor} text-${textColor} font-bold py-2 px-4 rounded')}>
            {children}
        </button>
    );

export default Button;
