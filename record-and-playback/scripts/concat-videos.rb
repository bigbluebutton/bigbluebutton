class MediaFormatException < StandardError
end

class String
	def is_i?
		!!(self =~ /^[-+]?[0-9]+$/)
	end
end

def executeFfmpeg(command)
	IO.popen(command) do |pipe|
		pipe.each("r") do |line|
			puts line
		end
	end
	raise MediaFormatException if $?.exitstatus != 0
end

def executeMencoder(videos)
	command="mencoder -forceidx -of lavf -oac copy -ovc copy -o result.flv "
	videos.each do|a|
		command << "#{a} "
	end
	IO.popen(command) do |pipe|
		pipe.each("r") do |line|
			puts line
		end
	end
	raise MediaFormatException if $?.exitstatus != 0
end

def execute(args)
	videos = []
	cont=0
	args.each do|a|
		if(a.include? ".flv")
			puts "parsing flv video: #{a}..."
			executeFfmpeg("ffmpeg -i #{a} -r 1 -y #{a}")
			videos << a
		elsif(a.is_i?)
			puts "creating image video with duration: #{a} seconds..."
			newImageVideo="tmp#{cont}.flv"
			executeFfmpeg("ffmpeg -loop_input -t #{a} -i logo.jpg -r 1 #{newImageVideo}")
			videos << newImageVideo
			cont=cont+1
		end
	end
	executeMencoder(videos)
end

execute(ARGV)
