# frozen_string_literal: true

require 'minitest/autorun'
require 'nokogiri'

require 'recordandplayback'

class TestAudioEvents < Minitest::Test
  def test_last_voice_file_without_stop_runs_to_the_end
    edl = audio_edl(
      event(1000, 'PARTICIPANT', 'ParticipantJoinEvent'),
      event(2000, 'VOICE', 'StartRecordingEvent', 'a.opus'),
      event(9000, 'VOICE', 'StartRecordingEvent', 'b.opus'),
      event(9500, 'VOICE', 'StopRecordingEvent', 'a.opus'),
      event(20_000, 'PARTICIPANT', 'EndAndKickAllEvent')
    )

    assert_equal({ 'a.opus' => 7500, 'b.opus' => 11_000 }, original_durations(edl))
  end

  # A file left without a stop event because the recording was restarted has no known end
  def test_earlier_voice_file_without_stop_has_no_duration
    edl = audio_edl(
      event(1000, 'VOICE', 'StartRecordingEvent', 'a.opus'),
      event(5000, 'VOICE', 'StartRecordingEvent', 'b.opus'),
      event(9000, 'PARTICIPANT', 'EndAndKickAllEvent')
    )

    assert_equal({ 'a.opus' => nil, 'b.opus' => 4000 }, original_durations(edl))
  end

  def test_audio_track_without_unpublish_has_no_duration
    edl = audio_edl(
      event(1000, 'VOICE', 'StartRecordingEvent', 'a.opus'),
      event(2000, 'VOICE', 'StopRecordingEvent', 'a.opus'),
      event(3000, 'bbb-webrtc-sfu', 'AudioTrackPublishedEvent', 'track.webm'),
      event(9000, 'PARTICIPANT', 'EndAndKickAllEvent')
    )

    assert_equal({ 'a.opus' => 1000, 'track.webm' => nil }, original_durations(edl))
  end

  private

  def event(timestamp, mod, name, filename = nil)
    file = filename ? "<filename>/var/freeswitch/meetings/#{filename}</filename>" : ''
    %(<event timestamp="#{timestamp}" module="#{mod}" eventname="#{name}">#{file}</event>)
  end

  def audio_edl(*events)
    BigBlueButton::AudioEvents.create_audio_edl(Nokogiri::XML("<recording>#{events.join}</recording>"), '/raw')
  end

  def original_durations(edl)
    edl.flat_map { |entry| entry[:audios] }.to_h { |audio| [File.basename(audio[:filename]), audio[:original_duration]] }
  end
end
