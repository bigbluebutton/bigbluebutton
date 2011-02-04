from lxml.builder import E
from lxml import etree
import redis
import os, getopt, sys
import shutil, subprocess

def usage():
    print ' -------------------------------------------------------------------------'
    print ' (c) Blindside Networks Inc. 2010'
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
    
def TIMESTAMP(*args): 
    return {"timestamp":' '.join(args)}

def MODULE(*args): 
    return {"module":' '.join(args)}
    
def EVENTNAME(*args): 
    return {"name":' '.join(args)}

def KEYVALS(res):
    result = ""
    for key, value in res.items():
        result += "<" + key + ">" + value + "</" + key + ">"
        
    return result

def generate_events_xml(redisHost, redisPort, meetingId, archiveDir):
    r = redis.Redis(host=redisHost, port=redisPort, db=0)

    count = r.llen("meeting:" + meetingId + ":recordings")
    print count
    msgs = r.lrange("meeting:" + meetingId + ":recordings", 0, count)
                
    html = page = (
        E.events(
            E.head(
                E.title("This is a sample document")
            )
        )
    )

    for msg in msgs:
        res = r.hgetall("recording:" + meetingId + ":" + str(msg))
        timestamp = res.get('timestamp')
        module = res.get('module')
        eventname = res.get('eventName')
        ev = E.event(
                TIMESTAMP(timestamp),
                MODULE(module),
                EVENTNAME(eventname)
            )
        
        for key, val in res.items():
            if key not in ['timestamp', 'module', 'eventName', 'meetingId']:
                ev.append(E(key, val))
            
        page.append(ev)
                    
    print(etree.tostring(page, pretty_print=True))

    targetFile = archiveDir + "/" + meetingId + "/events.xml"
    f = open(targetFile, 'w')
    f.write(etree.tostring(page, pretty_print=True))
    f.close()    
    
def main():
    redisHost = ""
    redisPort = 0
    archiveDir = ""
    meetingId = ""
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hm:r:p:a:", ["help", "meeting-id=", "redis-host=", "redis-port=", "archive-dir="])
    except getopt.GetoptError, err:
        # print help information and exit:
        print str(err)
        usage()
        sys.exit(2)
    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit()
        elif o in ("-m", "--redis-host"):
            meetingId = a
        elif o in ("-r", "--redis-host"):
            redisHost = a
        elif o in ("-p", "--redis-port"):
            redisPort = a
        elif o in ("-a", "--archive-dir"):
            archiveDir = a
        else:
            assert False, "unhandled option"
    
    printUsage = False
    if (meetingId == ""):
        print "Missing meeting id."
        printUsage = True
    if (redisHost == ""):
        print "Missing redis host."
        printUsage = True
    if (redisPort == 0):
        print "Missing redis port."
        printUsage = True
    if (archiveDir == ""):
        print "Missing archive dir."
        printUsage = True
        
    if (printUsage):
        printUsageHelp()
    
    print meetingId
    print redisHost
    print redisPort
    print archiveDir
    
    generate_events_xml(redisHost, int(redisPort), meetingId, archiveDir)
    
if __name__ == "__main__":
    main()     