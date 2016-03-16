UploadingFileListItem = React.createClass ({
  percUploaded() {
    return Math.round((this.uploadedSize / this.size) * 100);
  },

  render() {
    <li className="presenter-uploader-file-item is-uploading">
      <span className="presenter-uploader-file-item-name">
        {this.props.name}
      </span>
      <span className="presenter-uploader-file-item-progress">
        {percUploaded}%
      </span>
    </li>
  }
});