import {chai} from 'meteor/practicalmeteor:chai';
import { testLog } from "meteor/doichain:doichain-meteor-api";
import {
    deleteOptInsFromAliceAndBob, getBalance, initBlockchain
} from "./test-api/test-api-on-node";

global.inside_docker = false;

const log = true;

global.node_url_alice = 'http://172.20.0.6:18332/';
if(!global.inside_docker) global.node_url_alice = 'http://localhost:18543/';
global.node_url_bob =   'http://172.20.0.7:18332/';
if(!global.inside_docker) global.node_url_bob = 'http://localhost:18544/';
global.rpcAuthAlice = "admin:generated-password";
global.rpcAuth = "admin:generated-password";

const privKeyBob = "cP3EigkzsWuyKEmxk8cC6qXYb4ZjwUo5vzvZpAPmDQ83RCgXQruj";

global.dappUrlAlice = "http://localhost:3000";
global.dappUrlBob = global.insde_docker?"http://172.20.0.8:4000":"http://localhost:4000";
global.dAppLogin = {"username":"admin","password":"password"};



if(Meteor.isAppTest) {
    describe('basic-doi-test-0', function () {
        this.timeout(0);

        before(function () {
            testLog("removing OptIns,Recipients,Senders",'');
            deleteOptInsFromAliceAndBob();
        });

        it('should create a RegTest Doichain with alice and bob and some Doi - coins', function () {
            initBlockchain(global.node_url_alice,global.node_url_bob,global.rpcAuth,privKeyBob,true);
            const aliceBalance = getBalance(global.node_url_alice, global.rpcAuth, log);
            chai.assert.isAbove(aliceBalance, 0, 'no funding! ');
        });
    });
}
