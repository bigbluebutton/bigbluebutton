# frozen_string_literal: true

require 'minitest/autorun'
require 'fileutils'
require 'logger'
require 'tmpdir'

require 'recordandplayback'

class TestEDLAudio < Minitest::Test
  def setup
    skip 'ffmpeg is not installed' unless system('ffmpeg', '-version', out: File::NULL, err: File::NULL)
    BigBlueButton.logger = Logger.new(File::NULL)
    @dir = Dir.mktmpdir
  end

  def teardown
    FileUtils.rm_rf(@dir) if @dir
  end

  # The wav file is 2% shorter than its original duration, so it is played
  # with an adjusted speed. The cut starts 6 s into the file but is only 2 s
  # long, so it must play that part of the stretched file. The file is silent
  # for its first 5 s, so playing it from the start comes out silent too.
  def test_render_speed_adjusted_cut_into_the_file
    file = "#{@dir}/voice.wav"
    assert(system('ffmpeg', '-v', 'error', '-f', 'lavfi',
                  '-i', 'aevalsrc=0.5*sin(2*PI*440*t)*gte(t\,5):s=48000:d=9.8', '-c:a', 'pcm_s16le', file))
    edl = [
      { timestamp: 0, audios: [{ filename: file, timestamp: 6000, original_duration: 10_000 }] },
      { timestamp: 2000, audios: [] },
    ]

    output = render(edl)

    assert_operator(mean_volume(output), :>, -40)
  end

  # A speed-adjusted cut that starts 1 s into the file must play the file from
  # there. The tone starts 2 s into the file, so it must come in about 1 s into
  # the cut, not 1 s later as when the timestamps were not reset.
  def test_render_speed_adjusted_cut_starts_on_time
    file = "#{@dir}/voice.wav"
    assert(system('ffmpeg', '-v', 'error', '-f', 'lavfi',
                  '-i', 'aevalsrc=0.5*sin(2*PI*440*t)*gte(t\,2):s=48000:d=9.8', '-c:a', 'pcm_s16le', file))
    edl = [
      { timestamp: 0, audios: [{ filename: file, timestamp: 1000, original_duration: 10_000 }] },
      { timestamp: 3000, audios: [] },
    ]

    output = render(edl)

    assert_operator(mean_volume(output, 'atrim=0:0.9,'), :<, -60)
    assert_operator(mean_volume(output, 'atrim=1.2:1.3,'), :>, -40)
  end

  private

  def render(edl)
    BigBlueButton::EDL::Audio.render(edl, "#{@dir}/out")
  end

  def mean_volume(file, filter = '')
    out = IO.popen(['ffmpeg', '-nostats', '-i', file, '-af', "#{filter}volumedetect", '-f', 'null', '-'],
                   err: %i[child out], &:read)
    Float(out[/mean_volume: (-?[\d.]+) dB/, 1])
  end
end
