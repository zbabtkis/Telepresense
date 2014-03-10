var logger = require('winston');

// Just log everything to debug.log
logger.add(logger.transports.File, {filename: "debug.client.log"});
logger.remove(logger.transports.Console);

var _proto_ = {

	// Remove this 
	destroy: function() {

		// Destroy all references to cleint on connected cameras
		this.connections.forEach(this._unsetConnection);

		// Remove reference to this client from client list.
		delete Clients._clients[this.id];
	},

	_unsetConnection: function(camera) {

		// Stop sending data from camera to client
		camera.removeClient(this);
	},

	useCamera: function(Camera) {
		
		// Check if this client is already connected to camera.
		if(this.connections.indexOf(Camera) !== -1) {

			// If not already connected, add camera to connections
			// and register client on camera.
			this.connections.push(Camera.addClient(this));
		}

		return {
			sendCommand: function(attr, value) {
				Camera.set(attr, value);
			},
			requestFeed: function(fr) {
				Camera.requestWithFramerate(fr);
			}
		};
	},

	// By default, write data sent to client to log
	writeData: function(data) {
		winston.info("Data from camera ignored: ", data);
	}
};

var Clients = {
	_clients: {}, 

	register: function(id, constructor) {

		// Build constructor for client object based on callback.
		var Client = function() {

			// Use initializer passed in.
			constructor.call(this);

			// For tracking references.
			this.id = id;

			// Holds all cameras client is subscribed to.
			this.connections = [];
		};
			
		Client.prototype = _proto_;

		// Add client to client list.
		return this._clients[id] = new Client();
	},

	get: function(id) {
		
		// Return client based on id.
		return this._clients[id];	
	}
};

module.exports = Clients;

