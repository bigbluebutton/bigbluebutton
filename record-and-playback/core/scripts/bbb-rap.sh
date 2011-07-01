#!/bin/bash
BBB_VERSION="0.8"

#Log files
ARCHIVE_LOG_FILE=/var/log/bigbluebutton/archive.log
PROCESS_LOG_FILE=$ARCHIVE_LOG_FILE
PUBLISH_LOG_FILE=$ARCHIVE_LOG_FILE

#Error strings patterns
#ARCHIVE_ERROR_PATTERN="ERROR"
ARCHIVE_ERROR_PATTERN="Failed to archive"
PROCESS_ERROR_PATTERN="Failed to process"
PUBLISH_ERROR_PATTERN="Failed to publish"

usage() {
	echo "BigBlueButton Record and Playback Configuration Utility - Version $BBB_VERSION"
        echo "http://code.google.com/p/bigbluebutton/wiki/BBBRap"
        echo
        echo "   bbb-rap [options]"
        echo
        echo
        echo "Monitoring:"
        echo "   --check <verbose>                Check configuration files and processes for problems"
        echo "   --debug                          Scan the log files for error messages in record and playback phases"
        echo "   --debug-archive                  Scan the log files for error messages in archiving phase"
        echo "   --debug-process                  Scan the log files for error messages in processing phase"
        echo "   --debug-publish                  Scan the log files for error messages in publish phase"

}

scan_errors(){
	rm -rf /tmp/t
	grep "$1" $2 > /tmp/t
	if [ -s /tmp/t ]; then
		echo "  -- ERRORS found in $2 -- "
		cat /tmp/t
		echo
	fi
	
}
scan_archive_err(){ 
 scan_errors  "$ARCHIVE_ERROR_PATTERN" "$ARCHIVE_LOG_FILE" 
}
scan_process_err(){ 
 scan_errors  "$PROCESS_ERROR_PATTERN" "$PROCESS_LOG_FILE" 
}
scan_publish_err(){
  scan_errors  "$PUBLISH_ERROR_PATTERN" "$PUBLISH_LOG_FILE" 
}


# Parse the parameters
while [ $# -gt 0 ]; do

	if [ "$1" = "-debug" -o "$1" = "--debug" ]; then
		scan_archive_err
		scan_process_err
		scan_publish_err
		shift
		continue
	fi
	if [ "$1" = "-debug-a" -o "$1" = "--debug-archive" ]; then
		scan_archive_err
		shift
		continue
	fi
	if [ "$1" = "-debug-p" -o "$1" = "--debug-process" ]; then
		scan_process_err
		shift
		continue
	fi
	if [ "$1" = "-debug-a" -o "$1" = "--debug-publish" ]; then
		scan_publish_err
		shift
		continue
	fi

	usage
	exit 1
done

