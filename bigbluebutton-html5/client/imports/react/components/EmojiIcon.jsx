import classNames from 'classnames';

const { PropTypes } = React;

export let EmojiIcon = React.createClass({
  propTypes: {
    iconName: PropTypes.string.isRequired,
  },

  render() {
    return this.renderIcon();
  },

  renderIcon() {
    if(this.props.iconName === 'raiseHand') {
      return (<i className={classNames(this.props.className, 'ion-android-hand')}></i>);
    }
    else if(this.props.iconName === 'happy') {
      return (
        <svg width="25" height="25" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
          <circle cx="19" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <circle cx="31" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <path d="m18 30 C 21 33, 29 33, 32 30" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" fill="none" />
        </svg>
      )
    }
    else if(this.props.iconName === 'neutral') {
      return (
        <svg width="25" height="25" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
          <circle cx="19" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <circle cx="31" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <path d="m18 30 l 14 0" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
        </svg>
      )
    }
    else if(this.props.iconName === 'confused') {
      return (
        <svg width="25" height="25" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
          <circle cx="19" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <circle cx="31" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <path d="M18 30 C 20 28, 22 28, 25 30 S 30 32, 32 30" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
        </svg>
      )
    }
    else if(this.props.iconName === 'sad') {
      return (
        <svg width="25" height="25" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
          <circle cx="19" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <circle cx="31" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <path d="m18 30 C 21 27, 29 27, 32 30" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" fill="none" />
        </svg>
      )
    }
    else if(this.props.iconName === 'away') {
      return (
        <svg width="25" height="25" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
          <path d="m25 25 l 0 -8" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
          <path d="m25 25 l 5 5" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
        </svg>
      )
    }
    else if(this.props.iconName === 'plus') {
      return (
        <svg width="25" height="25" viewBox="0 0 50 50">
          <path d="m25 18 l 0 14" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
          <path d="m18 25 l 14 0" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
        </svg>
      )
    }
  },
});
