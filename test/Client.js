var Clients = require('../models/Client')
  , expect = require('chai').expect;


/** Unit Tests */

describe("Client", function() {
	var client;

	beforeEach(function() {
		client = Clients.register("abc123", function() {});
	});

	afterEach(function() {
		client.destroy();
	});

	it("Should register client to client list accessable by client.id", function() {
		expect(Clients.get("abc123").id).to.equal("abc123");
	});

	it("Should be removed from client list by calling the destroy method", function() {
		client.destroy();
		expect(Clients.get(client.id)).to.be.undefined;
	});

	it("Should return camera connection API with useCamera", function() {
		var api = client.useCamera({addClient: function() {}});

		expect(api).to.be.an('Object');
		expect(api.sendCommand).to.be.a('Function');
		expect(api.requestFeed).to.be.a('Function');
	});

	it("Should require addClient method with useCamera method", function() {
		expect(client.useCamera).to.throw(TypeError);
	});

	it("Should have built in readData method", function() {
		expect(client.writeData).to.be.a('Function');
	});
});
