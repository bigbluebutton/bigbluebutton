# Video EDL & Rendering

## Video EDL

### Video EDL Data Structure

The Video EDL is an array of EDL entries. Each EDL entry is a "cut" in the video, where the displayed contents of the recording (which videos are shown, which layout is used) may change.

### EDL Entry Data Structure

EDL entries are hashes with the following symbol keys:

- `:timestamp`: The timestamp of the entry, in milliseconds. The first entry must have a timestamp of 0.
- `:areas`: Content to include in each of the areas defined in the layout. This is a hash where the key is the name of the area (as a symbol), and the value is an array of EDL Entry Videos to include in that area.
- `:next_timestamp`: For internal use only. This is populated by the EDL rendering code to allow the duration of each EDL entry to be calculated independently.
- `:conditions`: The current state of various conditions that affect layout selection. This is a hash where the keys are symbols, and the values are boolean.

#### Conditions

The conditions currently supported by the recording scripts are as follows:

- `:screenshare_as_content`: When both screenshare and presentation are present, this indicates which of them has been selected to be displayed in the main "content" area. This is set to `true` when screenshare is selected, and `false` when presentation is selected.
- `:presentation_used`: Initially set to `false`. After the presentation or whiteboard have been used (specifically: if a non-default presentation is uploaded, if the presentation slide is changed, or if a shape is drawn on the whiteboard), this is set to `true`.
- `:presentation_is_open`: Initially set to `true`. If the layout is changed such that the main "content" area (where presentation or screenshare are shown) is minimized or hidden, this will change to `false`.

### EDL Entry Video Data Structure

EDL Entry Videos are hashes with the following symbol keys:

- `:filename`: For video files, the path to the video file. A file `VideoSource` will be created automatically for videos where only a filename is provided. For video sources which do not use files, set this to a unique symbol identifying the video source.
- `:source`: The video source object to use. If omitted, the renderer creates a `VideoSource` for the media file in `:filename`.
- `:timestamp`: The timestamp to seek to within the video source.
- `:original_duration`: Optional. The time between the BigBlueButton recording event where the video was started and where the video was stopped, if known. This is used to detect and workaround some bugs in BigBlueButton that caused video files to have incorrect durations. Passed to the `VideoSource` constructor.

### Rendering Preprocessing

Before compositing cuts, the renderer may mutate the EDL. It enforces minimum cut lengths, creates `VideoSource` objects for videos that only provide `:filename`, removes corrupt media-file videos, removes video sources from cuts that overlap PTS gaps reported by their source, and populates `:next_timestamp` for each renderable cut.

PTS gap removal is used to avoid asking ffmpeg to process or fill long timestamp ranges. The gap length threshold is controlled by `BigBlueButton::EDL::MediaUtils::DEFAULT_PTS_GAP_MS` unless the gap detector is called with another value. If gap removal inserts additional cuts, the renderer enforces the minimum cut length again before setting `:next_timestamp`.

## Video Rendering Layout

Video rendering layouts define properties of the output video including framerate and resolution, and define areas within the video where content will be placed.

### Video Rendering Layout selection

The Video EDL render method is passed a default `layout`, and may optionally be passed a list of alternate layouts via the `layouts` parameter. If any alternate layouts are passed, the renderer will go through each of the provided layouts, and pick the first one which matches all of the following:

1. The cut has content to place within all of the areas listed in the `:required` key of the layout.
2. The layout has areas defined for all of the areas containing videos in the cut. (The areas in the layout may be hidden, but must be defined.)
3. All of the conditions listed in the `:conditions` key of the layout have values which match the `:conditions` state in the cut.

If none of the alternate layouts match, the default layout will be used.

### Video Rendering Layout Data Structure

The video rendering layout is a hash with the following symbol keys:

- `:name`: Optional. The name of the layout, used for logging and debugging.
- `:width`: The width of the output video. Should only be specified for the default layout.
- `:height`: The height of the output video. Should only be specified for the default layout.
- `:framerate`: The frame rate of the output video. Should only be specified for the default layout.
- `:areas`: The areas defined in the layout. This is an array of Video Rendering Layout Area hashes. When the recording is rendered, areas will be composited in the order they are listed, so later areas will be rendered "on top" of earlier areas.
- `:required`: Optional. A list of areas (array of symbols) which must have content in order for the layout to be selected.
- `:conditions`: Optional. A hash containing conditions which must match in order for the layout to be selected. The keys are symbols, and the values are boolean.

### Video Rendering Layout Area Data Structure

Video Rendering Layout Areas are hashes with the following symbol keys:

- `:name`: The name of the area. Must be a symbol.
- `:width`: The width of the area.
- `:height`: The height of the area.
- `:x`: The x coordinate of the area.
- `:y`: The y coordinate of the area.
- `:hidden`: Optional. Whether the area is hidden. If true, the area will not be rendered (hidden areas do not need `:width`, `:height`, `:x`, or `:y` to be set)
