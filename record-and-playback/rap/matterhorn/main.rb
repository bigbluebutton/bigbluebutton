require 'rubygems'
#require 'sinatra'
require 'sinatra/base'
require 'haml'
require 'redis'
require 'bigbluebutton-api'

#TODO:  manage exceptions
#		yaml for bigbluebutton gem
#		yaml for redis connection
#		support of multiple conferences?
#		messages format in redis
#		student redirect to bigbluebutton
#		login validation message
#		bigbluebutton session

class LoginScreen < Sinatra::Base
    use Rack::Session::Pool, :expire_after => 2592000
    
    get('/login') { 
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
	
	#trying to add a logger
	set :logging, true
	
    #Redis is running with the default values
	@redis 
    @bigbluebutton
	
	log = File.new("sinatra.log", "a")
	STDOUT.reopen(log)
	STDERR.reopen(log)
	
	before do
		unless session['user']
			puts "testing logger"
			halt "Access denied, please <a href='/login'>login</a>."
		end
    end
    
    get('/') { 
		
		if session['role'] == "instructor"
			redirect "/metadata"
		elsif session['role'] == "student"
			"Welcome student"
		else
			redirect "/login"
		end
		
		@redis = Redis.new
		@bigbluebutton = BigBlueButton::BigBlueButtonApi.new("http://192.168.1.38/bigbluebutton/api", "e49e0123e531d0816abaf4bc1b1d7f11", "0.7", true)
	}
	
	get '/metadata' do
		haml :metadata
	end

	post '/metadata/process' do
		title=params[:txttitle]
		series=params[:txtseries]
		instructor=params[:txtinstructor]
		
		
		sessionid = redis.incr "global:nextMatterhornSession"
		@redis.set "matterhorn:#{sessionid}:title", title
		@redis.set "matterhorn:#{sessionid}:series", series
		@redis.set "matterhorn:#{sessionid}:instructor", instructor
		@redis.rpush "matterhorn:sessions", "#{sessionid}"
		
		#if @api.test_connection
			#"ok"
		#else
		#	"not ok"
		#end
		@api.create_meeting("matterhorn test", "bbb-matter", "instructor", "student")
		
		redirect @api.join_meeting_url("bbb-matter", instructor, "instructor")
	end
end
Main.run!

	




