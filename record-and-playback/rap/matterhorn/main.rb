require 'rubygems'
#require 'sinatra'
require 'sinatra/base'
require 'haml'
require 'redis'
require 'bigbluebutton-api'

#TODO:  manage exceptions
#		support of multiple conferences
#		wait student for meeting to start
#		logout

class LoginScreen < Sinatra::Base
    use Rack::Session::Pool, :expire_after => 2592000
    
    get('/login/?') { 
		haml :login 
	}
    
    post('/login') do
		INST="instructor"
		PASS_INST="instructor"
		
		STUD="student"
		PASS_STUD="student"
		
		username=params[:txtusername]
		password=params[:txtpassword]
		
		if username==INST and password==PASS_INST
			session["user"]=username
			session["role"]="instructor"
		elsif username==STUD and password==PASS_STUD
			session["user"]=username
			session["role"]="student"
		end
		redirect "/"
    end
 end

class Main < Sinatra::Base
    # middleware will run before filters
    use LoginScreen
	
	#enable logger
	set :logging, true
	
	configure do
		#setting up logger
		log = File.new("sinatra.log", "a")
		STDOUT.reopen(log)
		STDERR.reopen(log)
		
		#loading config YAML file
		config_file = 'config.yml'
		unless File.exist? config_file
			puts config_file + " does not exists..."
		end
		puts "loading config file..."
		$config = YAML.load_file(config_file)
		
		#setting bigbluebutton object
		puts "setting bigbluebutton session" + $config['bbb_url']
		$bbb_api = BigBlueButton::BigBlueButtonApi.new($config['bbb_url'], $config['bbb_salt'], $config['bbb_version'], true)
		
	end
	
	before do
		unless session['user']
			redirect "/login"
		end
    end
    
    get('/?') { 
		
		if session['role'] == "instructor"
			redirect "/metadata"
		elsif session['role'] == "student"
			redirect $bbb_api.join_meeting_url("bbb-matter", "student", "student")
		else
			redirect "/login"
		end
	}
	
	
	get '/metadata' do
		haml :metadata
	end

	post '/metadata/process' do
		title=params[:txttitle]
		series=params[:txtseries]
		instructor=params[:txtinstructor]
		
		storeMatterhornInfo(title,series,instructor)
		
		$bbb_api.create_meeting("Matterhorn BigBlueButton Session", "bbb-matter", "instructor", "student")
		
		redirect $bbb_api.join_meeting_url("bbb-matter", instructor, "instructor")
	end
	
	def storeMatterhornInfo(title,series,instructor)
		redis = Redis.new(:host => $config['redis_server'], :port => $config['redis_port'])
		sessionid = redis.incr "global:nextMatterhornSession"
		redis.set "matterhorn:#{sessionid}:title", title
		redis.set "matterhorn:#{sessionid}:series", series
		redis.set "matterhorn:#{sessionid}:instructor", instructor
		redis.rpush "matterhorn:sessions", "#{sessionid}"
		redis.quit
	end
end

	




