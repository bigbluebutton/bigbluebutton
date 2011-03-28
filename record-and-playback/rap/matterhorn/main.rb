require 'sinatra'
require 'haml'
require 'redis'

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
		"Welcome student"
		session["user"]=username
		session["role"]="student"
	else
		"you are a stranger!!!"
	end
	
end

get '/metadata' do
	haml :metadata
end

post '/metadata/process' do
	title=params[:txttitle]
	series=params[:txtseries]
	instructor=params[:txtinstructor]
	
	redis = Redis.new
	sessionid = redis.incr "global:nextMatterhornSession"
	redis.set "matterhorn:#{sessionid}:title", title
	redis.set "matterhorn:#{sessionid}:series", series
	redis.set "matterhorn:#{sessionid}:instructor", instructor
	redis.rpush "matterhorn:sessions", "#{sessionid}"
	
	redirect "/metadata/success"
end

get '/metadata/success' do
	"Thank you. Successful metadata in redis"
end