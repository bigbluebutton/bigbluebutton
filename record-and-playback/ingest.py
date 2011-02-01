from lxml import etree
import subprocess
import logging
import os

logfile = 'ingest.log'
logging.basicConfig(level=logging.INFO, filename=logfile)
logging.info('Starting ingest process')

audio_sampling_rate = 16000
src_dir = 'workspace'
audio_recordings = []

class AudioRecording:
    filename = None
    start_event_timestamp = None
    start_timestamp = None
    stop_timestamp = None
    stop_event_timestamp = None
    length_from_file = None
    gap_file = False
    position = 0
    length_of_gap = 0

def add_audio_recording(start_timestamp, stop_timestamp, is_gap, length_of_gap):
    audio_gap = AudioRecording()
    audio_gap.start_event_timestamp = long(start_timestamp)
    audio_gap.stop_event_timestamp = long(stop_timestamp)
    audio_gap.gap_file = is_gap
    audio_gap.length_of_gap = length_of_gap
    audio_gap.filename = 'gap-' + str(length_of_gap)
    audio_recordings.append(audio_gap)
    
def create_audio_gap_file(length_in_msec, filename, sampling_rate):
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
    proc = subprocess.Popen("sox " + filename + ".dat -b 16 -r 16000 -c 1 -s " + filename + ".wav", shell=True)
    # Wait for the process to finish before removing the temp file
    proc.wait()
    os.remove(filename + ".dat")
    
logging.info('Loading workspace/events.xml')
tree = etree.parse('workspace/event.xml')
r = tree.xpath('/events/event')

logging.info('Determining start and stop timestamp for session')
# Get the first event of the session
begin = r[0].get('timestamp')
# Get the last event of the session
end = r[len(r)-1].get('timestamp')
# Determine the length of the session  
length = long(end) - long(begin)  

logging.info('Count how many audio files')
# Count how many wave files
proc = subprocess.Popen('ls workspace/audio/*.wav | wc -l', shell=True, stdout=subprocess.PIPE)
num_files = proc.communicate()[0]

# Store a list of the audio recordings    
audio_recs = []    
# A dictionary of the audio recording with filename as key.
# This will be used to access the audio recording to update the stop
# recording timestamp.
audio_recs_dict = {}

# Get the start recording events    
start_rec_events = tree.xpath("//event[@name='StartRecordingEvent']")
for evt in start_rec_events:
    e = AudioRecording()
    e.filename = evt.find('filename').text
    e.start_timestamp = evt.find('recordingTimestamp').text
    e.start_event_timestamp = evt.get('timestamp')
    audio_recs.append(e)
    audio_recs_dict[e.filename] = e
    
# Get the stop recording events     
stop_rec_events = tree.xpath("//event[@name='StopRecordingEvent']")
num_stop_rec = len(stop_rec_events)
print num_stop_rec
for evt in stop_rec_events:
    rec = audio_recs_dict[evt.find('filename').text]
    rec.stop_timestamp = evt.find('recordingTimestamp').text
    rec.stop_event_timestamp = evt.get('timestamp')
        

# Determine if we need to pad the beginning of the audio
length_of_gap = long(audio_recs[0].start_event_timestamp) - long(begin)
print "l gap " + str(length_of_gap)
if (length_of_gap > 0):
    add_audio_recording(long(begin), long(audio_recs[0].start_event_timestamp), True, length_of_gap)

# Now go through all the recorded audio files and fill in the gaps in between them.    
num_audio_recs = len(audio_recs)
i = 0
while i < num_audio_recs-1:
    ar_prev = audio_recs[i]
    ar_next = audio_recs[i+1]
    length_of_gap = long(ar_next.start_event_timestamp) - long(ar_prev.stop_event_timestamp)
    audio_recordings.append(ar_prev)
    if (length_of_gap > 0):
        print "l gap " + str(length_of_gap)     
        add_audio_recording(long(ar_prev.stop_event_timestamp), long(ar_next.start_event_timestamp), True, length_of_gap)      
    i += 1

# Determine if we need the end of the audio file.
length_of_gap = long(end) - long(audio_recs[-1].stop_event_timestamp)
print "l gap " + str(length_of_gap)
audio_recordings.append(audio_recs[-1])
if (length_of_gap > 0):    
    add_audio_recording(long(audio_recs[-1].stop_event_timestamp), long(end), True, length_of_gap)  
    
print len(audio_recordings)

audio_filenames = []
# Now we got all the audio information we need. We will create the files for the audio gaps.
for ar in audio_recordings:    
    if (ar.gap_file):
        audio_filenames.append((ar.filename + ".wav"))
        lsec = long(ar.length_of_gap)
        print "gap = " + str(lsec)
        create_audio_gap_file(lsec, ar.filename, audio_sampling_rate)
    else:
        audio_filenames.append(ar.filename)

concat_cmd = 'sox '
for ar in audio_filenames:
    concat_cmd += " " + ar
    
concat_cmd += " recording.wav"

proc = subprocess.Popen(concat_cmd, shell=True)
# Wait for the process to finish before removing the temp file
proc.wait()    
    
    
#proc = subprocess.Popen(['./b.sh'], 
#proc = subprocess.Popen(['echo', '"to stdout"'], 
#proc = subprocess.Popen(['sox', "workspace/audio/370de0e4-1cdd-4852-858b-b326a55db4d4-20110126-115112.wav", "-n", "stat"], 
#                stdout=subprocess.PIPE).communicate()[0]
#stdout_value = proc.communicate()[0]
#print '\tstdout:', repr(proc)

#proc = subprocess.Popen(['echo', '"to stdout"'], 

#p = Process('sox workspace/audio/370de0e4-1cdd-4852-858b-b326a55db4d4-20110126-115112.wav -n stat') | Process("wc -w")
#print p.stdout

    
    

