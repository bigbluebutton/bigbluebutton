from lxml import etree
import subprocess

class AudioRecEvents:
    filename = None
    start_event_timestamp = None
    start_timestamp = None
    stop_timestamp = None
    stop_event_timestamp = None
    length_from_file = None
    
def create_audio_gap_file(length_in_sec, filename):
    f = open(filename + '.dat', "wb")
    samples = length_in_sec * 16000
    # Write the sample rate for this audio file.
    f.write('; SampleRate 16000\n')
    x = 0
    while x <= samples: 
        f.write(str(x / 16000) + "\t0\n");
        x += 1
    f.close();
    proc = subprocess.Popen("sox " + filename + ".dat -b 16 -r 16000 -c 1 -s " + filename + ".wav", shell=True)
    
print 'Loading events.xml'
tree = etree.parse('workspace/event.xml')
r = tree.xpath('/events/event')

# Get the first event of the session
begin = r[0].get('timestamp')
# Get the last event of the session
end = r[len(r)-1].get('timestamp')
# Determine the length of the session  
length = long(end) - long(begin)  

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
    e = AudioRecEvents()
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
    
audio_gaps = []
prev = long(begin)
for e in audio_recs:
    length = long(e.stop_timestamp) - long(e.start_timestamp)
    audio_gap = long(e.start_event_timestamp) - prev
    audio_gaps.append(audio_gap)
    prev = long(e.stop_event_timestamp)

# Pad the audio until the last event.    
audio_gaps.append(long(end) - long(prev))

for g in audio_gaps:
    lsec = g / 1000
    print str(lsec) + " " + str(g)
    create_audio_gap_file(lsec, 'gap-' + str(lsec))
    

#proc = subprocess.Popen(['./b.sh'], 
#proc = subprocess.Popen(['echo', '"to stdout"'], 
#proc = subprocess.Popen(['sox', "workspace/audio/370de0e4-1cdd-4852-858b-b326a55db4d4-20110126-115112.wav", "-n", "stat"], 
#                stdout=subprocess.PIPE).communicate()[0]
#stdout_value = proc.communicate()[0]
#print '\tstdout:', repr(proc)

#proc = subprocess.Popen(['echo', '"to stdout"'], 

#p = Process('sox workspace/audio/370de0e4-1cdd-4852-858b-b326a55db4d4-20110126-115112.wav -n stat') | Process("wc -w")
#print p.stdout

    
    
