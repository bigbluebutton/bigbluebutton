UserName = React.createClass({
  render() {
    return (
      <div className="user-name">
        {this.props.user.user.name}
      </div>
    );
  }
})
