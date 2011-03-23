README file

Scripts Description:

===============================================================
concat-videos.rb

The script can create a image video of T seconds taking the logo.jpg file, and can join several videos.
Receives N parameters which can be a video filename and/or integer T. Usage:

ruby concat-videos.rb video1.flv 25 video2.flv
output: a result.flv video (video1.flv+imageVideo.flv+video2.flv)

ruby concat-videos.rb video1.flv 25 video2.flv 60 video3.flv
output: a result.flv video (video1.flv+imageVideo.flv+video2.flv+imageVideo.flv+video3.flv)

NOTE: The videos to join should be in the same directory
===============================================================