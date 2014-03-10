var Q = require('q');

var _proto_ = { getStatus: function() {
		return this.store.fetch()
	},

	listen: function() {
		if(!this.feed) {
			logger.warn('Feed not set on ' + this.id);
			return this;
		}

		// When image data comes from feed, send to clients.
		this.feed.on('packet', function(data) {
			this.clients.forEach(function(client) {
				client.writeData(data);
			});
		}.bind(this));

		// When feed ends, teardown camera client interaction.
		this.feed.on('close', function() {
			this.close();
		}.bind(this));

		return this;
	},

	close: function() {

		// When camera connection closes, empty client array
		this.clients = [];
		this.active  = false;

		return this;
	},

	destroy: function() {

		// Unsubscribe all attached clients
		this.clients.forEach(this.removeClient.bind(this));

		// End feed stream
		this.close();
	},

	set: function(attr, value) {
		var d     = Q.defer()
		  , _this = this;

		// Send command to camera through Access interface
		this.access.command(attr, value)
			.then(function(err) {
				if(err) {
					q.reject(err);
					return logger.error(err.message);
				}

				// If command succeeded, save camera attributes to store.
				_this.store.save(attr, value)
					.then(function(err) {
						if(err) {
							d.reject(err);
							return logger.error(err.message);
						}

						d.resolve();
					});
			});

		return d.promise;
	},

	/** 
	 * Create new feed subscription with new framerate
	 *
	 * @param {Number} fr - Framerate to use in new feed.
	 */
	requestWithFramerate: function(fr) {

		// We shouldn't downgrade framerate if higher has been requested
		if(this.currentFr > fr) return this;

		this.currentFr = fr;

		// Turn off old feed.
		this.feed.removeAllListeners('packet');
		this.feed.removeAllListeners('close');

		// Create new feed with new framerate.
		this.feed.play(fr);

		// Rebind feed events for all clients.
		this.listen();

		return this;
	},

	/**
	 * Add client to list and subscribe them to feed data.
	 *
	 * @param {Client} client - subscribes to data events
	 */
	addClient: function(client) {

		// Should check this on client side
		// this is a sanity check
		if(this.clients.indexOf(client) === -1) {
			this.clients.push(client);
		}

		return this;
	},

	removeClient: function(client) {
		var pos = this.clients.indexOf(client);
		this.clients.splice(pos, 1);
	}
};
	
var Cameras = {
	
	// Store all registered cameras here.
	_cameras: {},

	/**
	 * Camera factory, builds constructor and prototype chain
	 *
	 * @param {String} id ID of camera 
	 * @param {CameraAccess} access API to use to connect to camera stream and send commands
	 * @param {ObjectStore} db store to save and persist changes.
	 *
	 * @return new Camera object.
	 */
	create: function(id, Access, Db) {
		var Camera = function() {

			// Build access feed from camera ID
			this.access = new Access(id);
			this.feed   = this.access.feed();

			// Use or create store in DB.
			this.store = new Db(id);

			this.clients   = [];
			this.currentFr = 1;
		};

		Camera.prototype = _proto_;

		// Construct new instance of Camera
		return this._cameras[id] = new Camera();
	},

	/**
	 * Getter for existing cameras
	 * 
	 * @param {String|Number} id Identifier of camera.
	 * @return requested camera object or undefined.
	 */
	get: function(id) {
		return this._cameras[id];
	}
};

module.exports = Cameras;
