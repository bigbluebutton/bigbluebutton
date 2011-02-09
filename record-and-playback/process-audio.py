from lxml.builder import E
from lxml import etree
import logging, os, getopt, sys, subprocess, re

LOGFILE = 'process-audio.log'
audioSamplingRate = 16000
AUDIO_DIR = "audio"
AUDIO_RECORDING_WAV = "recording.wav"
AUDIO_RECORDING_OGG = "recording.ogg"

audio_recordings = []
    
def usage():
    print ' -------------------------------------------------------------------------'
    print ' '
    print ' Create an audio file in ogg format by combining all audio recordings and '
    print ' filling the gaps between recordings with silence '
    print ' '
    print ' Usage:'
    print ' process-audio.py -m [meetingid] -a [audio-recording-directory] -p [presentation directory] -r [archive directory]'
    print ' '
    print ' h, --help                   Print this'
    print ' m, --meeting-id             The id of the meeting'
    print ' a, --audio-dir              The location of the audio recording (e.g. /var/freeswitch/meetings)'
    print ' p, --presentation-dir       The location of the presentations (e.g. /var/bigbluebutton/'
    print ' r, --archive-dir            The directory where the audio and presentation will be archived'
    print ' -------------------------------------------------------------------------'

def printUsageHelp():
    usage()
    sys.exit(2)    

class AudioRecording:
    filename = None
    fileFound = False
    startEventTimestamp = 0
    startRecordingTimestamp = 0
    stopRecordingTimestamp = 0
    stopEventTimestamp = 0
    lengthFromFile = 0
    gapFile = False
    position = 0
    lengthOfGap = 0

def create_audio_gap_recording(startTimestamp, stopTimestamp, isGap, lengthOfGap):
    '''
        Create information for a gap in the audio recording.
        startTimestamp:         The start of the event
        stopTimestamp:          The end of the event
        isGap:                  If the audio is a gap filler
        lengthOfGap:            How long is the audio
    '''
    audioGap = AudioRecording()
    audioGap.startEventTimestamp = long(startTimestamp)
    audioGap.stopEventTimestamp = long(stopTimestamp)
    audioGap.gapFile = isGap
    audioGap.lengthOfGap = lengthOfGap    
    audioGap.filename = 'gap-' + str(lengthOfGap) + ".wav"
    return audioGap
    
def create_audio_gap_file(length_in_msec, filename, sampling_rate):
    '''
        Creates a raw audio file
        length_in_msec:     The length of the audio in milliseconds
        filename:           The absolute filename of the audio resulting .wav file
        sampling_rate:      The sampling rate of the audio (e.g. 16000)
    '''
    
    rate_in_ms = sampling_rate / 1000
    f = open(filename + '.dat', "wb")
    samples = length_in_msec * rate_in_ms
    # Write the sample rate for this audio file.
    f.write('; SampleRate ' + str(sampling_rate) + '\n')
    x = 0
    while x <= samples: 
        f.write(str(x / rate_in_ms) + "\t0\n");
        x += 1
    f.close();
    proc = subprocess.Popen("sox " + filename + ".dat -b 16 -r 16000 -c 1 -s " + filename, shell=True)
    # Wait for the process to finish before removing the temp file
    proc.wait()
    # Delete the temporary raw audio file
    os.remove(filename + ".dat")

def get_first_timestamp_of_session(events): 
    '''
        Get the timestamp of the first event.
        events:     List of events of the meeting
    '''
    return events[0].get('timestamp')

def get_last_timestamp_of_session(events):
    '''
        Get the timestamp of the last event.
        events:     List of events of the meeting
    '''
    return events[len(events)-1].get('timestamp')

def get_start_audio_recording_events(tree):
    '''
        Retrieve all the start audio recording events.
        tree:       The xml tree of all events.
    '''
    return tree.xpath("//event[@name='StartRecordingEvent']")

def get_stop_audio_recording_events(tree):
    '''
        Retrieve all the stop audio recording events.
        tree:       The xml tree of all events.
    '''
    return tree.xpath("//event[@name='StopRecordingEvent']")

def create_audio_recording_for_event(event):
    ar = AudioRecording()
    ar.filename = evt.find('filename').text
    ar.startRecordingTimestamp = evt.find('recordingTimestamp').text
    ar.startEventTimestamp = evt.get('timestamp')
    return ar
    
def create_audio_recordings_for_events(startRecEvents):
    '''
        Create an audio recording event for start audio events.
    '''
    audioRecordings = []    
    for evt in startRecEvents:        
        audioRecordings.append(create_audio_recording_for_event(evt))
        
    return audioRecordings

def insert_stop_event_info(evt, audioRecordings): 
    '''
        Store a stop event information.
    '''
    for rec in audioRecordings:
        if (rec.filename == evt.find('filename').text):
            rec.stopRecordingTimestamp = int(evt.find('recordingTimestamp').text) / 1000
            rec.stopEventTimestamp = evt.get('timestamp')
            return True

    return False
    
def pad_beginning_of_audio_if_needed(audioRecording, firstEventTimestamp, meetingAudio):    
    '''
        Pad the beginning of the audio to start at the first event timestamp.
    '''
    lengthOfGap = long(audioRecording.startEventTimestamp) - long(firstEventTimestamp)
    if (lengthOfGap > 0):
        audioGap = create_audio_gap_recording(long(firstEventTimestamp), long(audioRecording.startEventTimestamp), True, lengthOfGap)
        meetingAudio.append(audioGap)
        
def pad_between_recorded_audio_files_if_needed(audioRecordings, meetingAudio):    
    '''
        Pad the audio in between audio recordings.
    '''
    numAudioRecs = len(audioRecordings)
    i = 0
    while i < numAudioRecs-1:
        arPrev = audioRecordings[i]
        arNext = audioRecordings[i+1]
        lengthOfGap = long(arNext.startEventTimestamp) - long(arPrev.stopEventTimestamp)
        meetingAudio.append(arPrev)
        if (lengthOfGap > 0):   
            audioGap = create_audio_gap_recording(long(arPrev.stopEventTimestamp), long(arNext.startEventTimestamp), True, lengthOfGap)      
            meetingAudio.append(audioGap)
        i += 1

def pad_end_of_audio_if_needed(audioRecording, lastEventTimestamp, meetingAudio):
    '''
        Pad the audio to end at the same time as the last event timestamp.
    '''
    lengthOfGap = long(lastEventTimestamp) - long(audioRecording.stopEventTimestamp)
    meetingAudio.append(audioRecording)
    if (lengthOfGap > 0):    
        audioGap = create_audio_gap_recording(long(audioRecording.stopEventTimestamp), long(lastEventTimestamp), True, lengthOfGap) 
        meetingAudio.append(audioGap)

def create_gap_audio_files(meetingArchiveDir, audioRecordings, audioSamplingRate):
    '''
        Create an audio of silence to fill in the gaps between recordings.
    '''
    for ar in audioRecordings:    
        if (ar.gapFile):
            ar.filename = meetingArchiveDir + "/audio/" + ar.filename
            lsec = long(ar.lengthOfGap)
            create_audio_gap_file(lsec, ar.filename, audioSamplingRate)

def get_audio_filenames(audioRecordings):
    '''
        Get the filnames of all audio files.
    '''
    audioFilenames = []
    for ar in audioRecordings:    
        audioFilenames.append(ar.filename)
    
    return audioFilenames

def concatenate_all_audio_files(meetingArchiveDir, audioFilenames):
    '''
        Concatenate all audio files, including gaps, to create one audio recording file.
    '''
    concatCmd = 'sox '
    for ar in audioFilenames:
        concatCmd += " " + ar
    
    outputWavFile = meetingArchiveDir + "/" + AUDIO_RECORDING_WAV
    concatCmd += " " + outputWavFile
    logging.info("Creating recorded audio file")

    proc = subprocess.Popen(concatCmd, shell=True)
    # Wait for the process to finish before removing the temp file
    proc.wait()
    
    return outputWavFile

def create_ogg_from_wav(meetingArchiveDir, outputWavFile):
    '''
        Create an ogg file of the audio recording.
    '''
    ogg_file = meetingArchiveDir + '/' + AUDIO_RECORDING_OGG
    logging.info("Convert wav file to ogg")
    proc = subprocess.Popen('oggenc -a "Budka Suflera" -l "Za Ostatni Grosz" -N 1 -t "Za Ostatni Grosz" -d "1981-05-01" -c "composer=Romuald Lipko, Marek Dutkiewicz" -o ' 
            + ogg_file + " " + outputWavFile, shell=True)
    proc.wait() 

def determine_if_file_is_present(audioFileDir, audioRecordings):
    '''
        Check if the audio file is in the archive directory.
    '''
    audioFileList = os.listdir(audioFileDir)
    for ar in audioRecordings:
        # Strip the filename and pre-pend the audio archive dir
        ar.filename = audioFileDir + '/' + ar.filename.split('/')[-1]
        ar.fileFound = True
        
def determine_length_of_audio_from_file(audioFileDir, audioRecordings):
    '''
        Get the length of audio from the file.
    '''
    audioFileList = os.listdir(audioFileDir)
    for ar in audioRecordings:
        if ar.fileFound:            
            # Need to use 2>&1 for the output redirected to stdout.
            proc = subprocess.Popen('sox ' + ar.filename + ' -n stat 2>&1', shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            # Wait for the process to finish
            retCode = proc.wait()
            # Read the output of the process
            result = proc.stdout.read()            
            if retCode == 0:
                # Everything went well, output should be in the following format. We need to get the Length (seconds) value
                #'''
                #    Samples read:            888960
                #    Length (seconds):     55.560000
                #    Scaled by:         2147483647.0
                #    Maximum amplitude:     0.822937
                #    Minimum amplitude:    -0.707764
                #    Midline amplitude:     0.057587
                #    Mean    norm:          0.026014
                #    Mean    amplitude:    -0.000059
                #    RMS     amplitude:     0.040610
                #    Maximum delta:         0.330719
                #    Minimum delta:         0.000000
                #    Mean    delta:         0.003805
                #    RMS     delta:         0.008049
                #    Rough   frequency:          504
                #    Volume adjustment:        1.215
                #'''
                regex = re.compile("Length \(seconds\):(.+)")
                # convert to milliseconds
                length = float(regex.findall(result)[0].strip()) * 1000
                # round it off to an integer
                ar.lengthFromFile = int(length)
            else:
                # Failed to get the length of the audio from the file
                ar.lengthFromFile = int(-1)
                
def generate_recording_xml(audioDir, audioRecordings):
    '''
        Generates an xml file of information about the audio recordings.
    '''
    xml = page = (
        E.recordings(
            E.title("Available audio recordings for meeting.")
        )
    )

    for ar in audioRecordings:
        ev = E.recording(
            E.filename(ar.filename), 
            E.fileFound(str(ar.fileFound)),
            E.startEventTimestamp(str(ar.startEventTimestamp)),
            E.startRecordingTimestamp(str(ar.startRecordingTimestamp)),
            E.stopRecordingTimestamp(str(ar.stopRecordingTimestamp)),
            E.stopEventTimestamp(str(ar.stopEventTimestamp)),
            E.lengthFromFile(str(ar.lengthFromFile))
        )            
        page.append(ev)
                    
    targetFile = audioDir + "/recordings.xml"
    f = open(targetFile, 'w')
    f.write(etree.tostring(page, pretty_print=True))
    f.close()    

def sanitize_audio_recording_info(audioRecordings):
    '''
        Try as much as possible to put values on the timestamp fields.
    '''
    for ar in audioRecordings:
        if (ar.startRecordingTimestamp == 0 and ar.startEventTimestamp > 0):
            ar.startRecordingTimestamp = ar.startEventTimestamp
        if (ar.startRecordingTimestamp > 0 and ar.startEventTimestamp == 0):
            ar.startEventTimestamp = ar.startRecordingTimestamp
            
        if (ar.stopRecordingTimestamp == 0 and ar.stopEventTimestamp > 0):
            ar.stopRecordingTimestamp = ar.stopEventTimestamp
        if (ar.stopRecordingTimestamp > 0 and ar.stopEventTimestamp == 0):
            ar.stopEventTimestamp = ar.stopRecordingTimestamp
            
        if (ar.startRecordingTimestamp == 0 and ar.startEventTimestamp == 0):
            if (ar.fileFound and ar.stopEventTimestamp > 0):
                ar.startRecordingTimestamp = ar.startEventTimestamp = ar.stopEventTimestamp - ar.lengthFromFile
        
        if (ar.stopRecordingTimestamp == 0 and ar.stopEventTimestamp == 0):
            if (ar.fileFound and ar.startEventTimestamp > 0):
                ar.stopRecordingTimestamp = ar.stopEventTimestamp = ar.startEventTimestamp + ar.lengthFromFile
    
def main():
    meetingId = ""
    archiveDir = ""
    logFile = ""
    
    # Get all the passed in options
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hm:a:l", ["help", "meeting-id=", "archive-dir="])
    except getopt.GetoptError, err:
        # print help information and exit:
        print str(err) # will print something like "option -a not recognized"
        usage()
        sys.exit(2)
    output = None
    verbose = False
    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit()
        elif o in ("-m", "--meeting-id"):
            meetingId = a
        elif o in ("-a", "--archive-dir"):
            archiveDir = a
        else:
            assert False, "unhandled option"
    
    meetingArchiveDir = archiveDir + "/" + meetingId
    audioArchiveDir = meetingArchiveDir + "/" + AUDIO_DIR
    
    logFile = meetingArchiveDir + "/process-audio.log"
    logging.basicConfig(level=logging.INFO, filename=logFile)
    logging.info('Starting ingest process')

    audioRecordings = []    
    meetingAudio = []
    
    tree = etree.parse(meetingArchiveDir + '/events.xml')
    r = tree.xpath('/events/event')

    firstEventTimestamp = get_first_timestamp_of_session(r)
    lastEventTimestamp = get_last_timestamp_of_session(r)

    startRecordingEvents = get_start_audio_recording_events(tree)          
    stopRecordingEvents = get_stop_audio_recording_events(tree)
    
    if (len(startRecordingEvents) != len(stopRecordingEvents)):
        logging.warn("Number of start events [%s] does not match stop events [%s]" % (len(startRecordingEvents), len(stopRecordingEvents)))        
    
    for evt in startRecordingEvents:
        ar = AudioRecording()
        ar.filename = evt.find('filename').text
        ar.startRecordingTimestamp = int(evt.find('recordingTimestamp').text) / 1000
        ar.startEventTimestamp = evt.get('timestamp')
        audioRecordings.append(ar)
        
    for evt in stopRecordingEvents:
        if (not insert_stop_event_info(evt, audioRecordings)):
            # Oohh, we got more work to do. This means that a stop event doesn't have a matching start event.
            # Create an audio recording and let's figure out the start timestamp later
            ar = AudioRecording()
            ar.filename = evt.find('filename').text
            ar.stopRecordingTimestamp = int(evt.find('recordingTimestamp').text) / 1000
            ar.stopEventTimestamp = evt.get('timestamp')
            audioRecordings.append(ar)

    # Check if the audio files listed in the events are actually in the audio directory
    determine_if_file_is_present(audioArchiveDir, audioRecordings)
    # Let's figure out the length of the audio from the file. This allows us to guess what the
    # start/stop timestamps of the events in case we don't have it.
    determine_length_of_audio_from_file(audioArchiveDir, audioRecordings)
    # Let's try and put valid values into the different information we need to process the audio files.
    sanitize_audio_recording_info(audioRecordings)    
    # Save the information into a file. This way if something goes wrong, an admin can take a look at
    # the information and figure out why something did not work out.
    generate_recording_xml(audioArchiveDir, audioRecordings)    
    
    # Now, start processing the audio. See if we need to pad the recorded audio files from the beginning.
    pad_beginning_of_audio_if_needed(audioRecordings[0], firstEventTimestamp, meetingAudio)
    # Determine if we need to pad the audio with silence in between recorded audio files.
    pad_between_recorded_audio_files_if_needed(audioRecordings, meetingAudio)
    # Determine if we need to pad the end the of the recording to match the last event timestamp.
    pad_end_of_audio_if_needed(audioRecordings[-1], lastEventTimestamp, meetingAudio)  
    # We've not figured out which parts of the recording we need to pad. Create the pad audio files.
    create_gap_audio_files(meetingArchiveDir, meetingAudio, audioSamplingRate)    
    # Let's get all the filenames of the audio files including the gap files.
    audio_filenames = get_audio_filenames(meetingAudio)
    # Create one audio file by combining all the audio files.
    outputWavFile = concatenate_all_audio_files(meetingArchiveDir, audio_filenames)    
    # Convert the wav file into ogg format to be playable in the browser.
    create_ogg_from_wav(meetingArchiveDir, outputWavFile)     
                
if __name__ == "__main__":
    main()
    

