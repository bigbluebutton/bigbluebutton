_Icon = React.createClass({
  getDefaultProps: function() {
    return {
      icon: 'die-six',
      title: ''
    };
  },

  render(){
    const shouldDisplayTooltip = this.props.title.length;
    let icon = <i className={"fi-" + this.props.icon + " " + this.props.class}></i>;

    if(shouldDisplayTooltip) {
      return (
        <Tooltip title={this.props.title} placement={this.props.placement}>
          {icon}
        </Tooltip>
      );
    }

    return icon;
  }
})
