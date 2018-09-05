'use strict';
exports.getinfo = function (req,res){

let bodyInput = req.body;
// console.log(bodyInput)	
	
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

//
var fabric_client = new Fabric_Client();

var channel = fabric_client.newChannel('mychannel');

var peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);

//
var member_user = null;
var store_path = path.join(__dirname, '../../generatekeys/hfc-key-store_org1');
// console.log('Store path:'+store_path);
var tx_id = null;
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
	// assign the store to the fabric client
	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	// use the same location for the state store (where the users' certificate are kept)
	// and the crypto store (where the users' keys are kept)
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	// get the enrolled user from persistence, this user will sign all requests
	return fabric_client.getUserContext('user1', true);
}).then((user_from_store) => {
	if (user_from_store && user_from_store.isEnrolled()) {
		// console.log(user_from_store)
		let object = JSON.parse(user_from_store)
		// console.dir(object, {depth: null, colors: true})
		console.log('Successfully loaded user1 from persistence');
		member_user = user_from_store;
	} else {
		throw new Error('Failed to get user1.... run registerUser.js');
	}
	return 
})
.then(() => {
	console.log("Calling queryInfo()");
	//   Pegando info do numero do bloco atual e hash
	return channel.queryBlockByTxID(
		'bb56b4a5ffdc3cdaa9309921334b28951a9ba4d8d16d5793e715f17feb2b5961',
		peer,
		false
	)
})
.then((output) => {
	
	// console.dir(output, {depth: null, colors: true})

	res.json(output);
    return;
})

.catch((err) => {
	console.error('Failed to query successfully :: ' + err);
});

}
