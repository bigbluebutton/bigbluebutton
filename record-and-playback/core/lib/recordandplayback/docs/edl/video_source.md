# EDL Video Source Interface

The EDL video source interface is used to represent a video source used during EDL rendering. It provides a common interface for different types of video sources, such as recorded deskshare and camera video or generated presentation video.

## Implementations

### VideoSource

An implementation of the Video Source interface for video files. It is intended to be used for video files which are present in the raw recording data, and handles reading information from the file along with checking for corruption and recording bugs from various BigBlueButton versions. It has special handling for specific problematic codecs and formats seen in BigBlueButton recordings.

### PresentationVideoSource

An implementation of the Video Source interface which generates presentation video using the [bbb-presentation-video](https://github.com/bigbluebutton/bbb-presentation-video) tool.

## Required Methods

### aspect_ratio

The native aspect ratio of the video source, if it has one, as a `Rational` object. If the video source does not have a native aspect (e.g. it can be rendered at arbitrary aspect ratio), this method should return `nil`.

### corrupt?

Check whether the video source is corrupt. If the video source is corrupt, it cannot be used for EDL rendering (and the `open` method should not be called). The renderer should remove corrupt videos from the EDL prior to rendering.

### pts_gaps

Return a list of large PTS gaps in the source as arrays of `[start_ms, end_ms]`. The end value may be `Float::INFINITY` for a gap that continues to the end of the source. The renderer removes the source from EDL cuts that overlap these ranges before opening cuts, so ffmpeg does not have to process or fill long timestamp gaps.

Sources that read existing media should probe that media and return gaps in the source timeline. Generated sources, or sources that cannot have PTS gaps in their input media, should return an empty array.

### open(width, height, seek, duration, framerate, name)

Open the video source, which should launch any additional processes needed to read or generate the video data. This method will return a `VideoSourceReader` object which provides the information needed to incorporate the video source into the rendering of an EDL cut. This information includes the process IDs of any external processes launched, the file descriptor for the video data, the command-line arguments required to use the video source as an input on an ffmpeg command, and any ffmpeg filters which should be applied to the video prior to it being used.

The video source is required to produce video which matches the parameters specified. This can be done either in preprocessing in an external process, or by providing a set of ffmpeg filters which do any required adjustments.

The video source _must not_ provide video which triggers re-initialization of the ffmpeg filter chain, since the ffmpeg filter chain used in video processing uses stateful filters which will drop frames if re-initialized. In particular, this means that the resolution of the input video as received by ffmpeg must not change over the duration of the cut.

The frame timestamps must be set such that the frame at the seek point has a pts value of 0.
