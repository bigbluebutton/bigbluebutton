# frozen_string_literal: true

require 'minitest/autorun'
require 'minitest/mock'
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

  # The wav file is 2 s (4%) shorter than its original duration, so it is played
  # with an adjusted speed. The cut starts 6 s into the file but is only 2 s
  # long, so it must play that part of the stretched file. The file is silent
  # for its first 5 s, so playing it from the start comes out silent too.
  def test_render_speed_adjusted_cut_into_the_file
    file = "#{@dir}/voice.wav"
    assert(system('ffmpeg', '-v', 'error', '-f', 'lavfi',
                  '-i', 'aevalsrc=0.5*sin(2*PI*440*t)*gte(t\,5):s=48000:d=48', '-c:a', 'pcm_s16le', file))
    edl = [
      { timestamp: 0, audios: [{ filename: file, timestamp: 6000, original_duration: 50_000 }] },
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
                  '-i', 'aevalsrc=0.5*sin(2*PI*440*t)*gte(t\,2):s=48000:d=48', '-c:a', 'pcm_s16le', file))
    edl = [
      { timestamp: 0, audios: [{ filename: file, timestamp: 1000, original_duration: 50_000 }] },
      { timestamp: 3000, audios: [] },
    ]

    output = render(edl)

    assert_operator(mean_volume(output, 'atrim=0:0.9,'), :<, -60)
    assert_operator(mean_volume(output, 'atrim=1.2:1.3,'), :>, -40)
  end

  # Stretched, the file covers its whole original duration, so a cut after
  # the end of the file's own audio must not be removed as a gap.
  def test_render_speed_adjusted_cut_past_the_file_audio
    file = "#{@dir}/voice.wav"
    assert(system('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=48:sample_rate=48000',
                  '-c:a', 'pcm_s16le', file))
    edl = [
      { timestamp: 0, audios: [{ filename: file, timestamp: 48_500, original_duration: 50_000 }] },
      { timestamp: 1000, audios: [] },
    ]

    output = render(edl)

    assert_operator(mean_volume(output), :>, -40)
  end

  # Stretching would close up the gap and play the audio after it too early,
  # so a file with a timestamp gap keeps its own timing.
  def test_render_does_not_stretch_a_file_with_timestamp_gaps
    file = "#{@dir}/voice.webm"
    assert(system('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono:d=10',
                  '-f', 'lavfi', '-i', 'sine=frequency=440:duration=33:sample_rate=48000',
                  '-filter_complex', '[1]asetpts=PTS+15/TB[b];[0][b]concat=n=2:v=0:a=1', '-c:a', 'libvorbis', file))
    edl = [
      { timestamp: 0, audios: [{ filename: file, timestamp: 12_000, original_duration: 61_000 }] },
      { timestamp: 1000, audios: [] },
    ]

    output = render(edl)

    assert_operator(mean_volume(output), :<, -60)
  end

  # A gap of half a second is enough to keep the file at its own timing. The
  # tone starts after 30 s of silence and the gap; stretched, it would start
  # about a second late.
  def test_render_does_not_stretch_a_file_with_a_short_timestamp_gap
    file = "#{@dir}/voice.webm"
    assert(system('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono:d=30',
                  '-f', 'lavfi', '-i', 'sine=frequency=440:duration=15:sample_rate=48000',
                  '-filter_complex', '[1]asetpts=PTS+0.5/TB[b];[0][b]concat=n=2:v=0:a=1', '-c:a', 'libvorbis', file))
    edl = [
      { timestamp: 0, audios: [{ filename: file, timestamp: 30_700, original_duration: 47_600 }] },
      { timestamp: 600, audios: [] },
    ]

    output = render(edl)

    assert_operator(mean_volume(output), :>, -40)
  end

  # FreeSWITCH records opus. Overloaded, it drops frames, and files can miss
  # more than 10% of the time they cover.
  def test_render_opus_file_missing_frames
    file = "#{@dir}/voice.opus"
    assert(system('ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=44:sample_rate=48000',
                  '-c:a', 'libopus', file))
    edl = [
      { timestamp: 0, audios: [{ filename: file, timestamp: 45_000, original_duration: 50_000 }] },
      { timestamp: 1000, audios: [] },
    ]

    output = render(edl)

    assert_operator(mean_volume(output), :>, -40)
  end

  private

  # Render with the default settings, whatever the host's recording.yml says
  def render(edl)
    BigBlueButton.stub(:read_props, {}) { BigBlueButton::EDL::Audio.render(edl, "#{@dir}/out") }
  end

  def mean_volume(file, filter = '')
    out = IO.popen(['ffmpeg', '-nostats', '-i', file, '-af', "#{filter}volumedetect", '-f', 'null', '-'],
                   err: %i[child out], &:read)
    Float(out[/mean_volume: (-?[\d.]+) dB/, 1])
  end
end

class TestEDLAudioSpeedAdjustment < Minitest::Test
  # Recording events and the file they started differ by a fraction of a second
  def test_speed_adjustment_ignores_differences_under_2_s
    assert_equal(1.0, speed(info('wav', 'pcm_s16le', 179_200, 180_000), 0.2))
  end

  def test_speed_adjustment_stretches_a_short_file
    assert_in_delta(0.98, speed(info('wav', 'pcm_s16le', 176_400, 180_000), 0.2), 1e-9)
  end

  def test_speed_adjustment_stretches_freeswitch_opus
    assert_in_delta(0.88, speed(info('ogg', 'opus', 158_400, 180_000), 0.2), 1e-9)
  end

  def test_speed_adjustment_respects_the_limit
    assert_equal(1.0, speed(info('ogg', 'opus', 158_400, 180_000), 0.1))
    assert_equal(1.0, speed(info('ogg', 'opus', 176_400, 180_000), 0))
  end

  # atempo cannot play slower than half speed, whatever the configured limit
  def test_speed_adjustment_never_goes_below_half_speed
    assert_in_delta(0.6, speed(info('ogg', 'opus', 108_000, 180_000), 0.9), 1e-9)
    assert_equal(1.0, speed(info('ogg', 'opus', 72_000, 180_000), 0.9))
  end

  # Screen share audio is opus in webm, not a FreeSWITCH voice recording
  def test_speed_adjustment_leaves_webm_alone
    assert_equal(1.0, speed(info('matroska,webm', 'opus', 176_400, 180_000), 0.2))
  end

  private

  def speed(info, max_mismatch)
    BigBlueButton::EDL::Audio.speed_adjustment(info, max_mismatch)
  end

  def info(format_name, codec_name, duration, original_duration)
    {
      format: { format_name: format_name },
      audio: { codec_name: codec_name },
      duration: duration,
      original_duration: original_duration,
    }
  end
end
