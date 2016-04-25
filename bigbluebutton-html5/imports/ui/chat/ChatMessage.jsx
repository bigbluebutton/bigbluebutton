import React from 'react';

export let ChatMessage = React.createClass({
  sanitizeAndFormat: function (str) {
    let res;
    if (typeof str === 'string') { // First, replace replace all tags with the ascii equivalent (excluding those involved in anchor tags)
      res = str.replace(/&/g, '&amp;').replace(/<(?![au\/])/g, '&lt;').replace(/\/([^au])>/g, '$1&gt;').replace(/([^=])"(?!>)/g, '$1&quot;');
      res = this.toClickable(res);
      return res = this.activateBreakLines(res);
    }
  },

  toClickable: function (str) {
    let res;
    if (typeof str === 'string') {
      res = str.replace(/<a href='event:/gim, "<a target='_blank' href='");
      return res = res.replace(/<a href="event:/gim, '<a target="_blank" href="');
    }
  },

  activateBreakLines: function (str) {
    let res;
    if (typeof str === 'string') { // turn '\r' carriage return characters into '<br/>' break lines
      res = str.replace(new RegExp(CARRIAGE_RETURN, 'g'), BREAK_LINE);
      return res;
    }
  },

  autoscroll: function () {
    let ref;
    $('#chatbody').scrollTop((ref = $('#chatbody')[0]) != null ? ref.scrollHeight : void 0);
    return false;
  },

  componentDidUpdate: function () {
    this.autoscroll();
  },

  componentDidMount: function () {
    this.autoscroll();
  },

  toClockTime: function (epochTime) {
    let dateObj, hours, local, minutes, offset;
    if (epochTime === null) {
      return '';
    }

    local = new Date();
    offset = local.getTimezoneOffset();
    epochTime = epochTime - offset * 60000; // 1 min = 60 s = 60,000 ms
    dateObj = new Date(epochTime);
    hours = dateObj.getUTCHours();
    minutes = dateObj.getUTCMinutes();
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    return `${hours}:${minutes}`;
  },

  getTime: function () {
    var floatRight = { float: 'right' };

    if (this.props.message.message.from_time) {
      return (
        <span style={floatRight}>
          <span style={this.props.messageFontSize}>{this.toClockTime(this.props.message.message.from_time)}</span>
          <span style={this.props.messageFontSize} className="glyphicon glyphicon-time"></span>
        </span>
      );
    } else {
      return (
        <span style={floatRight}>
        </span>
      );
    }
  },

  render() {
    var messageColor = { color: colourToHex(this.props.message.message.from_color) };
    var floatLeft = { float: 'left' };
    function createMarkup(str) { return { __html: str }; };

    return (
      <li>
        <span style={floatLeft}>
        {this.props.message.message.from_username ?
          <span className="userNameEntry" rel="tooltip" data-placement="bottom" title={this.props.message.message.from_username}>
            {this.props.message.message.from_username}
          </span>
        : null }
        </span>
        {this.getTime()}
        <br/>
        <div style={ messageColor } dangerouslySetInnerHTML={createMarkup(this.sanitizeAndFormat(this.props.message.message.message))}>
        </div>
        {this.autoscroll()}
      </li>
    );
  },
});
