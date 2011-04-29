require 'rubygems'
require 'bundler'
Bundler.setup(:default)

#require 'sinatra'
require 'sinatra/base'
require 'haml'
require 'bigbluebutton-api'

#TODO:  manage exceptions
#		support of multiple conferences
#		wait student for meeting to start
#		logout

		
class LoginScreen < Sinatra::Base
    use Rack::Session::Pool, :expire_after => 2592000
    
	configure do
		set :pass_inst, "instructor"
		set :pass_stud, "student"
		
	end
	
    get('/login/?') { 
		if session["user"].nil? == false
			redirect to("/?")
		else
			haml :login
		end			
	}
    
    post('/login/?') do
		
		
		username=params[:txtusername]
		password=params[:txtpassword]
		
		if password==settings.pass_inst
			session["user"]=username
			session["role"]="instructor"
		elsif password==settings.pass_stud
			session["user"]=username
			session["role"]="student"
		end
		redirect to("/")
    end
 end

class Main < Sinatra::Base
    
    use LoginScreen
	
	#enable logger
	set :logging, true
	
	configure do
		set :pass_inst, "instructor"
		set :pass_stud, "student"
	
		#setting up logger
		log = File.new("log/sinatra.log", "a")
		STDOUT.reopen(log)
		STDERR.reopen(log)
		
		#loading config YAML file
		config_file = 'bigbluebutton.yml'
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
			redirect ("/login")
		end
    end
    get('/?') { 
		puts "getting meetings..."
		resp = $bbb_api.get_meetings
		@conflist = Hash.new
		unless !resp["meetings"].nil? then 
			puts resp[:meetings]
			@conflist = resp[:meetings]
		end
		
		@message = ""
		if @conflist.length == 0
			@message = "No meetings running..."
		end
		
		haml :list

	}
	
	get '/logout' do
		session.clear
		redirect to("/login")
	end
	
	get '/enter' do
		meeting_id = params[:meetingid]
		username = session['user']
		passwd = nil
		
		if session['role'] == "instructor" 
			passwd = settings.pass_inst
		elsif session['role'] == "student"
			passwd = settings.pass_stud
		end
		
		redirect $bbb_api.join_meeting_url(meeting_id, username, passwd)
	end
	
	get '/metadata' do
		haml :metadata
	end

	post '/metadata/process' do
		meeting_name=params[:txtname]
		meeting_id=params[:txtid]
		
		metadata = Hash.new
		metadata[:title]=params[:txttitle]
		metadata[:series]=params[:txtseries]
		metadata[:instructor]=params[:txtinstructor]
		
		$bbb_api.create_meeting(meeting_name, meeting_id, settings.pass_inst, settings.pass_stud, nil, nil, nil, nil, nil, true, metadata)
		
		redirect to("/enter?meetingid=#{meeting_id}")
	end
	
end

	




