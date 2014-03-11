var Emitter = require('events').EventEmitter
  , logger = require('winston');

// Just log everything to debug.log
logger.add(logger.transports.File, {filename: "debug.camera_access.log"});
logger.remove(logger.transports.Console);

/**
 * CameraAccess
 * - Used to build camera feed and command interface
 *
 * @param {Object} o - Should hold functions for building streams and commands
 *   - initialize
 *   - feedGetter
 *   - commander
 */
var CameraAccess = function(o) {
	this.emitter = new EventEmitter;

	this.events.PACKET = 'packet';
	this.events.CLOSE  = 'close';

	if(o.initialize) {
		o.initialize.apply(this, arguments);
	}
	
	if(o.feedGetter) {
		this.feedGetter = o.feedGetter;
	}

	if(o.commander) {
		this.commander = o.commander;
	}
};

/**
 * Convenience method for sending feed packets
 */
CameraAccess.prototype.sendFeedPacket = function(pkt) {
	this.emitter.emit(this.events.PACKET, pkt);
};

/**
 * Convenience method for emitting close event on feed
 */
CameraAccess.prototype.closeFeed = function() {
	this.emitter.emit(this.events.CLOSE);
};

/**
 * Get EventEmitter for feed related events
 *
 * @param {String|Number} id of camera to help build URL
 * @return {Object} API for controlling and reacting to feed
 */
CameraAccess.prototype.feed = function(id) {
	if(this.feedGetter) {

		// Initialize feedGetter
		this.feedGetter.call(this, id); 
	} else {
		logger.warn("No feedGetter set on CameraAccess");
	}

	return {
		subscribe: this.emitter.on,
		unsubscrube: this.emitter.removeAllListeners

		/**
		 * Start feed from feedGetter
		 *
		 * @param {Number} fr - framerate to play
		 */
		play: function(fr) {
			this.feedGetter.call(this, id, fr);
		}
	};
};

/**
 * Send command to server
 */
CameraAccess.prototype.command = function(attr, val) {
	if(this.commander) {
		this.commander.call(this, attr, val);
	} else {
		logger.warn("Command sent without commander set on CameraAccess");
	}
};

module.exports = CameraAccess;
