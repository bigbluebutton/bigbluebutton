module BigBlueButton
  class AudioProcessor
    def process
      gen = Generator::AudioEvents.new(events_xml)
      first_event_timestamp = gen.first_event_timestamp
    end
  end
end