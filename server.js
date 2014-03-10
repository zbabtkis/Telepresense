var io = require('socket.io')()
  , logger = require('winston');

// Just log everything to debug.log
logger.add(logger.transport.FILE, {filename: "debug.log"});
logger.remove(logger.transport.CONSOLE);


function CameraAccess = function() {

}

CameraAccess.prototype.command = function() {};
CameraAccess.prototype.feed    = function(id) {
	var _this = this;

	return {
		getUrl: function() {
			return _this.getUrl(id);
		},
		getPath: function(id) {
			return _this.getPath(id);
		}
	};
};

var AxisAccess = new CameraAccess();

AxisAccess.feed = function(id) {

var MainCtrl = {
	init: function() {
		io.on('connection', this.addClient.bind(this));
	}, 

	addClient: function(client) {
		Client.register(client.id, function() {
			client.on('disconnect', this.destroy.bind(this));
			client.on('open:camera', this.requestFeed.bind(this));
			
			// When client sends command to camera, 
			client.on('send:command', function(cameraId, cmd) {
				MainCtrl.sendCmd(this, cameraId, cmd);
			}.bind(this));
		});
	},

	addCamera: function(camera) {
		Camera.register(camera.id, ;
	},

	sendCmd: function(client, cameraId, cmd) {
		var camera = Camera.get(camId);

		client.requestFeed(camera);
	}
};

