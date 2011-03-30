class Output
    def messages
        @messages ||= []
    end
    
    def info(message)
        messages << message
    end

    def error(message)
        messages << message
    end    
end

def output
    @output ||= Output.new
end

Given /^the meeting has ended$/ do
    @audioArchiver = Collector::Audio.new(output)
end

Given /^the audio has been recorded$/ do
    @audioArchiver.location_exist? '/var/freeswitch/meetings'
end

When /^the audio is archived$/ do
    @audioArchiver.archive_audio_recording 'cda73e7e-8f71-4906-8e74-cbdc66a5e97f', '/var/freeswitch/meetings', '/var/freeswitch/archive'
end

Then /^I should see the audio files in the archive$/ do
    @audioArchiver.confirm_audio_has_been_archived(:meeting_id, :destination)
end

Then /^I should not see the audio files from where it was recorded$/ do
    @audioArchiver.confirm_that_there_is_no_more_recording_fom_original_location(:meeting_id, :source)
end

Then /^it should report success$/ do
  pending # express the regexp above with the code you wish you had
end

