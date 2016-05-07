from bottle import Bottle, run, request
import json

app = Bottle()

@app.route('/login', method='POST')
def post_login():
	data = request.json
	username = data["username"]
	password = data["password"]

	retdata = {}
	if(username == 'pedro' and password == 'pedro123'):
		retdata = {
			"status": "OK"
		}
	else:
		retdata = {
			"status": "ERROR"
		}

	return retdata


run(app, host='127.0.0.1', port=8081, reloader=True)
