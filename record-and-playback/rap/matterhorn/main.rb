require 'sinatra'
require 'haml'

get '/login' do
	haml :login
end

post '/auth' do
	USER="root"
	PASS="admin"
	
	username=params[:txtusername]
	password=params[:txtpassword]
	
	if username==USER && password==PASS
		"Welcome #{username}!!"
	else
		"you are a stranger!!!"
	end
	
end
