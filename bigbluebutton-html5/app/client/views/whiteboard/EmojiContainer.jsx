EmojiContainer = React.createClass ({
  mixins: [ReactMeteorData],
  getMeteorData() {
    let user, emoji_status, current_presentation;
    user = BBB.getCurrentUser();
    if(user != null) {
      emoji_status = user.user.emoji_status;
    } else {
      emoji_status = "none";
    }
    current_presentation = Meteor.Presentations.findOne({
      'presentation.current': true
    });
    current_presentation ? current_presentation = true : current_presentation = false;
    return {
      emoji_status: emoji_status,
      current_presentation: current_presentation
    };
  },

  getCurrentUserEmojiStatus(name) {
    return name == this.data.emoji_status;
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

  handleInactive(name, event) {
    if($(event.target).css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        name
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
      <div className={ classNames('FABContainer', !this.data.current_presentation ? 'noPresentation' : '' ) }>
        <Button onClick={ this.handleFABTriggerButton } btn_class="FABTriggerButton" i_class="ion-android-hand"/>
        {this.emojiIcons().map((emoji) =>
          <Button btn_class={ classNames(' ' + emoji.name + 'EmojiButton', this.getCurrentUserEmojiStatus(emoji.name) ? 'activeEmojiButton' : 'inactiveEmojiButton') }
          onClick={ this.getCurrentUserEmojiStatus(emoji.name) ? this.handleActive : this.handleInactive.bind(null, emoji.name) }
          key={emoji.name} emoji={ emoji.icon }/>
        )}
      </div>
    );
  }
});