
(function() {
  function adjustVideos(tagId, centerVideos) {
    const _minContentAspectRatio = 16 / 9.0;

    function calculateOccupiedArea(canvasWidth, canvasHeight, numColumns, numRows, numChildren) {
      const obj = calculateCellDimensions(canvasWidth, canvasHeight, numColumns, numRows);
      obj.occupiedArea = obj.width * obj.height * numChildren;
      obj.numColumns = numColumns;
      obj.numRows = numRows;
      obj.cellAspectRatio = _minContentAspectRatio;
      return obj;
    }

    function calculateCellDimensions(canvasWidth, canvasHeight, numColumns, numRows) {
      const obj = {
        width: Math.floor(canvasWidth / numColumns),
        height: Math.floor(canvasHeight / numRows),
      };

      if (obj.width / obj.height > _minContentAspectRatio) {
        obj.width = Math.min(Math.floor(obj.height * _minContentAspectRatio), Math.floor(canvasWidth / numColumns));
      } else {
        obj.height = Math.min(Math.floor(obj.width / _minContentAspectRatio), Math.floor(canvasHeight / numRows));
      }
      return obj;
    }

    function findBestConfiguration(canvasWidth, canvasHeight, numChildrenInCanvas) {
      let bestConfiguration = {
        occupiedArea: 0,
      };

      for (let cols = 1; cols <= numChildrenInCanvas; cols++) {
        let rows = Math.floor(numChildrenInCanvas / cols);

        // That's a small HACK, different from the original algorithm
        // Sometimes numChildren will be bigger than cols*rows, this means that this configuration
        // can't show all the videos and shouldn't be considered. So we just increment the number of rows
        // and get a configuration which shows all the videos albeit with a few missing slots in the end.
        //   For example: with numChildren == 8 the loop will generate cols == 3 and rows == 2
        //   cols * rows is 6 so we bump rows to 3 and then cols*rows is 9 which is bigger than 8
        if (numChildrenInCanvas > cols * rows) {
          rows += 1;
        }

        const currentConfiguration = calculateOccupiedArea(canvasWidth, canvasHeight, cols, rows, numChildrenInCanvas);

        if (currentConfiguration.occupiedArea > bestConfiguration.occupiedArea) {
          bestConfiguration = currentConfiguration;
        }
      }

      return bestConfiguration;
    }

    // http://stackoverflow.com/a/3437825/414642
    const e = $("#" + tagId).parent().parent().parent().parent(); // TODO arrumar
    const x = e.outerWidth() - 1;
    const y = e.outerHeight() - 1;

    const isPortrait = ( $(document).width() < $(document).height() );

    const videos = $("#" + tagId + " > div:visible");

    if (isPortrait) {
      e.css('margin-top', $('#app > main > section > div > section._imports_ui_components_app__styles__media > div > div._imports_ui_components_presentation__styles__presentationContainer > div > div:nth-child(2)').offset().top - 221);
      e.css('width', 'calc(100% - ' + $("#app > main > section > div > section._imports_ui_components_app__styles__media > div > div._imports_ui_components_presentation__styles__presentationContainer > div > div:nth-child(2)").offset().left + ')');
    } else {
      e.css('width', '100%');
      e.css('margin-top', 0);
    }

    if (videos.length > 4 && !isPortrait) {
      e.addClass('_imports_ui_components_media__styles__moreThan4Videos'); // TODO harcoded
      $('._imports_ui_components_media__styles__container').css('max-width', 'calc(100% - 170px)'); // TODO hardcoded
    } else {
      e.removeClass('_imports_ui_components_media__styles__moreThan4Videos'); // TODO harcoded
      $('._imports_ui_components_media__styles__container').css('max-width', '100%'); // TODO hardcoded
    }

    const best = findBestConfiguration(x, y, videos.length);

    videos.each(function (i) {
      const row = Math.floor(i / best.numColumns);
      const col = Math.floor(i % best.numColumns);

      const top = (row > 0 && videos.length <= 4 && !isPortrait) ? 1 : 0;
      const left = (col > 0 && videos.length <= 4 && !isPortrait) ? 1 : 0;

      $(this).attr('style', `margin-top: ${top}px; margin-left: ${left}px; width: ${best.width}px; height: ${best.height}px;`);
    });

    videos.attr('width', best.width);
    videos.attr('height', best.height);
  }

  window.adjustVideos = adjustVideos;
})();
