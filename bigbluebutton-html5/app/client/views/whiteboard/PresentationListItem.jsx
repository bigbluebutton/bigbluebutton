PresentationListItem = React.createClass({
  handleClickShow(){
    return console.info('Should show the file `' + this.name + '`');
  },

  handleDelete(){
    return console.info('Should delete the file `' + this.name + '`');
  },
  render() {
    var fileItemClasses = "presenter-uploader-file-item" + (this.props.current ? " current" : "" )
    return(
      <li onClick={this.handleClickShow} class="presenter-uploader-file-item {{#if current}}current{{/if}}">
        <span className="presenter-uploader-file-item-name" data-action-show>
          {this.props.name}
        </span>
        <span className="presenter-uploader-file-item-actions">
          {this.props.current ? null :
            <i className="ion-ios-eye-outline" data-action-show></i>
          }
          <i onClick={this.handleClickDelete} className="ion-ios-trash-outline" data-action-delete></i>
        </span>
      </li>
    );
  }
});