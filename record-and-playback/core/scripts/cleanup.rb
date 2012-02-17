require "rubygems"
require "fileutils"
require "redis"

PUBLISHED_DIR="/var/bigbluebutton/published"
UNPUBLISHED_DIR="/var/bigbluebutton/unpublished"
RECORDING_DIR="/var/bigbluebutton/recording"



def cleanProcessedFiles(path)
	redis=Redis.new
	# get the pastday
	pastday=Time.new-(3600*24)
	puts "Cleaning out conferences before #{pastday}"
	
	(Dir.entries(path) - ['.','..']).each do
	|playback|
		(Dir.entries(path+"/#{playback}") - ['.','..']).each do
		|meeting|	
			
			modtime = File.mtime(path+"/#{playback}/#{meeting}")
			dif=modtime <=> pastday
			# 1 represents all the recording upto the pastday
			if dif != 1
				puts "Meeting: #{meeting}"
				#Deleting Processed Dir
				puts "Checking record and ingest directories..."
				
				puts "Deleting *.done files..."
				FileUtils.rm_rf RECORDING_DIR+"/status/recorded/#{meeting}.done"
				FileUtils.rm_rf RECORDING_DIR+"/status/archived/#{meeting}.done"
				FileUtils.rm_rf RECORDING_DIR+"/status/processed/#{meeting}-#{playback}.done"
				
				puts "Deleting processed directories..."
				if(File.directory?(RECORDING_DIR+"/process/#{playback}/#{meeting}"))
					FileUtils.rm_rf RECORDING_DIR+"/process/#{playback}/#{meeting}"
				end
				if(File.directory?(RECORDING_DIR+"/publish/#{playback}/#{meeting}"))
					FileUtils.rm_rf RECORDING_DIR+"/publish/#{playback}/#{meeting}"
				end
				
				#Deleting Redis Keys
				puts "Checking redis keys..."
				if( redis.exists("meeting:#{meeting}:recordings"))
					len= redis.llen("meeting:#{meeting}:recordings")
					range= redis.lrange("meeting:#{meeting}:recordings",0,len)
					range.each do
					|msgid|
						redis.del("recording:#{meeting}:#{msgid}")
					end
					puts "Deleting Redis Keys for #{meeting}"
					redis.del("meeting:#{meeting}:recordings")
				end
			end
			
		end
		
	end

end

cleanProcessedFiles(PUBLISHED_DIR)
cleanProcessedFiles(UNPUBLISHED_DIR)


