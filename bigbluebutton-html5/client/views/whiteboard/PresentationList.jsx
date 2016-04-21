import React from 'react';

PresentationList = React.createClass({
  handleShow(name){
    return console.info('Should show the file `' + name + '`');
  },

  handleDelete(name){
    return console.info('Should delete the file `' + name + '`');
  },

  render() {
    return(
    <ul className="presenter-uploader-file-list">
      {this.props.files ? this.props.files.map((file) =>
        <li className="presenter-uploader-file-item is-uploading" key={file.name}>
          <span className="presenter-uploader-file-item-name">
            {file.name}
          </span>
          <span className="presenter-uploader-file-item-progress">
            {file.percUploaded}
          </span>
        </li>
      )
      : null }

      {this.props.presentations ? this.props.presentations.map((presentation) =>
         <li key={presentation.id} className={ classNames('presenter-uploader-file-item', presentation.current ? 'current' : '') }>
          <span onClick={this.handleShow.bind(null, presentation.name)} className="presenter-uploader-file-item-name" data-action-show>
            {presentation.name}
          </span>
          <span className="presenter-uploader-file-item-actions">
            {presentation.current ? null :
              <i onClick={this.handleShow.bind(null, presentation.name)} className="ion-ios-eye-outline" data-action-show></i>
            }
            <i onClick={this.handleDelete.bind(null, presentation.name)} className="ion-ios-trash-outline" data-action-delete></i>
          </span>
        </li>
      )
      : null }
    </ul>
    );
  }
});
