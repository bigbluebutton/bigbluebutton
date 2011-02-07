from lxml import etree
import logging, os, getopt, sys, subprocess, re

logFile = 'process-audio.log'
audioSamplingRate = 16000
AUDIO_DIR = "audio"
AUDIO_RECORDING_WAV = "recording.wav"
AUDIO_RECORDING_OGG = "recording.ogg"

audio_recordings = []
    
def usage():
    print ' -------------------------------------------------------------------------'
    print ' '
    print ' Ingest and process BigBlueButton Recordings'
    print ' '
    print ' Usage:'
    print ' archive.py -m test123 -a /var/freeswitch/meetings -p /var/bigbluebutton -r /var/bigbluebutton/archive'
    print ' '
    print ' h, --help                   Print this'
    print ' m, --meeting-id             The id of the meeting'
    print ' a, --audio-dir              The location of the audio recording'
    print ' p, --presentation-dir       The location of the presentations'
    print ' r, --archive-dir            The directory where the audio and presentation will be archived'
    print ' -------------------------------------------------------------------------'

def printUsageHelp():
    usage()
    sys.exit(2)    

class AudioRecording:
    filename = None
    fileFound = False
    startEventTimestamp = 0
    startTimestamp = 0
    stopTimestamp = 0
    stopEventTimestamp = 0
    lengthFromFile = 0
    gapFile = False
    position = 0
    lengthOfGap = 0

def create_audio_gap_recording(startTimestamp, stopTimestamp, isGap, lengthOfGap):
    '''
        
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
    return events[0].get('timestamp')

def get_last_timestamp_of_session(events):
    return events[len(events)-1].get('timestamp')

def get_start_audio_recording_events(tree):
    return tree.xpath("//event[@name='StartRecordingEvent']")

def get_stop_audio_recording_events(tree):
    return tree.xpath("//event[@name='StopRecordingEvent']")

def create_audio_recording_for_event(event):
    ar = AudioRecording()
    ar.filename = evt.find('filename').text
    ar.startTimestamp = evt.find('recordingTimestamp').text
    ar.startEventTimestamp = evt.get('timestamp')
    return ar
    
def create_audio_recordings_for_events(startRecEvents):
    audioRecordings = []    
    for evt in startRecEvents:        
        audioRecordings.append(create_audio_recording_for_event(evt))
        
    return audioRecordings

def insert_stop_event_info(evt, audioRecordings): 
    for rec in audioRecordings:
        if (rec.filename == evt.find('filename').text):
            rec.stopTimestamp = evt.find('recordingTimestamp').text
            rec.stopEventTimestamp = evt.get('timestamp')
            return True

    return False
    
def pad_beginning_of_audio_if_needed(audioRecording, firstEventTimestamp, meetingAudio):            
    lengthOfGap = long(audioRecording.startEventTimestamp) - long(firstEventTimestamp)
    if (lengthOfGap > 0):
        audioGap = create_audio_gap_recording(long(firstEventTimestamp), long(audioRecording.startEventTimestamp), True, lengthOfGap)
        meetingAudio.append(audioGap)
        
def pad_between_recorded_audio_files_if_needed(audioRecordings, meetingAudio):          
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
    lengthOfGap = long(lastEventTimestamp) - long(audioRecording.stopEventTimestamp)
    meetingAudio.append(audioRecording)
    if (lengthOfGap > 0):    
        audioGap = create_audio_gap_recording(long(audioRecording.stopEventTimestamp), long(lastEventTimestamp), True, lengthOfGap) 
        meetingAudio.append(audioGap)

def create_gap_audio_files(meetingArchiveDir, audioRecordings, audioSamplingRate):
    for ar in audioRecordings:    
        if (ar.gapFile):
            ar.filename = meetingArchiveDir + "/audio/" + ar.filename
            lsec = long(ar.lengthOfGap)
            create_audio_gap_file(lsec, ar.filename, audioSamplingRate)

def get_audio_filenames(audioRecordings):
    audioFilenames = []
    for ar in audioRecordings:    
        audioFilenames.append(ar.filename)
    
    return audioFilenames

def concatenate_all_audio_files(meetingArchiveDir, audioFilenames):
    concatCmd = 'sox '
    for ar in audioFilenames:
        concatCmd += " " + ar
    
    outputWavFile = meetingArchiveDir + "/" + AUDIO_RECORDING_WAV
    concatCmd += " " + outputWavFile
    logging.info("Creating recorded audio file")
    print "Concat " + concatCmd
    
    proc = subprocess.Popen(concatCmd, shell=True)
    # Wait for the process to finish before removing the temp file
    proc.wait()
    
    return outputWavFile

def create_ogg_from_wav(meetingArchiveDir, outputWavFile):
    ogg_file = meetingArchiveDir + '/' + AUDIO_RECORDING_OGG
    logging.info("Convert wav file to ogg")
    proc = subprocess.Popen('oggenc -a "Budka Suflera" -l "Za Ostatni Grosz" -N 1 -t "Za Ostatni Grosz" -d "1981-05-01" -c "composer=Romuald Lipko, Marek Dutkiewicz" -o ' 
            + ogg_file + " " + outputWavFile, shell=True)
    proc.wait() 

def determine_if_file_is_present(audioFileDir, audioRecordings):
    audioFileList = os.listdir(audioFileDir)
    for ar in audioRecordings:
        ar.filename = ar.filename.split('/')[-1]
        ar.fileFound = True
        
def determine_length_of_audio_from_file(audioFileDir, audioRecordings):
    audioFileList = os.listdir(audioFileDir)
    for ar in audioRecordings:
        print "Determining length of " + audioFileDir + "/" + ar.filename
        if ar.fileFound:            
            proc = subprocess.Popen('sox ' + audioFileDir + "/" + ar.filename + ' -n stat 2>&1', shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            proc.wait()
            result = proc.stdout.read()
            rc = proc.wait()
            if rc == 0:
                regex = re.compile("Length \(seconds\):(.+)")
                length = float(regex.findall(result)[0].strip()) * 1000
                ar.lengthFromFile = int(length)
                print ar.lengthFromFile
        
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
    
    if (len(startRecordingEvents) == len(stopRecordingEvents)):
        logging.warn("Number of start events [%s] does not match stop events [%s]" % (len(startRecordingEvents), len(stopRecordingEvents)))
        print("Number of start events [%s] does not match stop events [%s]" % (len(startRecordingEvents), len(stopRecordingEvents)))
    
    for evt in startRecordingEvents:
        ar = AudioRecording()
        ar.filename = evt.find('filename').text
        ar.startTimestamp = evt.find('recordingTimestamp').text
        ar.startEventTimestamp = evt.get('timestamp')
        audioRecordings.append(ar)
        
    for evt in stopRecordingEvents:
        if (not insert_stop_event_info(evt, audioRecordings)):
            # Oohh, we got more work to do. This means that a stop event doesn't have a matching start event.
            # Create an audio recording and let's figure out the start timestamp later
            ar = AudioRecording()
            ar.filename = evt.find('filename').text
            ar.stopTimestamp = evt.find('recordingTimestamp').text
            ar.stopEventTimestamp = evt.get('timestamp')
            audioRecordings.append(ar)

    determine_if_file_is_present(meetingArchiveDir + "/" + AUDIO_DIR, audioRecordings)
    determine_length_of_audio_from_file(meetingArchiveDir + "/" + AUDIO_DIR, audioRecordings)
    

               
#    pad_beginning_of_audio_if_needed(audioRecordings[0], firstEventTimestamp, meetingAudio)
#    pad_between_recorded_audio_files_if_needed(audioRecordings, meetingAudio)
#    pad_end_of_audio_if_needed(audioRecordings[-1], lastEventTimestamp, meetingAudio)
    
#    create_gap_audio_files(meetingArchiveDir, meetingAudio, audioSamplingRate)    
#    audio_filenames = get_audio_filenames(meetingAudio)

#    outputWavFile = concatenate_all_audio_files(meetingArchiveDir, audio_filenames)    
#    create_ogg_from_wav(meetingArchiveDir, outputWavFile)     
                
if __name__ == "__main__":
    main()
    

