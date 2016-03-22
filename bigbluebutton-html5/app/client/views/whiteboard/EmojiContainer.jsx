EmojiContainer = React.createClass ({
 /* mixins: [ReactMeteorData],
  getMeteorData() {
  
  },
*/
  hasNoPresentation() {
    return Meteor.Presentations.findOne({
      'presentation.current': true
    });
  },

  getCurrentUserEmojiStatus(name) {
    let user;
    user = BBB.getCurrentUser();
    if(user != null) {
      return name == user.user.emoji_status
    }
  },

  emojiIcons() {
    return [
      { name: 'sad', icon: 'sad-face', title: ''},
      { name: 'happy', icon: 'happy-face', title: ''},
      { name: 'confused', icon: 'confused-face', title: ''},
      { name: 'neutral', icon: 'neutral-face', title: ''},
      { name: 'away', icon: 'clock', title: ''},
      { name: 'raiseHand', icon: 'hand', title: 'Lower your Hand'}
    ];
  },

  handleInactive(event) {
    if($(event.target).css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        this.name
      );
      $('.FABTriggerButton').blur();
      return toggleEmojisFAB();
    }
  },
  handleActive(event) {
    if($('.activeEmojiButton').css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        "none"
      );
      $('.FABTriggerButton').blur();
      return toggleEmojisFAB();
    }
  },
  handleFABTriggerButton(event) {
    $('.FABTriggerButton').blur();
    return toggleEmojisFAB();
  },

  render() {
  	return (
      <div className={ classNames('FABContainer', !this.hasNoPresentation() ? 'noPresentation' : '' ) }>
        <Button onClick={ this.handleFABTriggerButton } btn_class="FABTriggerButton" i_class="ion-android-hand"/>
        {this.emojiIcons().map((emoji) =>
          <Button btn_class={ classNames(' ' + emoji.name + 'EmojiButton', this.getCurrentUserEmojiStatus(emoji.name) ? 'activeEmojiButton' : 'inactiveEmojiButton') }
          onClick={ this.getCurrentUserEmojiStatus(emoji.name) ? this.handleActive.bind(null, emoji.name) : this.handleInactive.bind(null, emoji.name) }
          key={emoji.name} emoji={ emoji.icon }/>
        )}
      </div>
    );
  }
});