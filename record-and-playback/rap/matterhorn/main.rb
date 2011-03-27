require 'rubygems'
require 'sinatra'
require 'haml'
require 'redis'
require 'bigbluebutton-api'

use Rack::Session::Pool, :expire_after => 2592000

get '/' do
	haml :login
end

post '/login' do
	INST="instructor"
	PASS_INST="instructor"
	
	STUD="student"
	PASS_STUD="student"
	
	username=params[:txtusername]
	password=params[:txtpassword]
	
	if username==INST && password==PASS_INST
		"Welcome #{username}!!"
		session["user"]=username
		session["role"]="instructor"
		redirect "/metadata"
	elsif username==STUD && password==PASS_STUD
		"Welcome student, this hasn't been yet implemented ;)"
		session["user"]=username
		session["role"]="student"
	else
		redirect "/"
	end
	
end

get '/metadata' do
	haml :metadata
end

post '/metadata/process' do
	title=params[:txttitle]
	series=params[:txtseries]
	instructor=params[:txtinstructor]
	
	#Redis is running with the default values
	#redis = Redis.new
	#sessionid = redis.incr "global:nextMatterhornSession"
	#redis.set "matterhorn:#{sessionid}:title", title
	#redis.set "matterhorn:#{sessionid}:series", series
	#redis.set "matterhorn:#{sessionid}:instructor", instructor
	#redis.rpush "matterhorn:sessions", "#{sessionid}"
	#"testing"
	#bigbluebutton session
	@api = BigBlueButton::BigBlueButtonApi.new("http://192.168.1.38/bigbluebutton/api", "e49e0123e531d0816abaf4bc1b1d7f11", "0.7", true)
	#if @api.test_connection
		#"ok"
	#else
	#	"not ok"
	#end
	@api.create_meeting("matterhorn test", "bbb-matter", "instructor", "student")
	
	"url: "+@api.join_meeting_url("bbb-matter", instructor, "instructor")
end

get '/metadata/success' do
	"Thank you. Successful metadata in redis"
end
