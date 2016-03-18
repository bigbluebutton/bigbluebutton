WhiteboardControls = React.createClass ({
  mixins: [ReactMeteorData],
  getMeteorData() {
    let currentPresentation, currentSlide, currentSlideNum, ref, ref1, totalSlideNum;
    currentSlideNum = 0;
    totalSlideNum = 0;
    currentPresentation = Meteor.Presentations.findOne({
      'presentation.current': true
    });
    if(currentPresentation != null) {
      currentSlide = Meteor.Slides.findOne({
        'presentationId': currentPresentation.presentation.id,
        'slide.current': true
    })
      if(currentSlide != null) {
        currentSlideNum = currentSlide.slide.num;
      }
      totalSlides = Meteor.Slides.find({ 'presentationId': currentPresentation.presentation.id });
      if(totalSlides != null) {
        totalSlideNum = totalSlides.count();
      }
    }
    return {
      currentSlideNum: currentSlideNum,
      totalSlideNum: totalSlideNum
    };
  },

  componentDidMount() {
    setTimeout(scaleWhiteboard, 0);
  },

  componentWillUnmount () {
    setTimeout(scaleWhiteboard, 0);
  },

  handlePrevious() {
    BBB.goToPreviousPage();
  },

  handleNext() {
    BBB.goToNextPage();
  },

  render() {
    return (
      <div id="whiteboard-controls">
        <div className="whiteboard-buttons-left">
          {/* TODO: Adjust the presenter uploader for mobile views on iOS devices
              you cant upload PDFs, only images from camera/gallery */
           !isMobile() ? 
            <UploaderControls />
          : null }
        </div>
        <div className="whiteboard-buttons-right">
        </div>
        <div className="whiteboard-buttons-center">
          <div className="whiteboard-buttons-slide">
            <Button onClick={this.handlePrevious} btn_class=" prev" i_class="ion-arrow-left-a" rel="tooltip" data_placement="top" title="Previous"/>
            <span className="current">
              {this.data.currentSlideNum + '/' + this.data.totalSlideNum}
            </span>
            <Button onClick={this.handleNext} btn_class=" next" i_class="ion-arrow-right-a" rel="tooltip" data_placement="top" title="Next"/>
          </div>
        </div>
      </div>
    )
  }
});