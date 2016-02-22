_Tooltip = React.createClass({
  getDefaultProps: function() {
    return {
      placement: 'bottom'
    };
  },

  render(){
    return (
      <span rel="tooltip" data-placement={this.props.placement} title={this.props.title}>
        {this.props.children}
      </span>
    );
  }
})
