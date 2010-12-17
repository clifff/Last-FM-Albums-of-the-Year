require 'rubygems'
require 'sinatra'

set :public, File.dirname(__FILE__)

get '/' do
	return File.open "index.html"
end

get '/test' do
	return File.open "SpecRunner.html"
end
