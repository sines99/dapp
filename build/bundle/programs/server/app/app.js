var require = meteorInstall({"imports":{"api":{"opt-ins":{"server":{"publications.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/opt-ins/server/publications.js                                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 1);
let OptIns;
module.link("../opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 2);
Meteor.publish('opt-ins.all', function OptInsAll() {
  if (!this.userId) {
    return this.ready();
  }

  if (!Roles.userIsInRole(this.userId, ['admin'])) {
    return OptIns.find({
      ownerId: this.userId
    }, {
      fields: OptIns.publicFields
    });
  }

  return OptIns.find({}, {
    fields: OptIns.publicFields
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/opt-ins/methods.js                                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let DDPRateLimiter;
module.link("meteor/ddp-rate-limiter", {
  DDPRateLimiter(v) {
    DDPRateLimiter = v;
  }

}, 1);
let i18n;
module.link("meteor/universe:i18n", {
  _i18n(v) {
    i18n = v;
  }

}, 2);
let ValidatedMethod;
module.link("meteor/mdg:validated-method", {
  ValidatedMethod(v) {
    ValidatedMethod = v;
  }

}, 3);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 4);

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 5);
let addOptIn;
module.link("../../modules/server/opt-ins/add_and_write_to_blockchain.js", {
  default(v) {
    addOptIn = v;
  }

}, 6);
const add = new ValidatedMethod({
  name: 'opt-ins.add',
  validate: null,

  run({
    recipientMail,
    senderMail,
    data
  }) {
    if (!this.userId || !Roles.userIsInRole(this.userId, ['admin'])) {
      const error = "api.opt-ins.add.accessDenied";
      throw new Meteor.Error(error, i18n.__(error));
    }

    const optIn = {
      "recipient_mail": recipientMail,
      "sender_mail": senderMail,
      data
    };
    addOptIn(optIn);
  }

}); // Get list of all method names on opt-ins

const OPTIONS_METHODS = _.pluck([add], 'name');

if (Meteor.isServer) {
  // Only allow 5 opt-in operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(OPTIONS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() {
      return true;
    }

  }, 5, 1000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"opt-ins.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/opt-ins/opt-ins.js                                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  OptIns: () => OptIns
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);

class OptInsCollection extends Mongo.Collection {
  insert(optIn, callback) {
    const ourOptIn = optIn;
    ourOptIn.recipient_sender = ourOptIn.recipient + ourOptIn.sender;
    ourOptIn.createdAt = ourOptIn.createdAt || new Date();
    const result = super.insert(ourOptIn, callback);
    return result;
  }

  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }

  remove(selector) {
    const result = super.remove(selector);
    return result;
  }

}

const OptIns = new OptInsCollection('opt-ins');
// Deny all client-side updates since we will be using methods to manage this collection
OptIns.deny({
  insert() {
    return true;
  },

  update() {
    return true;
  },

  remove() {
    return true;
  }

});
OptIns.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  recipient: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  sender: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  data: {
    type: String,
    optional: true,
    denyUpdate: false
  },
  index: {
    type: SimpleSchema.Integer,
    optional: true,
    denyUpdate: false
  },
  nameId: {
    type: String,
    optional: true,
    denyUpdate: false
  },
  txId: {
    type: String,
    optional: true,
    denyUpdate: false
  },
  masterDoi: {
    type: String,
    optional: true,
    denyUpdate: false
  },
  createdAt: {
    type: Date,
    denyUpdate: true
  },
  confirmedAt: {
    type: Date,
    optional: true,
    denyUpdate: false
  },
  confirmedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.IP,
    optional: true,
    denyUpdate: false
  },
  confirmationToken: {
    type: String,
    optional: true,
    denyUpdate: false
  },
  ownerId: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id
  },
  error: {
    type: String,
    optional: true,
    denyUpdate: false
  }
});
OptIns.attachSchema(OptIns.schema); // This represents the keys from Opt-In objects that should be published
// to the client. If we add secret properties to Opt-In objects, don't list
// them here to keep them private to the server.

OptIns.publicFields = {
  _id: 1,
  recipient: 1,
  sender: 1,
  data: 1,
  index: 1,
  nameId: 1,
  txId: 1,
  masterDoi: 1,
  createdAt: 1,
  confirmedAt: 1,
  confirmedBy: 1,
  ownerId: 1,
  error: 1
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"recipients":{"server":{"publications.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/recipients/server/publications.js                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 1);
let Recipients;
module.link("../recipients.js", {
  Recipients(v) {
    Recipients = v;
  }

}, 2);
let OptIns;
module.link("../../opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 3);
Meteor.publish('recipients.byOwner', function recipientGet() {
  let pipeline = [];

  if (!Roles.userIsInRole(this.userId, ['admin'])) {
    pipeline.push({
      $redact: {
        $cond: {
          if: {
            $cmp: ["$ownerId", this.userId]
          },
          then: "$$PRUNE",
          else: "$$KEEP"
        }
      }
    });
  }

  pipeline.push({
    $lookup: {
      from: "recipients",
      localField: "recipient",
      foreignField: "_id",
      as: "RecipientEmail"
    }
  });
  pipeline.push({
    $unwind: "$RecipientEmail"
  });
  pipeline.push({
    $project: {
      "RecipientEmail._id": 1
    }
  });
  const result = OptIns.aggregate(pipeline);
  let rIds = [];
  result.forEach(element => {
    rIds.push(element.RecipientEmail._id);
  });
  return Recipients.find({
    "_id": {
      "$in": rIds
    }
  }, {
    fields: Recipients.publicFields
  });
});
Meteor.publish('recipients.all', function recipientsAll() {
  if (!this.userId || !Roles.userIsInRole(this.userId, ['admin'])) {
    return this.ready();
  }

  return Recipients.find({}, {
    fields: Recipients.publicFields
  });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"recipients.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/recipients/recipients.js                                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  Recipients: () => Recipients
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);

class RecipientsCollection extends Mongo.Collection {
  insert(recipient, callback) {
    const ourRecipient = recipient;
    ourRecipient.createdAt = ourRecipient.createdAt || new Date();
    const result = super.insert(ourRecipient, callback);
    return result;
  }

  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }

  remove(selector) {
    const result = super.remove(selector);
    return result;
  }

}

const Recipients = new RecipientsCollection('recipients');
// Deny all client-side updates since we will be using methods to manage this collection
Recipients.deny({
  insert() {
    return true;
  },

  update() {
    return true;
  },

  remove() {
    return true;
  }

});
Recipients.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  email: {
    type: String,
    index: true,
    denyUpdate: true
  },
  privateKey: {
    type: String,
    unique: true,
    denyUpdate: true
  },
  publicKey: {
    type: String,
    unique: true,
    denyUpdate: true
  },
  createdAt: {
    type: Date,
    denyUpdate: true
  }
});
Recipients.attachSchema(Recipients.schema); // This represents the keys from Recipient objects that should be published
// to the client. If we add secret properties to Recipient objects, don't list
// them here to keep them private to the server.

Recipients.publicFields = {
  _id: 1,
  email: 1,
  publicKey: 1,
  createdAt: 1
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"doichain":{"entries.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/doichain/entries.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  DoichainEntries: () => DoichainEntries
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);

class DoichainEntriesCollection extends Mongo.Collection {
  insert(entry, callback) {
    const result = super.insert(entry, callback);
    return result;
  }

  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }

  remove(selector) {
    const result = super.remove(selector);
    return result;
  }

}

const DoichainEntries = new DoichainEntriesCollection('doichain-entries');
// Deny all client-side updates since we will be using methods to manage this collection
DoichainEntries.deny({
  insert() {
    return true;
  },

  update() {
    return true;
  },

  remove() {
    return true;
  }

});
DoichainEntries.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  name: {
    type: String,
    index: true,
    denyUpdate: true
  },
  value: {
    type: String,
    denyUpdate: false
  },
  address: {
    type: String,
    denyUpdate: false
  },
  masterDoi: {
    type: String,
    optional: true,
    index: true,
    denyUpdate: true
  },
  index: {
    type: SimpleSchema.Integer,
    optional: true,
    denyUpdate: true
  },
  txId: {
    type: String,
    denyUpdate: false
  }
});
DoichainEntries.attachSchema(DoichainEntries.schema); // This represents the keys from Entry objects that should be published
// to the client. If we add secret properties to Entry objects, don't list
// them here to keep them private to the server.

DoichainEntries.publicFields = {
  _id: 1,
  name: 1,
  value: 1,
  address: 1,
  masterDoi: 1,
  index: 1,
  txId: 1
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/doichain/methods.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let ValidatedMethod;
module.link("meteor/mdg:validated-method", {
  ValidatedMethod(v) {
    ValidatedMethod = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let DDPRateLimiter;
module.link("meteor/ddp-rate-limiter", {
  DDPRateLimiter(v) {
    DDPRateLimiter = v;
  }

}, 2);
let getKeyPairM;
module.link("../../modules/server/doichain/get_key-pair.js", {
  default(v) {
    getKeyPairM = v;
  }

}, 3);
let getBalanceM;
module.link("../../modules/server/doichain/get_balance.js", {
  default(v) {
    getBalanceM = v;
  }

}, 4);
const getKeyPair = new ValidatedMethod({
  name: 'doichain.getKeyPair',
  validate: null,

  run() {
    return getKeyPairM();
  }

});
const getBalance = new ValidatedMethod({
  name: 'doichain.getBalance',
  validate: null,

  run() {
    const logVal = getBalanceM();
    return logVal;
  }

}); // Get list of all method names on doichain

const OPTINS_METHODS = _.pluck([getKeyPair, getBalance], 'name');

if (Meteor.isServer) {
  // Only allow 5 opt-in operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(OPTINS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() {
      return true;
    }

  }, 5, 1000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"languages":{"methods.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/languages/methods.js                                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let DDPRateLimiter;
module.link("meteor/ddp-rate-limiter", {
  DDPRateLimiter(v) {
    DDPRateLimiter = v;
  }

}, 1);
let ValidatedMethod;
module.link("meteor/mdg:validated-method", {
  ValidatedMethod(v) {
    ValidatedMethod = v;
  }

}, 2);
let getLanguages;
module.link("../../modules/server/languages/get.js", {
  default(v) {
    getLanguages = v;
  }

}, 3);
const getAllLanguages = new ValidatedMethod({
  name: 'languages.getAll',
  validate: null,

  run() {
    return getLanguages();
  }

}); // Get list of all method names on languages

const OPTINS_METHODS = _.pluck([getAllLanguages], 'name');

if (Meteor.isServer) {
  // Only allow 5 opt-in operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(OPTINS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() {
      return true;
    }

  }, 5, 1000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"meta":{"meta.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/meta/meta.js                                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  Meta: () => Meta
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);

class MetaCollection extends Mongo.Collection {
  insert(data, callback) {
    const ourData = data;
    const result = super.insert(ourData, callback);
    return result;
  }

  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }

  remove(selector) {
    const result = super.remove(selector);
    return result;
  }

}

const Meta = new MetaCollection('meta');
// Deny all client-side updates since we will be using methods to manage this collection
Meta.deny({
  insert() {
    return true;
  },

  update() {
    return true;
  },

  remove() {
    return true;
  }

});
Meta.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  key: {
    type: String,
    index: true,
    denyUpdate: true
  },
  value: {
    type: String
  }
});
Meta.attachSchema(Meta.schema); // This represents the keys from Meta objects that should be published
// to the client. If we add secret properties to Meta objects, don't list
// them here to keep them private to the server.

Meta.publicFields = {};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"senders":{"senders.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/senders/senders.js                                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  Senders: () => Senders
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);

class SendersCollection extends Mongo.Collection {
  insert(sender, callback) {
    const ourSender = sender;
    ourSender.createdAt = ourSender.createdAt || new Date();
    const result = super.insert(ourSender, callback);
    return result;
  }

  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }

  remove(selector) {
    const result = super.remove(selector);
    return result;
  }

}

const Senders = new SendersCollection('senders');
// Deny all client-side updates since we will be using methods to manage this collection
Senders.deny({
  insert() {
    return true;
  },

  update() {
    return true;
  },

  remove() {
    return true;
  }

});
Senders.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  email: {
    type: String,
    index: true,
    denyUpdate: true
  },
  createdAt: {
    type: Date,
    denyUpdate: true
  }
});
Senders.attachSchema(Senders.schema); // This represents the keys from Sender objects that should be published
// to the client. If we add secret properties to Sender objects, don't list
// them here to keep them private to the server.

Senders.publicFields = {
  email: 1,
  createdAt: 1
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"modules":{"server":{"dapps":{"export_dois.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/dapps/export_dois.js                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let DOI_MAIL_FETCH_URL;
module.link("../../../startup/server/email-configuration.js", {
  DOI_MAIL_FETCH_URL(v) {
    DOI_MAIL_FETCH_URL = v;
  }

}, 2);
let logSend;
module.link("../../../startup/server/log-configuration", {
  logSend(v) {
    logSend = v;
  }

}, 3);
let OptIns;
module.link("../../../api/opt-ins/opt-ins", {
  OptIns(v) {
    OptIns = v;
  }

}, 4);
const ExportDoisDataSchema = new SimpleSchema({
  status: {
    type: String,
    optional: true
  },
  role: {
    type: String
  },
  userid: {
    type: String,
    regEx: SimpleSchema.RegEx.id,
    optional: true
  }
}); //TODO add sender and recipient email address to export

const exportDois = data => {
  try {
    const ourData = data;
    ExportDoisDataSchema.validate(ourData);
    let pipeline = [{
      $match: {
        "confirmedAt": {
          $exists: true,
          $ne: null
        }
      }
    }];

    if (ourData.role != 'admin' || ourData.userid != undefined) {
      pipeline.push({
        $redact: {
          $cond: {
            if: {
              $cmp: ["$ownerId", ourData.userid]
            },
            then: "$$PRUNE",
            else: "$$KEEP"
          }
        }
      });
    }

    pipeline.concat([{
      $lookup: {
        from: "recipients",
        localField: "recipient",
        foreignField: "_id",
        as: "RecipientEmail"
      }
    }, {
      $lookup: {
        from: "senders",
        localField: "sender",
        foreignField: "_id",
        as: "SenderEmail"
      }
    }, {
      $unwind: "$SenderEmail"
    }, {
      $unwind: "$RecipientEmail"
    }, {
      $project: {
        "_id": 1,
        "createdAt": 1,
        "confirmedAt": 1,
        "nameId": 1,
        "SenderEmail.email": 1,
        "RecipientEmail.email": 1
      }
    }]); //if(ourData.status==1) query = {"confirmedAt": { $exists: true, $ne: null }}

    let optIns = OptIns.aggregate(pipeline);
    let exportDoiData;

    try {
      exportDoiData = optIns;
      logSend('exportDoi url:', DOI_MAIL_FETCH_URL, JSON.stringify(exportDoiData));
      return exportDoiData;
    } catch (error) {
      throw "Error while exporting dois: " + error;
    }
  } catch (exception) {
    throw new Meteor.Error('dapps.exportDoi.exception', exception);
  }
};

module.exportDefault(exportDois);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"fetch_doi-mail-data.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/dapps/fetch_doi-mail-data.js                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let DOI_FETCH_ROUTE, DOI_CONFIRMATION_ROUTE, API_PATH, VERSION;
module.link("../../../../server/api/rest/rest.js", {
  DOI_FETCH_ROUTE(v) {
    DOI_FETCH_ROUTE = v;
  },

  DOI_CONFIRMATION_ROUTE(v) {
    DOI_CONFIRMATION_ROUTE = v;
  },

  API_PATH(v) {
    API_PATH = v;
  },

  VERSION(v) {
    VERSION = v;
  }

}, 2);
let getUrl;
module.link("../../../startup/server/dapp-configuration.js", {
  getUrl(v) {
    getUrl = v;
  }

}, 3);
let CONFIRM_CLIENT, CONFIRM_ADDRESS;
module.link("../../../startup/server/doichain-configuration.js", {
  CONFIRM_CLIENT(v) {
    CONFIRM_CLIENT = v;
  },

  CONFIRM_ADDRESS(v) {
    CONFIRM_ADDRESS = v;
  }

}, 4);
let getHttpGET;
module.link("../../../../server/api/http.js", {
  getHttpGET(v) {
    getHttpGET = v;
  }

}, 5);
let signMessage;
module.link("../../../../server/api/doichain.js", {
  signMessage(v) {
    signMessage = v;
  }

}, 6);
let OptIns;
module.link("../../../../imports/api/opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 7);
let parseTemplate;
module.link("../emails/parse_template.js", {
  default(v) {
    parseTemplate = v;
  }

}, 8);
let generateDoiToken;
module.link("../opt-ins/generate_doi-token.js", {
  default(v) {
    generateDoiToken = v;
  }

}, 9);
let generateDoiHash;
module.link("../emails/generate_doi-hash.js", {
  default(v) {
    generateDoiHash = v;
  }

}, 10);
let addOptIn;
module.link("../opt-ins/add.js", {
  default(v) {
    addOptIn = v;
  }

}, 11);
let addSendMailJob;
module.link("../jobs/add_send_mail.js", {
  default(v) {
    addSendMailJob = v;
  }

}, 12);
let logConfirm, logError;
module.link("../../../startup/server/log-configuration", {
  logConfirm(v) {
    logConfirm = v;
  },

  logError(v) {
    logError = v;
  }

}, 13);
const FetchDoiMailDataSchema = new SimpleSchema({
  name: {
    type: String
  },
  domain: {
    type: String
  }
});

const fetchDoiMailData = data => {
  try {
    const ourData = data;
    FetchDoiMailDataSchema.validate(ourData);
    const url = ourData.domain + API_PATH + VERSION + "/" + DOI_FETCH_ROUTE;
    const signature = signMessage(CONFIRM_CLIENT, CONFIRM_ADDRESS, ourData.name);
    const query = "name_id=" + encodeURIComponent(ourData.name) + "&signature=" + encodeURIComponent(signature);
    logConfirm('calling for doi-email-template:' + url + ' query:', query);
    /**
      TODO when running Send-dApp in Testnet behind NAT this URL will not be accessible from the internet
      but even when we use the URL from localhost verify andn others will fails.
     */

    const response = getHttpGET(url, query);
    if (response === undefined || response.data === undefined) throw "Bad response";
    const responseData = response.data;
    logConfirm('response while getting getting email template from URL:', response.data.status);

    if (responseData.status !== "success") {
      if (responseData.error === undefined) throw "Bad response";

      if (responseData.error.includes("Opt-In not found")) {
        //Do nothing and don't throw error so job is done
        logError('response data from Send-dApp:', responseData.error);
        return;
      }

      throw responseData.error;
    }

    logConfirm('DOI Mail data fetched.');
    const optInId = addOptIn({
      name: ourData.name
    });
    const optIn = OptIns.findOne({
      _id: optInId
    });
    logConfirm('opt-in found:', optIn);
    if (optIn.confirmationToken !== undefined) return;
    const token = generateDoiToken({
      id: optIn._id
    });
    logConfirm('generated confirmationToken:', token);
    const confirmationHash = generateDoiHash({
      id: optIn._id,
      token: token,
      redirect: responseData.data.redirect
    });
    logConfirm('generated confirmationHash:', confirmationHash);
    const confirmationUrl = getUrl() + API_PATH + VERSION + "/" + DOI_CONFIRMATION_ROUTE + "/" + encodeURIComponent(confirmationHash);
    logConfirm('confirmationUrl:' + confirmationUrl);
    const template = parseTemplate({
      template: responseData.data.content,
      data: {
        confirmation_url: confirmationUrl
      }
    }); //logConfirm('we are using this template:',template);

    logConfirm('sending email to peter for confirmation over bobs dApp');
    addSendMailJob({
      to: responseData.data.recipient,
      subject: responseData.data.subject,
      message: template,
      returnPath: responseData.data.returnPath
    });
  } catch (exception) {
    throw new Meteor.Error('dapps.fetchDoiMailData.exception', exception);
  }
};

module.exportDefault(fetchDoiMailData);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get_doi-mail-data.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/dapps/get_doi-mail-data.js                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let OptIns;
module.link("../../../api/opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 2);
let Recipients;
module.link("../../../api/recipients/recipients.js", {
  Recipients(v) {
    Recipients = v;
  }

}, 3);
let getOptInProvider;
module.link("../dns/get_opt-in-provider.js", {
  default(v) {
    getOptInProvider = v;
  }

}, 4);
let getOptInKey;
module.link("../dns/get_opt-in-key.js", {
  default(v) {
    getOptInKey = v;
  }

}, 5);
let verifySignature;
module.link("../doichain/verify_signature.js", {
  default(v) {
    verifySignature = v;
  }

}, 6);
let getHttpGET;
module.link("../../../../server/api/http.js", {
  getHttpGET(v) {
    getHttpGET = v;
  }

}, 7);
let DOI_MAIL_FETCH_URL;
module.link("../../../startup/server/email-configuration.js", {
  DOI_MAIL_FETCH_URL(v) {
    DOI_MAIL_FETCH_URL = v;
  }

}, 8);
let logSend;
module.link("../../../startup/server/log-configuration", {
  logSend(v) {
    logSend = v;
  }

}, 9);
let Accounts;
module.link("meteor/accounts-base", {
  Accounts(v) {
    Accounts = v;
  }

}, 10);
const GetDoiMailDataSchema = new SimpleSchema({
  name_id: {
    type: String
  },
  signature: {
    type: String
  }
});
const userProfileSchema = new SimpleSchema({
  subject: {
    type: String,
    optional: true
  },
  redirect: {
    type: String,
    regEx: "@(https?|ftp)://(-\\.)?([^\\s/?\\.#-]+\\.?)+(/[^\\s]*)?$@",
    optional: true
  },
  returnPath: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  templateURL: {
    type: String,
    regEx: "@(https?|ftp)://(-\\.)?([^\\s/?\\.#-]+\\.?)+(/[^\\s]*)?$@",
    optional: true
  }
});

const getDoiMailData = data => {
  try {
    const ourData = data;
    GetDoiMailDataSchema.validate(ourData);
    const optIn = OptIns.findOne({
      nameId: ourData.name_id
    });
    if (optIn === undefined) throw "Opt-In with name_id: " + ourData.name_id + " not found";
    logSend('Opt-In found', optIn);
    const recipient = Recipients.findOne({
      _id: optIn.recipient
    });
    if (recipient === undefined) throw "Recipient not found";
    logSend('Recipient found', recipient);
    const parts = recipient.email.split("@");
    const domain = parts[parts.length - 1];
    let publicKey = getOptInKey({
      domain: domain
    });

    if (!publicKey) {
      const provider = getOptInProvider({
        domain: ourData.domain
      });
      logSend("using doichain provider instead of directly configured publicKey:", {
        provider: provider
      });
      publicKey = getOptInKey({
        domain: provider
      }); //get public key from provider or fallback if publickey was not set in dns
    }

    logSend('queried data: (parts, domain, provider, publicKey)', '(' + parts + ',' + domain + ',' + publicKey + ')'); //TODO: Only allow access one time
    // Possible solution:
    // 1. Provider (confirm dApp) request the data
    // 2. Provider receive the data
    // 3. Provider sends confirmation "I got the data"
    // 4. Send dApp lock the data for this opt in

    logSend('verifying signature...');

    if (!verifySignature({
      publicKey: publicKey,
      data: ourData.name_id,
      signature: ourData.signature
    })) {
      throw "signature incorrect - access denied";
    }

    logSend('signature verified'); //TODO: Query for language

    let doiMailData;

    try {
      doiMailData = getHttpGET(DOI_MAIL_FETCH_URL, "").data;
      let defaultReturnData = {
        "recipient": recipient.email,
        "content": doiMailData.data.content,
        "redirect": doiMailData.data.redirect,
        "subject": doiMailData.data.subject,
        "returnPath": doiMailData.data.returnPath
      };
      let returnData = defaultReturnData;

      try {
        let owner = Accounts.users.findOne({
          _id: optIn.ownerId
        });
        let mailTemplate = owner.profile.mailTemplate;
        userProfileSchema.validate(mailTemplate);
        returnData["redirect"] = mailTemplate["redirect"] || defaultReturnData["redirect"];
        returnData["subject"] = mailTemplate["subject"] || defaultReturnData["subject"];
        returnData["returnPath"] = mailTemplate["returnPath"] || defaultReturnData["returnPath"];
        returnData["content"] = mailTemplate["templateURL"] ? getHttpGET(mailTemplate["templateURL"], "").content || defaultReturnData["content"] : defaultReturnData["content"];
      } catch (error) {
        returnData = defaultReturnData;
      }

      logSend('doiMailData and url:', DOI_MAIL_FETCH_URL, returnData);
      return returnData;
    } catch (error) {
      throw "Error while fetching mail content: " + error;
    }
  } catch (exception) {
    throw new Meteor.Error('dapps.getDoiMailData.exception', exception);
  }
};

module.exportDefault(getDoiMailData);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"dns":{"get_opt-in-key.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/dns/get_opt-in-key.js                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let resolveTxt;
module.link("../../../../server/api/dns.js", {
  resolveTxt(v) {
    resolveTxt = v;
  }

}, 2);
let FALLBACK_PROVIDER;
module.link("../../../startup/server/dns-configuration.js", {
  FALLBACK_PROVIDER(v) {
    FALLBACK_PROVIDER = v;
  }

}, 3);
let isRegtest, isTestnet;
module.link("../../../startup/server/dapp-configuration", {
  isRegtest(v) {
    isRegtest = v;
  },

  isTestnet(v) {
    isTestnet = v;
  }

}, 4);
let logSend;
module.link("../../../startup/server/log-configuration", {
  logSend(v) {
    logSend = v;
  }

}, 5);
const OPT_IN_KEY = "doichain-opt-in-key";
const OPT_IN_KEY_TESTNET = "doichain-testnet-opt-in-key";
const GetOptInKeySchema = new SimpleSchema({
  domain: {
    type: String
  }
});

const getOptInKey = data => {
  try {
    const ourData = data;
    GetOptInKeySchema.validate(ourData);
    let ourOPT_IN_KEY = OPT_IN_KEY;

    if (isRegtest() || isTestnet()) {
      ourOPT_IN_KEY = OPT_IN_KEY_TESTNET;
      logSend('Using RegTest:' + isRegtest() + " Testnet: " + isTestnet() + " ourOPT_IN_KEY", ourOPT_IN_KEY);
    }

    const key = resolveTxt(ourOPT_IN_KEY, ourData.domain);
    logSend('DNS TXT configured public key of recipient email domain and confirmation dapp', {
      foundKey: key,
      domain: ourData.domain,
      dnskey: ourOPT_IN_KEY
    });
    if (key === undefined) return useFallback(ourData.domain);
    return key;
  } catch (exception) {
    throw new Meteor.Error('dns.getOptInKey.exception', exception);
  }
};

const useFallback = domain => {
  if (domain === FALLBACK_PROVIDER) throw new Meteor.Error("Fallback has no key defined!");
  logSend("Key not defined. Using fallback: ", FALLBACK_PROVIDER);
  return getOptInKey({
    domain: FALLBACK_PROVIDER
  });
};

module.exportDefault(getOptInKey);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get_opt-in-provider.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/dns/get_opt-in-provider.js                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let resolveTxt;
module.link("../../../../server/api/dns.js", {
  resolveTxt(v) {
    resolveTxt = v;
  }

}, 2);
let FALLBACK_PROVIDER;
module.link("../../../startup/server/dns-configuration.js", {
  FALLBACK_PROVIDER(v) {
    FALLBACK_PROVIDER = v;
  }

}, 3);
let logSend;
module.link("../../../startup/server/log-configuration", {
  logSend(v) {
    logSend = v;
  }

}, 4);
let isRegtest, isTestnet;
module.link("../../../startup/server/dapp-configuration", {
  isRegtest(v) {
    isRegtest = v;
  },

  isTestnet(v) {
    isTestnet = v;
  }

}, 5);
const PROVIDER_KEY = "doichain-opt-in-provider";
const PROVIDER_KEY_TESTNET = "doichain-testnet-opt-in-provider";
const GetOptInProviderSchema = new SimpleSchema({
  domain: {
    type: String
  }
});

const getOptInProvider = data => {
  try {
    const ourData = data;
    GetOptInProviderSchema.validate(ourData);
    let ourPROVIDER_KEY = PROVIDER_KEY;

    if (isRegtest() || isTestnet()) {
      ourPROVIDER_KEY = PROVIDER_KEY_TESTNET;
      logSend('Using RegTest:' + isRegtest() + " : Testnet:" + isTestnet() + " PROVIDER_KEY", {
        providerKey: ourPROVIDER_KEY,
        domain: ourData.domain
      });
    }

    const provider = resolveTxt(ourPROVIDER_KEY, ourData.domain);
    if (provider === undefined) return useFallback();
    logSend('opt-in-provider from dns - server of mail recipient: (TXT):', provider);
    return provider;
  } catch (exception) {
    throw new Meteor.Error('dns.getOptInProvider.exception', exception);
  }
};

const useFallback = () => {
  logSend('Provider not defined. Fallback ' + FALLBACK_PROVIDER + ' is used');
  return FALLBACK_PROVIDER;
};

module.exportDefault(getOptInProvider);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"doichain":{"add_entry_and_fetch_data.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/add_entry_and_fetch_data.js                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let CONFIRM_CLIENT, CONFIRM_ADDRESS;
module.link("../../../startup/server/doichain-configuration.js", {
  CONFIRM_CLIENT(v) {
    CONFIRM_CLIENT = v;
  },

  CONFIRM_ADDRESS(v) {
    CONFIRM_ADDRESS = v;
  }

}, 2);
let getWif;
module.link("../../../../server/api/doichain.js", {
  getWif(v) {
    getWif = v;
  }

}, 3);
let DoichainEntries;
module.link("../../../api/doichain/entries.js", {
  DoichainEntries(v) {
    DoichainEntries = v;
  }

}, 4);
let addFetchDoiMailDataJob;
module.link("../jobs/add_fetch-doi-mail-data.js", {
  default(v) {
    addFetchDoiMailDataJob = v;
  }

}, 5);
let getPrivateKeyFromWif;
module.link("./get_private-key_from_wif.js", {
  default(v) {
    getPrivateKeyFromWif = v;
  }

}, 6);
let decryptMessage;
module.link("./decrypt_message.js", {
  default(v) {
    decryptMessage = v;
  }

}, 7);
let logConfirm, logSend;
module.link("../../../startup/server/log-configuration", {
  logConfirm(v) {
    logConfirm = v;
  },

  logSend(v) {
    logSend = v;
  }

}, 8);
const AddDoichainEntrySchema = new SimpleSchema({
  name: {
    type: String
  },
  value: {
    type: String
  },
  address: {
    type: String
  },
  txId: {
    type: String
  }
});
/**
 * Inserts
 *
 * @param entry
 * @returns {*}
 */

const addDoichainEntry = entry => {
  try {
    const ourEntry = entry;
    logConfirm('adding DoichainEntry on Bob...', ourEntry.name);
    AddDoichainEntrySchema.validate(ourEntry);
    const ety = DoichainEntries.findOne({
      name: ourEntry.name
    });

    if (ety !== undefined) {
      logSend('returning locally saved entry with _id:' + ety._id);
      return ety._id;
    }

    const value = JSON.parse(ourEntry.value); //logSend("value:",value);

    if (value.from === undefined) throw "Wrong blockchain entry"; //TODO if from is missing but value is there, it is probably allready handeled correctly anyways this is not so cool as it seems.

    const wif = getWif(CONFIRM_CLIENT, CONFIRM_ADDRESS);
    const privateKey = getPrivateKeyFromWif({
      wif: wif
    });
    logSend('got private key (will not show it here)');
    const domain = decryptMessage({
      privateKey: privateKey,
      message: value.from
    });
    logSend('decrypted message from domain: ', domain);
    const namePos = ourEntry.name.indexOf('-'); //if this is not a co-registration fetch mail.

    logSend('namePos:', namePos);
    const masterDoi = namePos != -1 ? ourEntry.name.substring(0, namePos) : undefined;
    logSend('masterDoi:', masterDoi);
    const index = masterDoi ? ourEntry.name.substring(namePos + 1) : undefined;
    logSend('index:', index);
    const id = DoichainEntries.insert({
      name: ourEntry.name,
      value: ourEntry.value,
      address: ourEntry.address,
      masterDoi: masterDoi,
      index: index,
      txId: ourEntry.txId,
      expiresIn: ourEntry.expiresIn,
      expired: ourEntry.expired
    });
    logSend('DoichainEntry added on Bob:', {
      id: id,
      name: ourEntry.name,
      masterDoi: masterDoi,
      index: index
    });

    if (!masterDoi) {
      addFetchDoiMailDataJob({
        name: ourEntry.name,
        domain: domain
      });
      logSend('New entry added: \n' + 'NameId=' + ourEntry.name + "\n" + 'Address=' + ourEntry.address + "\n" + 'TxId=' + ourEntry.txId + "\n" + 'Value=' + ourEntry.value);
    } else {
      logSend('This transaction belongs to co-registration', masterDoi);
    }

    return id;
  } catch (exception) {
    throw new Meteor.Error('doichain.addEntryAndFetchData.exception', exception);
  }
};

module.exportDefault(addDoichainEntry);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"check_new_transactions.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/check_new_transactions.js                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let listSinceBlock, nameShow, getRawTransaction;
module.link("../../../../server/api/doichain.js", {
  listSinceBlock(v) {
    listSinceBlock = v;
  },

  nameShow(v) {
    nameShow = v;
  },

  getRawTransaction(v) {
    getRawTransaction = v;
  }

}, 1);
let CONFIRM_CLIENT, CONFIRM_ADDRESS;
module.link("../../../startup/server/doichain-configuration.js", {
  CONFIRM_CLIENT(v) {
    CONFIRM_CLIENT = v;
  },

  CONFIRM_ADDRESS(v) {
    CONFIRM_ADDRESS = v;
  }

}, 2);
let addDoichainEntry;
module.link("./add_entry_and_fetch_data.js", {
  default(v) {
    addDoichainEntry = v;
  }

}, 3);
let Meta;
module.link("../../../api/meta/meta.js", {
  Meta(v) {
    Meta = v;
  }

}, 4);
let addOrUpdateMeta;
module.link("../meta/addOrUpdate.js", {
  default(v) {
    addOrUpdateMeta = v;
  }

}, 5);
let logConfirm;
module.link("../../../startup/server/log-configuration", {
  logConfirm(v) {
    logConfirm = v;
  }

}, 6);
const TX_NAME_START = "e/";
const LAST_CHECKED_BLOCK_KEY = "lastCheckedBlock";

const checkNewTransaction = (txid, job) => {
  try {
    if (!txid) {
      logConfirm("checkNewTransaction triggered when starting node - checking all confirmed blocks since last check for doichain address", CONFIRM_ADDRESS);

      try {
        var lastCheckedBlock = Meta.findOne({
          key: LAST_CHECKED_BLOCK_KEY
        });
        if (lastCheckedBlock !== undefined) lastCheckedBlock = lastCheckedBlock.value;
        logConfirm("lastCheckedBlock", lastCheckedBlock);
        const ret = listSinceBlock(CONFIRM_CLIENT, lastCheckedBlock);
        if (ret === undefined || ret.transactions === undefined) return;
        const txs = ret.transactions;
        lastCheckedBlock = ret.lastblock;

        if (!ret || !txs || !txs.length === 0) {
          logConfirm("transactions do not contain nameOp transaction details or transaction not found.", lastCheckedBlock);
          addOrUpdateMeta({
            key: LAST_CHECKED_BLOCK_KEY,
            value: lastCheckedBlock
          });
          return;
        }

        logConfirm("listSinceBlock", ret);
        const addressTxs = txs.filter(tx => tx.address === CONFIRM_ADDRESS && tx.name !== undefined //since name_show cannot be read without confirmations
        && tx.name.startsWith("doi: " + TX_NAME_START) //here 'doi: e/xxxx' is already written in the block
        );
        addressTxs.forEach(tx => {
          logConfirm("tx:", tx);
          var txName = tx.name.substring(("doi: " + TX_NAME_START).length);
          logConfirm("excuting name_show in order to get value of nameId:", txName);
          const ety = nameShow(CONFIRM_CLIENT, txName);
          logConfirm("nameShow: value", ety);

          if (!ety) {
            logConfirm("couldn't find name - obviously not (yet?!) confirmed in blockchain:", ety);
            return;
          }

          addTx(txName, ety.value, tx.address, tx.txid); //TODO ety.value.from is maybe NOT existing because of this its  (maybe) ont working...
        });
        addOrUpdateMeta({
          key: LAST_CHECKED_BLOCK_KEY,
          value: lastCheckedBlock
        });
        logConfirm("Transactions updated - lastCheckedBlock:", lastCheckedBlock);
        job.done();
      } catch (exception) {
        throw new Meteor.Error('namecoin.checkNewTransactions.exception', exception);
      }
    } else {
      logConfirm("txid: " + txid + " was triggered by walletnotify for address:", CONFIRM_ADDRESS);
      const ret = getRawTransaction(CONFIRM_CLIENT, txid);
      const txs = ret.vout;

      if (!ret || !txs || !txs.length === 0) {
        logConfirm("txid " + txid + ' does not contain transaction details or transaction not found.');
        return;
      } // logConfirm('now checking raw transactions with filter:',txs);


      const addressTxs = txs.filter(tx => tx.scriptPubKey !== undefined && tx.scriptPubKey.nameOp !== undefined && tx.scriptPubKey.nameOp.op === "name_doi" //  && tx.scriptPubKey.addresses[0] === CONFIRM_ADDRESS //only own transaction should arrive here. - so check on own address unneccesary
      && tx.scriptPubKey.nameOp.name !== undefined && tx.scriptPubKey.nameOp.name.startsWith(TX_NAME_START)); //logConfirm("found name_op transactions:", addressTxs);

      addressTxs.forEach(tx => {
        addTx(tx.scriptPubKey.nameOp.name, tx.scriptPubKey.nameOp.value, tx.scriptPubKey.addresses[0], txid);
      });
    }
  } catch (exception) {
    throw new Meteor.Error('doichain.checkNewTransactions.exception', exception);
  }

  return true;
};

function addTx(name, value, address, txid) {
  const txName = name.substring(TX_NAME_START.length);
  addDoichainEntry({
    name: txName,
    value: value,
    address: address,
    txId: txid
  });
}

module.exportDefault(checkNewTransaction);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"decrypt_message.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/decrypt_message.js                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let crypto;
module.link("crypto", {
  default(v) {
    crypto = v;
  }

}, 2);
let ecies;
module.link("standard-ecies", {
  default(v) {
    ecies = v;
  }

}, 3);
const DecryptMessageSchema = new SimpleSchema({
  privateKey: {
    type: String
  },
  message: {
    type: String
  }
});

const decryptMessage = data => {
  try {
    const ourData = data;
    DecryptMessageSchema.validate(ourData);
    const privateKey = Buffer.from(ourData.privateKey, 'hex');
    const ecdh = crypto.createECDH('secp256k1');
    ecdh.setPrivateKey(privateKey);
    const message = Buffer.from(ourData.message, 'hex');
    return ecies.decrypt(ecdh, message).toString('utf8');
  } catch (exception) {
    throw new Meteor.Error('doichain.decryptMessage.exception', exception);
  }
};

module.exportDefault(decryptMessage);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"encrypt_message.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/encrypt_message.js                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let ecies;
module.link("standard-ecies", {
  default(v) {
    ecies = v;
  }

}, 2);
const EncryptMessageSchema = new SimpleSchema({
  publicKey: {
    type: String
  },
  message: {
    type: String
  }
});

const encryptMessage = data => {
  try {
    const ourData = data;
    EncryptMessageSchema.validate(ourData);
    const publicKey = Buffer.from(ourData.publicKey, 'hex');
    const message = Buffer.from(ourData.message);
    return ecies.encrypt(publicKey, message).toString('hex');
  } catch (exception) {
    throw new Meteor.Error('doichain.encryptMessage.exception', exception);
  }
};

module.exportDefault(encryptMessage);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"generate_name-id.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/generate_name-id.js                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let OptIns;
module.link("../../../api/opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 2);
let getKeyPair;
module.link("./get_key-pair.js", {
  default(v) {
    getKeyPair = v;
  }

}, 3);
let logSend;
module.link("../../../startup/server/log-configuration", {
  logSend(v) {
    logSend = v;
  }

}, 4);
const GenerateNameIdSchema = new SimpleSchema({
  id: {
    type: String
  },
  masterDoi: {
    type: String,
    optional: true
  },
  index: {
    type: SimpleSchema.Integer,
    optional: true
  }
});

const generateNameId = optIn => {
  try {
    const ourOptIn = optIn;
    GenerateNameIdSchema.validate(ourOptIn);
    let nameId;

    if (optIn.masterDoi) {
      nameId = ourOptIn.masterDoi + "-" + ourOptIn.index;
      logSend("used master_doi as nameId index " + optIn.index + "storage:", nameId);
    } else {
      nameId = getKeyPair().privateKey;
      logSend("generated nameId for doichain storage:", nameId);
    }

    OptIns.update({
      _id: ourOptIn.id
    }, {
      $set: {
        nameId: nameId
      }
    });
    return nameId;
  } catch (exception) {
    throw new Meteor.Error('doichain.generateNameId.exception', exception);
  }
};

module.exportDefault(generateNameId);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get_address.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/get_address.js                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let CryptoJS;
module.link("crypto-js", {
  default(v) {
    CryptoJS = v;
  }

}, 2);
let Base58;
module.link("bs58", {
  default(v) {
    Base58 = v;
  }

}, 3);
let isRegtest;
module.link("../../../startup/server/dapp-configuration.js", {
  isRegtest(v) {
    isRegtest = v;
  }

}, 4);
let isTestnet;
module.link("../../../startup/server/dapp-configuration", {
  isTestnet(v) {
    isTestnet = v;
  }

}, 5);
const VERSION_BYTE = 0x34;
const VERSION_BYTE_REGTEST = 0x6f;
const GetAddressSchema = new SimpleSchema({
  publicKey: {
    type: String
  }
});

const getAddress = data => {
  try {
    const ourData = data;
    GetAddressSchema.validate(ourData);
    return _getAddress(ourData.publicKey);
  } catch (exception) {
    throw new Meteor.Error('doichain.getAddress.exception', exception);
  }
};

function _getAddress(publicKey) {
  const pubKey = CryptoJS.lib.WordArray.create(Buffer.from(publicKey, 'hex'));
  let key = CryptoJS.SHA256(pubKey);
  key = CryptoJS.RIPEMD160(key);
  let versionByte = VERSION_BYTE;
  if (isRegtest() || isTestnet()) versionByte = VERSION_BYTE_REGTEST;
  let address = Buffer.concat([Buffer.from([versionByte]), Buffer.from(key.toString(), 'hex')]);
  key = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(address));
  key = CryptoJS.SHA256(key);
  let checksum = key.toString().substring(0, 8);
  address = new Buffer(address.toString('hex') + checksum, 'hex');
  address = Base58.encode(address);
  return address;
}

module.exportDefault(getAddress);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get_balance.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/get_balance.js                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let getBalance;
module.link("../../../../server/api/doichain.js", {
  getBalance(v) {
    getBalance = v;
  }

}, 1);
let CONFIRM_CLIENT;
module.link("../../../startup/server/doichain-configuration.js", {
  CONFIRM_CLIENT(v) {
    CONFIRM_CLIENT = v;
  }

}, 2);

const get_Balance = () => {
  try {
    const bal = getBalance(CONFIRM_CLIENT);
    return bal;
  } catch (exception) {
    throw new Meteor.Error('doichain.getBalance.exception', exception);
  }

  return true;
};

module.exportDefault(get_Balance);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get_data-hash.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/get_data-hash.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let CryptoJS;
module.link("crypto-js", {
  default(v) {
    CryptoJS = v;
  }

}, 1);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 2);
const GetDataHashSchema = new SimpleSchema({
  data: {
    type: String
  }
});

const getDataHash = data => {
  try {
    const ourData = data;
    GetDataHashSchema.validate(ourData);
    const hash = CryptoJS.SHA256(ourData).toString();
    return hash;
  } catch (exception) {
    throw new Meteor.Error('doichain.getDataHash.exception', exception);
  }
};

module.exportDefault(getDataHash);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get_key-pair.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/get_key-pair.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let randomBytes;
module.link("crypto", {
  randomBytes(v) {
    randomBytes = v;
  }

}, 1);
let secp256k1;
module.link("secp256k1", {
  default(v) {
    secp256k1 = v;
  }

}, 2);

const getKeyPair = () => {
  try {
    let privKey;

    do {
      privKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privKey));

    const privateKey = privKey;
    const publicKey = secp256k1.publicKeyCreate(privateKey);
    return {
      privateKey: privateKey.toString('hex').toUpperCase(),
      publicKey: publicKey.toString('hex').toUpperCase()
    };
  } catch (exception) {
    throw new Meteor.Error('doichain.getKeyPair.exception', exception);
  }
};

module.exportDefault(getKeyPair);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get_private-key_from_wif.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/get_private-key_from_wif.js                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let Base58;
module.link("bs58", {
  default(v) {
    Base58 = v;
  }

}, 2);
const GetPrivateKeyFromWifSchema = new SimpleSchema({
  wif: {
    type: String
  }
});

const getPrivateKeyFromWif = data => {
  try {
    const ourData = data;
    GetPrivateKeyFromWifSchema.validate(ourData);
    return _getPrivateKeyFromWif(ourData.wif);
  } catch (exception) {
    throw new Meteor.Error('doichain.getPrivateKeyFromWif.exception', exception);
  }
};

function _getPrivateKeyFromWif(wif) {
  var privateKey = Base58.decode(wif).toString('hex');
  privateKey = privateKey.substring(2, privateKey.length - 8);

  if (privateKey.length === 66 && privateKey.endsWith("01")) {
    privateKey = privateKey.substring(0, privateKey.length - 2);
  }

  return privateKey;
}

module.exportDefault(getPrivateKeyFromWif);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get_publickey_and_address_by_domain.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/get_publickey_and_address_by_domain.js                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 0);
let logSend;
module.link("../../../startup/server/log-configuration", {
  logSend(v) {
    logSend = v;
  }

}, 1);
let getOptInKey;
module.link("../dns/get_opt-in-key", {
  default(v) {
    getOptInKey = v;
  }

}, 2);
let getOptInProvider;
module.link("../dns/get_opt-in-provider", {
  default(v) {
    getOptInProvider = v;
  }

}, 3);
let getAddress;
module.link("./get_address", {
  default(v) {
    getAddress = v;
  }

}, 4);
const GetPublicKeySchema = new SimpleSchema({
  domain: {
    type: String
  }
});

const getPublicKeyAndAddress = data => {
  const ourData = data;
  GetPublicKeySchema.validate(ourData);
  let publicKey = getOptInKey({
    domain: ourData.domain
  });

  if (!publicKey) {
    const provider = getOptInProvider({
      domain: ourData.domain
    });
    logSend("using doichain provider instead of directly configured publicKey:", {
      provider: provider
    });
    publicKey = getOptInKey({
      domain: provider
    }); //get public key from provider or fallback if publickey was not set in dns
  }

  const destAddress = getAddress({
    publicKey: publicKey
  });
  logSend('publicKey and destAddress ', {
    publicKey: publicKey,
    destAddress: destAddress
  });
  return {
    publicKey: publicKey,
    destAddress: destAddress
  };
};

module.exportDefault(getPublicKeyAndAddress);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"get_signature.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/get_signature.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let bitcore;
module.link("bitcore-lib", {
  default(v) {
    bitcore = v;
  }

}, 2);
let Message;
module.link("bitcore-message", {
  default(v) {
    Message = v;
  }

}, 3);
const GetSignatureSchema = new SimpleSchema({
  message: {
    type: String
  },
  privateKey: {
    type: String
  }
});

const getSignature = data => {
  try {
    const ourData = data;
    GetSignatureSchema.validate(ourData);
    const signature = Message(ourData.message).sign(new bitcore.PrivateKey(ourData.privateKey));
    return signature;
  } catch (exception) {
    throw new Meteor.Error('doichain.getSignature.exception', exception);
  }
};

module.exportDefault(getSignature);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"insert.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/insert.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let SEND_CLIENT;
module.link("../../../startup/server/doichain-configuration.js", {
  SEND_CLIENT(v) {
    SEND_CLIENT = v;
  }

}, 2);
let encryptMessage;
module.link("./encrypt_message", {
  default(v) {
    encryptMessage = v;
  }

}, 3);
let getUrl;
module.link("../../../startup/server/dapp-configuration", {
  getUrl(v) {
    getUrl = v;
  }

}, 4);
let logBlockchain, logSend;
module.link("../../../startup/server/log-configuration", {
  logBlockchain(v) {
    logBlockchain = v;
  },

  logSend(v) {
    logSend = v;
  }

}, 5);
let feeDoi, nameDoi;
module.link("../../../../server/api/doichain", {
  feeDoi(v) {
    feeDoi = v;
  },

  nameDoi(v) {
    nameDoi = v;
  }

}, 6);
let OptIns;
module.link("../../../api/opt-ins/opt-ins", {
  OptIns(v) {
    OptIns = v;
  }

}, 7);
let getPublicKeyAndAddress;
module.link("./get_publickey_and_address_by_domain", {
  default(v) {
    getPublicKeyAndAddress = v;
  }

}, 8);
const InsertSchema = new SimpleSchema({
  nameId: {
    type: String
  },
  signature: {
    type: String
  },
  dataHash: {
    type: String
  },
  domain: {
    type: String
  },
  soiDate: {
    type: Date
  }
});

const insert = data => {
  const ourData = data;

  try {
    InsertSchema.validate(ourData);
    logSend("domain:", ourData.domain);
    const publicKeyAndAddress = getPublicKeyAndAddress({
      domain: ourData.domain
    });
    const from = encryptMessage({
      publicKey: publicKeyAndAddress.publicKey,
      message: getUrl()
    });
    logSend('encrypted url for use ad from in doichain value:', getUrl(), from);
    const nameValue = JSON.stringify({
      signature: ourData.signature,
      dataHash: ourData.dataHash,
      from: from
    }); //TODO (!) this must be replaced in future by "atomic name trading example" https://wiki.namecoin.info/?title=Atomic_Name-Trading

    logBlockchain('sending a fee to bob so he can pay the doi storage (destAddress):', publicKeyAndAddress.destAddress);
    const feeDoiTx = feeDoi(SEND_CLIENT, publicKeyAndAddress.destAddress);
    logBlockchain('fee send txid to destaddress', feeDoiTx, publicKeyAndAddress.destAddress);
    logBlockchain('adding data to blockchain via name_doi (nameId,value,destAddress):', ourData.nameId, nameValue, publicKeyAndAddress.destAddress);
    const nameDoiTx = nameDoi(SEND_CLIENT, ourData.nameId, nameValue, publicKeyAndAddress.destAddress);
    logBlockchain('name_doi added blockchain. txid:', nameDoiTx);
    OptIns.update({
      nameId: ourData.nameId
    }, {
      $set: {
        txId: nameDoiTx
      }
    });
    logBlockchain('updating OptIn locally with:', {
      nameId: ourData.nameId,
      txId: nameDoiTx
    });
  } catch (exception) {
    OptIns.update({
      nameId: ourData.nameId
    }, {
      $set: {
        error: JSON.stringify(exception.message)
      }
    });
    throw new Meteor.Error('doichain.insert.exception', exception); //TODO update opt-in in local db to inform user about the error! e.g. Insufficient funds etc.
  }
};

module.exportDefault(insert);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"update.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/update.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let CONFIRM_CLIENT;
module.link("../../../startup/server/doichain-configuration.js", {
  CONFIRM_CLIENT(v) {
    CONFIRM_CLIENT = v;
  }

}, 2);
let getWif, signMessage, getTransaction, nameDoi, nameShow;
module.link("../../../../server/api/doichain", {
  getWif(v) {
    getWif = v;
  },

  signMessage(v) {
    signMessage = v;
  },

  getTransaction(v) {
    getTransaction = v;
  },

  nameDoi(v) {
    nameDoi = v;
  },

  nameShow(v) {
    nameShow = v;
  }

}, 3);
let API_PATH, DOI_CONFIRMATION_NOTIFY_ROUTE, VERSION;
module.link("../../../../server/api/rest/rest", {
  API_PATH(v) {
    API_PATH = v;
  },

  DOI_CONFIRMATION_NOTIFY_ROUTE(v) {
    DOI_CONFIRMATION_NOTIFY_ROUTE = v;
  },

  VERSION(v) {
    VERSION = v;
  }

}, 4);
let CONFIRM_ADDRESS;
module.link("../../../startup/server/doichain-configuration", {
  CONFIRM_ADDRESS(v) {
    CONFIRM_ADDRESS = v;
  }

}, 5);
let getHttpPUT;
module.link("../../../../server/api/http", {
  getHttpPUT(v) {
    getHttpPUT = v;
  }

}, 6);
let logConfirm;
module.link("../../../startup/server/log-configuration", {
  logConfirm(v) {
    logConfirm = v;
  }

}, 7);
let getPrivateKeyFromWif;
module.link("./get_private-key_from_wif", {
  default(v) {
    getPrivateKeyFromWif = v;
  }

}, 8);
let decryptMessage;
module.link("./decrypt_message", {
  default(v) {
    decryptMessage = v;
  }

}, 9);
let OptIns;
module.link("../../../api/opt-ins/opt-ins", {
  OptIns(v) {
    OptIns = v;
  }

}, 10);
const UpdateSchema = new SimpleSchema({
  nameId: {
    type: String
  },
  value: {
    type: String
  },
  host: {
    type: String,
    optional: true
  },
  fromHostUrl: {
    type: String
  }
});

const update = (data, job) => {
  try {
    const ourData = data;
    UpdateSchema.validate(ourData); //stop this update until this name as at least 1 confirmation

    const name_data = nameShow(CONFIRM_CLIENT, ourData.nameId);

    if (name_data === undefined) {
      rerun(job);
      logConfirm('name not visible - delaying name update', ourData.nameId);
      return;
    }

    const our_transaction = getTransaction(CONFIRM_CLIENT, name_data.txid);

    if (our_transaction.confirmations === 0) {
      rerun(job);
      logConfirm('transaction has 0 confirmations - delaying name update', JSON.parse(ourData.value));
      return;
    }

    logConfirm('updating blockchain with doiSignature:', JSON.parse(ourData.value));
    const wif = getWif(CONFIRM_CLIENT, CONFIRM_ADDRESS);
    const privateKey = getPrivateKeyFromWif({
      wif: wif
    });
    logConfirm('got private key (will not show it here) in order to decrypt Send-dApp host url from value:', ourData.fromHostUrl);
    const ourfromHostUrl = decryptMessage({
      privateKey: privateKey,
      message: ourData.fromHostUrl
    });
    logConfirm('decrypted fromHostUrl', ourfromHostUrl);
    const url = ourfromHostUrl + API_PATH + VERSION + "/" + DOI_CONFIRMATION_NOTIFY_ROUTE;
    logConfirm('creating signature with ADDRESS' + CONFIRM_ADDRESS + " nameId:", ourData.value);
    const signature = signMessage(CONFIRM_CLIENT, CONFIRM_ADDRESS, ourData.nameId); //TODO why here over nameID?

    logConfirm('signature created:', signature);
    const updateData = {
      nameId: ourData.nameId,
      signature: signature,
      host: ourData.host
    };

    try {
      const txid = nameDoi(CONFIRM_CLIENT, ourData.nameId, ourData.value, null);
      logConfirm('update transaction txid:', txid);
    } catch (exception) {
      //
      logConfirm('this nameDOI doesn´t have a block yet and will be updated with the next block and with the next queue start:', ourData.nameId);

      if (exception.toString().indexOf("there is already a registration for this doi name") == -1) {
        OptIns.update({
          nameId: ourData.nameId
        }, {
          $set: {
            error: JSON.stringify(exception.message)
          }
        });
      }

      throw new Meteor.Error('doichain.update.exception', exception); //}else{
      //    logConfirm('this nameDOI doesn´t have a block yet and will be updated with the next block and with the next queue start:',ourData.nameId);
      //}
    }

    const response = getHttpPUT(url, updateData);
    logConfirm('informed send dApp about confirmed doi on url:' + url + ' with updateData' + JSON.stringify(updateData) + " response:", response.data);
    job.done();
  } catch (exception) {
    throw new Meteor.Error('doichain.update.exception', exception);
  }
};

function rerun(job) {
  logConfirm('rerunning txid in 10sec - canceling old job', '');
  job.cancel();
  logConfirm('restart blockchain doi update', '');
  job.restart({//repeats: 600,   // Only repeat this once
    // This is the default
    // wait: 10000   // Wait 10 sec between repeats
    // Default is previous setting
  }, function (err, result) {
    if (result) {
      logConfirm('rerunning txid in 10sec:', result);
    }
  });
}

module.exportDefault(update);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"verify_signature.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/verify_signature.js                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let bitcore;
module.link("bitcore-lib", {
  default(v) {
    bitcore = v;
  }

}, 2);
let Message;
module.link("bitcore-message", {
  default(v) {
    Message = v;
  }

}, 3);
let logError, logVerify;
module.link("../../../startup/server/log-configuration", {
  logError(v) {
    logError = v;
  },

  logVerify(v) {
    logVerify = v;
  }

}, 4);
const NETWORK = bitcore.Networks.add({
  name: 'doichain',
  alias: 'doichain',
  pubkeyhash: 0x34,
  privatekey: 0xB4,
  scripthash: 13,
  networkMagic: 0xf9beb4fe
});
const VerifySignatureSchema = new SimpleSchema({
  data: {
    type: String
  },
  publicKey: {
    type: String
  },
  signature: {
    type: String
  }
});

const verifySignature = data => {
  try {
    const ourData = data;
    logVerify('verifySignature:', ourData);
    VerifySignatureSchema.validate(ourData);
    const address = bitcore.Address.fromPublicKey(new bitcore.PublicKey(ourData.publicKey), NETWORK);

    try {
      return Message(ourData.data).verify(address, ourData.signature);
    } catch (error) {
      logError(error);
    }

    return false;
  } catch (exception) {
    throw new Meteor.Error('doichain.verifySignature.exception', exception);
  }
};

module.exportDefault(verifySignature);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"write_to_blockchain.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/doichain/write_to_blockchain.js                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let OptIns;
module.link("../../../api/opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 2);
let Senders;
module.link("../../../api/senders/senders.js", {
  Senders(v) {
    Senders = v;
  }

}, 3);
let Recipients;
module.link("../../../api/recipients/recipients.js", {
  Recipients(v) {
    Recipients = v;
  }

}, 4);
let generateNameId;
module.link("./generate_name-id.js", {
  default(v) {
    generateNameId = v;
  }

}, 5);
let getSignature;
module.link("./get_signature.js", {
  default(v) {
    getSignature = v;
  }

}, 6);
let getDataHash;
module.link("./get_data-hash.js", {
  default(v) {
    getDataHash = v;
  }

}, 7);
let addInsertBlockchainJob;
module.link("../jobs/add_insert_blockchain.js", {
  default(v) {
    addInsertBlockchainJob = v;
  }

}, 8);
let logSend;
module.link("../../../startup/server/log-configuration", {
  logSend(v) {
    logSend = v;
  }

}, 9);
const WriteToBlockchainSchema = new SimpleSchema({
  id: {
    type: String
  }
});

const writeToBlockchain = data => {
  try {
    const ourData = data;
    WriteToBlockchainSchema.validate(ourData);
    const optIn = OptIns.findOne({
      _id: data.id
    });
    const recipient = Recipients.findOne({
      _id: optIn.recipient
    });
    const sender = Senders.findOne({
      _id: optIn.sender
    });
    logSend("optIn data:", {
      index: ourData.index,
      optIn: optIn,
      recipient: recipient,
      sender: sender
    });
    const nameId = generateNameId({
      id: data.id,
      index: optIn.index,
      masterDoi: optIn.masterDoi
    });
    const signature = getSignature({
      message: recipient.email + sender.email,
      privateKey: recipient.privateKey
    });
    logSend("generated signature from email recipient and sender:", signature);
    let dataHash = "";

    if (optIn.data) {
      dataHash = getDataHash({
        data: optIn.data
      });
      logSend("generated datahash from given data:", dataHash);
    }

    const parts = recipient.email.split("@");
    const domain = parts[parts.length - 1];
    logSend("email domain for publicKey request is:", domain);
    addInsertBlockchainJob({
      nameId: nameId,
      signature: signature,
      dataHash: dataHash,
      domain: domain,
      soiDate: optIn.createdAt
    });
  } catch (exception) {
    throw new Meteor.Error('doichain.writeToBlockchain.exception', exception);
  }
};

module.exportDefault(writeToBlockchain);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"emails":{"decode_doi-hash.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/emails/decode_doi-hash.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let HashIds;
module.link("../../../startup/server/email-configuration.js", {
  HashIds(v) {
    HashIds = v;
  }

}, 2);
const DecodeDoiHashSchema = new SimpleSchema({
  hash: {
    type: String
  }
});

const decodeDoiHash = hash => {
  try {
    const ourHash = hash;
    DecodeDoiHashSchema.validate(ourHash);
    const hex = HashIds.decodeHex(ourHash.hash);
    if (!hex || hex === '') throw "Wrong hash";

    try {
      const obj = JSON.parse(Buffer(hex, 'hex').toString('ascii'));
      return obj;
    } catch (exception) {
      throw "Wrong hash";
    }
  } catch (exception) {
    throw new Meteor.Error('emails.decode_doi-hash.exception', exception);
  }
};

module.exportDefault(decodeDoiHash);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"generate_doi-hash.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/emails/generate_doi-hash.js                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let HashIds;
module.link("../../../startup/server/email-configuration.js", {
  HashIds(v) {
    HashIds = v;
  }

}, 2);
const GenerateDoiHashSchema = new SimpleSchema({
  id: {
    type: String
  },
  token: {
    type: String
  },
  redirect: {
    type: String
  }
});

const generateDoiHash = optIn => {
  try {
    const ourOptIn = optIn;
    GenerateDoiHashSchema.validate(ourOptIn);
    const json = JSON.stringify({
      id: ourOptIn.id,
      token: ourOptIn.token,
      redirect: ourOptIn.redirect
    });
    const hex = Buffer(json).toString('hex');
    const hash = HashIds.encodeHex(hex);
    return hash;
  } catch (exception) {
    throw new Meteor.Error('emails.generate_doi-hash.exception', exception);
  }
};

module.exportDefault(generateDoiHash);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"parse_template.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/emails/parse_template.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let logConfirm;
module.link("../../../startup/server/log-configuration", {
  logConfirm(v) {
    logConfirm = v;
  }

}, 2);
const PLACEHOLDER_REGEX = /\${([\w]*)}/g;
const ParseTemplateSchema = new SimpleSchema({
  template: {
    type: String
  },
  data: {
    type: Object,
    blackbox: true
  }
});

const parseTemplate = data => {
  try {
    const ourData = data; //logConfirm('parseTemplate:',ourData);

    ParseTemplateSchema.validate(ourData);
    logConfirm('ParseTemplateSchema validated');

    var _match;

    var template = ourData.template; //logConfirm('doing some regex with template:',template);

    do {
      _match = PLACEHOLDER_REGEX.exec(template);
      if (_match) template = _replacePlaceholder(template, _match, ourData.data[_match[1]]);
    } while (_match);

    return template;
  } catch (exception) {
    throw new Meteor.Error('emails.parseTemplate.exception', exception);
  }
};

function _replacePlaceholder(template, _match, replace) {
  var rep = replace;
  if (replace === undefined) rep = "";
  return template.substring(0, _match.index) + rep + template.substring(_match.index + _match[0].length);
}

module.exportDefault(parseTemplate);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"send.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/emails/send.js                                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let logConfirm;
module.link("../../../startup/server/log-configuration", {
  logConfirm(v) {
    logConfirm = v;
  }

}, 2);
let DOI_MAIL_DEFAULT_EMAIL_FROM;
module.link("../../../startup/server/email-configuration.js", {
  DOI_MAIL_DEFAULT_EMAIL_FROM(v) {
    DOI_MAIL_DEFAULT_EMAIL_FROM = v;
  }

}, 3);
const SendMailSchema = new SimpleSchema({
  from: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  to: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  subject: {
    type: String
  },
  message: {
    type: String
  },
  returnPath: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  }
});

const sendMail = mail => {
  try {
    mail.from = DOI_MAIL_DEFAULT_EMAIL_FROM;
    const ourMail = mail;
    logConfirm('sending email with data:', {
      to: mail.to,
      subject: mail.subject
    });
    SendMailSchema.validate(ourMail); //TODO: Text fallback

    Email.send({
      from: mail.from,
      to: mail.to,
      subject: mail.subject,
      html: mail.message,
      headers: {
        'Return-Path': mail.returnPath
      }
    });
  } catch (exception) {
    throw new Meteor.Error('emails.send.exception', exception);
  }
};

module.exportDefault(sendMail);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"jobs":{"add_check_new_transactions.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/jobs/add_check_new_transactions.js                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Job;
module.link("meteor/vsivsi:job-collection", {
  Job(v) {
    Job = v;
  }

}, 1);
let BlockchainJobs;
module.link("../../../../server/api/blockchain_jobs.js", {
  BlockchainJobs(v) {
    BlockchainJobs = v;
  }

}, 2);

const addCheckNewTransactionsBlockchainJob = () => {
  try {
    const job = new Job(BlockchainJobs, 'checkNewTransaction', {});
    job.retry({
      retries: 60,
      wait: 15 * 1000
    }).save({
      cancelRepeats: true
    });
  } catch (exception) {
    throw new Meteor.Error('jobs.addCheckNewTransactionsBlockchain.exception', exception);
  }
};

module.exportDefault(addCheckNewTransactionsBlockchainJob);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"add_fetch-doi-mail-data.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/jobs/add_fetch-doi-mail-data.js                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let Job;
module.link("meteor/vsivsi:job-collection", {
  Job(v) {
    Job = v;
  }

}, 2);
let DAppJobs;
module.link("../../../../server/api/dapp_jobs.js", {
  DAppJobs(v) {
    DAppJobs = v;
  }

}, 3);
const AddFetchDoiMailDataJobSchema = new SimpleSchema({
  name: {
    type: String
  },
  domain: {
    type: String
  }
});

const addFetchDoiMailDataJob = data => {
  try {
    const ourData = data;
    AddFetchDoiMailDataJobSchema.validate(ourData);
    const job = new Job(DAppJobs, 'fetchDoiMailData', ourData);
    job.retry({
      retries: 5,
      wait: 1 * 10 * 1000
    }).save(); //check every 10 secs 5 times
  } catch (exception) {
    throw new Meteor.Error('jobs.addFetchDoiMailData.exception', exception);
  }
};

module.exportDefault(addFetchDoiMailDataJob);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"add_insert_blockchain.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/jobs/add_insert_blockchain.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Job;
module.link("meteor/vsivsi:job-collection", {
  Job(v) {
    Job = v;
  }

}, 1);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 2);
let BlockchainJobs;
module.link("../../../../server/api/blockchain_jobs.js", {
  BlockchainJobs(v) {
    BlockchainJobs = v;
  }

}, 3);
const AddInsertBlockchainJobSchema = new SimpleSchema({
  nameId: {
    type: String
  },
  signature: {
    type: String
  },
  dataHash: {
    type: String,
    optional: true
  },
  domain: {
    type: String
  },
  soiDate: {
    type: Date
  }
});

const addInsertBlockchainJob = entry => {
  try {
    const ourEntry = entry;
    AddInsertBlockchainJobSchema.validate(ourEntry);
    const job = new Job(BlockchainJobs, 'insert', ourEntry);
    job.retry({
      retries: 10,
      wait: 3 * 60 * 1000
    }).save(); //check every 10sec for 1h
  } catch (exception) {
    throw new Meteor.Error('jobs.addInsertBlockchain.exception', exception);
  }
};

module.exportDefault(addInsertBlockchainJob);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"add_send_mail.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/jobs/add_send_mail.js                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Job;
module.link("meteor/vsivsi:job-collection", {
  Job(v) {
    Job = v;
  }

}, 1);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 2);
let MailJobs;
module.link("../../../../server/api/mail_jobs.js", {
  MailJobs(v) {
    MailJobs = v;
  }

}, 3);
const AddSendMailJobSchema = new SimpleSchema({
  /*from: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },*/
  to: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  subject: {
    type: String
  },
  message: {
    type: String
  },
  returnPath: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  }
});

const addSendMailJob = mail => {
  try {
    const ourMail = mail;
    AddSendMailJobSchema.validate(ourMail);
    const job = new Job(MailJobs, 'send', ourMail);
    job.retry({
      retries: 5,
      wait: 60 * 1000
    }).save();
  } catch (exception) {
    throw new Meteor.Error('jobs.addSendMail.exception', exception);
  }
};

module.exportDefault(addSendMailJob);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"add_update_blockchain.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/jobs/add_update_blockchain.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let Job;
module.link("meteor/vsivsi:job-collection", {
  Job(v) {
    Job = v;
  }

}, 2);
let BlockchainJobs;
module.link("../../../../server/api/blockchain_jobs.js", {
  BlockchainJobs(v) {
    BlockchainJobs = v;
  }

}, 3);
const AddUpdateBlockchainJobSchema = new SimpleSchema({
  nameId: {
    type: String
  },
  value: {
    type: String
  },
  fromHostUrl: {
    type: String
  },
  host: {
    type: String
  }
});

const addUpdateBlockchainJob = entry => {
  try {
    const ourEntry = entry;
    AddUpdateBlockchainJobSchema.validate(ourEntry);
    const job = new Job(BlockchainJobs, 'update', ourEntry);
    job.retry({
      retries: 360,
      wait: 1 * 10 * 1000
    }).save();
  } catch (exception) {
    throw new Meteor.Error('jobs.addUpdateBlockchain.exception', exception);
  }
};

module.exportDefault(addUpdateBlockchainJob);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"languages":{"get.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/languages/get.js                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let i18n;
module.link("meteor/universe:i18n", {
  default(v) {
    i18n = v;
  }

}, 1);

// universe:i18n only bundles the default language on the client side.
// To get a list of all avialble languages with at least one translation,
// i18n.getLanguages() must be called server side.
const getLanguages = () => {
  try {
    return i18n.getLanguages();
  } catch (exception) {
    throw new Meteor.Error('languages.get.exception', exception);
  }
};

module.exportDefault(getLanguages);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"meta":{"addOrUpdate.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/meta/addOrUpdate.js                                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let Meta;
module.link("../../../api/meta/meta.js", {
  Meta(v) {
    Meta = v;
  }

}, 2);
const AddOrUpdateMetaSchema = new SimpleSchema({
  key: {
    type: String
  },
  value: {
    type: String
  }
});

const addOrUpdateMeta = data => {
  try {
    const ourData = data;
    AddOrUpdateMetaSchema.validate(ourData);
    const meta = Meta.findOne({
      key: ourData.key
    });
    if (meta !== undefined) Meta.update({
      _id: meta._id
    }, {
      $set: {
        value: ourData.value
      }
    });else return Meta.insert({
      key: ourData.key,
      value: ourData.value
    });
  } catch (exception) {
    throw new Meteor.Error('meta.addOrUpdate.exception', exception);
  }
};

module.exportDefault(addOrUpdateMeta);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"opt-ins":{"add.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/opt-ins/add.js                                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let OptIns;
module.link("../../../api/opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 2);
const AddOptInSchema = new SimpleSchema({
  name: {
    type: String
  }
});

const addOptIn = optIn => {
  try {
    const ourOptIn = optIn;
    AddOptInSchema.validate(ourOptIn);
    const optIns = OptIns.find({
      nameId: ourOptIn.name
    }).fetch();
    if (optIns.length > 0) return optIns[0]._id;
    const optInId = OptIns.insert({
      nameId: ourOptIn.name
    });
    return optInId;
  } catch (exception) {
    throw new Meteor.Error('opt-ins.add.exception', exception);
  }
};

module.exportDefault(addOptIn);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"add_and_write_to_blockchain.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/opt-ins/add_and_write_to_blockchain.js                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let addRecipient;
module.link("../recipients/add.js", {
  default(v) {
    addRecipient = v;
  }

}, 2);
let addSender;
module.link("../senders/add.js", {
  default(v) {
    addSender = v;
  }

}, 3);
let OptIns;
module.link("../../../api/opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 4);
let writeToBlockchain;
module.link("../doichain/write_to_blockchain.js", {
  default(v) {
    writeToBlockchain = v;
  }

}, 5);
let logError, logSend;
module.link("../../../startup/server/log-configuration", {
  logError(v) {
    logError = v;
  },

  logSend(v) {
    logSend = v;
  }

}, 6);
const AddOptInSchema = new SimpleSchema({
  recipient_mail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  sender_mail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  data: {
    type: String,
    optional: true
  },
  master_doi: {
    type: String,
    optional: true
  },
  index: {
    type: SimpleSchema.Integer,
    optional: true
  },
  ownerId: {
    type: String,
    regEx: SimpleSchema.RegEx.id
  }
});

const addOptIn = optIn => {
  try {
    const ourOptIn = optIn;
    AddOptInSchema.validate(ourOptIn);
    const recipient = {
      email: ourOptIn.recipient_mail
    };
    const recipientId = addRecipient(recipient);
    const sender = {
      email: ourOptIn.sender_mail
    };
    const senderId = addSender(sender);
    const optIns = OptIns.find({
      recipient: recipientId,
      sender: senderId
    }).fetch();
    if (optIns.length > 0) return optIns[0]._id; //TODO when SOI already exists resend email?

    if (ourOptIn.data !== undefined) {
      try {
        JSON.parse(ourOptIn.data);
      } catch (error) {
        logError("ourOptIn.data:", ourOptIn.data);
        throw "Invalid data json ";
      }
    }

    const optInId = OptIns.insert({
      recipient: recipientId,
      sender: senderId,
      index: ourOptIn.index,
      masterDoi: ourOptIn.master_doi,
      data: ourOptIn.data,
      ownerId: ourOptIn.ownerId
    });
    logSend("optIn (index:" + ourOptIn.index + " added to local db with optInId", optInId);
    writeToBlockchain({
      id: optInId
    });
    return optInId;
  } catch (exception) {
    throw new Meteor.Error('opt-ins.addAndWriteToBlockchain.exception', exception);
  }
};

module.exportDefault(addOptIn);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"confirm.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/opt-ins/confirm.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let CONFIRM_CLIENT, CONFIRM_ADDRESS;
module.link("../../../startup/server/doichain-configuration.js", {
  CONFIRM_CLIENT(v) {
    CONFIRM_CLIENT = v;
  },

  CONFIRM_ADDRESS(v) {
    CONFIRM_ADDRESS = v;
  }

}, 2);
let OptIns;
module.link("../../../api/opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 3);
let DoichainEntries;
module.link("../../../api/doichain/entries.js", {
  DoichainEntries(v) {
    DoichainEntries = v;
  }

}, 4);
let decodeDoiHash;
module.link("../emails/decode_doi-hash.js", {
  default(v) {
    decodeDoiHash = v;
  }

}, 5);
let signMessage;
module.link("../../../../server/api/doichain.js", {
  signMessage(v) {
    signMessage = v;
  }

}, 6);
let addUpdateBlockchainJob;
module.link("../jobs/add_update_blockchain.js", {
  default(v) {
    addUpdateBlockchainJob = v;
  }

}, 7);
let logConfirm;
module.link("../../../startup/server/log-configuration", {
  logConfirm(v) {
    logConfirm = v;
  }

}, 8);
const ConfirmOptInSchema = new SimpleSchema({
  host: {
    type: String
  },
  hash: {
    type: String
  }
});

const confirmOptIn = request => {
  try {
    const ourRequest = request;
    ConfirmOptInSchema.validate(ourRequest);
    const decoded = decodeDoiHash({
      hash: request.hash
    });
    const optIn = OptIns.findOne({
      _id: decoded.id
    });
    if (optIn === undefined || optIn.confirmationToken !== decoded.token) throw "Invalid hash";
    const confirmedAt = new Date();
    OptIns.update({
      _id: optIn._id
    }, {
      $set: {
        confirmedAt: confirmedAt,
        confirmedBy: ourRequest.host
      },
      $unset: {
        confirmationToken: ""
      }
    }); //TODO here find all DoichainEntries in the local database  and blockchain with the same masterDoi

    const entries = DoichainEntries.find({
      $or: [{
        name: optIn.nameId
      }, {
        masterDoi: optIn.nameId
      }]
    });
    if (entries === undefined) throw "Doichain entry/entries not found";
    entries.forEach(entry => {
      logConfirm('confirming DoiChainEntry:', entry);
      const value = JSON.parse(entry.value);
      logConfirm('getSignature (only of value!)', value);
      const doiSignature = signMessage(CONFIRM_CLIENT, CONFIRM_ADDRESS, value.signature);
      logConfirm('got doiSignature:', doiSignature);
      const fromHostUrl = value.from;
      delete value.from;
      value.doiTimestamp = confirmedAt.toISOString();
      value.doiSignature = doiSignature;
      const jsonValue = JSON.stringify(value);
      logConfirm('updating Doichain nameId:' + optIn.nameId + ' with value:', jsonValue);
      addUpdateBlockchainJob({
        nameId: entry.name,
        value: jsonValue,
        fromHostUrl: fromHostUrl,
        host: ourRequest.host
      });
    });
    logConfirm('redirecting user to:', decoded.redirect);
    return decoded.redirect;
  } catch (exception) {
    throw new Meteor.Error('opt-ins.confirm.exception', exception);
  }
};

module.exportDefault(confirmOptIn);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"generate_doi-token.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/opt-ins/generate_doi-token.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let randomBytes;
module.link("crypto", {
  randomBytes(v) {
    randomBytes = v;
  }

}, 2);
let OptIns;
module.link("../../../api/opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 3);
const GenerateDoiTokenSchema = new SimpleSchema({
  id: {
    type: String
  }
});

const generateDoiToken = optIn => {
  try {
    const ourOptIn = optIn;
    GenerateDoiTokenSchema.validate(ourOptIn);
    const token = randomBytes(32).toString('hex');
    OptIns.update({
      _id: ourOptIn.id
    }, {
      $set: {
        confirmationToken: token
      }
    });
    return token;
  } catch (exception) {
    throw new Meteor.Error('opt-ins.generate_doi-token.exception', exception);
  }
};

module.exportDefault(generateDoiToken);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"update_status.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/opt-ins/update_status.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let OptIns;
module.link("../../../api/opt-ins/opt-ins.js", {
  OptIns(v) {
    OptIns = v;
  }

}, 2);
let Recipients;
module.link("../../../api/recipients/recipients.js", {
  Recipients(v) {
    Recipients = v;
  }

}, 3);
let verifySignature;
module.link("../doichain/verify_signature.js", {
  default(v) {
    verifySignature = v;
  }

}, 4);
let logSend;
module.link("../../../startup/server/log-configuration", {
  logSend(v) {
    logSend = v;
  }

}, 5);
let getPublicKeyAndAddress;
module.link("../doichain/get_publickey_and_address_by_domain", {
  default(v) {
    getPublicKeyAndAddress = v;
  }

}, 6);
const UpdateOptInStatusSchema = new SimpleSchema({
  nameId: {
    type: String
  },
  signature: {
    type: String
  },
  host: {
    type: String,
    optional: true
  }
});

const updateOptInStatus = data => {
  try {
    const ourData = data;
    logSend('confirm dApp confirms optIn:', JSON.stringify(data));
    UpdateOptInStatusSchema.validate(ourData);
    const optIn = OptIns.findOne({
      nameId: ourData.nameId
    });
    if (optIn === undefined) throw "Opt-In not found";
    logSend('confirm dApp confirms optIn:', ourData.nameId);
    const recipient = Recipients.findOne({
      _id: optIn.recipient
    });
    if (recipient === undefined) throw "Recipient not found";
    const parts = recipient.email.split("@");
    const domain = parts[parts.length - 1];
    const publicKeyAndAddress = getPublicKeyAndAddress({
      domain: domain
    }); //TODO getting information from Bob that a certain nameId (DOI) got confirmed.

    if (!verifySignature({
      publicKey: publicKeyAndAddress.publicKey,
      data: ourData.nameId,
      signature: ourData.signature
    })) {
      throw "Access denied";
    }

    logSend('signature valid for publicKey', publicKeyAndAddress.publicKey);
    OptIns.update({
      _id: optIn._id
    }, {
      $set: {
        confirmedAt: new Date(),
        confirmedBy: ourData.host
      }
    });
  } catch (exception) {
    throw new Meteor.Error('dapps.send.updateOptInStatus.exception', exception);
  }
};

module.exportDefault(updateOptInStatus);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"verify.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/opt-ins/verify.js                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let VERIFY_CLIENT;
module.link("../../../startup/server/doichain-configuration.js", {
  VERIFY_CLIENT(v) {
    VERIFY_CLIENT = v;
  }

}, 2);
let nameShow;
module.link("../../../../server/api/doichain.js", {
  nameShow(v) {
    nameShow = v;
  }

}, 3);
let getOptInProvider;
module.link("../dns/get_opt-in-provider.js", {
  default(v) {
    getOptInProvider = v;
  }

}, 4);
let getOptInKey;
module.link("../dns/get_opt-in-key.js", {
  default(v) {
    getOptInKey = v;
  }

}, 5);
let verifySignature;
module.link("../doichain/verify_signature.js", {
  default(v) {
    verifySignature = v;
  }

}, 6);
let logVerify;
module.link("../../../startup/server/log-configuration", {
  logVerify(v) {
    logVerify = v;
  }

}, 7);
let getPublicKeyAndAddress;
module.link("../doichain/get_publickey_and_address_by_domain", {
  default(v) {
    getPublicKeyAndAddress = v;
  }

}, 8);
const VerifyOptInSchema = new SimpleSchema({
  recipient_mail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  sender_mail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  name_id: {
    type: String
  },
  recipient_public_key: {
    type: String
  }
});

const verifyOptIn = data => {
  try {
    const ourData = data;
    VerifyOptInSchema.validate(ourData);
    const entry = nameShow(VERIFY_CLIENT, ourData.name_id);
    if (entry === undefined) return false;
    const entryData = JSON.parse(entry.value);
    const firstCheck = verifySignature({
      data: ourData.recipient_mail + ourData.sender_mail,
      signature: entryData.signature,
      publicKey: ourData.recipient_public_key
    });
    if (!firstCheck) return {
      firstCheck: false
    };
    const parts = ourData.recipient_mail.split("@"); //TODO put this into getPublicKeyAndAddress

    const domain = parts[parts.length - 1];
    const publicKeyAndAddress = getPublicKeyAndAddress({
      domain: domain
    });
    const secondCheck = verifySignature({
      data: entryData.signature,
      signature: entryData.doiSignature,
      publicKey: publicKeyAndAddress.publicKey
    });
    if (!secondCheck) return {
      secondCheck: false
    };
    return true;
  } catch (exception) {
    throw new Meteor.Error('opt-ins.verify.exception', exception);
  }
};

module.exportDefault(verifyOptIn);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"recipients":{"add.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/recipients/add.js                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let Recipients;
module.link("../../../api/recipients/recipients.js", {
  Recipients(v) {
    Recipients = v;
  }

}, 2);
let getKeyPair;
module.link("../doichain/get_key-pair.js", {
  default(v) {
    getKeyPair = v;
  }

}, 3);
const AddRecipientSchema = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  }
});

const addRecipient = recipient => {
  try {
    const ourRecipient = recipient;
    AddRecipientSchema.validate(ourRecipient);
    const recipients = Recipients.find({
      email: recipient.email
    }).fetch();
    if (recipients.length > 0) return recipients[0]._id;
    const keyPair = getKeyPair();
    return Recipients.insert({
      email: ourRecipient.email,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey
    });
  } catch (exception) {
    throw new Meteor.Error('recipients.add.exception', exception);
  }
};

module.exportDefault(addRecipient);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"senders":{"add.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/modules/server/senders/add.js                                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let Senders;
module.link("../../../api/senders/senders.js", {
  Senders(v) {
    Senders = v;
  }

}, 2);
const AddSenderSchema = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  }
});

const addSender = sender => {
  try {
    const ourSender = sender;
    AddSenderSchema.validate(ourSender);
    const senders = Senders.find({
      email: sender.email
    }).fetch();
    if (senders.length > 0) return senders[0]._id;
    return Senders.insert({
      email: ourSender.email
    });
  } catch (exception) {
    throw new Meteor.Error('senders.add.exception', exception);
  }
};

module.exportDefault(addSender);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},"startup":{"server":{"dapp-configuration.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/dapp-configuration.js                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  isDebug: () => isDebug,
  isRegtest: () => isRegtest,
  isTestnet: () => isTestnet,
  getUrl: () => getUrl
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);

function isDebug() {
  if (Meteor.settings !== undefined && Meteor.settings.app !== undefined && Meteor.settings.app.debug !== undefined) return Meteor.settings.app.debug;
  return false;
}

function isRegtest() {
  if (Meteor.settings !== undefined && Meteor.settings.app !== undefined && Meteor.settings.app.regtest !== undefined) return Meteor.settings.app.regtest;
  return false;
}

function isTestnet() {
  if (Meteor.settings !== undefined && Meteor.settings.app !== undefined && Meteor.settings.app.testnet !== undefined) return Meteor.settings.app.testnet;
  return false;
}

function getUrl() {
  if (Meteor.settings !== undefined && Meteor.settings.app !== undefined && Meteor.settings.app.host !== undefined) {
    let port = 3000;
    if (Meteor.settings.app.port !== undefined) port = Meteor.settings.app.port;
    return "http://" + Meteor.settings.app.host + ":" + port + "/";
  }

  return Meteor.absoluteUrl();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dns-configuration.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/dns-configuration.js                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  FALLBACK_PROVIDER: () => FALLBACK_PROVIDER
});
const FALLBACK_PROVIDER = "doichain.org";
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"doichain-configuration.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/doichain-configuration.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  SEND_CLIENT: () => SEND_CLIENT,
  CONFIRM_CLIENT: () => CONFIRM_CLIENT,
  CONFIRM_ADDRESS: () => CONFIRM_ADDRESS,
  VERIFY_CLIENT: () => VERIFY_CLIENT
});
let namecoin;
module.link("namecoin", {
  default(v) {
    namecoin = v;
  }

}, 0);
let SEND_APP, CONFIRM_APP, VERIFY_APP, isAppType;
module.link("./type-configuration.js", {
  SEND_APP(v) {
    SEND_APP = v;
  },

  CONFIRM_APP(v) {
    CONFIRM_APP = v;
  },

  VERIFY_APP(v) {
    VERIFY_APP = v;
  },

  isAppType(v) {
    isAppType = v;
  }

}, 1);
var sendSettings = Meteor.settings.send;
var sendClient = undefined;

if (isAppType(SEND_APP)) {
  if (!sendSettings || !sendSettings.doichain) throw new Meteor.Error("config.send.doichain", "Send app doichain settings not found");
  sendClient = createClient(sendSettings.doichain);
}

const SEND_CLIENT = sendClient;
var confirmSettings = Meteor.settings.confirm;
var confirmClient = undefined;
var confirmAddress = undefined;

if (isAppType(CONFIRM_APP)) {
  if (!confirmSettings || !confirmSettings.doichain) throw new Meteor.Error("config.confirm.doichain", "Confirm app doichain settings not found");
  confirmClient = createClient(confirmSettings.doichain);
  confirmAddress = confirmSettings.doichain.address;
}

const CONFIRM_CLIENT = confirmClient;
const CONFIRM_ADDRESS = confirmAddress;
var verifySettings = Meteor.settings.verify;
var verifyClient = undefined;

if (isAppType(VERIFY_APP)) {
  if (!verifySettings || !verifySettings.doichain) throw new Meteor.Error("config.verify.doichain", "Verify app doichain settings not found");
  verifyClient = createClient(verifySettings.doichain);
}

const VERIFY_CLIENT = verifyClient;

function createClient(settings) {
  return new namecoin.Client({
    host: settings.host,
    port: settings.port,
    user: settings.username,
    pass: settings.password
  });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"email-configuration.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/email-configuration.js                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  HashIds: () => HashIds,
  DOI_MAIL_FETCH_URL: () => DOI_MAIL_FETCH_URL,
  DOI_MAIL_DEFAULT_EMAIL_FROM: () => DOI_MAIL_DEFAULT_EMAIL_FROM
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let SEND_APP, CONFIRM_APP, isAppType;
module.link("./type-configuration.js", {
  SEND_APP(v) {
    SEND_APP = v;
  },

  CONFIRM_APP(v) {
    CONFIRM_APP = v;
  },

  isAppType(v) {
    isAppType = v;
  }

}, 1);
let Hashids;
module.link("hashids", {
  default(v) {
    Hashids = v;
  }

}, 2);
let logConfirm;
module.link("./log-configuration", {
  logConfirm(v) {
    logConfirm = v;
  }

}, 3);
const HashIds = new Hashids('0xugmLe7Nyee6vk1iF88(6CmwpqoG4hQ*-T74tjYw^O2vOO(Xl-91wA8*nCg_lX$');
var sendSettings = Meteor.settings.send;
var doiMailFetchUrl = undefined;

if (isAppType(SEND_APP)) {
  if (!sendSettings || !sendSettings.doiMailFetchUrl) throw new Meteor.Error("config.send.email", "Settings not found");
  doiMailFetchUrl = sendSettings.doiMailFetchUrl;
}

const DOI_MAIL_FETCH_URL = doiMailFetchUrl;
var defaultFrom = undefined;

if (isAppType(CONFIRM_APP)) {
  var confirmSettings = Meteor.settings.confirm;
  if (!confirmSettings || !confirmSettings.smtp) throw new Meteor.Error("config.confirm.smtp", "Confirm app email smtp settings not found");
  if (!confirmSettings.smtp.defaultFrom) throw new Meteor.Error("config.confirm.defaultFrom", "Confirm app email defaultFrom not found");
  defaultFrom = confirmSettings.smtp.defaultFrom;
  logConfirm('sending with defaultFrom:', defaultFrom);
  Meteor.startup(() => {
    if (confirmSettings.smtp.username === undefined) {
      process.env.MAIL_URL = 'smtp://' + encodeURIComponent(confirmSettings.smtp.server) + ':' + confirmSettings.smtp.port;
    } else {
      process.env.MAIL_URL = 'smtp://' + encodeURIComponent(confirmSettings.smtp.username) + ':' + encodeURIComponent(confirmSettings.smtp.password) + '@' + encodeURIComponent(confirmSettings.smtp.server) + ':' + confirmSettings.smtp.port;
    }

    logConfirm('using MAIL_URL:', process.env.MAIL_URL);
    if (confirmSettings.smtp.NODE_TLS_REJECT_UNAUTHORIZED !== undefined) process.env.NODE_TLS_REJECT_UNAUTHORIZED = confirmSettings.smtp.NODE_TLS_REJECT_UNAUTHORIZED; //0
  });
}

const DOI_MAIL_DEFAULT_EMAIL_FROM = defaultFrom;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"fixtures.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/fixtures.js                                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 1);
Meteor.startup(() => {
  if (Meteor.users.find().count() === 0) {
    const id = Accounts.createUser({
      username: 'admin',
      email: 'admin@sendeffect.de',
      password: 'password'
    });
    Roles.addUsersToRoles(id, 'admin');
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/index.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.link("./log-configuration.js");
module.link("./dapp-configuration.js");
module.link("./type-configuration.js");
module.link("./dns-configuration.js");
module.link("./doichain-configuration.js");
module.link("./fixtures.js");
module.link("./register-api.js");
module.link("./useraccounts-configuration.js");
module.link("./security.js");
module.link("./email-configuration.js");
module.link("./jobs.js");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"jobs.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/jobs.js                                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let MailJobs;
module.link("../../../server/api/mail_jobs.js", {
  MailJobs(v) {
    MailJobs = v;
  }

}, 1);
let BlockchainJobs;
module.link("../../../server/api/blockchain_jobs.js", {
  BlockchainJobs(v) {
    BlockchainJobs = v;
  }

}, 2);
let DAppJobs;
module.link("../../../server/api/dapp_jobs.js", {
  DAppJobs(v) {
    DAppJobs = v;
  }

}, 3);
let CONFIRM_APP, isAppType;
module.link("./type-configuration.js", {
  CONFIRM_APP(v) {
    CONFIRM_APP = v;
  },

  isAppType(v) {
    isAppType = v;
  }

}, 4);
let addCheckNewTransactionsBlockchainJob;
module.link("../../modules/server/jobs/add_check_new_transactions.js", {
  default(v) {
    addCheckNewTransactionsBlockchainJob = v;
  }

}, 5);
Meteor.startup(() => {
  MailJobs.startJobServer();
  BlockchainJobs.startJobServer();
  DAppJobs.startJobServer();
  if (isAppType(CONFIRM_APP)) addCheckNewTransactionsBlockchainJob();
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"log-configuration.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/log-configuration.js                                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  console: () => console,
  sendModeTagColor: () => sendModeTagColor,
  confirmModeTagColor: () => confirmModeTagColor,
  verifyModeTagColor: () => verifyModeTagColor,
  blockchainModeTagColor: () => blockchainModeTagColor,
  testingModeTagColor: () => testingModeTagColor,
  logSend: () => logSend,
  logConfirm: () => logConfirm,
  logVerify: () => logVerify,
  logBlockchain: () => logBlockchain,
  logMain: () => logMain,
  logError: () => logError,
  testLogging: () => testLogging
});
let isDebug;
module.link("./dapp-configuration", {
  isDebug(v) {
    isDebug = v;
  }

}, 0);

require('scribe-js')();

const console = process.console;
const sendModeTagColor = {
  msg: 'send-mode',
  colors: ['yellow', 'inverse']
};
const confirmModeTagColor = {
  msg: 'confirm-mode',
  colors: ['blue', 'inverse']
};
const verifyModeTagColor = {
  msg: 'verify-mode',
  colors: ['green', 'inverse']
};
const blockchainModeTagColor = {
  msg: 'blockchain-mode',
  colors: ['white', 'inverse']
};
const testingModeTagColor = {
  msg: 'testing-mode',
  colors: ['orange', 'inverse']
};

function logSend(message, param) {
  if (isDebug()) {
    console.time().tag(sendModeTagColor).log(message, param ? param : '');
  }
}

function logConfirm(message, param) {
  if (isDebug()) {
    console.time().tag(confirmModeTagColor).log(message, param ? param : '');
  }
}

function logVerify(message, param) {
  if (isDebug()) {
    console.time().tag(verifyModeTagColor).log(message, param ? param : '');
  }
}

function logBlockchain(message, param) {
  if (isDebug()) {
    console.time().tag(blockchainModeTagColor).log(message, param ? param : '');
  }
}

function logMain(message, param) {
  if (isDebug()) {
    console.time().tag(blockchainModeTagColor).log(message, param ? param : '');
  }
}

function logError(message, param) {
  if (isDebug()) {
    console.time().tag(blockchainModeTagColor).error(message, param ? param : '');
  }
}

function testLogging(message, param) {
  if (isDebug()) {
    console.time().tag(testingModeTagColor).log(message, param ? param : '');
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"register-api.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/register-api.js                                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.link("../../api/languages/methods.js");
module.link("../../api/doichain/methods.js");
module.link("../../api/recipients/server/publications.js");
module.link("../../api/opt-ins/methods.js");
module.link("../../api/opt-ins/server/publications.js");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"security.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/security.js                                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let DDPRateLimiter;
module.link("meteor/ddp-rate-limiter", {
  DDPRateLimiter(v) {
    DDPRateLimiter = v;
  }

}, 1);

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 2);
// Don't let people write arbitrary data to their 'profile' field from the client
Meteor.users.deny({
  update() {
    return true;
  }

}); // Get a list of all accounts methods by running `Meteor.server.method_handlers` in meteor shell

const AUTH_METHODS = ['login', 'logout', 'logoutOtherClients', 'getNewToken', 'removeOtherTokens', 'configureLoginService', 'changePassword', 'forgotPassword', 'resetPassword', 'verifyEmail', 'createUser', 'ATRemoveService', 'ATCreateUserServer', 'ATResendVerificationEmail'];

if (Meteor.isServer) {
  // Only allow 2 login attempts per connection per 5 seconds
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(AUTH_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() {
      return true;
    }

  }, 2, 5000);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"type-configuration.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/type-configuration.js                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  SEND_APP: () => SEND_APP,
  CONFIRM_APP: () => CONFIRM_APP,
  VERIFY_APP: () => VERIFY_APP,
  isAppType: () => isAppType
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const SEND_APP = "send";
const CONFIRM_APP = "confirm";
const VERIFY_APP = "verify";

function isAppType(type) {
  if (Meteor.settings === undefined || Meteor.settings.app === undefined) throw "No settings found!";
  const types = Meteor.settings.app.types;
  if (types !== undefined) return types.includes(type);
  return false;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"useraccounts-configuration.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/server/useraccounts-configuration.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Accounts;
module.link("meteor/accounts-base", {
  Accounts(v) {
    Accounts = v;
  }

}, 0);
Accounts.config({
  sendVerificationEmail: true,
  forbidClientAccountCreation: true
});
Accounts.emailTemplates.from = 'doichain@le-space.de';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},"server":{"api":{"rest":{"imports":{"confirm.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/rest/imports/confirm.js                                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Api, DOI_WALLETNOTIFY_ROUTE, DOI_CONFIRMATION_ROUTE;
module.link("../rest.js", {
  Api(v) {
    Api = v;
  },

  DOI_WALLETNOTIFY_ROUTE(v) {
    DOI_WALLETNOTIFY_ROUTE = v;
  },

  DOI_CONFIRMATION_ROUTE(v) {
    DOI_CONFIRMATION_ROUTE = v;
  }

}, 0);
let confirmOptIn;
module.link("../../../../imports/modules/server/opt-ins/confirm.js", {
  default(v) {
    confirmOptIn = v;
  }

}, 1);
let checkNewTransaction;
module.link("../../../../imports/modules/server/doichain/check_new_transactions", {
  default(v) {
    checkNewTransaction = v;
  }

}, 2);
let logConfirm;
module.link("../../../../imports/startup/server/log-configuration", {
  logConfirm(v) {
    logConfirm = v;
  }

}, 3);
//doku of meteor-restivus https://github.com/kahmali/meteor-restivus
Api.addRoute(DOI_CONFIRMATION_ROUTE + '/:hash', {
  authRequired: false
}, {
  get: {
    action: function () {
      const hash = this.urlParams.hash;

      try {
        let ip = this.request.headers['x-forwarded-for'] || this.request.connection.remoteAddress || this.request.socket.remoteAddress || (this.request.connection.socket ? this.request.connection.socket.remoteAddress : null);
        if (ip.indexOf(',') != -1) ip = ip.substring(0, ip.indexOf(','));
        logConfirm('REST opt-in/confirm :', {
          hash: hash,
          host: ip
        });
        const redirect = confirmOptIn({
          host: ip,
          hash: hash
        });
        return {
          statusCode: 303,
          headers: {
            'Content-Type': 'text/plain',
            'Location': redirect
          },
          body: 'Location: ' + redirect
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: {
            status: 'fail',
            message: error.message
          }
        };
      }
    }
  }
});
Api.addRoute(DOI_WALLETNOTIFY_ROUTE, {
  get: {
    authRequired: false,
    action: function () {
      const params = this.queryParams;
      const txid = params.tx;

      try {
        checkNewTransaction(txid);
        return {
          status: 'success',
          data: 'txid:' + txid + ' was read from blockchain'
        };
      } catch (error) {
        return {
          status: 'fail',
          error: error.message
        };
      }
    }
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"debug.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/rest/imports/debug.js                                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
let Api;
module.link("../rest.js", {
  Api(v) {
    Api = v;
  }

}, 0);
Api.addRoute('debug/mail', {
  authRequired: false
}, {
  get: {
    action: function () {
      const data = {
        "from": "noreply@doichain.org",
        "subject": "Doichain.org Newsletter Bestätigung",
        "redirect": "https://www.doichain.org/vielen-dank/",
        "returnPath": "noreply@doichain.org",
        "content": "<style type='text/css' media='screen'>\n" + "* {\n" + "\tline-height: inherit;\n" + "}\n" + ".ExternalClass * {\n" + "\tline-height: 100%;\n" + "}\n" + "body, p {\n" + "\tmargin: 0;\n" + "\tpadding: 0;\n" + "\tmargin-bottom: 0;\n" + "\t-webkit-text-size-adjust: none;\n" + "\t-ms-text-size-adjust: none;\n" + "}\n" + "img {\n" + "\tline-height: 100%;\n" + "\toutline: none;\n" + "\ttext-decoration: none;\n" + "\t-ms-interpolation-mode: bicubic;\n" + "}\n" + "a img {\n" + "\tborder: none;\n" + "}\n" + "#backgroundTable {\n" + "\tmargin: 0;\n" + "\tpadding: 0;\n" + "\twidth: 100% !important;\n" + "}\n" + "a, a:link, .no-detect-local a, .appleLinks a {\n" + "\tcolor: #5555ff !important;\n" + "\ttext-decoration: underline;\n" + "}\n" + ".ExternalClass {\n" + "\tdisplay: block !important;\n" + "\twidth: 100%;\n" + "}\n" + ".ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {\n" + "\tline-height: inherit;\n" + "}\n" + "table td {\n" + "\tborder-collapse: collapse;\n" + "\tmso-table-lspace: 0pt;\n" + "\tmso-table-rspace: 0pt;\n" + "}\n" + "sup {\n" + "\tposition: relative;\n" + "\ttop: 4px;\n" + "\tline-height: 7px !important;\n" + "\tfont-size: 11px !important;\n" + "}\n" + ".mobile_link a[href^='tel'], .mobile_link a[href^='sms'] {\n" + "\ttext-decoration: default;\n" + "\tcolor: #5555ff !important;\n" + "\tpointer-events: auto;\n" + "\tcursor: default;\n" + "}\n" + ".no-detect a {\n" + "\ttext-decoration: none;\n" + "\tcolor: #5555ff;\n" + "\tpointer-events: auto;\n" + "\tcursor: default;\n" + "}\n" + "{\n" + "color: #5555ff;\n" + "}\n" + "span {\n" + "\tcolor: inherit;\n" + "\tborder-bottom: none;\n" + "}\n" + "span:hover {\n" + "\tbackground-color: transparent;\n" + "}\n" + ".nounderline {\n" + "\ttext-decoration: none !important;\n" + "}\n" + "h1, h2, h3 {\n" + "\tmargin: 0;\n" + "\tpadding: 0;\n" + "}\n" + "p {\n" + "\tMargin: 0px !important;\n" + "}\n" + "table[class='email-root-wrapper'] {\n" + "\twidth: 600px !important;\n" + "}\n" + "body {\n" + "}\n" + "body {\n" + "\tmin-width: 280px;\n" + "\twidth: 100%;\n" + "}\n" + "td[class='pattern'] .c112p20r {\n" + "\twidth: 20%;\n" + "}\n" + "td[class='pattern'] .c336p60r {\n" + "\twidth: 60.000000000000256%;\n" + "}\n" + "</style>\n" + "<style>\n" + "@media only screen and (max-width: 599px), only screen and (max-device-width: 599px), only screen and (max-width: 400px), only screen and (max-device-width: 400px) {\n" + ".email-root-wrapper {\n" + "\twidth: 100% !important;\n" + "}\n" + ".full-width {\n" + "\twidth: 100% !important;\n" + "\theight: auto !important;\n" + "\ttext-align: center;\n" + "}\n" + ".fullwidthhalfleft {\n" + "\twidth: 100% !important;\n" + "}\n" + ".fullwidthhalfright {\n" + "\twidth: 100% !important;\n" + "}\n" + ".fullwidthhalfinner {\n" + "\twidth: 100% !important;\n" + "\tmargin: 0 auto !important;\n" + "\tfloat: none !important;\n" + "\tmargin-left: auto !important;\n" + "\tmargin-right: auto !important;\n" + "\tclear: both !important;\n" + "}\n" + ".hide {\n" + "\tdisplay: none !important;\n" + "\twidth: 0px !important;\n" + "\theight: 0px !important;\n" + "\toverflow: hidden;\n" + "}\n" + ".desktop-hide {\n" + "\tdisplay: block !important;\n" + "\twidth: 100% !important;\n" + "\theight: auto !important;\n" + "\toverflow: hidden;\n" + "\tmax-height: inherit !important;\n" + "}\n" + ".c112p20r {\n" + "\twidth: 100% !important;\n" + "\tfloat: none;\n" + "}\n" + ".c336p60r {\n" + "\twidth: 100% !important;\n" + "\tfloat: none;\n" + "}\n" + "}\n" + "</style>\n" + "<style>\n" + "@media only screen and (min-width: 600px) {\n" + "td[class='pattern'] .c112p20r {\n" + "\twidth: 112px !important;\n" + "}\n" + "td[class='pattern'] .c336p60r {\n" + "\twidth: 336px !important;\n" + "}\n" + "}\n" + "\n" + "@media only screen and (max-width: 599px), only screen and (max-device-width: 599px), only screen and (max-width: 400px), only screen and (max-device-width: 400px) {\n" + "table[class='email-root-wrapper'] {\n" + "\twidth: 100% !important;\n" + "}\n" + "td[class='wrap'] .full-width {\n" + "\twidth: 100% !important;\n" + "\theight: auto !important;\n" + "}\n" + "td[class='wrap'] .fullwidthhalfleft {\n" + "\twidth: 100% !important;\n" + "}\n" + "td[class='wrap'] .fullwidthhalfright {\n" + "\twidth: 100% !important;\n" + "}\n" + "td[class='wrap'] .fullwidthhalfinner {\n" + "\twidth: 100% !important;\n" + "\tmargin: 0 auto !important;\n" + "\tfloat: none !important;\n" + "\tmargin-left: auto !important;\n" + "\tmargin-right: auto !important;\n" + "\tclear: both !important;\n" + "}\n" + "td[class='wrap'] .hide {\n" + "\tdisplay: none !important;\n" + "\twidth: 0px;\n" + "\theight: 0px;\n" + "\toverflow: hidden;\n" + "}\n" + "td[class='pattern'] .c112p20r {\n" + "\twidth: 100% !important;\n" + "}\n" + "td[class='pattern'] .c336p60r {\n" + "\twidth: 100% !important;\n" + "}\n" + "}\n" + "\n" + "@media yahoo {\n" + "table {\n" + "\tfloat: none !important;\n" + "\theight: auto;\n" + "}\n" + "table[align='left'] {\n" + "\tfloat: left !important;\n" + "}\n" + "td[align='left'] {\n" + "\tfloat: left !important;\n" + "\theight: auto;\n" + "}\n" + "table[align='center'] {\n" + "\tmargin: 0 auto;\n" + "}\n" + "td[align='center'] {\n" + "\tmargin: 0 auto;\n" + "\theight: auto;\n" + "}\n" + "table[align='right'] {\n" + "\tfloat: right !important;\n" + "}\n" + "td[align='right'] {\n" + "\tfloat: right !important;\n" + "\theight: auto;\n" + "}\n" + "}\n" + "</style>\n" + "\n" + "<!--[if (gte IE 7) & (vml)]>\n" + "<style type='text/css'>\n" + "html, body {margin:0 !important; padding:0px !important;}\n" + "img.full-width { position: relative !important; }\n" + "\n" + ".img240x30 { width: 240px !important; height: 30px !important;}\n" + ".img20x20 { width: 20px !important; height: 20px !important;}\n" + "\n" + "</style>\n" + "<![endif]-->\n" + "\n" + "<!--[if gte mso 9]>\n" + "<style type='text/css'>\n" + ".mso-font-fix-arial { font-family: Arial, sans-serif;}\n" + ".mso-font-fix-georgia { font-family: Georgia, sans-serif;}\n" + ".mso-font-fix-tahoma { font-family: Tahoma, sans-serif;}\n" + ".mso-font-fix-times_new_roman { font-family: 'Times New Roman', sans-serif;}\n" + ".mso-font-fix-trebuchet_ms { font-family: 'Trebuchet MS', sans-serif;}\n" + ".mso-font-fix-verdana { font-family: Verdana, sans-serif;}\n" + "</style>\n" + "<![endif]-->\n" + "\n" + "<!--[if gte mso 9]>\n" + "<style type='text/css'>\n" + "table, td {\n" + "border-collapse: collapse !important;\n" + "mso-table-lspace: 0px !important;\n" + "mso-table-rspace: 0px !important;\n" + "}\n" + "\n" + ".email-root-wrapper { width 600px !important;}\n" + ".imglink { font-size: 0px; }\n" + ".edm_button { font-size: 0px; }\n" + "</style>\n" + "<![endif]-->\n" + "\n" + "<!--[if gte mso 15]>\n" + "<style type='text/css'>\n" + "table {\n" + "font-size:0px;\n" + "mso-margin-top-alt:0px;\n" + "}\n" + "\n" + ".fullwidthhalfleft {\n" + "width: 49% !important;\n" + "float:left !important;\n" + "}\n" + "\n" + ".fullwidthhalfright {\n" + "width: 50% !important;\n" + "float:right !important;\n" + "}\n" + "</style>\n" + "<![endif]-->\n" + "<style type='text/css' media='(pointer) and (min-color-index:0)'>\n" + "html, body {\n" + "\tbackground-image: none !important;\n" + "\tbackground-color: #ebebeb !important;\n" + "\tmargin: 0 !important;\n" + "\tpadding: 0 !important;\n" + "}\n" + "</style>\n" + "</head>\n" + "<body leftmargin='0' marginwidth='0' topmargin='0' marginheight='0' offset='0' background=\"\" bgcolor='#ebebeb' style='font-family:Arial, sans-serif; font-size:0px;margin:0;padding:0; '>\n" + "<!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]--><!--[if t]><![endif]-->\n" + "<table align='center' border='0' cellpadding='0' cellspacing='0' background=\"\"  height='100%' width='100%' id='backgroundTable'>\n" + "  <tr>\n" + "    <td class='wrap' align='center' valign='top' width='100%'>\n" + "\t\t<center>\n" + "        <!-- content -->\n" + "        \t<div style='padding: 0px;'>\n" + "        \t  <table cellpadding='0' cellspacing='0' border='0' width='100%' bgcolor='#ebebeb'>\n" + "           \t\t <tr>\n" + "            \t\t  <td valign='top' style='padding: 0px;'>\n" + "\t\t\t\t\t\t  <table cellpadding='0' cellspacing='0' width='600' align='center' style='max-width: 600px;min-width: 240px;margin: 0 auto;' class='email-root-wrapper'>\n" + "                 \t\t \t\t<tr>\n" + "                   \t\t\t\t\t <td valign='top' style='padding: 0px;'>\n" + "\t\t\t\t\t\t\t\t \t\t<table cellpadding='0' cellspacing='0' border='0' width='100%' bgcolor='#FFFFFF' style='border: 0px none;background-color: #FFFFFF;'>\n" + "                       \t\t\t\t\t\t <tr>\n" + "                       \t\t\t  \t\t\t\t <td valign='top' style='padding-top: 30px;padding-right: 20px;padding-bottom: 35px;padding-left: 20px;'>\n" + "\t\t\t\t\t\t\t\t\t   \t\t\t\t\n" + "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<table cellpadding='0'\n" + "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tcellspacing='0' border='0' align='center' width='240'  style='border: 0px none;height: auto;' class='full-width'>\n" + "                                         \t \t\t\t\t\t\t\t\t\t<tr>\n" + "                                            \t\t\t\t\t\t\t\t\t\t<td valign='top' style='padding: 0px;'><img src='https://sf26.sendsfx.com/admin/temp/user/17/doichain_100h.png' width='240' height='30' alt=\"\" border='0' style='display: block;width: 100%;height: auto;' class='full-width img240x30' /></td>\n" + "                                         \t \t\t\t\t\t\t\t\t\t</tr>\n" + "                                        \t\t\t\t\t\t\t\t\t</table>\n" + "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n" + "\t\t\t\t\t\t\t\t\t\t\t\t</td>\n" + "                      \t\t  \t\t\t\t</tr>\n" + "                      \t\t\t\t\t</table>\n" + "\t\t\t\t\t\t\t\t \n" + "\t\t\t\t\t\t\t\t \n" + "                      <table cellpadding='0' cellspacing='0' border='0' width='100%' bgcolor='#0071aa' style='border: 0px none;background-color: #0071aa;background-image: url('https://sf26.sendsfx.com/admin/temp/user/17/blue-bg.jpg');background-repeat: no-repeat ;background-position: center;'>\n" + "                        <tr>\n" + "                          <td valign='top' style='padding-top: 40px;padding-right: 20px;padding-bottom: 45px;padding-left: 20px;'><table cellpadding='0' cellspacing='0' width='100%'>\n" + "                              <tr>\n" + "                                <td style='padding: 0px;' class='pattern'><table cellpadding='0' cellspacing='0' border='0' width='100%'>\n" + "                                    <tr>\n" + "                                      <td valign='top' style='padding-bottom: 10px;'><div style='text-align: left;font-family: arial;font-size: 20px;color: #ffffff;line-height: 30px;mso-line-height: exactly;mso-text-raise: 5px;'>\n" + "                                          <p\n" + "style='padding: 0; margin: 0;text-align: center;'>Bitte bestätigen Sie Ihre Anmeldung</p>\n" + "                                        </div></td>\n" + "                                    </tr>\n" + "                                  </table>\n" + "                                  <table cellpadding='0' cellspacing='0' border='0' width='100%'>\n" + "                                    <tr>\n" + "                                      <td valign='top' style='padding: 0;mso-cellspacing: 0in;'><table cellpadding='0' cellspacing='0' border='0' align='left' width='112'  style='float: left;' class='c112p20r'>\n" + "                                          <tr>\n" + "                                            <td valign='top' style='padding: 0px;'><table cellpadding='0' cellspacing='0' border='0' width='100%' style='border: 0px none;' class='hide'>\n" + "                                                <tr>\n" + "                                                  <td valign='top' style='padding: 0px;'><table cellpadding='0' cellspacing='0' width='100%'>\n" + "                                                      <tr>\n" + "                                                        <td style='padding: 0px;'><table cellpadding='0' cellspacing='0' width='100%'>\n" + "                                                            <tr>\n" + "                                                              <td align='center' style='padding: 0px;'><table cellpadding='0' cellspacing='0' border='0' align='center' width='20'  style='border: 0px none;height: auto;'>\n" + "                                                                  <tr>\n" + "                                                                    <td valign='top' style='padding: 0px;'><img\n" + "src='https://sf26.sendsfx.com/admin/temp/user/17/img_89837318.png' width='20' height='20' alt=\"\" border='0' style='display: block;' class='img20x20' /></td>\n" + "                                                                  </tr>\n" + "                                                                </table></td>\n" + "                                                            </tr>\n" + "                                                          </table></td>\n" + "                                                      </tr>\n" + "                                                    </table></td>\n" + "                                                </tr>\n" + "                                              </table></td>\n" + "                                          </tr>\n" + "                                        </table>\n" + "                                        \n" + "                                        <!--[if gte mso 9]></td><td valign='top' style='padding:0;'><![endif]-->\n" + "                                        \n" + "                                        <table cellpadding='0' cellspacing='0' border='0' align='left' width='336'  style='float: left;' class='c336p60r'>\n" + "                                          <tr>\n" + "                                            <td valign='top' style='padding: 0px;'><table cellpadding='0' cellspacing='0' border='0' width='100%'>\n" + "                                                <tr>\n" + "                                                  <td valign='top' style='padding-bottom: 30px;'><table cellpadding='0' cellspacing='0' width='100%'>\n" + "                                                      <tr>\n" + "                                                        <td style='padding: 0px;'><table cellpadding='0' cellspacing='0' border='0' width='100%' style='border-top: 2px solid #ffffff;'>\n" + "                                                            <tr>\n" + "                                                              <td valign='top'><table cellpadding='0' cellspacing='0' width='100%'>\n" + "                                                                  <tr>\n" + "                                                                    <td style='padding: 0px;'></td>\n" + "                                                                  </tr>\n" + "                                                                </table></td>\n" + "                                                            </tr>\n" + "                                                          </table></td>\n" + "                                                      </tr>\n" + "                                                    </table></td>\n" + "                                                </tr>\n" + "                                              </table></td>\n" + "                                          </tr>\n" + "                                        </table>\n" + "                                        \n" + "                                        <!--[if gte mso 9]></td><td valign='top' style='padding:0;'><![endif]-->\n" + "                                        \n" + "                                        <table cellpadding='0' cellspacing='0' border='0' align='left' width='112'  style='float: left;' class='c112p20r'>\n" + "                                          <tr>\n" + "                                            <td valign='top' style='padding: 0px;'><table cellpadding='0' cellspacing='0' border='0' width='100%' style='border: 0px none;' class='hide'>\n" + "                                                <tr>\n" + "                                                  <td valign='top' style='padding: 0px;'><table cellpadding='0' cellspacing='0' width='100%'>\n" + "                                                      <tr>\n" + "                                                        <td style='padding: 0px;'><table cellpadding='0' cellspacing='0' width='100%'>\n" + "                                                            <tr>\n" + "                                                              <td align='center' style='padding: 0px;'><table cellpadding='0' cellspacing='0' border='0' align='center' width='20'  style='border: 0px none;height: auto;'>\n" + "                                                                  <tr>\n" + "                                                                    <td valign='top' style='padding: 0px;'><img src='https://sf26.sendsfx.com/admin/temp/user/17/img_89837318.png' width='20' height='20' alt=\"\" border='0' style='display: block;' class='img20x20'\n" + "/></td>\n" + "                                                                  </tr>\n" + "                                                                </table></td>\n" + "                                                            </tr>\n" + "                                                          </table></td>\n" + "                                                      </tr>\n" + "                                                    </table></td>\n" + "                                                </tr>\n" + "                                              </table></td>\n" + "                                          </tr>\n" + "                                        </table></td>\n" + "                                    </tr>\n" + "                                  </table>\n" + "                                  <table cellpadding='0' cellspacing='0' border='0' width='100%'>\n" + "                                    <tr>\n" + "                                      <td valign='top' style='padding-bottom: 20px;'><div style='text-align: left;font-family: arial;font-size: 16px;color: #ffffff;line-height: 26px;mso-line-height: exactly;mso-text-raise: 5px;'>\n" + "                                          <p style='padding: 0; margin: 0;text-align: center;'>Vielen Dank, dass Sie sich für unseren Newsletter angemeldet haben.</p>\n" + "                                          <p style='padding: 0; margin: 0;text-align: center;'>Um diese E-Mail-Adresse und Ihre kostenlose Anmeldung zu bestätigen, klicken Sie bitte jetzt auf den folgenden Button:</p>\n" + "                                        </div></td>\n" + "                                    </tr>\n" + "                                  </table>\n" + "                                  <table cellpadding='0' cellspacing='0' width='100%'>\n" + "                                    <tr>\n" + "                                      <td align='center' style='padding: 0px;'><table cellpadding='0' cellspacing='0' border='0' align='center' style='text-align: center;color: #000;' class='full-width'>\n" + "                                          <tr>\n" + "                                            <td valign='top' align='center' style='padding-right: 10px;padding-bottom: 30px;padding-left: 10px;'><table cellpadding='0' cellspacing='0' border='0' bgcolor='#85ac1c' style='border: 0px none;border-radius: 5px;border-collapse: separate !important;background-color: #85ac1c;' class='full-width'>\n" + "                                                <tr>\n" + "                                                  <td valign='top' align='center' style='padding: 12px;'><a href='${confirmation_url}' target='_blank' style='text-decoration: none;' class='edm_button'><span style='font-family: arial;font-size: 18px;color: #ffffff;line-height: 28px;text-decoration: none;'><span\n" + "style='font-size: 18px;'>Jetzt Anmeldung best&auml;tigen</span></span> </a></td>\n" + "                                                </tr>\n" + "                                              </table></td>\n" + "                                          </tr>\n" + "                                        </table></td>\n" + "                                    </tr>\n" + "                                  </table>\n" + "                                  <div style='text-align: left;font-family: arial;font-size: 12px;color: #ffffff;line-height: 22px;mso-line-height: exactly;mso-text-raise: 5px;'>\n" + "                                    <p style='padding: 0; margin: 0;text-align: center;'>Wenn Sie ihre E-Mail-Adresse nicht bestätigen, können keine Newsletter zugestellt werden. Ihr Einverständnis können Sie selbstverständlich jederzeit widerrufen. Sollte es sich bei der Anmeldung um ein Versehen handeln oder wurde der Newsletter nicht in Ihrem Namen bestellt, können Sie diese E-Mail einfach ignorieren. Ihnen werden keine weiteren Nachrichten zugeschickt.</p>\n" + "                                  </div></td>\n" + "                              </tr>\n" + "                            </table></td>\n" + "                        </tr>\n" + "                      </table>\n" + "                      <table cellpadding='0' cellspacing='0' border='0' width='100%' bgcolor='#ffffff' style='border: 0px none;background-color: #ffffff;'>\n" + "                        <tr>\n" + "                          <td valign='top' style='padding-top: 30px;padding-right: 20px;padding-bottom: 35px;padding-left: 20px;'><table cellpadding='0' cellspacing='0' width='100%'>\n" + "                              <tr>\n" + "                                <td style='padding: 0px;'><table cellpadding='0' cellspacing='0' border='0' width='100%'>\n" + "                                    <tr>\n" + "                                      <td valign='top' style='padding-bottom: 25px;'><div style='text-align: left;font-family: arial;font-size: 12px;color: #333333;line-height: 22px;mso-line-height: exactly;mso-text-raise: 5px;'>\n" + "                                          <p style='padding: 0; margin: 0;text-align: center;'><span style='line-height: 3;'><strong>Kontakt</strong></span><br>\n" + "                                            service@sendeffect.de<br>\n" + "                                            www.sendeffect.de<br>\n" + "                                            Telefon: +49 (0) 8571 - 97 39 - 69-0</p>\n" + "                                        </div></td>\n" + "                                    </tr>\n" + "                                  </table>\n" + "                                  <div style='text-align: left;font-family: arial;font-size: 12px;color: #333333;line-height: 22px;mso-line-height: exactly;mso-text-raise: 5px;'>\n" + "                                    <p style='padding: 0; margin: 0;text-align: center;'><span style='line-height: 3;'><strong>Impressum</strong></span><br>\n" + "                                      Anschrift: Schulgasse 5, D-84359 Simbach am Inn, eMail: service@sendeffect.de<br>\n" + "                                      Betreiber: WEBanizer AG, Registergericht: Amtsgericht Landshut HRB 5177, UstId.: DE 2068 62 070<br>\n" + "                                      Vorstand: Ottmar Neuburger, Aufsichtsrat: Tobias Neuburger</p>\n" + "                                  </div></td>\n" + "                              </tr>\n" + "                            </table></td>\n" + "                        </tr>\n" + "                      </table></td>\n" + "                  </tr>\n" + "                </table></td>\n" + "            </tr>\n" + "          </table>\n" + "        </div>\n" + "        <!-- content end -->\n" + "      </center></td>\n" + "  </tr>\n" + "</table>"
      };
      return {
        "status": "success",
        "data": data
      };
    }
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"send.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/rest/imports/send.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

let Api, DOI_FETCH_ROUTE, DOI_CONFIRMATION_NOTIFY_ROUTE;
module.link("../rest.js", {
  Api(v) {
    Api = v;
  },

  DOI_FETCH_ROUTE(v) {
    DOI_FETCH_ROUTE = v;
  },

  DOI_CONFIRMATION_NOTIFY_ROUTE(v) {
    DOI_CONFIRMATION_NOTIFY_ROUTE = v;
  }

}, 0);
let addOptIn;
module.link("../../../../imports/modules/server/opt-ins/add_and_write_to_blockchain.js", {
  default(v) {
    addOptIn = v;
  }

}, 1);
let updateOptInStatus;
module.link("../../../../imports/modules/server/opt-ins/update_status.js", {
  default(v) {
    updateOptInStatus = v;
  }

}, 2);
let getDoiMailData;
module.link("../../../../imports/modules/server/dapps/get_doi-mail-data.js", {
  default(v) {
    getDoiMailData = v;
  }

}, 3);
let logError, logSend;
module.link("../../../../imports/startup/server/log-configuration", {
  logError(v) {
    logError = v;
  },

  logSend(v) {
    logSend = v;
  }

}, 4);
let DOI_EXPORT_ROUTE;
module.link("../rest", {
  DOI_EXPORT_ROUTE(v) {
    DOI_EXPORT_ROUTE = v;
  }

}, 5);
let exportDois;
module.link("../../../../imports/modules/server/dapps/export_dois", {
  default(v) {
    exportDois = v;
  }

}, 6);
let OptIns;
module.link("../../../../imports/api/opt-ins/opt-ins", {
  OptIns(v) {
    OptIns = v;
  }

}, 7);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 8);
//doku of meteor-restivus https://github.com/kahmali/meteor-restivus
Api.addRoute(DOI_CONFIRMATION_NOTIFY_ROUTE, {
  post: {
    authRequired: true,
    //roleRequired: ['admin'],
    action: function () {
      const qParams = this.queryParams;
      const bParams = this.bodyParams;
      let params = {};
      if (qParams !== undefined) params = (0, _objectSpread2.default)({}, qParams);
      if (bParams !== undefined) params = (0, _objectSpread2.default)({}, params, bParams);
      const uid = this.userId;

      if (!Roles.userIsInRole(uid, 'admin') || //if its not an admin always use uid as ownerId
      Roles.userIsInRole(uid, 'admin') && (params["ownerId"] == null || params["ownerId"] == undefined)) {
        //if its an admin only use uid in case no ownerId was given
        params["ownerId"] = uid;
      }

      logSend('parameter received from browser:', params);

      if (params.sender_mail.constructor === Array) {
        //this is a SOI with co-sponsors first email is main sponsor
        return prepareCoDOI(params);
      } else {
        return prepareAdd(params);
      }
    }
  },
  put: {
    authRequired: false,
    action: function () {
      const qParams = this.queryParams;
      const bParams = this.bodyParams;
      logSend('qParams:', qParams);
      logSend('bParams:', bParams);
      let params = {};
      if (qParams !== undefined) params = (0, _objectSpread2.default)({}, qParams);
      if (bParams !== undefined) params = (0, _objectSpread2.default)({}, params, bParams);

      try {
        const val = updateOptInStatus(params);
        logSend('opt-In status updated', val);
        return {
          status: 'success',
          data: {
            message: 'Opt-In status updated'
          }
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: {
            status: 'fail',
            message: error.message
          }
        };
      }
    }
  }
});
Api.addRoute(DOI_FETCH_ROUTE, {
  authRequired: false
}, {
  get: {
    action: function () {
      const params = this.queryParams;

      try {
        logSend('rest api - DOI_FETCH_ROUTE called by bob to request email template', JSON.stringify(params));
        const data = getDoiMailData(params);
        logSend('got doi-mail-data (including templalte) returning to bob', {
          subject: data.subject,
          recipient: data.recipient
        });
        return {
          status: 'success',
          data
        };
      } catch (error) {
        logError('error while getting DoiMailData', error);
        return {
          status: 'fail',
          error: error.message
        };
      }
    }
  }
});
Api.addRoute(DOI_EXPORT_ROUTE, {
  get: {
    authRequired: true,
    //roleRequired: ['admin'],
    action: function () {
      let params = this.queryParams;
      const uid = this.userId;

      if (!Roles.userIsInRole(uid, 'admin')) {
        params = {
          userid: uid,
          role: 'user'
        };
      } else {
        params = (0, _objectSpread2.default)({}, params, {
          role: 'admin'
        });
      }

      try {
        logSend('rest api - DOI_EXPORT_ROUTE called', JSON.stringify(params));
        const data = exportDois(params);
        logSend('got dois from database', JSON.stringify(data));
        return {
          status: 'success',
          data
        };
      } catch (error) {
        logError('error while exporting confirmed dois', error);
        return {
          status: 'fail',
          error: error.message
        };
      }
    }
  }
});

function prepareCoDOI(params) {
  logSend('is array ', params.sender_mail);
  const senders = params.sender_mail;
  const recipient_mail = params.recipient_mail;
  const data = params.data;
  const ownerID = params.ownerId;
  let currentOptInId;
  let retResponse = [];
  let master_doi;
  senders.forEach((sender, index) => {
    const ret_response = prepareAdd({
      sender_mail: sender,
      recipient_mail: recipient_mail,
      data: data,
      master_doi: master_doi,
      index: index,
      ownerId: ownerID
    });
    logSend('CoDOI:', ret_response);
    if (ret_response.status === undefined || ret_response.status === "failed") throw "could not add co-opt-in";
    retResponse.push(ret_response);
    currentOptInId = ret_response.data.id;

    if (index === 0) {
      logSend('main sponsor optInId:', currentOptInId);
      const optIn = OptIns.findOne({
        _id: currentOptInId
      });
      master_doi = optIn.nameId;
      logSend('main sponsor nameId:', master_doi);
    }
  });
  logSend(retResponse);
  return retResponse;
}

function prepareAdd(params) {
  try {
    const val = addOptIn(params);
    logSend('opt-In added ID:', val);
    return {
      status: 'success',
      data: {
        id: val,
        status: 'success',
        message: 'Opt-In added.'
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        status: 'fail',
        message: error.message
      }
    };
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/rest/imports/user.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

let Api;
module.link("../rest.js", {
  Api(v) {
    Api = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Accounts;
module.link("meteor/accounts-base", {
  Accounts(v) {
    Accounts = v;
  }

}, 2);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 3);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 4);
let logMain;
module.link("../../../../imports/startup/server/log-configuration", {
  logMain(v) {
    logMain = v;
  }

}, 5);
const mailTemplateSchema = new SimpleSchema({
  subject: {
    type: String,
    optional: true
  },
  redirect: {
    type: String,
    regEx: "@(https?|ftp)://(-\\.)?([^\\s/?\\.#-]+\\.?)+(/[^\\s]*)?$@",
    optional: true
  },
  returnPath: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  templateURL: {
    type: String,
    regEx: "@(https?|ftp)://(-\\.)?([^\\s/?\\.#-]+\\.?)+(/[^\\s]*)?$@",
    optional: true
  }
});
const createUserSchema = new SimpleSchema({
  username: {
    type: String,
    regEx: "^[A-Z,a-z,0-9,!,_,$,#]{4,24}$" //Only usernames between 4-24 characters from A-Z,a-z,0-9,!,_,$,# allowed

  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  password: {
    type: String,
    regEx: "^[A-Z,a-z,0-9,!,_,$,#]{8,24}$" //Only passwords between 8-24 characters from A-Z,a-z,0-9,!,_,$,# allowed

  },
  mailTemplate: {
    type: mailTemplateSchema,
    optional: true
  }
});
const updateUserSchema = new SimpleSchema({
  mailTemplate: {
    type: mailTemplateSchema
  }
}); //TODO: collection options separate

const collectionOptions = {
  path: "users",
  routeOptions: {
    authRequired: true //,roleRequired : "admin"

  },
  excludedEndpoints: ['patch', 'deleteAll'],
  endpoints: {
    delete: {
      roleRequired: "admin"
    },
    post: {
      roleRequired: "admin",
      action: function () {
        const qParams = this.queryParams;
        const bParams = this.bodyParams;
        let params = {};
        if (qParams !== undefined) params = (0, _objectSpread2.default)({}, qParams);
        if (bParams !== undefined) params = (0, _objectSpread2.default)({}, params, bParams);

        try {
          let userId;
          createUserSchema.validate(params);
          logMain('validated', params);

          if (params.mailTemplate !== undefined) {
            userId = Accounts.createUser({
              username: params.username,
              email: params.email,
              password: params.password,
              profile: {
                mailTemplate: params.mailTemplate
              }
            });
          } else {
            userId = Accounts.createUser({
              username: params.username,
              email: params.email,
              password: params.password,
              profile: {}
            });
          }

          return {
            status: 'success',
            data: {
              userid: userId
            }
          };
        } catch (error) {
          return {
            statusCode: 400,
            body: {
              status: 'fail',
              message: error.message
            }
          };
        }
      }
    },
    put: {
      action: function () {
        const qParams = this.queryParams;
        const bParams = this.bodyParams;
        let params = {};
        let uid = this.userId;
        const paramId = this.urlParams.id;
        if (qParams !== undefined) params = (0, _objectSpread2.default)({}, qParams);
        if (bParams !== undefined) params = (0, _objectSpread2.default)({}, params, bParams);

        try {
          //TODO this is not necessary here and can probably go right into the definition of the REST METHOD next to put (!?!)
          if (!Roles.userIsInRole(uid, 'admin')) {
            if (uid !== paramId) {
              throw Error("No Permission");
            }
          }

          updateUserSchema.validate(params);

          if (!Meteor.users.update(this.urlParams.id, {
            $set: {
              "profile.mailTemplate": params.mailTemplate
            }
          })) {
            throw Error("Failed to update user");
          }

          return {
            status: 'success',
            data: {
              userid: this.urlParams.id,
              mailTemplate: params.mailTemplate
            }
          };
        } catch (error) {
          return {
            statusCode: 400,
            body: {
              status: 'fail',
              message: error.message
            }
          };
        }
      }
    }
  }
};
Api.addCollection(Meteor.users, collectionOptions);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"verify.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/rest/imports/verify.js                                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

let Api;
module.link("../rest.js", {
  Api(v) {
    Api = v;
  }

}, 0);
let verifyOptIn;
module.link("../../../../imports/modules/server/opt-ins/verify.js", {
  default(v) {
    verifyOptIn = v;
  }

}, 1);
Api.addRoute('opt-in/verify', {
  authRequired: true
}, {
  get: {
    authRequired: false,
    action: function () {
      const qParams = this.queryParams;
      const bParams = this.bodyParams;
      let params = {};
      if (qParams !== undefined) params = (0, _objectSpread2.default)({}, qParams);
      if (bParams !== undefined) params = (0, _objectSpread2.default)({}, params, bParams);

      try {
        const val = verifyOptIn(params);
        return {
          status: "success",
          data: {
            val
          }
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: {
            status: 'fail',
            message: error.message
          }
        };
      }
    }
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"rest.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/rest/rest.js                                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  DOI_CONFIRMATION_ROUTE: () => DOI_CONFIRMATION_ROUTE,
  DOI_CONFIRMATION_NOTIFY_ROUTE: () => DOI_CONFIRMATION_NOTIFY_ROUTE,
  DOI_WALLETNOTIFY_ROUTE: () => DOI_WALLETNOTIFY_ROUTE,
  DOI_FETCH_ROUTE: () => DOI_FETCH_ROUTE,
  DOI_EXPORT_ROUTE: () => DOI_EXPORT_ROUTE,
  USERS_COLLECTION_ROUTE: () => USERS_COLLECTION_ROUTE,
  API_PATH: () => API_PATH,
  VERSION: () => VERSION,
  Api: () => Api
});
let Restivus;
module.link("meteor/nimble:restivus", {
  Restivus(v) {
    Restivus = v;
  }

}, 0);
let isDebug;
module.link("../../../imports/startup/server/dapp-configuration.js", {
  isDebug(v) {
    isDebug = v;
  }

}, 1);
let SEND_APP, CONFIRM_APP, VERIFY_APP, isAppType;
module.link("../../../imports/startup/server/type-configuration.js", {
  SEND_APP(v) {
    SEND_APP = v;
  },

  CONFIRM_APP(v) {
    CONFIRM_APP = v;
  },

  VERIFY_APP(v) {
    VERIFY_APP = v;
  },

  isAppType(v) {
    isAppType = v;
  }

}, 2);
const DOI_CONFIRMATION_ROUTE = "opt-in/confirm";
const DOI_CONFIRMATION_NOTIFY_ROUTE = "opt-in";
const DOI_WALLETNOTIFY_ROUTE = "walletnotify";
const DOI_FETCH_ROUTE = "doi-mail";
const DOI_EXPORT_ROUTE = "export";
const USERS_COLLECTION_ROUTE = "users";
const API_PATH = "api/";
const VERSION = "v1";
const Api = new Restivus({
  apiPath: API_PATH,
  version: VERSION,
  useDefaultAuth: true,
  prettyJson: true
});
if (isDebug()) require('./imports/debug.js');
if (isAppType(SEND_APP)) require('./imports/send.js');
if (isAppType(CONFIRM_APP)) require('./imports/confirm.js');
if (isAppType(VERIFY_APP)) require('./imports/verify.js');

require('./imports/user.js');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"blockchain_jobs.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/blockchain_jobs.js                                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  BlockchainJobs: () => BlockchainJobs
});
let JobCollection, Job;
module.link("meteor/vsivsi:job-collection", {
  JobCollection(v) {
    JobCollection = v;
  },

  Job(v) {
    Job = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let insert;
module.link("../../imports/modules/server/doichain/insert.js", {
  default(v) {
    insert = v;
  }

}, 2);
let update;
module.link("../../imports/modules/server/doichain/update.js", {
  default(v) {
    update = v;
  }

}, 3);
let checkNewTransaction;
module.link("../../imports/modules/server/doichain/check_new_transactions.js", {
  default(v) {
    checkNewTransaction = v;
  }

}, 4);
let CONFIRM_APP, isAppType;
module.link("../../imports/startup/server/type-configuration.js", {
  CONFIRM_APP(v) {
    CONFIRM_APP = v;
  },

  isAppType(v) {
    isAppType = v;
  }

}, 5);
let logMain;
module.link("../../imports/startup/server/log-configuration", {
  logMain(v) {
    logMain = v;
  }

}, 6);
const BlockchainJobs = JobCollection('blockchain');
BlockchainJobs.processJobs('insert', {
  workTimeout: 30 * 1000
}, function (job, cb) {
  try {
    const entry = job.data;
    insert(entry);
    job.done();
  } catch (exception) {
    job.fail();
    throw new Meteor.Error('jobs.blockchain.insert.exception', exception);
  } finally {
    cb();
  }
});
BlockchainJobs.processJobs('update', {
  workTimeout: 30 * 1000
}, function (job, cb) {
  try {
    const entry = job.data;
    update(entry, job);
  } catch (exception) {
    job.fail();
    throw new Meteor.Error('jobs.blockchain.update.exception', exception);
  } finally {
    cb();
  }
});
BlockchainJobs.processJobs('checkNewTransaction', {
  workTimeout: 30 * 1000
}, function (job, cb) {
  try {
    if (!isAppType(CONFIRM_APP)) {
      job.pause();
      job.cancel();
      job.remove();
    } else {//checkNewTransaction(null,job);
    }
  } catch (exception) {
    job.fail();
    throw new Meteor.Error('jobs.blockchain.checkNewTransactions.exception', exception);
  } finally {
    cb();
  }
});
new Job(BlockchainJobs, 'cleanup', {}).repeat({
  schedule: BlockchainJobs.later.parse.text("every 5 minutes")
}).save({
  cancelRepeats: true
});
let q = BlockchainJobs.processJobs('cleanup', {
  pollInterval: false,
  workTimeout: 60 * 1000
}, function (job, cb) {
  const current = new Date();
  current.setMinutes(current.getMinutes() - 5);
  const ids = BlockchainJobs.find({
    status: {
      $in: Job.jobStatusRemovable
    },
    updated: {
      $lt: current
    }
  }, {
    fields: {
      _id: 1
    }
  });
  logMain('found  removable blockchain jobs:', ids);
  BlockchainJobs.removeJobs(ids);

  if (ids.length > 0) {
    job.done("Removed #{ids.length} old jobs");
  }

  cb();
});
BlockchainJobs.find({
  type: 'jobType',
  status: 'ready'
}).observe({
  added: function () {
    q.trigger();
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dapp_jobs.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/dapp_jobs.js                                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  DAppJobs: () => DAppJobs
});
let JobCollection, Job;
module.link("meteor/vsivsi:job-collection", {
  JobCollection(v) {
    JobCollection = v;
  },

  Job(v) {
    Job = v;
  }

}, 0);
let fetchDoiMailData;
module.link("../../imports/modules/server/dapps/fetch_doi-mail-data.js", {
  default(v) {
    fetchDoiMailData = v;
  }

}, 1);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 2);
let logMain;
module.link("../../imports/startup/server/log-configuration", {
  logMain(v) {
    logMain = v;
  }

}, 3);
let BlockchainJobs;
module.link("./blockchain_jobs", {
  BlockchainJobs(v) {
    BlockchainJobs = v;
  }

}, 4);
const DAppJobs = JobCollection('dapp');
DAppJobs.processJobs('fetchDoiMailData', function (job, cb) {
  try {
    const data = job.data;
    fetchDoiMailData(data);
    job.done();
  } catch (exception) {
    job.fail();
    throw new Meteor.Error('jobs.dapp.fetchDoiMailData.exception', exception);
  } finally {
    cb();
  }
});
new Job(DAppJobs, 'cleanup', {}).repeat({
  schedule: DAppJobs.later.parse.text("every 5 minutes")
}).save({
  cancelRepeats: true
});
let q = DAppJobs.processJobs('cleanup', {
  pollInterval: false,
  workTimeout: 60 * 1000
}, function (job, cb) {
  const current = new Date();
  current.setMinutes(current.getMinutes() - 5);
  const ids = DAppJobs.find({
    status: {
      $in: Job.jobStatusRemovable
    },
    updated: {
      $lt: current
    }
  }, {
    fields: {
      _id: 1
    }
  });
  logMain('found  removable blockchain jobs:', ids);
  DAppJobs.removeJobs(ids);

  if (ids.length > 0) {
    job.done("Removed #{ids.length} old jobs");
  }

  cb();
});
DAppJobs.find({
  type: 'jobType',
  status: 'ready'
}).observe({
  added: function () {
    q.trigger();
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dns.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/dns.js                                                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  resolveTxt: () => resolveTxt
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let dns;
module.link("dns", {
  default(v) {
    dns = v;
  }

}, 1);
let logSend;
module.link("../../imports/startup/server/log-configuration", {
  logSend(v) {
    logSend = v;
  }

}, 2);

function resolveTxt(key, domain) {
  const syncFunc = Meteor.wrapAsync(dns_resolveTxt);

  try {
    const records = syncFunc(key, domain);
    if (records === undefined) return undefined;
    let value = undefined;
    records.forEach(record => {
      if (record[0].startsWith(key)) {
        const val = record[0].substring(key.length + 1);
        value = val.trim();
      }
    });
    return value;
  } catch (error) {
    if (error.message.startsWith("queryTxt ENODATA") || error.message.startsWith("queryTxt ENOTFOUND")) return undefined;else throw error;
  }
}

function dns_resolveTxt(key, domain, callback) {
  logSend("resolving dns txt attribute: ", {
    key: key,
    domain: domain
  });
  dns.resolveTxt(domain, (err, records) => {
    callback(err, records);
  });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"doichain.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/doichain.js                                                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  getWif: () => getWif,
  getAddressesByAccount: () => getAddressesByAccount,
  getNewAddress: () => getNewAddress,
  signMessage: () => signMessage,
  nameShow: () => nameShow,
  feeDoi: () => feeDoi,
  nameDoi: () => nameDoi,
  listSinceBlock: () => listSinceBlock,
  getTransaction: () => getTransaction,
  getRawTransaction: () => getRawTransaction,
  getBalance: () => getBalance
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let logBlockchain, logConfirm, logError;
module.link("../../imports/startup/server/log-configuration", {
  logBlockchain(v) {
    logBlockchain = v;
  },

  logConfirm(v) {
    logConfirm = v;
  },

  logError(v) {
    logError = v;
  }

}, 1);
const NAMESPACE = 'e/';

function getWif(client, address) {
  if (!address) {
    address = getAddressesByAccount("")[0];
    logBlockchain('address was not defined so getting the first existing one of the wallet:', address);
  }

  if (!address) {
    address = getNewAddress("");
    logBlockchain('address was never defined  at all generated new address for this wallet:', address);
  }

  const syncFunc = Meteor.wrapAsync(doichain_dumpprivkey);
  return syncFunc(client, address);
}

function doichain_dumpprivkey(client, address, callback) {
  const ourAddress = address;
  client.cmd('dumpprivkey', ourAddress, function (err, data) {
    if (err) logError('doichain_dumpprivkey:', err);
    callback(err, data);
  });
}

function getAddressesByAccount(client, accout) {
  const syncFunc = Meteor.wrapAsync(doichain_getaddressesbyaccount);
  return syncFunc(client, accout);
}

function doichain_getaddressesbyaccount(client, account, callback) {
  const ourAccount = account;
  client.cmd('getaddressesbyaccount', ourAccount, function (err, data) {
    if (err) logError('getaddressesbyaccount:', err);
    callback(err, data);
  });
}

function getNewAddress(client, accout) {
  const syncFunc = Meteor.wrapAsync(doichain_getnewaddress);
  return syncFunc(client, accout);
}

function doichain_getnewaddress(client, account, callback) {
  const ourAccount = account;
  client.cmd('getnewaddresss', ourAccount, function (err, data) {
    if (err) logError('getnewaddresss:', err);
    callback(err, data);
  });
}

function signMessage(client, address, message) {
  const syncFunc = Meteor.wrapAsync(doichain_signMessage);
  return syncFunc(client, address, message);
}

function doichain_signMessage(client, address, message, callback) {
  const ourAddress = address;
  const ourMessage = message;
  client.cmd('signmessage', ourAddress, ourMessage, function (err, data) {
    callback(err, data);
  });
}

function nameShow(client, id) {
  const syncFunc = Meteor.wrapAsync(doichain_nameShow);
  return syncFunc(client, id);
}

function doichain_nameShow(client, id, callback) {
  const ourId = checkId(id);
  logConfirm('doichain-cli name_show :', ourId);
  client.cmd('name_show', ourId, function (err, data) {
    if (err !== undefined && err !== null && err.message.startsWith("name not found")) {
      err = undefined, data = undefined;
    }

    callback(err, data);
  });
}

function feeDoi(client, address) {
  const syncFunc = Meteor.wrapAsync(doichain_feeDoi);
  return syncFunc(client, address);
}

function doichain_feeDoi(client, address, callback) {
  const destAddress = address;
  client.cmd('sendtoaddress', destAddress, '0.02', function (err, data) {
    callback(err, data);
  });
}

function nameDoi(client, name, value, address) {
  const syncFunc = Meteor.wrapAsync(doichain_nameDoi);
  return syncFunc(client, name, value, address);
}

function doichain_nameDoi(client, name, value, address, callback) {
  const ourName = checkId(name);
  const ourValue = value;
  const destAddress = address;

  if (!address) {
    client.cmd('name_doi', ourName, ourValue, function (err, data) {
      callback(err, data);
    });
  } else {
    client.cmd('name_doi', ourName, ourValue, destAddress, function (err, data) {
      callback(err, data);
    });
  }
}

function listSinceBlock(client, block) {
  const syncFunc = Meteor.wrapAsync(doichain_listSinceBlock);
  var ourBlock = block;
  if (ourBlock === undefined) ourBlock = null;
  return syncFunc(client, ourBlock);
}

function doichain_listSinceBlock(client, block, callback) {
  var ourBlock = block;
  if (ourBlock === null) client.cmd('listsinceblock', function (err, data) {
    callback(err, data);
  });else client.cmd('listsinceblock', ourBlock, function (err, data) {
    callback(err, data);
  });
}

function getTransaction(client, txid) {
  const syncFunc = Meteor.wrapAsync(doichain_gettransaction);
  return syncFunc(client, txid);
}

function doichain_gettransaction(client, txid, callback) {
  logConfirm('doichain_gettransaction:', txid);
  client.cmd('gettransaction', txid, function (err, data) {
    if (err) logError('doichain_gettransaction:', err);
    callback(err, data);
  });
}

function getRawTransaction(client, txid) {
  const syncFunc = Meteor.wrapAsync(doichain_getrawtransaction);
  return syncFunc(client, txid);
}

function doichain_getrawtransaction(client, txid, callback) {
  logBlockchain('doichain_getrawtransaction:', txid);
  client.cmd('getrawtransaction', txid, 1, function (err, data) {
    if (err) logError('doichain_getrawtransaction:', err);
    callback(err, data);
  });
}

function getBalance(client) {
  const syncFunc = Meteor.wrapAsync(doichain_getbalance);
  return syncFunc(client);
}

function doichain_getbalance(client, callback) {
  client.cmd('getbalance', function (err, data) {
    if (err) {
      logError('doichain_getbalance:', err);
    }

    callback(err, data);
  });
}

function checkId(id) {
  const DOI_PREFIX = "doi: ";
  let ret_val = id; //default value

  if (id.startsWith(DOI_PREFIX)) ret_val = id.substring(DOI_PREFIX.length); //in case it starts with doi: cut  this away

  if (!id.startsWith(NAMESPACE)) ret_val = NAMESPACE + id; //in case it doesn't start with e/ put it in front now.

  return ret_val;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"http.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/http.js                                                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  getHttpGET: () => getHttpGET,
  getHttpGETdata: () => getHttpGETdata,
  getHttpPOST: () => getHttpPOST,
  getHttpPUT: () => getHttpPUT
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let HTTP;
module.link("meteor/http", {
  HTTP(v) {
    HTTP = v;
  }

}, 1);

function getHttpGET(url, query) {
  const syncFunc = Meteor.wrapAsync(_get);
  return syncFunc(url, query);
}

function getHttpGETdata(url, data) {
  const syncFunc = Meteor.wrapAsync(_getData);
  return syncFunc(url, data);
}

function getHttpPOST(url, data) {
  const syncFunc = Meteor.wrapAsync(_post);
  return syncFunc(url, data);
}

function getHttpPUT(url, data) {
  const syncFunc = Meteor.wrapAsync(_put);
  return syncFunc(url, data);
}

function _get(url, query, callback) {
  const ourUrl = url;
  const ourQuery = query;
  HTTP.get(ourUrl, {
    query: ourQuery
  }, function (err, ret) {
    callback(err, ret);
  });
}

function _getData(url, data, callback) {
  const ourUrl = url;
  const ourData = data;
  HTTP.get(ourUrl, ourData, function (err, ret) {
    callback(err, ret);
  });
}

function _post(url, data, callback) {
  const ourUrl = url;
  const ourData = data;
  HTTP.post(ourUrl, ourData, function (err, ret) {
    callback(err, ret);
  });
}

function _put(url, updateData, callback) {
  const ourUrl = url;
  const ourData = {
    data: updateData
  };
  HTTP.put(ourUrl, ourData, function (err, ret) {
    callback(err, ret);
  });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/index.js                                                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.link("./mail_jobs.js");
module.link("./doichain.js");
module.link("./blockchain_jobs.js");
module.link("./dapp_jobs.js");
module.link("./dns.js");
module.link("./rest/rest.js");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mail_jobs.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/api/mail_jobs.js                                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  MailJobs: () => MailJobs
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let JobCollection, Job;
module.link("meteor/vsivsi:job-collection", {
  JobCollection(v) {
    JobCollection = v;
  },

  Job(v) {
    Job = v;
  }

}, 1);
let sendMail;
module.link("../../imports/modules/server/emails/send.js", {
  default(v) {
    sendMail = v;
  }

}, 2);
let logMain;
module.link("../../imports/startup/server/log-configuration", {
  logMain(v) {
    logMain = v;
  }

}, 3);
let BlockchainJobs;
module.link("./blockchain_jobs", {
  BlockchainJobs(v) {
    BlockchainJobs = v;
  }

}, 4);
const MailJobs = JobCollection('emails');
MailJobs.processJobs('send', function (job, cb) {
  try {
    const email = job.data;
    sendMail(email);
    job.done();
  } catch (exception) {
    job.fail();
    throw new Meteor.Error('jobs.mail.send.exception', exception);
  } finally {
    cb();
  }
});
new Job(MailJobs, 'cleanup', {}).repeat({
  schedule: MailJobs.later.parse.text("every 5 minutes")
}).save({
  cancelRepeats: true
});
let q = MailJobs.processJobs('cleanup', {
  pollInterval: false,
  workTimeout: 60 * 1000
}, function (job, cb) {
  const current = new Date();
  current.setMinutes(current.getMinutes() - 5);
  const ids = MailJobs.find({
    status: {
      $in: Job.jobStatusRemovable
    },
    updated: {
      $lt: current
    }
  }, {
    fields: {
      _id: 1
    }
  });
  logMain('found  removable blockchain jobs:', ids);
  MailJobs.removeJobs(ids);

  if (ids.length > 0) {
    job.done("Removed #{ids.length} old jobs");
  }

  cb();
});
MailJobs.find({
  type: 'jobType',
  status: 'ready'
}).observe({
  added: function () {
    q.trigger();
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"main.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/main.js                                                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.link("/imports/startup/server");
module.link("./api/index.js");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"i18n":{"de.i18n.json.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// i18n/de.i18n.json.js                                                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Package['universe:i18n'].i18n.addTranslations('de','',{"components":{"userMenu":{"logout":"Ausloggen","login":"Einloggen","join":"Beitreten","change":"Passwort ändern","entries":{"home":{"name":"Startseite"},"key-generator":{"name":"Key Generator"},"balance":{"name":"Guthaben"},"recipients":{"name":"Empfänger"},"opt-ins":{"name":"Opt-Ins"}}},"keyGenerator":{"privateKey":"Privater Schlüssel","publicKey":"Öffentlicher Schlüssel","generateButton":"Generieren"},"balance":{},"connectionNotification":{"tryingToConnect":"Versuche zu verbinden","connectionIssue":"Es scheint ein Verbindungsproblem zu geben"},"mobileMenu":{"showMenu":"Zeige Menü"},"ImageElement":{"toggle":"Anzeigen"}},"pages":{"startPage":{"title":"doichain","infoText":"Doichain - die Blockchain basierte Anti-Email-Spam Lösung","joinNow":"Jetzt anmelden!"},"keyGeneratorPage":{"title":"Key Generator"},"balancePage":{"title":"Guthaben"},"recipientsPage":{"title":"Empfänger","noRecipients":"Keine Empfänger hier","loading":"Lade Empfänger...","id":"ID","email":"Email","publicKey":"Public Key","createdAt":"Erstellt am"},"optInsPage":{"title":"Opt-Ins","noOptIns":"Keine Opt-Ins hier","loading":"Lade Opt-Ins...","id":"ID","recipient":"Empfänger","sender":"Versender","data":"Daten","screenshot":"Screenshot","nameId":"NameId","createdAt":"Erstellt am","confirmedAt":"Bestätigt am","confirmedBy":"Bestätigt von","txId":"Transaktions-Id","error":"Fehler"},"authPageSignIn":{"emailRequired":"Email benötigt","passwordRequired":"Passwort benötigt","signIn":"Einloggen.","signInReason":"Einloggen erlaubt dir opt-ins hinzuzufügen","yourEmail":"Deine Email","password":"Passwort","signInButton":"Einloggen","needAccount":"Keinen Account? Jetzt beitreten."},"notFoundPage":{"pageNotFound":"Seite nicht gefunden"}},"api":{"opt-ins":{"add":{"accessDenied":"Keine Berechtigung um Opt-Ins hinzuzufügen"}}}});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"en.i18n.json.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// i18n/en.i18n.json.js                                                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Package['universe:i18n'].i18n.addTranslations('en','',{"components":{"userMenu":{"logout":"Logout","login":"Login","join":"Sign-up","change":"Change password","entries":{"home":{"name":"Home"},"key-generator":{"name":"Key Generator"},"balance":{"name":"Balance"},"recipients":{"name":"Recipients"},"opt-ins":{"name":"Opt-Ins"}}},"keyGenerator":{"privateKey":"Private key","publicKey":"Public key","generateButton":"Generate"},"balance":{},"connectionNotification":{"tryingToConnect":"Trying to connect","connectionIssue":"There seems to be a connection issue"},"mobileMenu":{"showMenu":"Show Menu"},"ImageElement":{"toggle":"Display"}},"pages":{"startPage":{"title":"doichain","infoText":"This is Doichain - A blockchain based email anti-spam","joinNow":"Join now!"},"keyGeneratorPage":{"title":"Key Generator"},"balancePage":{"title":"Balance"},"recipientsPage":{"title":"Recipients","noRecipients":"No recipients here","loading":"Loading recipients...","id":"ID","email":"Email","publicKey":"Public Key","createdAt":"Created At"},"optInsPage":{"title":"Opt-Ins","noOptIns":"No opt-ins here","loading":"Loading opt-ins...","id":"ID","recipient":"Recipient","sender":"Sender","data":"Data","screenshot":"Screenshot","nameId":"NameId","createdAt":"Created At","confirmedAt":"Confirmed At","confirmedBy":"Confirmed By","txId":"Transaction-Id","error":"Error"},"authPageSignIn":{"emailRequired":"Email required","passwordRequired":"Password required","signIn":"Sign In.","signInReason":"Signing in allows you to add opt-ins","yourEmail":"Your Email","password":"Password","signInButton":"Sign in","needAccount":"Need an account? Join Now."},"notFoundPage":{"pageNotFound":"Page not found"}},"api":{"opt-ins":{"add":{"accessDenied":"Cannot add opt-ins without permissions"}}}});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".i18n.json"
  ]
});

require("/server/api/rest/rest.js");
require("/server/api/blockchain_jobs.js");
require("/server/api/dapp_jobs.js");
require("/server/api/dns.js");
require("/server/api/doichain.js");
require("/server/api/http.js");
require("/server/api/index.js");
require("/server/api/mail_jobs.js");
require("/i18n/de.i18n.json.js");
require("/i18n/en.i18n.json.js");
require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvb3B0LWlucy9zZXJ2ZXIvcHVibGljYXRpb25zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9vcHQtaW5zL21ldGhvZHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL29wdC1pbnMvb3B0LWlucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvcmVjaXBpZW50cy9zZXJ2ZXIvcHVibGljYXRpb25zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9yZWNpcGllbnRzL3JlY2lwaWVudHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL2RvaWNoYWluL2VudHJpZXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL2RvaWNoYWluL21ldGhvZHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL2xhbmd1YWdlcy9tZXRob2RzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2FwaS9tZXRhL21ldGEuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvYXBpL3NlbmRlcnMvc2VuZGVycy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kYXBwcy9leHBvcnRfZG9pcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kYXBwcy9mZXRjaF9kb2ktbWFpbC1kYXRhLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2RhcHBzL2dldF9kb2ktbWFpbC1kYXRhLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2Rucy9nZXRfb3B0LWluLWtleS5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kbnMvZ2V0X29wdC1pbi1wcm92aWRlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kb2ljaGFpbi9hZGRfZW50cnlfYW5kX2ZldGNoX2RhdGEuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZG9pY2hhaW4vY2hlY2tfbmV3X3RyYW5zYWN0aW9ucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kb2ljaGFpbi9kZWNyeXB0X21lc3NhZ2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZG9pY2hhaW4vZW5jcnlwdF9tZXNzYWdlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2RvaWNoYWluL2dlbmVyYXRlX25hbWUtaWQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZG9pY2hhaW4vZ2V0X2FkZHJlc3MuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZG9pY2hhaW4vZ2V0X2JhbGFuY2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZG9pY2hhaW4vZ2V0X2RhdGEtaGFzaC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kb2ljaGFpbi9nZXRfa2V5LXBhaXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZG9pY2hhaW4vZ2V0X3ByaXZhdGUta2V5X2Zyb21fd2lmLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2RvaWNoYWluL2dldF9wdWJsaWNrZXlfYW5kX2FkZHJlc3NfYnlfZG9tYWluLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2RvaWNoYWluL2dldF9zaWduYXR1cmUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZG9pY2hhaW4vaW5zZXJ0LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2RvaWNoYWluL3VwZGF0ZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kb2ljaGFpbi92ZXJpZnlfc2lnbmF0dXJlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2RvaWNoYWluL3dyaXRlX3RvX2Jsb2NrY2hhaW4uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZW1haWxzL2RlY29kZV9kb2ktaGFzaC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9lbWFpbHMvZ2VuZXJhdGVfZG9pLWhhc2guanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZW1haWxzL3BhcnNlX3RlbXBsYXRlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2VtYWlscy9zZW5kLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2pvYnMvYWRkX2NoZWNrX25ld190cmFuc2FjdGlvbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvam9icy9hZGRfZmV0Y2gtZG9pLW1haWwtZGF0YS5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9qb2JzL2FkZF9pbnNlcnRfYmxvY2tjaGFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9qb2JzL2FkZF9zZW5kX21haWwuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvam9icy9hZGRfdXBkYXRlX2Jsb2NrY2hhaW4uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvbGFuZ3VhZ2VzL2dldC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9tZXRhL2FkZE9yVXBkYXRlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL29wdC1pbnMvYWRkLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL29wdC1pbnMvYWRkX2FuZF93cml0ZV90b19ibG9ja2NoYWluLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL21vZHVsZXMvc2VydmVyL29wdC1pbnMvY29uZmlybS5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9vcHQtaW5zL2dlbmVyYXRlX2RvaS10b2tlbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9vcHQtaW5zL3VwZGF0ZV9zdGF0dXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvb3B0LWlucy92ZXJpZnkuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvcmVjaXBpZW50cy9hZGQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvc2VuZGVycy9hZGQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvZGFwcC1jb25maWd1cmF0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL2Rucy1jb25maWd1cmF0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL2RvaWNoYWluLWNvbmZpZ3VyYXRpb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvZW1haWwtY29uZmlndXJhdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zdGFydHVwL3NlcnZlci9maXh0dXJlcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zdGFydHVwL3NlcnZlci9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zdGFydHVwL3NlcnZlci9qb2JzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL3JlZ2lzdGVyLWFwaS5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zdGFydHVwL3NlcnZlci9zZWN1cml0eS5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zdGFydHVwL3NlcnZlci90eXBlLWNvbmZpZ3VyYXRpb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvdXNlcmFjY291bnRzLWNvbmZpZ3VyYXRpb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9hcGkvcmVzdC9pbXBvcnRzL2NvbmZpcm0uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9hcGkvcmVzdC9pbXBvcnRzL2RlYnVnLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvYXBpL3Jlc3QvaW1wb3J0cy9zZW5kLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvYXBpL3Jlc3QvaW1wb3J0cy91c2VyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvYXBpL3Jlc3QvaW1wb3J0cy92ZXJpZnkuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9hcGkvcmVzdC9yZXN0LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvYXBpL2Jsb2NrY2hhaW5fam9icy5qcyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2FwaS9kYXBwX2pvYnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9hcGkvZG5zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvYXBpL2RvaWNoYWluLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvYXBpL2h0dHAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9hcGkvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9hcGkvbWFpbF9qb2JzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvbWFpbi5qcyJdLCJuYW1lcyI6WyJNZXRlb3IiLCJtb2R1bGUiLCJsaW5rIiwidiIsIlJvbGVzIiwiT3B0SW5zIiwicHVibGlzaCIsIk9wdEluc0FsbCIsInVzZXJJZCIsInJlYWR5IiwidXNlcklzSW5Sb2xlIiwiZmluZCIsIm93bmVySWQiLCJmaWVsZHMiLCJwdWJsaWNGaWVsZHMiLCJERFBSYXRlTGltaXRlciIsImkxOG4iLCJfaTE4biIsIlZhbGlkYXRlZE1ldGhvZCIsIl8iLCJhZGRPcHRJbiIsImRlZmF1bHQiLCJhZGQiLCJuYW1lIiwidmFsaWRhdGUiLCJydW4iLCJyZWNpcGllbnRNYWlsIiwic2VuZGVyTWFpbCIsImRhdGEiLCJlcnJvciIsIkVycm9yIiwiX18iLCJvcHRJbiIsIk9QVElPTlNfTUVUSE9EUyIsInBsdWNrIiwiaXNTZXJ2ZXIiLCJhZGRSdWxlIiwiY29udGFpbnMiLCJjb25uZWN0aW9uSWQiLCJleHBvcnQiLCJNb25nbyIsIlNpbXBsZVNjaGVtYSIsIk9wdEluc0NvbGxlY3Rpb24iLCJDb2xsZWN0aW9uIiwiaW5zZXJ0IiwiY2FsbGJhY2siLCJvdXJPcHRJbiIsInJlY2lwaWVudF9zZW5kZXIiLCJyZWNpcGllbnQiLCJzZW5kZXIiLCJjcmVhdGVkQXQiLCJEYXRlIiwicmVzdWx0IiwidXBkYXRlIiwic2VsZWN0b3IiLCJtb2RpZmllciIsInJlbW92ZSIsImRlbnkiLCJzY2hlbWEiLCJfaWQiLCJ0eXBlIiwiU3RyaW5nIiwicmVnRXgiLCJSZWdFeCIsIklkIiwib3B0aW9uYWwiLCJkZW55VXBkYXRlIiwiaW5kZXgiLCJJbnRlZ2VyIiwibmFtZUlkIiwidHhJZCIsIm1hc3RlckRvaSIsImNvbmZpcm1lZEF0IiwiY29uZmlybWVkQnkiLCJJUCIsImNvbmZpcm1hdGlvblRva2VuIiwiYXR0YWNoU2NoZW1hIiwiUmVjaXBpZW50cyIsInJlY2lwaWVudEdldCIsInBpcGVsaW5lIiwicHVzaCIsIiRyZWRhY3QiLCIkY29uZCIsImlmIiwiJGNtcCIsInRoZW4iLCJlbHNlIiwiJGxvb2t1cCIsImZyb20iLCJsb2NhbEZpZWxkIiwiZm9yZWlnbkZpZWxkIiwiYXMiLCIkdW53aW5kIiwiJHByb2plY3QiLCJhZ2dyZWdhdGUiLCJySWRzIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJSZWNpcGllbnRFbWFpbCIsInJlY2lwaWVudHNBbGwiLCJSZWNpcGllbnRzQ29sbGVjdGlvbiIsIm91clJlY2lwaWVudCIsImVtYWlsIiwicHJpdmF0ZUtleSIsInVuaXF1ZSIsInB1YmxpY0tleSIsIkRvaWNoYWluRW50cmllcyIsIkRvaWNoYWluRW50cmllc0NvbGxlY3Rpb24iLCJlbnRyeSIsInZhbHVlIiwiYWRkcmVzcyIsImdldEtleVBhaXJNIiwiZ2V0QmFsYW5jZU0iLCJnZXRLZXlQYWlyIiwiZ2V0QmFsYW5jZSIsImxvZ1ZhbCIsIk9QVElOU19NRVRIT0RTIiwiZ2V0TGFuZ3VhZ2VzIiwiZ2V0QWxsTGFuZ3VhZ2VzIiwiTWV0YSIsIk1ldGFDb2xsZWN0aW9uIiwib3VyRGF0YSIsImtleSIsIlNlbmRlcnMiLCJTZW5kZXJzQ29sbGVjdGlvbiIsIm91clNlbmRlciIsIkRPSV9NQUlMX0ZFVENIX1VSTCIsImxvZ1NlbmQiLCJFeHBvcnREb2lzRGF0YVNjaGVtYSIsInN0YXR1cyIsInJvbGUiLCJ1c2VyaWQiLCJpZCIsImV4cG9ydERvaXMiLCIkbWF0Y2giLCIkZXhpc3RzIiwiJG5lIiwidW5kZWZpbmVkIiwiY29uY2F0Iiwib3B0SW5zIiwiZXhwb3J0RG9pRGF0YSIsIkpTT04iLCJzdHJpbmdpZnkiLCJleGNlcHRpb24iLCJleHBvcnREZWZhdWx0IiwiRE9JX0ZFVENIX1JPVVRFIiwiRE9JX0NPTkZJUk1BVElPTl9ST1VURSIsIkFQSV9QQVRIIiwiVkVSU0lPTiIsImdldFVybCIsIkNPTkZJUk1fQ0xJRU5UIiwiQ09ORklSTV9BRERSRVNTIiwiZ2V0SHR0cEdFVCIsInNpZ25NZXNzYWdlIiwicGFyc2VUZW1wbGF0ZSIsImdlbmVyYXRlRG9pVG9rZW4iLCJnZW5lcmF0ZURvaUhhc2giLCJhZGRTZW5kTWFpbEpvYiIsImxvZ0NvbmZpcm0iLCJsb2dFcnJvciIsIkZldGNoRG9pTWFpbERhdGFTY2hlbWEiLCJkb21haW4iLCJmZXRjaERvaU1haWxEYXRhIiwidXJsIiwic2lnbmF0dXJlIiwicXVlcnkiLCJlbmNvZGVVUklDb21wb25lbnQiLCJyZXNwb25zZSIsInJlc3BvbnNlRGF0YSIsImluY2x1ZGVzIiwib3B0SW5JZCIsImZpbmRPbmUiLCJ0b2tlbiIsImNvbmZpcm1hdGlvbkhhc2giLCJyZWRpcmVjdCIsImNvbmZpcm1hdGlvblVybCIsInRlbXBsYXRlIiwiY29udGVudCIsImNvbmZpcm1hdGlvbl91cmwiLCJ0byIsInN1YmplY3QiLCJtZXNzYWdlIiwicmV0dXJuUGF0aCIsImdldE9wdEluUHJvdmlkZXIiLCJnZXRPcHRJbktleSIsInZlcmlmeVNpZ25hdHVyZSIsIkFjY291bnRzIiwiR2V0RG9pTWFpbERhdGFTY2hlbWEiLCJuYW1lX2lkIiwidXNlclByb2ZpbGVTY2hlbWEiLCJFbWFpbCIsInRlbXBsYXRlVVJMIiwiZ2V0RG9pTWFpbERhdGEiLCJwYXJ0cyIsInNwbGl0IiwibGVuZ3RoIiwicHJvdmlkZXIiLCJkb2lNYWlsRGF0YSIsImRlZmF1bHRSZXR1cm5EYXRhIiwicmV0dXJuRGF0YSIsIm93bmVyIiwidXNlcnMiLCJtYWlsVGVtcGxhdGUiLCJwcm9maWxlIiwicmVzb2x2ZVR4dCIsIkZBTExCQUNLX1BST1ZJREVSIiwiaXNSZWd0ZXN0IiwiaXNUZXN0bmV0IiwiT1BUX0lOX0tFWSIsIk9QVF9JTl9LRVlfVEVTVE5FVCIsIkdldE9wdEluS2V5U2NoZW1hIiwib3VyT1BUX0lOX0tFWSIsImZvdW5kS2V5IiwiZG5za2V5IiwidXNlRmFsbGJhY2siLCJQUk9WSURFUl9LRVkiLCJQUk9WSURFUl9LRVlfVEVTVE5FVCIsIkdldE9wdEluUHJvdmlkZXJTY2hlbWEiLCJvdXJQUk9WSURFUl9LRVkiLCJwcm92aWRlcktleSIsImdldFdpZiIsImFkZEZldGNoRG9pTWFpbERhdGFKb2IiLCJnZXRQcml2YXRlS2V5RnJvbVdpZiIsImRlY3J5cHRNZXNzYWdlIiwiQWRkRG9pY2hhaW5FbnRyeVNjaGVtYSIsImFkZERvaWNoYWluRW50cnkiLCJvdXJFbnRyeSIsImV0eSIsInBhcnNlIiwid2lmIiwibmFtZVBvcyIsImluZGV4T2YiLCJzdWJzdHJpbmciLCJleHBpcmVzSW4iLCJleHBpcmVkIiwibGlzdFNpbmNlQmxvY2siLCJuYW1lU2hvdyIsImdldFJhd1RyYW5zYWN0aW9uIiwiYWRkT3JVcGRhdGVNZXRhIiwiVFhfTkFNRV9TVEFSVCIsIkxBU1RfQ0hFQ0tFRF9CTE9DS19LRVkiLCJjaGVja05ld1RyYW5zYWN0aW9uIiwidHhpZCIsImpvYiIsImxhc3RDaGVja2VkQmxvY2siLCJyZXQiLCJ0cmFuc2FjdGlvbnMiLCJ0eHMiLCJsYXN0YmxvY2siLCJhZGRyZXNzVHhzIiwiZmlsdGVyIiwidHgiLCJzdGFydHNXaXRoIiwidHhOYW1lIiwiYWRkVHgiLCJkb25lIiwidm91dCIsInNjcmlwdFB1YktleSIsIm5hbWVPcCIsIm9wIiwiYWRkcmVzc2VzIiwiY3J5cHRvIiwiZWNpZXMiLCJEZWNyeXB0TWVzc2FnZVNjaGVtYSIsIkJ1ZmZlciIsImVjZGgiLCJjcmVhdGVFQ0RIIiwic2V0UHJpdmF0ZUtleSIsImRlY3J5cHQiLCJ0b1N0cmluZyIsIkVuY3J5cHRNZXNzYWdlU2NoZW1hIiwiZW5jcnlwdE1lc3NhZ2UiLCJlbmNyeXB0IiwiR2VuZXJhdGVOYW1lSWRTY2hlbWEiLCJnZW5lcmF0ZU5hbWVJZCIsIiRzZXQiLCJDcnlwdG9KUyIsIkJhc2U1OCIsIlZFUlNJT05fQllURSIsIlZFUlNJT05fQllURV9SRUdURVNUIiwiR2V0QWRkcmVzc1NjaGVtYSIsImdldEFkZHJlc3MiLCJfZ2V0QWRkcmVzcyIsInB1YktleSIsImxpYiIsIldvcmRBcnJheSIsImNyZWF0ZSIsIlNIQTI1NiIsIlJJUEVNRDE2MCIsInZlcnNpb25CeXRlIiwiY2hlY2tzdW0iLCJlbmNvZGUiLCJnZXRfQmFsYW5jZSIsImJhbCIsIkdldERhdGFIYXNoU2NoZW1hIiwiZ2V0RGF0YUhhc2giLCJoYXNoIiwicmFuZG9tQnl0ZXMiLCJzZWNwMjU2azEiLCJwcml2S2V5IiwicHJpdmF0ZUtleVZlcmlmeSIsInB1YmxpY0tleUNyZWF0ZSIsInRvVXBwZXJDYXNlIiwiR2V0UHJpdmF0ZUtleUZyb21XaWZTY2hlbWEiLCJfZ2V0UHJpdmF0ZUtleUZyb21XaWYiLCJkZWNvZGUiLCJlbmRzV2l0aCIsIkdldFB1YmxpY0tleVNjaGVtYSIsImdldFB1YmxpY0tleUFuZEFkZHJlc3MiLCJkZXN0QWRkcmVzcyIsImJpdGNvcmUiLCJNZXNzYWdlIiwiR2V0U2lnbmF0dXJlU2NoZW1hIiwiZ2V0U2lnbmF0dXJlIiwic2lnbiIsIlByaXZhdGVLZXkiLCJTRU5EX0NMSUVOVCIsImxvZ0Jsb2NrY2hhaW4iLCJmZWVEb2kiLCJuYW1lRG9pIiwiSW5zZXJ0U2NoZW1hIiwiZGF0YUhhc2giLCJzb2lEYXRlIiwicHVibGljS2V5QW5kQWRkcmVzcyIsIm5hbWVWYWx1ZSIsImZlZURvaVR4IiwibmFtZURvaVR4IiwiZ2V0VHJhbnNhY3Rpb24iLCJET0lfQ09ORklSTUFUSU9OX05PVElGWV9ST1VURSIsImdldEh0dHBQVVQiLCJVcGRhdGVTY2hlbWEiLCJob3N0IiwiZnJvbUhvc3RVcmwiLCJuYW1lX2RhdGEiLCJyZXJ1biIsIm91cl90cmFuc2FjdGlvbiIsImNvbmZpcm1hdGlvbnMiLCJvdXJmcm9tSG9zdFVybCIsInVwZGF0ZURhdGEiLCJjYW5jZWwiLCJyZXN0YXJ0IiwiZXJyIiwibG9nVmVyaWZ5IiwiTkVUV09SSyIsIk5ldHdvcmtzIiwiYWxpYXMiLCJwdWJrZXloYXNoIiwicHJpdmF0ZWtleSIsInNjcmlwdGhhc2giLCJuZXR3b3JrTWFnaWMiLCJWZXJpZnlTaWduYXR1cmVTY2hlbWEiLCJBZGRyZXNzIiwiZnJvbVB1YmxpY0tleSIsIlB1YmxpY0tleSIsInZlcmlmeSIsImFkZEluc2VydEJsb2NrY2hhaW5Kb2IiLCJXcml0ZVRvQmxvY2tjaGFpblNjaGVtYSIsIndyaXRlVG9CbG9ja2NoYWluIiwiSGFzaElkcyIsIkRlY29kZURvaUhhc2hTY2hlbWEiLCJkZWNvZGVEb2lIYXNoIiwib3VySGFzaCIsImhleCIsImRlY29kZUhleCIsIm9iaiIsIkdlbmVyYXRlRG9pSGFzaFNjaGVtYSIsImpzb24iLCJlbmNvZGVIZXgiLCJQTEFDRUhPTERFUl9SRUdFWCIsIlBhcnNlVGVtcGxhdGVTY2hlbWEiLCJPYmplY3QiLCJibGFja2JveCIsIl9tYXRjaCIsImV4ZWMiLCJfcmVwbGFjZVBsYWNlaG9sZGVyIiwicmVwbGFjZSIsInJlcCIsIkRPSV9NQUlMX0RFRkFVTFRfRU1BSUxfRlJPTSIsIlNlbmRNYWlsU2NoZW1hIiwic2VuZE1haWwiLCJtYWlsIiwib3VyTWFpbCIsInNlbmQiLCJodG1sIiwiaGVhZGVycyIsIkpvYiIsIkJsb2NrY2hhaW5Kb2JzIiwiYWRkQ2hlY2tOZXdUcmFuc2FjdGlvbnNCbG9ja2NoYWluSm9iIiwicmV0cnkiLCJyZXRyaWVzIiwid2FpdCIsInNhdmUiLCJjYW5jZWxSZXBlYXRzIiwiREFwcEpvYnMiLCJBZGRGZXRjaERvaU1haWxEYXRhSm9iU2NoZW1hIiwiQWRkSW5zZXJ0QmxvY2tjaGFpbkpvYlNjaGVtYSIsIk1haWxKb2JzIiwiQWRkU2VuZE1haWxKb2JTY2hlbWEiLCJBZGRVcGRhdGVCbG9ja2NoYWluSm9iU2NoZW1hIiwiYWRkVXBkYXRlQmxvY2tjaGFpbkpvYiIsIkFkZE9yVXBkYXRlTWV0YVNjaGVtYSIsIm1ldGEiLCJBZGRPcHRJblNjaGVtYSIsImZldGNoIiwiYWRkUmVjaXBpZW50IiwiYWRkU2VuZGVyIiwicmVjaXBpZW50X21haWwiLCJzZW5kZXJfbWFpbCIsIm1hc3Rlcl9kb2kiLCJyZWNpcGllbnRJZCIsInNlbmRlcklkIiwiQ29uZmlybU9wdEluU2NoZW1hIiwiY29uZmlybU9wdEluIiwicmVxdWVzdCIsIm91clJlcXVlc3QiLCJkZWNvZGVkIiwiJHVuc2V0IiwiZW50cmllcyIsIiRvciIsImRvaVNpZ25hdHVyZSIsImRvaVRpbWVzdGFtcCIsInRvSVNPU3RyaW5nIiwianNvblZhbHVlIiwiR2VuZXJhdGVEb2lUb2tlblNjaGVtYSIsIlVwZGF0ZU9wdEluU3RhdHVzU2NoZW1hIiwidXBkYXRlT3B0SW5TdGF0dXMiLCJWRVJJRllfQ0xJRU5UIiwiVmVyaWZ5T3B0SW5TY2hlbWEiLCJyZWNpcGllbnRfcHVibGljX2tleSIsInZlcmlmeU9wdEluIiwiZW50cnlEYXRhIiwiZmlyc3RDaGVjayIsInNlY29uZENoZWNrIiwiQWRkUmVjaXBpZW50U2NoZW1hIiwicmVjaXBpZW50cyIsImtleVBhaXIiLCJBZGRTZW5kZXJTY2hlbWEiLCJzZW5kZXJzIiwiaXNEZWJ1ZyIsInNldHRpbmdzIiwiYXBwIiwiZGVidWciLCJyZWd0ZXN0IiwidGVzdG5ldCIsInBvcnQiLCJhYnNvbHV0ZVVybCIsIm5hbWVjb2luIiwiU0VORF9BUFAiLCJDT05GSVJNX0FQUCIsIlZFUklGWV9BUFAiLCJpc0FwcFR5cGUiLCJzZW5kU2V0dGluZ3MiLCJzZW5kQ2xpZW50IiwiZG9pY2hhaW4iLCJjcmVhdGVDbGllbnQiLCJjb25maXJtU2V0dGluZ3MiLCJjb25maXJtIiwiY29uZmlybUNsaWVudCIsImNvbmZpcm1BZGRyZXNzIiwidmVyaWZ5U2V0dGluZ3MiLCJ2ZXJpZnlDbGllbnQiLCJDbGllbnQiLCJ1c2VyIiwidXNlcm5hbWUiLCJwYXNzIiwicGFzc3dvcmQiLCJIYXNoaWRzIiwiZG9pTWFpbEZldGNoVXJsIiwiZGVmYXVsdEZyb20iLCJzbXRwIiwic3RhcnR1cCIsInByb2Nlc3MiLCJlbnYiLCJNQUlMX1VSTCIsInNlcnZlciIsIk5PREVfVExTX1JFSkVDVF9VTkFVVEhPUklaRUQiLCJjb3VudCIsImNyZWF0ZVVzZXIiLCJhZGRVc2Vyc1RvUm9sZXMiLCJzdGFydEpvYlNlcnZlciIsImNvbnNvbGUiLCJzZW5kTW9kZVRhZ0NvbG9yIiwiY29uZmlybU1vZGVUYWdDb2xvciIsInZlcmlmeU1vZGVUYWdDb2xvciIsImJsb2NrY2hhaW5Nb2RlVGFnQ29sb3IiLCJ0ZXN0aW5nTW9kZVRhZ0NvbG9yIiwibG9nTWFpbiIsInRlc3RMb2dnaW5nIiwicmVxdWlyZSIsIm1zZyIsImNvbG9ycyIsInBhcmFtIiwidGltZSIsInRhZyIsImxvZyIsIkFVVEhfTUVUSE9EUyIsInR5cGVzIiwiY29uZmlnIiwic2VuZFZlcmlmaWNhdGlvbkVtYWlsIiwiZm9yYmlkQ2xpZW50QWNjb3VudENyZWF0aW9uIiwiZW1haWxUZW1wbGF0ZXMiLCJBcGkiLCJET0lfV0FMTEVUTk9USUZZX1JPVVRFIiwiYWRkUm91dGUiLCJhdXRoUmVxdWlyZWQiLCJnZXQiLCJhY3Rpb24iLCJ1cmxQYXJhbXMiLCJpcCIsImNvbm5lY3Rpb24iLCJyZW1vdGVBZGRyZXNzIiwic29ja2V0Iiwic3RhdHVzQ29kZSIsImJvZHkiLCJwYXJhbXMiLCJxdWVyeVBhcmFtcyIsIkRPSV9FWFBPUlRfUk9VVEUiLCJwb3N0IiwicVBhcmFtcyIsImJQYXJhbXMiLCJib2R5UGFyYW1zIiwidWlkIiwiY29uc3RydWN0b3IiLCJBcnJheSIsInByZXBhcmVDb0RPSSIsInByZXBhcmVBZGQiLCJwdXQiLCJ2YWwiLCJvd25lcklEIiwiY3VycmVudE9wdEluSWQiLCJyZXRSZXNwb25zZSIsInJldF9yZXNwb25zZSIsIm1haWxUZW1wbGF0ZVNjaGVtYSIsImNyZWF0ZVVzZXJTY2hlbWEiLCJ1cGRhdGVVc2VyU2NoZW1hIiwiY29sbGVjdGlvbk9wdGlvbnMiLCJwYXRoIiwicm91dGVPcHRpb25zIiwiZXhjbHVkZWRFbmRwb2ludHMiLCJlbmRwb2ludHMiLCJkZWxldGUiLCJyb2xlUmVxdWlyZWQiLCJwYXJhbUlkIiwiYWRkQ29sbGVjdGlvbiIsIlVTRVJTX0NPTExFQ1RJT05fUk9VVEUiLCJSZXN0aXZ1cyIsImFwaVBhdGgiLCJ2ZXJzaW9uIiwidXNlRGVmYXVsdEF1dGgiLCJwcmV0dHlKc29uIiwiSm9iQ29sbGVjdGlvbiIsInByb2Nlc3NKb2JzIiwid29ya1RpbWVvdXQiLCJjYiIsImZhaWwiLCJwYXVzZSIsInJlcGVhdCIsInNjaGVkdWxlIiwibGF0ZXIiLCJ0ZXh0IiwicSIsInBvbGxJbnRlcnZhbCIsImN1cnJlbnQiLCJzZXRNaW51dGVzIiwiZ2V0TWludXRlcyIsImlkcyIsIiRpbiIsImpvYlN0YXR1c1JlbW92YWJsZSIsInVwZGF0ZWQiLCIkbHQiLCJyZW1vdmVKb2JzIiwib2JzZXJ2ZSIsImFkZGVkIiwidHJpZ2dlciIsImRucyIsInN5bmNGdW5jIiwid3JhcEFzeW5jIiwiZG5zX3Jlc29sdmVUeHQiLCJyZWNvcmRzIiwicmVjb3JkIiwidHJpbSIsImdldEFkZHJlc3Nlc0J5QWNjb3VudCIsImdldE5ld0FkZHJlc3MiLCJOQU1FU1BBQ0UiLCJjbGllbnQiLCJkb2ljaGFpbl9kdW1wcHJpdmtleSIsIm91ckFkZHJlc3MiLCJjbWQiLCJhY2NvdXQiLCJkb2ljaGFpbl9nZXRhZGRyZXNzZXNieWFjY291bnQiLCJhY2NvdW50Iiwib3VyQWNjb3VudCIsImRvaWNoYWluX2dldG5ld2FkZHJlc3MiLCJkb2ljaGFpbl9zaWduTWVzc2FnZSIsIm91ck1lc3NhZ2UiLCJkb2ljaGFpbl9uYW1lU2hvdyIsIm91cklkIiwiY2hlY2tJZCIsImRvaWNoYWluX2ZlZURvaSIsImRvaWNoYWluX25hbWVEb2kiLCJvdXJOYW1lIiwib3VyVmFsdWUiLCJibG9jayIsImRvaWNoYWluX2xpc3RTaW5jZUJsb2NrIiwib3VyQmxvY2siLCJkb2ljaGFpbl9nZXR0cmFuc2FjdGlvbiIsImRvaWNoYWluX2dldHJhd3RyYW5zYWN0aW9uIiwiZG9pY2hhaW5fZ2V0YmFsYW5jZSIsIkRPSV9QUkVGSVgiLCJyZXRfdmFsIiwiZ2V0SHR0cEdFVGRhdGEiLCJnZXRIdHRwUE9TVCIsIkhUVFAiLCJfZ2V0IiwiX2dldERhdGEiLCJfcG9zdCIsIl9wdXQiLCJv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LENBQUNFLFVBQVIsS0FBdUIsQ0FBMUM7QUFFQSxRQUFNQyxHQUFHLEdBQUd6SyxRQUFRLENBQUNqWSxJQUFULENBQWM7QUFDbEJzSCxVQUFNLEVBQUU7QUFBQ3FiLFNBQUcsRUFBRXJMLEdBQUcsQ0FBQ3NMO0FBQVYsS0FEVTtBQUVsQkMsV0FBTyxFQUFFO0FBQUNDLFNBQUcsRUFBRVA7QUFBTjtBQUZTLEdBQWQsRUFHUjtBQUFDcmlCLFVBQU0sRUFBRTtBQUFFOEMsU0FBRyxFQUFFO0FBQVA7QUFBVCxHQUhRLENBQVo7QUFLQTJhLFNBQU8sQ0FBQyxtQ0FBRCxFQUFxQytFLEdBQXJDLENBQVA7QUFDQXpLLFVBQVEsQ0FBQzhLLFVBQVQsQ0FBb0JMLEdBQXBCOztBQUNBLE1BQUdBLEdBQUcsQ0FBQ2xYLE1BQUosR0FBYSxDQUFoQixFQUFrQjtBQUNkZ0QsT0FBRyxDQUFDWSxJQUFKLENBQVMsZ0NBQVQ7QUFDSDs7QUFDRDBTLElBQUU7QUFDTCxDQWZPLENBQVI7QUFpQkE3SixRQUFRLENBQUNqWSxJQUFULENBQWM7QUFBRWlELE1BQUksRUFBRSxTQUFSO0FBQW1CcUUsUUFBTSxFQUFFO0FBQTNCLENBQWQsRUFDSzBiLE9BREwsQ0FDYTtBQUNMQyxPQUFLLEVBQUUsWUFBWTtBQUFFWixLQUFDLENBQUNhLE9BQUY7QUFBYztBQUQ5QixDQURiLEU7Ozs7Ozs7Ozs7O0FDNUNBNWpCLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLHlCQUFaO0FBQXVDRCxNQUFNLENBQUNDLElBQVAsQ0FBWSxnQkFBWixFIiwiZmlsZSI6Ii9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJvbGVzIH0gZnJvbSAnbWV0ZW9yL2FsYW5uaW5nOnJvbGVzJztcblxuaW1wb3J0IHsgT3B0SW5zIH0gZnJvbSAnLi4vb3B0LWlucy5qcyc7XG5cbk1ldGVvci5wdWJsaXNoKCdvcHQtaW5zLmFsbCcsIGZ1bmN0aW9uIE9wdEluc0FsbCgpIHtcbiAgaWYoIXRoaXMudXNlcklkKSB7XG4gICAgcmV0dXJuIHRoaXMucmVhZHkoKTtcbiAgfVxuICBpZighUm9sZXMudXNlcklzSW5Sb2xlKHRoaXMudXNlcklkLCBbJ2FkbWluJ10pKXtcbiAgICByZXR1cm4gT3B0SW5zLmZpbmQoe293bmVySWQ6dGhpcy51c2VySWR9LCB7XG4gICAgICBmaWVsZHM6IE9wdElucy5wdWJsaWNGaWVsZHMsXG4gICAgfSk7XG4gIH1cbiAgXG5cbiAgcmV0dXJuIE9wdElucy5maW5kKHt9LCB7XG4gICAgZmllbGRzOiBPcHRJbnMucHVibGljRmllbGRzLFxuICB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBERFBSYXRlTGltaXRlciB9IGZyb20gJ21ldGVvci9kZHAtcmF0ZS1saW1pdGVyJztcbmltcG9ydCB7IF9pMThuIGFzIGkxOG4gfSBmcm9tICdtZXRlb3IvdW5pdmVyc2U6aTE4bic7XG5pbXBvcnQgeyBWYWxpZGF0ZWRNZXRob2QgfSBmcm9tICdtZXRlb3IvbWRnOnZhbGlkYXRlZC1tZXRob2QnO1xuaW1wb3J0IHsgUm9sZXMgfSBmcm9tICdtZXRlb3IvYWxhbm5pbmc6cm9sZXMnO1xuaW1wb3J0IHsgXyB9IGZyb20gJ21ldGVvci91bmRlcnNjb3JlJztcbmltcG9ydCBhZGRPcHRJbiBmcm9tICcuLi8uLi9tb2R1bGVzL3NlcnZlci9vcHQtaW5zL2FkZF9hbmRfd3JpdGVfdG9fYmxvY2tjaGFpbi5qcyc7XG5cbmNvbnN0IGFkZCA9IG5ldyBWYWxpZGF0ZWRNZXRob2Qoe1xuICBuYW1lOiAnb3B0LWlucy5hZGQnLFxuICB2YWxpZGF0ZTogbnVsbCxcbiAgcnVuKHsgcmVjaXBpZW50TWFpbCwgc2VuZGVyTWFpbCwgZGF0YSB9KSB7XG4gICAgaWYoIXRoaXMudXNlcklkIHx8ICFSb2xlcy51c2VySXNJblJvbGUodGhpcy51c2VySWQsIFsnYWRtaW4nXSkpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gXCJhcGkub3B0LWlucy5hZGQuYWNjZXNzRGVuaWVkXCI7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKGVycm9yLCBpMThuLl9fKGVycm9yKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0SW4gPSB7XG4gICAgICBcInJlY2lwaWVudF9tYWlsXCI6IHJlY2lwaWVudE1haWwsXG4gICAgICBcInNlbmRlcl9tYWlsXCI6IHNlbmRlck1haWwsXG4gICAgICBkYXRhXG4gICAgfVxuXG4gICAgYWRkT3B0SW4ob3B0SW4pXG4gIH0sXG59KTtcblxuLy8gR2V0IGxpc3Qgb2YgYWxsIG1ldGhvZCBuYW1lcyBvbiBvcHQtaW5zXG5jb25zdCBPUFRJT05TX01FVEhPRFMgPSBfLnBsdWNrKFtcbiAgYWRkXG5dLCAnbmFtZScpO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIC8vIE9ubHkgYWxsb3cgNSBvcHQtaW4gb3BlcmF0aW9ucyBwZXIgY29ubmVjdGlvbiBwZXIgc2Vjb25kXG4gIEREUFJhdGVMaW1pdGVyLmFkZFJ1bGUoe1xuICAgIG5hbWUobmFtZSkge1xuICAgICAgcmV0dXJuIF8uY29udGFpbnMoT1BUSU9OU19NRVRIT0RTLCBuYW1lKTtcbiAgICB9LFxuXG4gICAgLy8gUmF0ZSBsaW1pdCBwZXIgY29ubmVjdGlvbiBJRFxuICAgIGNvbm5lY3Rpb25JZCgpIHsgcmV0dXJuIHRydWU7IH0sXG4gIH0sIDUsIDEwMDApO1xufVxuIiwiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuXG5jbGFzcyBPcHRJbnNDb2xsZWN0aW9uIGV4dGVuZHMgTW9uZ28uQ29sbGVjdGlvbiB7XG4gIGluc2VydChvcHRJbiwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBvdXJPcHRJbiA9IG9wdEluO1xuICAgIG91ck9wdEluLnJlY2lwaWVudF9zZW5kZXIgPSBvdXJPcHRJbi5yZWNpcGllbnQrb3VyT3B0SW4uc2VuZGVyO1xuICAgIG91ck9wdEluLmNyZWF0ZWRBdCA9IG91ck9wdEluLmNyZWF0ZWRBdCB8fCBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHN1cGVyLmluc2VydChvdXJPcHRJbiwgY2FsbGJhY2spO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdXBkYXRlKHNlbGVjdG9yLCBtb2RpZmllcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHN1cGVyLnVwZGF0ZShzZWxlY3RvciwgbW9kaWZpZXIpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcmVtb3ZlKHNlbGVjdG9yKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gc3VwZXIucmVtb3ZlKHNlbGVjdG9yKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBPcHRJbnMgPSBuZXcgT3B0SW5zQ29sbGVjdGlvbignb3B0LWlucycpO1xuXG4vLyBEZW55IGFsbCBjbGllbnQtc2lkZSB1cGRhdGVzIHNpbmNlIHdlIHdpbGwgYmUgdXNpbmcgbWV0aG9kcyB0byBtYW5hZ2UgdGhpcyBjb2xsZWN0aW9uXG5PcHRJbnMuZGVueSh7XG4gIGluc2VydCgpIHsgcmV0dXJuIHRydWU7IH0sXG4gIHVwZGF0ZSgpIHsgcmV0dXJuIHRydWU7IH0sXG4gIHJlbW92ZSgpIHsgcmV0dXJuIHRydWU7IH0sXG59KTtcblxuT3B0SW5zLnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBfaWQ6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5JZCxcbiAgfSxcbiAgcmVjaXBpZW50OiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgIGRlbnlVcGRhdGU6IHRydWUsXG4gIH0sXG4gIHNlbmRlcjoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICBkZW55VXBkYXRlOiB0cnVlLFxuICB9LFxuICBkYXRhOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgIGRlbnlVcGRhdGU6IGZhbHNlLFxuICB9LFxuICBpbmRleDoge1xuICAgIHR5cGU6IFNpbXBsZVNjaGVtYS5JbnRlZ2VyLFxuICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgIGRlbnlVcGRhdGU6IGZhbHNlLFxuICB9LFxuICBuYW1lSWQ6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgb3B0aW9uYWw6IHRydWUsXG4gICAgZGVueVVwZGF0ZTogZmFsc2UsXG4gIH0sXG4gIHR4SWQ6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgZGVueVVwZGF0ZTogZmFsc2UsXG4gIH0sXG4gIG1hc3RlckRvaToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICBkZW55VXBkYXRlOiBmYWxzZSxcbiAgfSxcbiAgY3JlYXRlZEF0OiB7XG4gICAgdHlwZTogRGF0ZSxcbiAgICBkZW55VXBkYXRlOiB0cnVlLFxuICB9LFxuICBjb25maXJtZWRBdDoge1xuICAgIHR5cGU6IERhdGUsXG4gICAgb3B0aW9uYWw6IHRydWUsXG4gICAgZGVueVVwZGF0ZTogZmFsc2UsXG4gIH0sXG4gIGNvbmZpcm1lZEJ5OiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBTaW1wbGVTY2hlbWEuUmVnRXguSVAsXG4gICAgb3B0aW9uYWw6IHRydWUsXG4gICAgZGVueVVwZGF0ZTogZmFsc2VcbiAgfSxcbiAgY29uZmlybWF0aW9uVG9rZW46IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgb3B0aW9uYWw6IHRydWUsXG4gICAgZGVueVVwZGF0ZTogZmFsc2VcbiAgfSxcbiAgb3duZXJJZDp7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgIHJlZ0V4OiBTaW1wbGVTY2hlbWEuUmVnRXguSWRcbiAgfSxcbiAgZXJyb3I6e1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICBkZW55VXBkYXRlOiBmYWxzZVxuICB9XG59KTtcblxuT3B0SW5zLmF0dGFjaFNjaGVtYShPcHRJbnMuc2NoZW1hKTtcblxuLy8gVGhpcyByZXByZXNlbnRzIHRoZSBrZXlzIGZyb20gT3B0LUluIG9iamVjdHMgdGhhdCBzaG91bGQgYmUgcHVibGlzaGVkXG4vLyB0byB0aGUgY2xpZW50LiBJZiB3ZSBhZGQgc2VjcmV0IHByb3BlcnRpZXMgdG8gT3B0LUluIG9iamVjdHMsIGRvbid0IGxpc3Rcbi8vIHRoZW0gaGVyZSB0byBrZWVwIHRoZW0gcHJpdmF0ZSB0byB0aGUgc2VydmVyLlxuT3B0SW5zLnB1YmxpY0ZpZWxkcyA9IHtcbiAgX2lkOiAxLFxuICByZWNpcGllbnQ6IDEsXG4gIHNlbmRlcjogMSxcbiAgZGF0YTogMSxcbiAgaW5kZXg6IDEsXG4gIG5hbWVJZDogMSxcbiAgdHhJZDogMSxcbiAgbWFzdGVyRG9pOiAxLFxuICBjcmVhdGVkQXQ6IDEsXG4gIGNvbmZpcm1lZEF0OiAxLFxuICBjb25maXJtZWRCeTogMSxcbiAgb3duZXJJZDogMSxcbiAgZXJyb3I6IDFcbn07XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJvbGVzIH0gZnJvbSAnbWV0ZW9yL2FsYW5uaW5nOnJvbGVzJztcblxuaW1wb3J0IHsgUmVjaXBpZW50cyB9IGZyb20gJy4uL3JlY2lwaWVudHMuanMnO1xuaW1wb3J0IHsgT3B0SW5zfSBmcm9tICcuLi8uLi9vcHQtaW5zL29wdC1pbnMuanMnXG5NZXRlb3IucHVibGlzaCgncmVjaXBpZW50cy5ieU93bmVyJyxmdW5jdGlvbiByZWNpcGllbnRHZXQoKXtcbiAgbGV0IHBpcGVsaW5lPVtdO1xuICBpZighUm9sZXMudXNlcklzSW5Sb2xlKHRoaXMudXNlcklkLCBbJ2FkbWluJ10pKXtcbiAgICBwaXBlbGluZS5wdXNoKFxuICAgICAgeyRyZWRhY3Q6e1xuICAgICAgJGNvbmQ6IHtcbiAgICAgICAgaWY6IHsgJGNtcDogWyBcIiRvd25lcklkXCIsIHRoaXMudXNlcklkIF0gfSxcbiAgICAgICAgdGhlbjogXCIkJFBSVU5FXCIsXG4gICAgICAgIGVsc2U6IFwiJCRLRUVQXCIgfX19KTtcbiAgICAgIH1cbiAgICAgIHBpcGVsaW5lLnB1c2goeyAkbG9va3VwOiB7IGZyb206IFwicmVjaXBpZW50c1wiLCBsb2NhbEZpZWxkOiBcInJlY2lwaWVudFwiLCBmb3JlaWduRmllbGQ6IFwiX2lkXCIsIGFzOiBcIlJlY2lwaWVudEVtYWlsXCIgfSB9KTtcbiAgICAgIHBpcGVsaW5lLnB1c2goeyAkdW53aW5kOiBcIiRSZWNpcGllbnRFbWFpbFwifSk7XG4gICAgICBwaXBlbGluZS5wdXNoKHsgJHByb2plY3Q6IHtcIlJlY2lwaWVudEVtYWlsLl9pZFwiOjF9fSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IE9wdElucy5hZ2dyZWdhdGUocGlwZWxpbmUpO1xuICAgICAgbGV0IHJJZHM9W107XG4gICAgICByZXN1bHQuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgcklkcy5wdXNoKGVsZW1lbnQuUmVjaXBpZW50RW1haWwuX2lkKTtcbiAgICAgIH0pO1xuICByZXR1cm4gUmVjaXBpZW50cy5maW5kKHtcIl9pZFwiOntcIiRpblwiOnJJZHN9fSx7ZmllbGRzOlJlY2lwaWVudHMucHVibGljRmllbGRzfSk7XG59KTtcbk1ldGVvci5wdWJsaXNoKCdyZWNpcGllbnRzLmFsbCcsIGZ1bmN0aW9uIHJlY2lwaWVudHNBbGwoKSB7XG4gIGlmKCF0aGlzLnVzZXJJZCB8fCAhUm9sZXMudXNlcklzSW5Sb2xlKHRoaXMudXNlcklkLCBbJ2FkbWluJ10pKSB7XG4gICAgcmV0dXJuIHRoaXMucmVhZHkoKTtcbiAgfVxuXG4gIHJldHVybiBSZWNpcGllbnRzLmZpbmQoe30sIHtcbiAgICBmaWVsZHM6IFJlY2lwaWVudHMucHVibGljRmllbGRzLFxuICB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuXG5jbGFzcyBSZWNpcGllbnRzQ29sbGVjdGlvbiBleHRlbmRzIE1vbmdvLkNvbGxlY3Rpb24ge1xuICBpbnNlcnQocmVjaXBpZW50LCBjYWxsYmFjaykge1xuICAgIGNvbnN0IG91clJlY2lwaWVudCA9IHJlY2lwaWVudDtcbiAgICBvdXJSZWNpcGllbnQuY3JlYXRlZEF0ID0gb3VyUmVjaXBpZW50LmNyZWF0ZWRBdCB8fCBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHN1cGVyLmluc2VydChvdXJSZWNpcGllbnQsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHVwZGF0ZShzZWxlY3RvciwgbW9kaWZpZXIpIHtcbiAgICBjb25zdCByZXN1bHQgPSBzdXBlci51cGRhdGUoc2VsZWN0b3IsIG1vZGlmaWVyKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHJlbW92ZShzZWxlY3Rvcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHN1cGVyLnJlbW92ZShzZWxlY3Rvcik7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgUmVjaXBpZW50cyA9IG5ldyBSZWNpcGllbnRzQ29sbGVjdGlvbigncmVjaXBpZW50cycpO1xuXG4vLyBEZW55IGFsbCBjbGllbnQtc2lkZSB1cGRhdGVzIHNpbmNlIHdlIHdpbGwgYmUgdXNpbmcgbWV0aG9kcyB0byBtYW5hZ2UgdGhpcyBjb2xsZWN0aW9uXG5SZWNpcGllbnRzLmRlbnkoe1xuICBpbnNlcnQoKSB7IHJldHVybiB0cnVlOyB9LFxuICB1cGRhdGUoKSB7IHJldHVybiB0cnVlOyB9LFxuICByZW1vdmUoKSB7IHJldHVybiB0cnVlOyB9LFxufSk7XG5cblJlY2lwaWVudHMuc2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gIF9pZDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICByZWdFeDogU2ltcGxlU2NoZW1hLlJlZ0V4LklkLFxuICB9LFxuICBlbWFpbDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBpbmRleDogdHJ1ZSxcbiAgICBkZW55VXBkYXRlOiB0cnVlLFxuICB9LFxuICBwcml2YXRlS2V5OiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHVuaXF1ZTogdHJ1ZSxcbiAgICBkZW55VXBkYXRlOiB0cnVlLFxuICB9LFxuICBwdWJsaWNLZXk6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgdW5pcXVlOiB0cnVlLFxuICAgIGRlbnlVcGRhdGU6IHRydWUsXG4gIH0sXG4gIGNyZWF0ZWRBdDoge1xuICAgIHR5cGU6IERhdGUsXG4gICAgZGVueVVwZGF0ZTogdHJ1ZSxcbiAgfVxufSk7XG5cblJlY2lwaWVudHMuYXR0YWNoU2NoZW1hKFJlY2lwaWVudHMuc2NoZW1hKTtcblxuLy8gVGhpcyByZXByZXNlbnRzIHRoZSBrZXlzIGZyb20gUmVjaXBpZW50IG9iamVjdHMgdGhhdCBzaG91bGQgYmUgcHVibGlzaGVkXG4vLyB0byB0aGUgY2xpZW50LiBJZiB3ZSBhZGQgc2VjcmV0IHByb3BlcnRpZXMgdG8gUmVjaXBpZW50IG9iamVjdHMsIGRvbid0IGxpc3Rcbi8vIHRoZW0gaGVyZSB0byBrZWVwIHRoZW0gcHJpdmF0ZSB0byB0aGUgc2VydmVyLlxuUmVjaXBpZW50cy5wdWJsaWNGaWVsZHMgPSB7XG4gIF9pZDogMSxcbiAgZW1haWw6IDEsXG4gIHB1YmxpY0tleTogMSxcbiAgY3JlYXRlZEF0OiAxXG59O1xuIiwiaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuXG5jbGFzcyBEb2ljaGFpbkVudHJpZXNDb2xsZWN0aW9uIGV4dGVuZHMgTW9uZ28uQ29sbGVjdGlvbiB7XG4gIGluc2VydChlbnRyeSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCByZXN1bHQgPSBzdXBlci5pbnNlcnQoZW50cnksIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHVwZGF0ZShzZWxlY3RvciwgbW9kaWZpZXIpIHtcbiAgICBjb25zdCByZXN1bHQgPSBzdXBlci51cGRhdGUoc2VsZWN0b3IsIG1vZGlmaWVyKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHJlbW92ZShzZWxlY3Rvcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHN1cGVyLnJlbW92ZShzZWxlY3Rvcik7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRG9pY2hhaW5FbnRyaWVzID0gbmV3IERvaWNoYWluRW50cmllc0NvbGxlY3Rpb24oJ2RvaWNoYWluLWVudHJpZXMnKTtcblxuLy8gRGVueSBhbGwgY2xpZW50LXNpZGUgdXBkYXRlcyBzaW5jZSB3ZSB3aWxsIGJlIHVzaW5nIG1ldGhvZHMgdG8gbWFuYWdlIHRoaXMgY29sbGVjdGlvblxuRG9pY2hhaW5FbnRyaWVzLmRlbnkoe1xuICBpbnNlcnQoKSB7IHJldHVybiB0cnVlOyB9LFxuICB1cGRhdGUoKSB7IHJldHVybiB0cnVlOyB9LFxuICByZW1vdmUoKSB7IHJldHVybiB0cnVlOyB9LFxufSk7XG5cbkRvaWNoYWluRW50cmllcy5zY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgX2lkOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBTaW1wbGVTY2hlbWEuUmVnRXguSWQsXG4gIH0sXG4gIG5hbWU6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgaW5kZXg6IHRydWUsXG4gICAgZGVueVVwZGF0ZTogdHJ1ZVxuICB9LFxuICB2YWx1ZToge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZW55VXBkYXRlOiBmYWxzZVxuICB9LFxuICBhZGRyZXNzOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGRlbnlVcGRhdGU6IGZhbHNlXG4gIH0sXG4gIG1hc3RlckRvaToge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICBpbmRleDogdHJ1ZSxcbiAgICAgICAgZGVueVVwZGF0ZTogdHJ1ZVxuICB9LFxuICBpbmRleDoge1xuICAgICAgICB0eXBlOiBTaW1wbGVTY2hlbWEuSW50ZWdlcixcbiAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgIGRlbnlVcGRhdGU6IHRydWVcbiAgfSxcbiAgdHhJZDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZW55VXBkYXRlOiBmYWxzZVxuICB9XG59KTtcblxuRG9pY2hhaW5FbnRyaWVzLmF0dGFjaFNjaGVtYShEb2ljaGFpbkVudHJpZXMuc2NoZW1hKTtcblxuLy8gVGhpcyByZXByZXNlbnRzIHRoZSBrZXlzIGZyb20gRW50cnkgb2JqZWN0cyB0aGF0IHNob3VsZCBiZSBwdWJsaXNoZWRcbi8vIHRvIHRoZSBjbGllbnQuIElmIHdlIGFkZCBzZWNyZXQgcHJvcGVydGllcyB0byBFbnRyeSBvYmplY3RzLCBkb24ndCBsaXN0XG4vLyB0aGVtIGhlcmUgdG8ga2VlcCB0aGVtIHByaXZhdGUgdG8gdGhlIHNlcnZlci5cbkRvaWNoYWluRW50cmllcy5wdWJsaWNGaWVsZHMgPSB7XG4gIF9pZDogMSxcbiAgbmFtZTogMSxcbiAgdmFsdWU6IDEsXG4gIGFkZHJlc3M6IDEsXG4gIG1hc3RlckRvaTogMSxcbiAgaW5kZXg6IDEsXG4gIHR4SWQ6IDFcbn07XG4iLCJpbXBvcnQgeyBWYWxpZGF0ZWRNZXRob2QgfSBmcm9tICdtZXRlb3IvbWRnOnZhbGlkYXRlZC1tZXRob2QnO1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBERFBSYXRlTGltaXRlciB9IGZyb20gJ21ldGVvci9kZHAtcmF0ZS1saW1pdGVyJztcbmltcG9ydCBnZXRLZXlQYWlyTSBmcm9tICcuLi8uLi9tb2R1bGVzL3NlcnZlci9kb2ljaGFpbi9nZXRfa2V5LXBhaXIuanMnO1xuaW1wb3J0IGdldEJhbGFuY2VNIGZyb20gJy4uLy4uL21vZHVsZXMvc2VydmVyL2RvaWNoYWluL2dldF9iYWxhbmNlLmpzJztcblxuXG5jb25zdCBnZXRLZXlQYWlyID0gbmV3IFZhbGlkYXRlZE1ldGhvZCh7XG4gIG5hbWU6ICdkb2ljaGFpbi5nZXRLZXlQYWlyJyxcbiAgdmFsaWRhdGU6IG51bGwsXG4gIHJ1bigpIHtcbiAgICByZXR1cm4gZ2V0S2V5UGFpck0oKTtcbiAgfSxcbn0pO1xuXG5jb25zdCBnZXRCYWxhbmNlID0gbmV3IFZhbGlkYXRlZE1ldGhvZCh7XG4gIG5hbWU6ICdkb2ljaGFpbi5nZXRCYWxhbmNlJyxcbiAgdmFsaWRhdGU6IG51bGwsXG4gIHJ1bigpIHtcbiAgICBjb25zdCBsb2dWYWwgPSBnZXRCYWxhbmNlTSgpO1xuICAgIHJldHVybiBsb2dWYWw7XG4gIH0sXG59KTtcblxuXG4vLyBHZXQgbGlzdCBvZiBhbGwgbWV0aG9kIG5hbWVzIG9uIGRvaWNoYWluXG5jb25zdCBPUFRJTlNfTUVUSE9EUyA9IF8ucGx1Y2soW1xuICBnZXRLZXlQYWlyXG4sZ2V0QmFsYW5jZV0sICduYW1lJyk7XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgLy8gT25seSBhbGxvdyA1IG9wdC1pbiBvcGVyYXRpb25zIHBlciBjb25uZWN0aW9uIHBlciBzZWNvbmRcbiAgRERQUmF0ZUxpbWl0ZXIuYWRkUnVsZSh7XG4gICAgbmFtZShuYW1lKSB7XG4gICAgICByZXR1cm4gXy5jb250YWlucyhPUFRJTlNfTUVUSE9EUywgbmFtZSk7XG4gICAgfSxcblxuICAgIC8vIFJhdGUgbGltaXQgcGVyIGNvbm5lY3Rpb24gSURcbiAgICBjb25uZWN0aW9uSWQoKSB7IHJldHVybiB0cnVlOyB9LFxuICB9LCA1LCAxMDAwKTtcbn1cbiIsImltcG9ydCB7IE1ldGVvcn0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBERFBSYXRlTGltaXRlciB9IGZyb20gJ21ldGVvci9kZHAtcmF0ZS1saW1pdGVyJztcbmltcG9ydCB7IFZhbGlkYXRlZE1ldGhvZCB9IGZyb20gJ21ldGVvci9tZGc6dmFsaWRhdGVkLW1ldGhvZCc7XG5pbXBvcnQgZ2V0TGFuZ3VhZ2VzIGZyb20gJy4uLy4uL21vZHVsZXMvc2VydmVyL2xhbmd1YWdlcy9nZXQuanMnO1xuXG5jb25zdCBnZXRBbGxMYW5ndWFnZXMgPSBuZXcgVmFsaWRhdGVkTWV0aG9kKHtcbiAgbmFtZTogJ2xhbmd1YWdlcy5nZXRBbGwnLFxuICB2YWxpZGF0ZTogbnVsbCxcbiAgcnVuKCkge1xuICAgIHJldHVybiBnZXRMYW5ndWFnZXMoKTtcbiAgfSxcbn0pO1xuXG4vLyBHZXQgbGlzdCBvZiBhbGwgbWV0aG9kIG5hbWVzIG9uIGxhbmd1YWdlc1xuY29uc3QgT1BUSU5TX01FVEhPRFMgPSBfLnBsdWNrKFtcbiAgZ2V0QWxsTGFuZ3VhZ2VzXG5dLCAnbmFtZScpO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIC8vIE9ubHkgYWxsb3cgNSBvcHQtaW4gb3BlcmF0aW9ucyBwZXIgY29ubmVjdGlvbiBwZXIgc2Vjb25kXG4gIEREUFJhdGVMaW1pdGVyLmFkZFJ1bGUoe1xuICAgIG5hbWUobmFtZSkge1xuICAgICAgcmV0dXJuIF8uY29udGFpbnMoT1BUSU5TX01FVEhPRFMsIG5hbWUpO1xuICAgIH0sXG5cbiAgICAvLyBSYXRlIGxpbWl0IHBlciBjb25uZWN0aW9uIElEXG4gICAgY29ubmVjdGlvbklkKCkgeyByZXR1cm4gdHJ1ZTsgfSxcbiAgfSwgNSwgMTAwMCk7XG59XG4iLCJpbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5cbmNsYXNzIE1ldGFDb2xsZWN0aW9uIGV4dGVuZHMgTW9uZ28uQ29sbGVjdGlvbiB7XG4gIGluc2VydChkYXRhLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgIGNvbnN0IHJlc3VsdCA9IHN1cGVyLmluc2VydChvdXJEYXRhLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICB1cGRhdGUoc2VsZWN0b3IsIG1vZGlmaWVyKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gc3VwZXIudXBkYXRlKHNlbGVjdG9yLCBtb2RpZmllcik7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICByZW1vdmUoc2VsZWN0b3IpIHtcbiAgICBjb25zdCByZXN1bHQgPSBzdXBlci5yZW1vdmUoc2VsZWN0b3IpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IE1ldGEgPSBuZXcgTWV0YUNvbGxlY3Rpb24oJ21ldGEnKTtcblxuLy8gRGVueSBhbGwgY2xpZW50LXNpZGUgdXBkYXRlcyBzaW5jZSB3ZSB3aWxsIGJlIHVzaW5nIG1ldGhvZHMgdG8gbWFuYWdlIHRoaXMgY29sbGVjdGlvblxuTWV0YS5kZW55KHtcbiAgaW5zZXJ0KCkgeyByZXR1cm4gdHJ1ZTsgfSxcbiAgdXBkYXRlKCkgeyByZXR1cm4gdHJ1ZTsgfSxcbiAgcmVtb3ZlKCkgeyByZXR1cm4gdHJ1ZTsgfSxcbn0pO1xuXG5NZXRhLnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBfaWQ6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5JZCxcbiAgfSxcbiAga2V5OiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGluZGV4OiB0cnVlLFxuICAgIGRlbnlVcGRhdGU6IHRydWVcbiAgfSxcbiAgdmFsdWU6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfVxufSk7XG5cbk1ldGEuYXR0YWNoU2NoZW1hKE1ldGEuc2NoZW1hKTtcblxuLy8gVGhpcyByZXByZXNlbnRzIHRoZSBrZXlzIGZyb20gTWV0YSBvYmplY3RzIHRoYXQgc2hvdWxkIGJlIHB1Ymxpc2hlZFxuLy8gdG8gdGhlIGNsaWVudC4gSWYgd2UgYWRkIHNlY3JldCBwcm9wZXJ0aWVzIHRvIE1ldGEgb2JqZWN0cywgZG9uJ3QgbGlzdFxuLy8gdGhlbSBoZXJlIHRvIGtlZXAgdGhlbSBwcml2YXRlIHRvIHRoZSBzZXJ2ZXIuXG5NZXRhLnB1YmxpY0ZpZWxkcyA9IHtcbn07XG4iLCJpbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5cbmNsYXNzIFNlbmRlcnNDb2xsZWN0aW9uIGV4dGVuZHMgTW9uZ28uQ29sbGVjdGlvbiB7XG4gIGluc2VydChzZW5kZXIsIGNhbGxiYWNrKSB7XG4gICAgY29uc3Qgb3VyU2VuZGVyID0gc2VuZGVyO1xuICAgIG91clNlbmRlci5jcmVhdGVkQXQgPSBvdXJTZW5kZXIuY3JlYXRlZEF0IHx8IG5ldyBEYXRlKCk7XG4gICAgY29uc3QgcmVzdWx0ID0gc3VwZXIuaW5zZXJ0KG91clNlbmRlciwgY2FsbGJhY2spO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdXBkYXRlKHNlbGVjdG9yLCBtb2RpZmllcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHN1cGVyLnVwZGF0ZShzZWxlY3RvciwgbW9kaWZpZXIpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcmVtb3ZlKHNlbGVjdG9yKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gc3VwZXIucmVtb3ZlKHNlbGVjdG9yKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBTZW5kZXJzID0gbmV3IFNlbmRlcnNDb2xsZWN0aW9uKCdzZW5kZXJzJyk7XG5cbi8vIERlbnkgYWxsIGNsaWVudC1zaWRlIHVwZGF0ZXMgc2luY2Ugd2Ugd2lsbCBiZSB1c2luZyBtZXRob2RzIHRvIG1hbmFnZSB0aGlzIGNvbGxlY3Rpb25cblNlbmRlcnMuZGVueSh7XG4gIGluc2VydCgpIHsgcmV0dXJuIHRydWU7IH0sXG4gIHVwZGF0ZSgpIHsgcmV0dXJuIHRydWU7IH0sXG4gIHJlbW92ZSgpIHsgcmV0dXJuIHRydWU7IH0sXG59KTtcblxuU2VuZGVycy5zY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgX2lkOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBTaW1wbGVTY2hlbWEuUmVnRXguSWQsXG4gIH0sXG4gIGVtYWlsOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGluZGV4OiB0cnVlLFxuICAgIGRlbnlVcGRhdGU6IHRydWUsXG4gIH0sXG4gIGNyZWF0ZWRBdDoge1xuICAgIHR5cGU6IERhdGUsXG4gICAgZGVueVVwZGF0ZTogdHJ1ZSxcbiAgfVxufSk7XG5cblNlbmRlcnMuYXR0YWNoU2NoZW1hKFNlbmRlcnMuc2NoZW1hKTtcblxuLy8gVGhpcyByZXByZXNlbnRzIHRoZSBrZXlzIGZyb20gU2VuZGVyIG9iamVjdHMgdGhhdCBzaG91bGQgYmUgcHVibGlzaGVkXG4vLyB0byB0aGUgY2xpZW50LiBJZiB3ZSBhZGQgc2VjcmV0IHByb3BlcnRpZXMgdG8gU2VuZGVyIG9iamVjdHMsIGRvbid0IGxpc3Rcbi8vIHRoZW0gaGVyZSB0byBrZWVwIHRoZW0gcHJpdmF0ZSB0byB0aGUgc2VydmVyLlxuU2VuZGVycy5wdWJsaWNGaWVsZHMgPSB7XG4gIGVtYWlsOiAxLFxuICBjcmVhdGVkQXQ6IDFcbn07XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCB7IERPSV9NQUlMX0ZFVENIX1VSTCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2VtYWlsLWNvbmZpZ3VyYXRpb24uanMnO1xuaW1wb3J0IHtsb2dTZW5kfSBmcm9tIFwiLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvbG9nLWNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7T3B0SW5zfSBmcm9tIFwiLi4vLi4vLi4vYXBpL29wdC1pbnMvb3B0LWluc1wiO1xuXG5jb25zdCBFeHBvcnREb2lzRGF0YVNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBzdGF0dXM6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgb3B0aW9uYWw6IHRydWUsXG4gIH0sXG4gIHJvbGU6e1xuICAgIHR5cGU6U3RyaW5nXG4gIH0sXG4gIHVzZXJpZDp7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBTaW1wbGVTY2hlbWEuUmVnRXguaWQsXG4gICAgb3B0aW9uYWw6dHJ1ZSBcbiAgfVxufSk7XG5cbi8vVE9ETyBhZGQgc2VuZGVyIGFuZCByZWNpcGllbnQgZW1haWwgYWRkcmVzcyB0byBleHBvcnRcblxuY29uc3QgZXhwb3J0RG9pcyA9IChkYXRhKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyRGF0YSA9IGRhdGE7XG4gICAgRXhwb3J0RG9pc0RhdGFTY2hlbWEudmFsaWRhdGUob3VyRGF0YSk7XG4gICAgbGV0IHBpcGVsaW5lPVt7ICRtYXRjaDoge1wiY29uZmlybWVkQXRcIjp7ICRleGlzdHM6IHRydWUsICRuZTogbnVsbCB9fSB9XTtcbiAgICBcbiAgICBpZihvdXJEYXRhLnJvbGUhPSdhZG1pbid8fG91ckRhdGEudXNlcmlkIT11bmRlZmluZWQpe1xuICAgICAgcGlwZWxpbmUucHVzaCh7ICRyZWRhY3Q6e1xuICAgICAgICAkY29uZDoge1xuICAgICAgICAgIGlmOiB7ICRjbXA6IFsgXCIkb3duZXJJZFwiLCBvdXJEYXRhLnVzZXJpZCBdIH0sXG4gICAgICAgICAgdGhlbjogXCIkJFBSVU5FXCIsXG4gICAgICAgICAgZWxzZTogXCIkJEtFRVBcIiB9fX0pO1xuICAgIH1cbiAgICBwaXBlbGluZS5jb25jYXQoW1xuICAgICAgICB7ICRsb29rdXA6IHsgZnJvbTogXCJyZWNpcGllbnRzXCIsIGxvY2FsRmllbGQ6IFwicmVjaXBpZW50XCIsIGZvcmVpZ25GaWVsZDogXCJfaWRcIiwgYXM6IFwiUmVjaXBpZW50RW1haWxcIiB9IH0sXG4gICAgICAgIHsgJGxvb2t1cDogeyBmcm9tOiBcInNlbmRlcnNcIiwgbG9jYWxGaWVsZDogXCJzZW5kZXJcIiwgZm9yZWlnbkZpZWxkOiBcIl9pZFwiLCBhczogXCJTZW5kZXJFbWFpbFwiIH0gfSxcbiAgICAgICAgeyAkdW53aW5kOiBcIiRTZW5kZXJFbWFpbFwifSxcbiAgICAgICAgeyAkdW53aW5kOiBcIiRSZWNpcGllbnRFbWFpbFwifSxcbiAgICAgICAgeyAkcHJvamVjdDoge1wiX2lkXCI6MSxcImNyZWF0ZWRBdFwiOjEsIFwiY29uZmlybWVkQXRcIjoxLFwibmFtZUlkXCI6MSwgXCJTZW5kZXJFbWFpbC5lbWFpbFwiOjEsXCJSZWNpcGllbnRFbWFpbC5lbWFpbFwiOjF9fVxuICAgIF0pO1xuICAgIC8vaWYob3VyRGF0YS5zdGF0dXM9PTEpIHF1ZXJ5ID0ge1wiY29uZmlybWVkQXRcIjogeyAkZXhpc3RzOiB0cnVlLCAkbmU6IG51bGwgfX1cblxuICAgIGxldCBvcHRJbnMgPSAgT3B0SW5zLmFnZ3JlZ2F0ZShwaXBlbGluZSk7XG4gICAgbGV0IGV4cG9ydERvaURhdGE7XG4gICAgdHJ5IHtcbiAgICAgICAgZXhwb3J0RG9pRGF0YSA9IG9wdElucztcbiAgICAgICAgbG9nU2VuZCgnZXhwb3J0RG9pIHVybDonLERPSV9NQUlMX0ZFVENIX1VSTCxKU09OLnN0cmluZ2lmeShleHBvcnREb2lEYXRhKSk7XG4gICAgICByZXR1cm4gZXhwb3J0RG9pRGF0YVxuXG4gICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgdGhyb3cgXCJFcnJvciB3aGlsZSBleHBvcnRpbmcgZG9pczogXCIrZXJyb3I7XG4gICAgfVxuXG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2RhcHBzLmV4cG9ydERvaS5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBleHBvcnREb2lzO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyBET0lfRkVUQ0hfUk9VVEUsIERPSV9DT05GSVJNQVRJT05fUk9VVEUsIEFQSV9QQVRILCBWRVJTSU9OIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmVyL2FwaS9yZXN0L3Jlc3QuanMnO1xuaW1wb3J0IHsgZ2V0VXJsIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvZGFwcC1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCB7IENPTkZJUk1fQ0xJRU5ULCBDT05GSVJNX0FERFJFU1MgfSBmcm9tICcuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kb2ljaGFpbi1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCB7IGdldEh0dHBHRVQgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2ZXIvYXBpL2h0dHAuanMnO1xuaW1wb3J0IHsgc2lnbk1lc3NhZ2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2ZXIvYXBpL2RvaWNoYWluLmpzJztcbmltcG9ydCB7IE9wdElucyB9IGZyb20gJy4uLy4uLy4uLy4uL2ltcG9ydHMvYXBpL29wdC1pbnMvb3B0LWlucy5qcyc7XG5pbXBvcnQgcGFyc2VUZW1wbGF0ZSBmcm9tICcuLi9lbWFpbHMvcGFyc2VfdGVtcGxhdGUuanMnO1xuaW1wb3J0IGdlbmVyYXRlRG9pVG9rZW4gZnJvbSAnLi4vb3B0LWlucy9nZW5lcmF0ZV9kb2ktdG9rZW4uanMnO1xuaW1wb3J0IGdlbmVyYXRlRG9pSGFzaCBmcm9tICcuLi9lbWFpbHMvZ2VuZXJhdGVfZG9pLWhhc2guanMnO1xuaW1wb3J0IGFkZE9wdEluIGZyb20gJy4uL29wdC1pbnMvYWRkLmpzJztcbmltcG9ydCBhZGRTZW5kTWFpbEpvYiBmcm9tICcuLi9qb2JzL2FkZF9zZW5kX21haWwuanMnO1xuaW1wb3J0IHtsb2dDb25maXJtLCBsb2dFcnJvcn0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5cbmNvbnN0IEZldGNoRG9pTWFpbERhdGFTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgbmFtZToge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9LFxuICBkb21haW46IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfVxufSk7XG5cblxuY29uc3QgZmV0Y2hEb2lNYWlsRGF0YSA9IChkYXRhKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyRGF0YSA9IGRhdGE7XG4gICAgRmV0Y2hEb2lNYWlsRGF0YVNjaGVtYS52YWxpZGF0ZShvdXJEYXRhKTtcbiAgICBjb25zdCB1cmwgPSBvdXJEYXRhLmRvbWFpbitBUElfUEFUSCtWRVJTSU9OK1wiL1wiK0RPSV9GRVRDSF9ST1VURTtcbiAgICBjb25zdCBzaWduYXR1cmUgPSBzaWduTWVzc2FnZShDT05GSVJNX0NMSUVOVCwgQ09ORklSTV9BRERSRVNTLCBvdXJEYXRhLm5hbWUpO1xuICAgIGNvbnN0IHF1ZXJ5ID0gXCJuYW1lX2lkPVwiK2VuY29kZVVSSUNvbXBvbmVudChvdXJEYXRhLm5hbWUpK1wiJnNpZ25hdHVyZT1cIitlbmNvZGVVUklDb21wb25lbnQoc2lnbmF0dXJlKTtcbiAgICBsb2dDb25maXJtKCdjYWxsaW5nIGZvciBkb2ktZW1haWwtdGVtcGxhdGU6Jyt1cmwrJyBxdWVyeTonLCBxdWVyeSk7XG5cbiAgICAvKipcbiAgICAgIFRPRE8gd2hlbiBydW5uaW5nIFNlbmQtZEFwcCBpbiBUZXN0bmV0IGJlaGluZCBOQVQgdGhpcyBVUkwgd2lsbCBub3QgYmUgYWNjZXNzaWJsZSBmcm9tIHRoZSBpbnRlcm5ldFxuICAgICAgYnV0IGV2ZW4gd2hlbiB3ZSB1c2UgdGhlIFVSTCBmcm9tIGxvY2FsaG9zdCB2ZXJpZnkgYW5kbiBvdGhlcnMgd2lsbCBmYWlscy5cbiAgICAgKi9cbiAgICBjb25zdCByZXNwb25zZSA9IGdldEh0dHBHRVQodXJsLCBxdWVyeSk7XG4gICAgaWYocmVzcG9uc2UgPT09IHVuZGVmaW5lZCB8fCByZXNwb25zZS5kYXRhID09PSB1bmRlZmluZWQpIHRocm93IFwiQmFkIHJlc3BvbnNlXCI7XG4gICAgY29uc3QgcmVzcG9uc2VEYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICBsb2dDb25maXJtKCdyZXNwb25zZSB3aGlsZSBnZXR0aW5nIGdldHRpbmcgZW1haWwgdGVtcGxhdGUgZnJvbSBVUkw6JyxyZXNwb25zZS5kYXRhLnN0YXR1cyk7XG5cbiAgICBpZihyZXNwb25zZURhdGEuc3RhdHVzICE9PSBcInN1Y2Nlc3NcIikge1xuICAgICAgaWYocmVzcG9uc2VEYXRhLmVycm9yID09PSB1bmRlZmluZWQpIHRocm93IFwiQmFkIHJlc3BvbnNlXCI7XG4gICAgICBpZihyZXNwb25zZURhdGEuZXJyb3IuaW5jbHVkZXMoXCJPcHQtSW4gbm90IGZvdW5kXCIpKSB7XG4gICAgICAgIC8vRG8gbm90aGluZyBhbmQgZG9uJ3QgdGhyb3cgZXJyb3Igc28gam9iIGlzIGRvbmVcbiAgICAgICAgICBsb2dFcnJvcigncmVzcG9uc2UgZGF0YSBmcm9tIFNlbmQtZEFwcDonLHJlc3BvbnNlRGF0YS5lcnJvcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IHJlc3BvbnNlRGF0YS5lcnJvcjtcbiAgICB9XG4gICAgbG9nQ29uZmlybSgnRE9JIE1haWwgZGF0YSBmZXRjaGVkLicpO1xuXG4gICAgY29uc3Qgb3B0SW5JZCA9IGFkZE9wdEluKHtuYW1lOiBvdXJEYXRhLm5hbWV9KTtcbiAgICBjb25zdCBvcHRJbiA9IE9wdElucy5maW5kT25lKHtfaWQ6IG9wdEluSWR9KTtcbiAgICBsb2dDb25maXJtKCdvcHQtaW4gZm91bmQ6JyxvcHRJbik7XG4gICAgaWYob3B0SW4uY29uZmlybWF0aW9uVG9rZW4gIT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdG9rZW4gPSBnZW5lcmF0ZURvaVRva2VuKHtpZDogb3B0SW4uX2lkfSk7XG4gICAgbG9nQ29uZmlybSgnZ2VuZXJhdGVkIGNvbmZpcm1hdGlvblRva2VuOicsdG9rZW4pO1xuICAgIGNvbnN0IGNvbmZpcm1hdGlvbkhhc2ggPSBnZW5lcmF0ZURvaUhhc2goe2lkOiBvcHRJbi5faWQsIHRva2VuOiB0b2tlbiwgcmVkaXJlY3Q6IHJlc3BvbnNlRGF0YS5kYXRhLnJlZGlyZWN0fSk7XG4gICAgbG9nQ29uZmlybSgnZ2VuZXJhdGVkIGNvbmZpcm1hdGlvbkhhc2g6Jyxjb25maXJtYXRpb25IYXNoKTtcbiAgICBjb25zdCBjb25maXJtYXRpb25VcmwgPSBnZXRVcmwoKStBUElfUEFUSCtWRVJTSU9OK1wiL1wiK0RPSV9DT05GSVJNQVRJT05fUk9VVEUrXCIvXCIrZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpcm1hdGlvbkhhc2gpO1xuICAgIGxvZ0NvbmZpcm0oJ2NvbmZpcm1hdGlvblVybDonK2NvbmZpcm1hdGlvblVybCk7XG5cbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHBhcnNlVGVtcGxhdGUoe3RlbXBsYXRlOiByZXNwb25zZURhdGEuZGF0YS5jb250ZW50LCBkYXRhOiB7XG4gICAgICBjb25maXJtYXRpb25fdXJsOiBjb25maXJtYXRpb25VcmxcbiAgICB9fSk7XG5cbiAgICAvL2xvZ0NvbmZpcm0oJ3dlIGFyZSB1c2luZyB0aGlzIHRlbXBsYXRlOicsdGVtcGxhdGUpO1xuXG4gICAgbG9nQ29uZmlybSgnc2VuZGluZyBlbWFpbCB0byBwZXRlciBmb3IgY29uZmlybWF0aW9uIG92ZXIgYm9icyBkQXBwJyk7XG4gICAgYWRkU2VuZE1haWxKb2Ioe1xuICAgICAgdG86IHJlc3BvbnNlRGF0YS5kYXRhLnJlY2lwaWVudCxcbiAgICAgIHN1YmplY3Q6IHJlc3BvbnNlRGF0YS5kYXRhLnN1YmplY3QsXG4gICAgICBtZXNzYWdlOiB0ZW1wbGF0ZSxcbiAgICAgIHJldHVyblBhdGg6IHJlc3BvbnNlRGF0YS5kYXRhLnJldHVyblBhdGhcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignZGFwcHMuZmV0Y2hEb2lNYWlsRGF0YS5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmZXRjaERvaU1haWxEYXRhO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyBPcHRJbnMgfSBmcm9tICcuLi8uLi8uLi9hcGkvb3B0LWlucy9vcHQtaW5zLmpzJztcbmltcG9ydCB7IFJlY2lwaWVudHMgfSBmcm9tICcuLi8uLi8uLi9hcGkvcmVjaXBpZW50cy9yZWNpcGllbnRzLmpzJztcbmltcG9ydCBnZXRPcHRJblByb3ZpZGVyIGZyb20gJy4uL2Rucy9nZXRfb3B0LWluLXByb3ZpZGVyLmpzJztcbmltcG9ydCBnZXRPcHRJbktleSBmcm9tICcuLi9kbnMvZ2V0X29wdC1pbi1rZXkuanMnO1xuaW1wb3J0IHZlcmlmeVNpZ25hdHVyZSBmcm9tICcuLi9kb2ljaGFpbi92ZXJpZnlfc2lnbmF0dXJlLmpzJztcbmltcG9ydCB7IGdldEh0dHBHRVQgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2ZXIvYXBpL2h0dHAuanMnO1xuaW1wb3J0IHsgRE9JX01BSUxfRkVUQ0hfVVJMIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvZW1haWwtY29uZmlndXJhdGlvbi5qcyc7XG5pbXBvcnQgeyBsb2dTZW5kIH0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgeyBBY2NvdW50cyB9IGZyb20gJ21ldGVvci9hY2NvdW50cy1iYXNlJ1xuXG5jb25zdCBHZXREb2lNYWlsRGF0YVNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBuYW1lX2lkOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIHNpZ25hdHVyZToge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9XG59KTtcblxuY29uc3QgdXNlclByb2ZpbGVTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgc3ViamVjdDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBvcHRpb25hbDp0cnVlXG4gIH0sXG4gIHJlZGlyZWN0OiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBcIkAoaHR0cHM/fGZ0cCk6Ly8oLVxcXFwuKT8oW15cXFxccy8/XFxcXC4jLV0rXFxcXC4/KSsoL1teXFxcXHNdKik/JEBcIixcbiAgICBvcHRpb25hbDp0cnVlXG4gIH0sXG4gIHJldHVyblBhdGg6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5FbWFpbCxcbiAgICBvcHRpb25hbDp0cnVlXG4gIH0sXG4gIHRlbXBsYXRlVVJMOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBcIkAoaHR0cHM/fGZ0cCk6Ly8oLVxcXFwuKT8oW15cXFxccy8/XFxcXC4jLV0rXFxcXC4/KSsoL1teXFxcXHNdKik/JEBcIixcbiAgICBvcHRpb25hbDp0cnVlXG4gIH1cbn0pO1xuXG5jb25zdCBnZXREb2lNYWlsRGF0YSA9IChkYXRhKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyRGF0YSA9IGRhdGE7XG4gICAgR2V0RG9pTWFpbERhdGFTY2hlbWEudmFsaWRhdGUob3VyRGF0YSk7XG4gICAgY29uc3Qgb3B0SW4gPSBPcHRJbnMuZmluZE9uZSh7bmFtZUlkOiBvdXJEYXRhLm5hbWVfaWR9KTtcbiAgICBpZihvcHRJbiA9PT0gdW5kZWZpbmVkKSB0aHJvdyBcIk9wdC1JbiB3aXRoIG5hbWVfaWQ6IFwiK291ckRhdGEubmFtZV9pZCtcIiBub3QgZm91bmRcIjtcbiAgICBsb2dTZW5kKCdPcHQtSW4gZm91bmQnLG9wdEluKTtcblxuICAgIGNvbnN0IHJlY2lwaWVudCA9IFJlY2lwaWVudHMuZmluZE9uZSh7X2lkOiBvcHRJbi5yZWNpcGllbnR9KTtcbiAgICBpZihyZWNpcGllbnQgPT09IHVuZGVmaW5lZCkgdGhyb3cgXCJSZWNpcGllbnQgbm90IGZvdW5kXCI7XG4gICAgbG9nU2VuZCgnUmVjaXBpZW50IGZvdW5kJywgcmVjaXBpZW50KTtcblxuICAgIGNvbnN0IHBhcnRzID0gcmVjaXBpZW50LmVtYWlsLnNwbGl0KFwiQFwiKTtcbiAgICBjb25zdCBkb21haW4gPSBwYXJ0c1twYXJ0cy5sZW5ndGgtMV07XG5cbiAgICBsZXQgcHVibGljS2V5ID0gZ2V0T3B0SW5LZXkoeyBkb21haW46IGRvbWFpbn0pO1xuXG4gICAgaWYoIXB1YmxpY0tleSl7XG4gICAgICBjb25zdCBwcm92aWRlciA9IGdldE9wdEluUHJvdmlkZXIoe2RvbWFpbjogb3VyRGF0YS5kb21haW4gfSk7XG4gICAgICBsb2dTZW5kKFwidXNpbmcgZG9pY2hhaW4gcHJvdmlkZXIgaW5zdGVhZCBvZiBkaXJlY3RseSBjb25maWd1cmVkIHB1YmxpY0tleTpcIiwgeyBwcm92aWRlcjogcHJvdmlkZXIgfSk7XG4gICAgICBwdWJsaWNLZXkgPSBnZXRPcHRJbktleSh7IGRvbWFpbjogcHJvdmlkZXJ9KTsgLy9nZXQgcHVibGljIGtleSBmcm9tIHByb3ZpZGVyIG9yIGZhbGxiYWNrIGlmIHB1YmxpY2tleSB3YXMgbm90IHNldCBpbiBkbnNcbiAgICB9XG5cbiAgICBsb2dTZW5kKCdxdWVyaWVkIGRhdGE6IChwYXJ0cywgZG9tYWluLCBwcm92aWRlciwgcHVibGljS2V5KScsICcoJytwYXJ0cysnLCcrZG9tYWluKycsJytwdWJsaWNLZXkrJyknKTtcblxuICAgIC8vVE9ETzogT25seSBhbGxvdyBhY2Nlc3Mgb25lIHRpbWVcbiAgICAvLyBQb3NzaWJsZSBzb2x1dGlvbjpcbiAgICAvLyAxLiBQcm92aWRlciAoY29uZmlybSBkQXBwKSByZXF1ZXN0IHRoZSBkYXRhXG4gICAgLy8gMi4gUHJvdmlkZXIgcmVjZWl2ZSB0aGUgZGF0YVxuICAgIC8vIDMuIFByb3ZpZGVyIHNlbmRzIGNvbmZpcm1hdGlvbiBcIkkgZ290IHRoZSBkYXRhXCJcbiAgICAvLyA0LiBTZW5kIGRBcHAgbG9jayB0aGUgZGF0YSBmb3IgdGhpcyBvcHQgaW5cbiAgICBsb2dTZW5kKCd2ZXJpZnlpbmcgc2lnbmF0dXJlLi4uJyk7XG4gICAgaWYoIXZlcmlmeVNpZ25hdHVyZSh7cHVibGljS2V5OiBwdWJsaWNLZXksIGRhdGE6IG91ckRhdGEubmFtZV9pZCwgc2lnbmF0dXJlOiBvdXJEYXRhLnNpZ25hdHVyZX0pKSB7XG4gICAgICB0aHJvdyBcInNpZ25hdHVyZSBpbmNvcnJlY3QgLSBhY2Nlc3MgZGVuaWVkXCI7XG4gICAgfVxuICAgIFxuICAgIGxvZ1NlbmQoJ3NpZ25hdHVyZSB2ZXJpZmllZCcpO1xuXG4gICAgLy9UT0RPOiBRdWVyeSBmb3IgbGFuZ3VhZ2VcbiAgICBsZXQgZG9pTWFpbERhdGE7XG4gICAgdHJ5IHtcblxuICAgICAgZG9pTWFpbERhdGEgPSBnZXRIdHRwR0VUKERPSV9NQUlMX0ZFVENIX1VSTCwgXCJcIikuZGF0YTtcbiAgICAgIGxldCBkZWZhdWx0UmV0dXJuRGF0YSA9IHtcbiAgICAgICAgXCJyZWNpcGllbnRcIjogcmVjaXBpZW50LmVtYWlsLFxuICAgICAgICBcImNvbnRlbnRcIjogZG9pTWFpbERhdGEuZGF0YS5jb250ZW50LFxuICAgICAgICBcInJlZGlyZWN0XCI6IGRvaU1haWxEYXRhLmRhdGEucmVkaXJlY3QsXG4gICAgICAgIFwic3ViamVjdFwiOiBkb2lNYWlsRGF0YS5kYXRhLnN1YmplY3QsXG4gICAgICAgIFwicmV0dXJuUGF0aFwiOiBkb2lNYWlsRGF0YS5kYXRhLnJldHVyblBhdGhcbiAgICAgIH1cblxuICAgIGxldCByZXR1cm5EYXRhID0gZGVmYXVsdFJldHVybkRhdGE7XG5cbiAgICB0cnl7XG4gICAgICBsZXQgb3duZXIgPSBBY2NvdW50cy51c2Vycy5maW5kT25lKHtfaWQ6IG9wdEluLm93bmVySWR9KTtcbiAgICAgIGxldCBtYWlsVGVtcGxhdGUgPSBvd25lci5wcm9maWxlLm1haWxUZW1wbGF0ZTtcbiAgICAgIHVzZXJQcm9maWxlU2NoZW1hLnZhbGlkYXRlKG1haWxUZW1wbGF0ZSk7XG5cbiAgICAgIHJldHVybkRhdGFbXCJyZWRpcmVjdFwiXSA9IG1haWxUZW1wbGF0ZVtcInJlZGlyZWN0XCJdIHx8IGRlZmF1bHRSZXR1cm5EYXRhW1wicmVkaXJlY3RcIl07XG4gICAgICByZXR1cm5EYXRhW1wic3ViamVjdFwiXSA9IG1haWxUZW1wbGF0ZVtcInN1YmplY3RcIl0gfHwgZGVmYXVsdFJldHVybkRhdGFbXCJzdWJqZWN0XCJdO1xuICAgICAgcmV0dXJuRGF0YVtcInJldHVyblBhdGhcIl0gPSBtYWlsVGVtcGxhdGVbXCJyZXR1cm5QYXRoXCJdIHx8IGRlZmF1bHRSZXR1cm5EYXRhW1wicmV0dXJuUGF0aFwiXTtcbiAgICAgIHJldHVybkRhdGFbXCJjb250ZW50XCJdID0gbWFpbFRlbXBsYXRlW1widGVtcGxhdGVVUkxcIl0gPyAoZ2V0SHR0cEdFVChtYWlsVGVtcGxhdGVbXCJ0ZW1wbGF0ZVVSTFwiXSwgXCJcIikuY29udGVudCB8fCBkZWZhdWx0UmV0dXJuRGF0YVtcImNvbnRlbnRcIl0pIDogZGVmYXVsdFJldHVybkRhdGFbXCJjb250ZW50XCJdO1xuICAgICAgXG4gICAgfVxuICAgIGNhdGNoKGVycm9yKSB7XG4gICAgICByZXR1cm5EYXRhPWRlZmF1bHRSZXR1cm5EYXRhO1xuICAgIH1cblxuICAgICAgbG9nU2VuZCgnZG9pTWFpbERhdGEgYW5kIHVybDonLCBET0lfTUFJTF9GRVRDSF9VUkwsIHJldHVybkRhdGEpO1xuXG4gICAgICByZXR1cm4gcmV0dXJuRGF0YVxuXG4gICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgdGhyb3cgXCJFcnJvciB3aGlsZSBmZXRjaGluZyBtYWlsIGNvbnRlbnQ6IFwiK2Vycm9yO1xuICAgIH1cblxuICB9IGNhdGNoKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2RhcHBzLmdldERvaU1haWxEYXRhLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGdldERvaU1haWxEYXRhO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyByZXNvbHZlVHh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmVyL2FwaS9kbnMuanMnO1xuaW1wb3J0IHsgRkFMTEJBQ0tfUFJPVklERVIgfSBmcm9tICcuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kbnMtY29uZmlndXJhdGlvbi5qcyc7XG5pbXBvcnQge2lzUmVndGVzdCwgaXNUZXN0bmV0fSBmcm9tIFwiLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvZGFwcC1jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQge2xvZ1NlbmR9IGZyb20gXCIuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9sb2ctY29uZmlndXJhdGlvblwiO1xuXG5jb25zdCBPUFRfSU5fS0VZID0gXCJkb2ljaGFpbi1vcHQtaW4ta2V5XCI7XG5jb25zdCBPUFRfSU5fS0VZX1RFU1RORVQgPSBcImRvaWNoYWluLXRlc3RuZXQtb3B0LWluLWtleVwiO1xuXG5jb25zdCBHZXRPcHRJbktleVNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBkb21haW46IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfVxufSk7XG5cblxuY29uc3QgZ2V0T3B0SW5LZXkgPSAoZGF0YSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgIEdldE9wdEluS2V5U2NoZW1hLnZhbGlkYXRlKG91ckRhdGEpO1xuXG4gICAgbGV0IG91ck9QVF9JTl9LRVk9T1BUX0lOX0tFWTtcblxuICAgIGlmKGlzUmVndGVzdCgpIHx8IGlzVGVzdG5ldCgpKXtcbiAgICAgICAgb3VyT1BUX0lOX0tFWSA9IE9QVF9JTl9LRVlfVEVTVE5FVDtcbiAgICAgICAgbG9nU2VuZCgnVXNpbmcgUmVnVGVzdDonK2lzUmVndGVzdCgpK1wiIFRlc3RuZXQ6IFwiK2lzVGVzdG5ldCgpK1wiIG91ck9QVF9JTl9LRVlcIixvdXJPUFRfSU5fS0VZKTtcbiAgICB9XG4gICAgY29uc3Qga2V5ID0gcmVzb2x2ZVR4dChvdXJPUFRfSU5fS0VZLCBvdXJEYXRhLmRvbWFpbik7XG4gICAgbG9nU2VuZCgnRE5TIFRYVCBjb25maWd1cmVkIHB1YmxpYyBrZXkgb2YgcmVjaXBpZW50IGVtYWlsIGRvbWFpbiBhbmQgY29uZmlybWF0aW9uIGRhcHAnLHtmb3VuZEtleTprZXksIGRvbWFpbjpvdXJEYXRhLmRvbWFpbiwgZG5za2V5Om91ck9QVF9JTl9LRVl9KTtcblxuICAgIGlmKGtleSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdXNlRmFsbGJhY2sob3VyRGF0YS5kb21haW4pO1xuICAgIHJldHVybiBrZXk7XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2Rucy5nZXRPcHRJbktleS5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5jb25zdCB1c2VGYWxsYmFjayA9IChkb21haW4pID0+IHtcbiAgaWYoZG9tYWluID09PSBGQUxMQkFDS19QUk9WSURFUikgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcIkZhbGxiYWNrIGhhcyBubyBrZXkgZGVmaW5lZCFcIik7XG4gICAgbG9nU2VuZChcIktleSBub3QgZGVmaW5lZC4gVXNpbmcgZmFsbGJhY2s6IFwiLEZBTExCQUNLX1BST1ZJREVSKTtcbiAgcmV0dXJuIGdldE9wdEluS2V5KHtkb21haW46IEZBTExCQUNLX1BST1ZJREVSfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXRPcHRJbktleTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHsgcmVzb2x2ZVR4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZlci9hcGkvZG5zLmpzJztcbmltcG9ydCB7IEZBTExCQUNLX1BST1ZJREVSIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvZG5zLWNvbmZpZ3VyYXRpb24uanMnO1xuaW1wb3J0IHtsb2dTZW5kfSBmcm9tIFwiLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvbG9nLWNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7aXNSZWd0ZXN0LCBpc1Rlc3RuZXR9IGZyb20gXCIuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kYXBwLWNvbmZpZ3VyYXRpb25cIjtcblxuY29uc3QgUFJPVklERVJfS0VZID0gXCJkb2ljaGFpbi1vcHQtaW4tcHJvdmlkZXJcIjtcbmNvbnN0IFBST1ZJREVSX0tFWV9URVNUTkVUID0gXCJkb2ljaGFpbi10ZXN0bmV0LW9wdC1pbi1wcm92aWRlclwiO1xuXG5jb25zdCBHZXRPcHRJblByb3ZpZGVyU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gIGRvbWFpbjoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9XG59KTtcblxuXG5jb25zdCBnZXRPcHRJblByb3ZpZGVyID0gKGRhdGEpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvdXJEYXRhID0gZGF0YTtcbiAgICBHZXRPcHRJblByb3ZpZGVyU2NoZW1hLnZhbGlkYXRlKG91ckRhdGEpO1xuXG4gICAgbGV0IG91clBST1ZJREVSX0tFWT1QUk9WSURFUl9LRVk7XG4gICAgaWYoaXNSZWd0ZXN0KCkgfHwgaXNUZXN0bmV0KCkpe1xuICAgICAgICBvdXJQUk9WSURFUl9LRVkgPSBQUk9WSURFUl9LRVlfVEVTVE5FVDtcbiAgICAgICAgbG9nU2VuZCgnVXNpbmcgUmVnVGVzdDonK2lzUmVndGVzdCgpK1wiIDogVGVzdG5ldDpcIitpc1Rlc3RuZXQoKStcIiBQUk9WSURFUl9LRVlcIix7cHJvdmlkZXJLZXk6b3VyUFJPVklERVJfS0VZLCBkb21haW46b3VyRGF0YS5kb21haW59KTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm92aWRlciA9IHJlc29sdmVUeHQob3VyUFJPVklERVJfS0VZLCBvdXJEYXRhLmRvbWFpbik7XG4gICAgaWYocHJvdmlkZXIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVzZUZhbGxiYWNrKCk7XG5cbiAgICBsb2dTZW5kKCdvcHQtaW4tcHJvdmlkZXIgZnJvbSBkbnMgLSBzZXJ2ZXIgb2YgbWFpbCByZWNpcGllbnQ6IChUWFQpOicscHJvdmlkZXIpO1xuICAgIHJldHVybiBwcm92aWRlcjtcbiAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignZG5zLmdldE9wdEluUHJvdmlkZXIuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuY29uc3QgdXNlRmFsbGJhY2sgPSAoKSA9PiB7XG4gIGxvZ1NlbmQoJ1Byb3ZpZGVyIG5vdCBkZWZpbmVkLiBGYWxsYmFjayAnK0ZBTExCQUNLX1BST1ZJREVSKycgaXMgdXNlZCcpO1xuICByZXR1cm4gRkFMTEJBQ0tfUFJPVklERVI7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXRPcHRJblByb3ZpZGVyO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyBDT05GSVJNX0NMSUVOVCwgQ09ORklSTV9BRERSRVNTIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvZG9pY2hhaW4tY29uZmlndXJhdGlvbi5qcyc7XG5pbXBvcnQgeyBnZXRXaWYgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2ZXIvYXBpL2RvaWNoYWluLmpzJztcbmltcG9ydCB7IERvaWNoYWluRW50cmllcyB9IGZyb20gJy4uLy4uLy4uL2FwaS9kb2ljaGFpbi9lbnRyaWVzLmpzJztcbmltcG9ydCBhZGRGZXRjaERvaU1haWxEYXRhSm9iIGZyb20gJy4uL2pvYnMvYWRkX2ZldGNoLWRvaS1tYWlsLWRhdGEuanMnO1xuaW1wb3J0IGdldFByaXZhdGVLZXlGcm9tV2lmIGZyb20gJy4vZ2V0X3ByaXZhdGUta2V5X2Zyb21fd2lmLmpzJztcbmltcG9ydCBkZWNyeXB0TWVzc2FnZSBmcm9tICcuL2RlY3J5cHRfbWVzc2FnZS5qcyc7XG5pbXBvcnQge2xvZ0NvbmZpcm0sIGxvZ1NlbmR9IGZyb20gXCIuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9sb2ctY29uZmlndXJhdGlvblwiO1xuXG5jb25zdCBBZGREb2ljaGFpbkVudHJ5U2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gIG5hbWU6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgdmFsdWU6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgYWRkcmVzczoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9LFxuICB0eElkOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH1cbn0pO1xuXG4vKipcbiAqIEluc2VydHNcbiAqXG4gKiBAcGFyYW0gZW50cnlcbiAqIEByZXR1cm5zIHsqfVxuICovXG5jb25zdCBhZGREb2ljaGFpbkVudHJ5ID0gKGVudHJ5KSA9PiB7XG4gIHRyeSB7XG5cbiAgICBjb25zdCBvdXJFbnRyeSA9IGVudHJ5O1xuICAgIGxvZ0NvbmZpcm0oJ2FkZGluZyBEb2ljaGFpbkVudHJ5IG9uIEJvYi4uLicsb3VyRW50cnkubmFtZSk7XG4gICAgQWRkRG9pY2hhaW5FbnRyeVNjaGVtYS52YWxpZGF0ZShvdXJFbnRyeSk7XG5cbiAgICBjb25zdCBldHkgPSBEb2ljaGFpbkVudHJpZXMuZmluZE9uZSh7bmFtZTogb3VyRW50cnkubmFtZX0pO1xuICAgIGlmKGV0eSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgbG9nU2VuZCgncmV0dXJuaW5nIGxvY2FsbHkgc2F2ZWQgZW50cnkgd2l0aCBfaWQ6JytldHkuX2lkKTtcbiAgICAgICAgcmV0dXJuIGV0eS5faWQ7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSBKU09OLnBhcnNlKG91ckVudHJ5LnZhbHVlKTtcbiAgICAvL2xvZ1NlbmQoXCJ2YWx1ZTpcIix2YWx1ZSk7XG4gICAgaWYodmFsdWUuZnJvbSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBcIldyb25nIGJsb2NrY2hhaW4gZW50cnlcIjsgLy9UT0RPIGlmIGZyb20gaXMgbWlzc2luZyBidXQgdmFsdWUgaXMgdGhlcmUsIGl0IGlzIHByb2JhYmx5IGFsbHJlYWR5IGhhbmRlbGVkIGNvcnJlY3RseSBhbnl3YXlzIHRoaXMgaXMgbm90IHNvIGNvb2wgYXMgaXQgc2VlbXMuXG4gICAgY29uc3Qgd2lmID0gZ2V0V2lmKENPTkZJUk1fQ0xJRU5ULCBDT05GSVJNX0FERFJFU1MpO1xuICAgIGNvbnN0IHByaXZhdGVLZXkgPSBnZXRQcml2YXRlS2V5RnJvbVdpZih7d2lmOiB3aWZ9KTtcbiAgICBsb2dTZW5kKCdnb3QgcHJpdmF0ZSBrZXkgKHdpbGwgbm90IHNob3cgaXQgaGVyZSknKTtcblxuICAgIGNvbnN0IGRvbWFpbiA9IGRlY3J5cHRNZXNzYWdlKHtwcml2YXRlS2V5OiBwcml2YXRlS2V5LCBtZXNzYWdlOiB2YWx1ZS5mcm9tfSk7XG4gICAgbG9nU2VuZCgnZGVjcnlwdGVkIG1lc3NhZ2UgZnJvbSBkb21haW46ICcsZG9tYWluKTtcblxuICAgIGNvbnN0IG5hbWVQb3MgPSBvdXJFbnRyeS5uYW1lLmluZGV4T2YoJy0nKTsgLy9pZiB0aGlzIGlzIG5vdCBhIGNvLXJlZ2lzdHJhdGlvbiBmZXRjaCBtYWlsLlxuICAgIGxvZ1NlbmQoJ25hbWVQb3M6JyxuYW1lUG9zKTtcbiAgICBjb25zdCBtYXN0ZXJEb2kgPSAobmFtZVBvcyE9LTEpP291ckVudHJ5Lm5hbWUuc3Vic3RyaW5nKDAsbmFtZVBvcyk6dW5kZWZpbmVkO1xuICAgIGxvZ1NlbmQoJ21hc3RlckRvaTonLG1hc3RlckRvaSk7XG4gICAgY29uc3QgaW5kZXggPSBtYXN0ZXJEb2k/b3VyRW50cnkubmFtZS5zdWJzdHJpbmcobmFtZVBvcysxKTp1bmRlZmluZWQ7XG4gICAgbG9nU2VuZCgnaW5kZXg6JyxpbmRleCk7XG5cbiAgICBjb25zdCBpZCA9IERvaWNoYWluRW50cmllcy5pbnNlcnQoe1xuICAgICAgICBuYW1lOiBvdXJFbnRyeS5uYW1lLFxuICAgICAgICB2YWx1ZTogb3VyRW50cnkudmFsdWUsXG4gICAgICAgIGFkZHJlc3M6IG91ckVudHJ5LmFkZHJlc3MsXG4gICAgICAgIG1hc3RlckRvaTogbWFzdGVyRG9pLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIHR4SWQ6IG91ckVudHJ5LnR4SWQsXG4gICAgICAgIGV4cGlyZXNJbjogb3VyRW50cnkuZXhwaXJlc0luLFxuICAgICAgICBleHBpcmVkOiBvdXJFbnRyeS5leHBpcmVkXG4gICAgfSk7XG5cbiAgICBsb2dTZW5kKCdEb2ljaGFpbkVudHJ5IGFkZGVkIG9uIEJvYjonLCB7aWQ6aWQsbmFtZTpvdXJFbnRyeS5uYW1lLG1hc3RlckRvaTptYXN0ZXJEb2ksaW5kZXg6aW5kZXh9KTtcblxuICAgIGlmKCFtYXN0ZXJEb2kpe1xuICAgICAgICBhZGRGZXRjaERvaU1haWxEYXRhSm9iKHtcbiAgICAgICAgICAgIG5hbWU6IG91ckVudHJ5Lm5hbWUsXG4gICAgICAgICAgICBkb21haW46IGRvbWFpblxuICAgICAgICB9KTtcbiAgICAgICAgbG9nU2VuZCgnTmV3IGVudHJ5IGFkZGVkOiBcXG4nK1xuICAgICAgICAgICAgJ05hbWVJZD0nK291ckVudHJ5Lm5hbWUrXCJcXG5cIitcbiAgICAgICAgICAgICdBZGRyZXNzPScrb3VyRW50cnkuYWRkcmVzcytcIlxcblwiK1xuICAgICAgICAgICAgJ1R4SWQ9JytvdXJFbnRyeS50eElkK1wiXFxuXCIrXG4gICAgICAgICAgICAnVmFsdWU9JytvdXJFbnRyeS52YWx1ZSk7XG5cbiAgICB9ZWxzZXtcbiAgICAgICAgbG9nU2VuZCgnVGhpcyB0cmFuc2FjdGlvbiBiZWxvbmdzIHRvIGNvLXJlZ2lzdHJhdGlvbicsIG1hc3RlckRvaSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlkO1xuICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi5hZGRFbnRyeUFuZEZldGNoRGF0YS5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhZGREb2ljaGFpbkVudHJ5O1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBsaXN0U2luY2VCbG9jaywgbmFtZVNob3csIGdldFJhd1RyYW5zYWN0aW9ufSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2ZXIvYXBpL2RvaWNoYWluLmpzJztcbmltcG9ydCB7IENPTkZJUk1fQ0xJRU5ULCBDT05GSVJNX0FERFJFU1MgfSBmcm9tICcuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kb2ljaGFpbi1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCBhZGREb2ljaGFpbkVudHJ5IGZyb20gJy4vYWRkX2VudHJ5X2FuZF9mZXRjaF9kYXRhLmpzJ1xuaW1wb3J0IHsgTWV0YSB9IGZyb20gJy4uLy4uLy4uL2FwaS9tZXRhL21ldGEuanMnO1xuaW1wb3J0IGFkZE9yVXBkYXRlTWV0YSBmcm9tICcuLi9tZXRhL2FkZE9yVXBkYXRlLmpzJztcbmltcG9ydCB7bG9nQ29uZmlybX0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5cbmNvbnN0IFRYX05BTUVfU1RBUlQgPSBcImUvXCI7XG5jb25zdCBMQVNUX0NIRUNLRURfQkxPQ0tfS0VZID0gXCJsYXN0Q2hlY2tlZEJsb2NrXCI7XG5cbmNvbnN0IGNoZWNrTmV3VHJhbnNhY3Rpb24gPSAodHhpZCwgam9iKSA9PiB7XG4gIHRyeSB7XG5cbiAgICAgIGlmKCF0eGlkKXtcbiAgICAgICAgICBsb2dDb25maXJtKFwiY2hlY2tOZXdUcmFuc2FjdGlvbiB0cmlnZ2VyZWQgd2hlbiBzdGFydGluZyBub2RlIC0gY2hlY2tpbmcgYWxsIGNvbmZpcm1lZCBibG9ja3Mgc2luY2UgbGFzdCBjaGVjayBmb3IgZG9pY2hhaW4gYWRkcmVzc1wiLENPTkZJUk1fQUREUkVTUyk7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB2YXIgbGFzdENoZWNrZWRCbG9jayA9IE1ldGEuZmluZE9uZSh7a2V5OiBMQVNUX0NIRUNLRURfQkxPQ0tfS0VZfSk7XG4gICAgICAgICAgICAgIGlmKGxhc3RDaGVja2VkQmxvY2sgIT09IHVuZGVmaW5lZCkgbGFzdENoZWNrZWRCbG9jayA9IGxhc3RDaGVja2VkQmxvY2sudmFsdWU7XG4gICAgICAgICAgICAgIGxvZ0NvbmZpcm0oXCJsYXN0Q2hlY2tlZEJsb2NrXCIsbGFzdENoZWNrZWRCbG9jayk7XG4gICAgICAgICAgICAgIGNvbnN0IHJldCA9IGxpc3RTaW5jZUJsb2NrKENPTkZJUk1fQ0xJRU5ULCBsYXN0Q2hlY2tlZEJsb2NrKTtcbiAgICAgICAgICAgICAgaWYocmV0ID09PSB1bmRlZmluZWQgfHwgcmV0LnRyYW5zYWN0aW9ucyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgY29uc3QgdHhzID0gcmV0LnRyYW5zYWN0aW9ucztcbiAgICAgICAgICAgICAgbGFzdENoZWNrZWRCbG9jayA9IHJldC5sYXN0YmxvY2s7XG4gICAgICAgICAgICAgIGlmKCFyZXQgfHwgIXR4cyB8fCAhdHhzLmxlbmd0aD09PTApe1xuICAgICAgICAgICAgICAgICAgbG9nQ29uZmlybShcInRyYW5zYWN0aW9ucyBkbyBub3QgY29udGFpbiBuYW1lT3AgdHJhbnNhY3Rpb24gZGV0YWlscyBvciB0cmFuc2FjdGlvbiBub3QgZm91bmQuXCIsIGxhc3RDaGVja2VkQmxvY2spO1xuICAgICAgICAgICAgICAgICAgYWRkT3JVcGRhdGVNZXRhKHtrZXk6IExBU1RfQ0hFQ0tFRF9CTE9DS19LRVksIHZhbHVlOiBsYXN0Q2hlY2tlZEJsb2NrfSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBsb2dDb25maXJtKFwibGlzdFNpbmNlQmxvY2tcIixyZXQpO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGFkZHJlc3NUeHMgPSB0eHMuZmlsdGVyKHR4ID0+XG4gICAgICAgICAgICAgICAgICB0eC5hZGRyZXNzID09PSBDT05GSVJNX0FERFJFU1NcbiAgICAgICAgICAgICAgICAgICYmIHR4Lm5hbWUgIT09IHVuZGVmaW5lZCAvL3NpbmNlIG5hbWVfc2hvdyBjYW5ub3QgYmUgcmVhZCB3aXRob3V0IGNvbmZpcm1hdGlvbnNcbiAgICAgICAgICAgICAgICAgICYmIHR4Lm5hbWUuc3RhcnRzV2l0aChcImRvaTogXCIrVFhfTkFNRV9TVEFSVCkgIC8vaGVyZSAnZG9pOiBlL3h4eHgnIGlzIGFscmVhZHkgd3JpdHRlbiBpbiB0aGUgYmxvY2tcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgYWRkcmVzc1R4cy5mb3JFYWNoKHR4ID0+IHtcbiAgICAgICAgICAgICAgICAgIGxvZ0NvbmZpcm0oXCJ0eDpcIix0eCk7XG4gICAgICAgICAgICAgICAgICB2YXIgdHhOYW1lID0gdHgubmFtZS5zdWJzdHJpbmcoKFwiZG9pOiBcIitUWF9OQU1FX1NUQVJUKS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgbG9nQ29uZmlybShcImV4Y3V0aW5nIG5hbWVfc2hvdyBpbiBvcmRlciB0byBnZXQgdmFsdWUgb2YgbmFtZUlkOlwiLCB0eE5hbWUpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZXR5ID0gbmFtZVNob3coQ09ORklSTV9DTElFTlQsIHR4TmFtZSk7XG4gICAgICAgICAgICAgICAgICBsb2dDb25maXJtKFwibmFtZVNob3c6IHZhbHVlXCIsZXR5KTtcbiAgICAgICAgICAgICAgICAgIGlmKCFldHkpe1xuICAgICAgICAgICAgICAgICAgICAgIGxvZ0NvbmZpcm0oXCJjb3VsZG4ndCBmaW5kIG5hbWUgLSBvYnZpb3VzbHkgbm90ICh5ZXQ/ISkgY29uZmlybWVkIGluIGJsb2NrY2hhaW46XCIsIGV0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgYWRkVHgodHhOYW1lLCBldHkudmFsdWUsdHguYWRkcmVzcyx0eC50eGlkKTsgLy9UT0RPIGV0eS52YWx1ZS5mcm9tIGlzIG1heWJlIE5PVCBleGlzdGluZyBiZWNhdXNlIG9mIHRoaXMgaXRzICAobWF5YmUpIG9udCB3b3JraW5nLi4uXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBhZGRPclVwZGF0ZU1ldGEoe2tleTogTEFTVF9DSEVDS0VEX0JMT0NLX0tFWSwgdmFsdWU6IGxhc3RDaGVja2VkQmxvY2t9KTtcbiAgICAgICAgICAgICAgbG9nQ29uZmlybShcIlRyYW5zYWN0aW9ucyB1cGRhdGVkIC0gbGFzdENoZWNrZWRCbG9jazpcIixsYXN0Q2hlY2tlZEJsb2NrKTtcbiAgICAgICAgICAgICAgam9iLmRvbmUoKTtcbiAgICAgICAgICB9IGNhdGNoKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCduYW1lY29pbi5jaGVja05ld1RyYW5zYWN0aW9ucy5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICAgICAgICAgIH1cblxuICAgICAgfWVsc2V7XG4gICAgICAgICAgbG9nQ29uZmlybShcInR4aWQ6IFwiK3R4aWQrXCIgd2FzIHRyaWdnZXJlZCBieSB3YWxsZXRub3RpZnkgZm9yIGFkZHJlc3M6XCIsQ09ORklSTV9BRERSRVNTKTtcblxuICAgICAgICAgIGNvbnN0IHJldCA9IGdldFJhd1RyYW5zYWN0aW9uKENPTkZJUk1fQ0xJRU5ULCB0eGlkKTtcbiAgICAgICAgICBjb25zdCB0eHMgPSByZXQudm91dDtcblxuICAgICAgICAgIGlmKCFyZXQgfHwgIXR4cyB8fCAhdHhzLmxlbmd0aD09PTApe1xuICAgICAgICAgICAgICBsb2dDb25maXJtKFwidHhpZCBcIit0eGlkKycgZG9lcyBub3QgY29udGFpbiB0cmFuc2FjdGlvbiBkZXRhaWxzIG9yIHRyYW5zYWN0aW9uIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgLy8gbG9nQ29uZmlybSgnbm93IGNoZWNraW5nIHJhdyB0cmFuc2FjdGlvbnMgd2l0aCBmaWx0ZXI6Jyx0eHMpO1xuXG4gICAgICAgICAgY29uc3QgYWRkcmVzc1R4cyA9IHR4cy5maWx0ZXIodHggPT5cbiAgICAgICAgICAgICAgdHguc2NyaXB0UHViS2V5ICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgJiYgdHguc2NyaXB0UHViS2V5Lm5hbWVPcCAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICYmIHR4LnNjcmlwdFB1YktleS5uYW1lT3Aub3AgPT09IFwibmFtZV9kb2lcIlxuICAgICAgICAgICAgLy8gICYmIHR4LnNjcmlwdFB1YktleS5hZGRyZXNzZXNbMF0gPT09IENPTkZJUk1fQUREUkVTUyAvL29ubHkgb3duIHRyYW5zYWN0aW9uIHNob3VsZCBhcnJpdmUgaGVyZS4gLSBzbyBjaGVjayBvbiBvd24gYWRkcmVzcyB1bm5lY2Nlc2FyeVxuICAgICAgICAgICAgICAmJiB0eC5zY3JpcHRQdWJLZXkubmFtZU9wLm5hbWUgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAmJiB0eC5zY3JpcHRQdWJLZXkubmFtZU9wLm5hbWUuc3RhcnRzV2l0aChUWF9OQU1FX1NUQVJUKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvL2xvZ0NvbmZpcm0oXCJmb3VuZCBuYW1lX29wIHRyYW5zYWN0aW9uczpcIiwgYWRkcmVzc1R4cyk7XG5cbiAgICAgICAgICBhZGRyZXNzVHhzLmZvckVhY2godHggPT4ge1xuICAgICAgICAgICAgICBhZGRUeCh0eC5zY3JpcHRQdWJLZXkubmFtZU9wLm5hbWUsIHR4LnNjcmlwdFB1YktleS5uYW1lT3AudmFsdWUsdHguc2NyaXB0UHViS2V5LmFkZHJlc3Nlc1swXSx0eGlkKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cblxuXG5cbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi5jaGVja05ld1RyYW5zYWN0aW9ucy5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuXG5mdW5jdGlvbiBhZGRUeChuYW1lLCB2YWx1ZSwgYWRkcmVzcywgdHhpZCkge1xuICAgIGNvbnN0IHR4TmFtZSA9IG5hbWUuc3Vic3RyaW5nKFRYX05BTUVfU1RBUlQubGVuZ3RoKTtcblxuICAgIGFkZERvaWNoYWluRW50cnkoe1xuICAgICAgICBuYW1lOiB0eE5hbWUsXG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgYWRkcmVzczogYWRkcmVzcyxcbiAgICAgICAgdHhJZDogdHhpZFxuICAgIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjaGVja05ld1RyYW5zYWN0aW9uO1xuXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbmltcG9ydCBlY2llcyBmcm9tICdzdGFuZGFyZC1lY2llcyc7XG5cbmNvbnN0IERlY3J5cHRNZXNzYWdlU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gIHByaXZhdGVLZXk6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgbWVzc2FnZToge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9XG59KTtcblxuY29uc3QgZGVjcnlwdE1lc3NhZ2UgPSAoZGF0YSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgIERlY3J5cHRNZXNzYWdlU2NoZW1hLnZhbGlkYXRlKG91ckRhdGEpO1xuICAgIGNvbnN0IHByaXZhdGVLZXkgPSBCdWZmZXIuZnJvbShvdXJEYXRhLnByaXZhdGVLZXksICdoZXgnKTtcbiAgICBjb25zdCBlY2RoID0gY3J5cHRvLmNyZWF0ZUVDREgoJ3NlY3AyNTZrMScpO1xuICAgIGVjZGguc2V0UHJpdmF0ZUtleShwcml2YXRlS2V5KTtcbiAgICBjb25zdCBtZXNzYWdlID0gQnVmZmVyLmZyb20ob3VyRGF0YS5tZXNzYWdlLCAnaGV4Jyk7XG4gICAgcmV0dXJuIGVjaWVzLmRlY3J5cHQoZWNkaCwgbWVzc2FnZSkudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi5kZWNyeXB0TWVzc2FnZS5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWNyeXB0TWVzc2FnZTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IGVjaWVzIGZyb20gJ3N0YW5kYXJkLWVjaWVzJztcblxuY29uc3QgRW5jcnlwdE1lc3NhZ2VTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgcHVibGljS2V5OiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIG1lc3NhZ2U6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfVxufSk7XG5cbmNvbnN0IGVuY3J5cHRNZXNzYWdlID0gKGRhdGEpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvdXJEYXRhID0gZGF0YTtcbiAgICBFbmNyeXB0TWVzc2FnZVNjaGVtYS52YWxpZGF0ZShvdXJEYXRhKTtcbiAgICBjb25zdCBwdWJsaWNLZXkgPSBCdWZmZXIuZnJvbShvdXJEYXRhLnB1YmxpY0tleSwgJ2hleCcpO1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBCdWZmZXIuZnJvbShvdXJEYXRhLm1lc3NhZ2UpO1xuICAgIHJldHVybiBlY2llcy5lbmNyeXB0KHB1YmxpY0tleSwgbWVzc2FnZSkudG9TdHJpbmcoJ2hleCcpO1xuICB9IGNhdGNoKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2RvaWNoYWluLmVuY3J5cHRNZXNzYWdlLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGVuY3J5cHRNZXNzYWdlO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyBPcHRJbnMgfSBmcm9tICcuLi8uLi8uLi9hcGkvb3B0LWlucy9vcHQtaW5zLmpzJztcbmltcG9ydCBnZXRLZXlQYWlyIGZyb20gJy4vZ2V0X2tleS1wYWlyLmpzJztcbmltcG9ydCB7bG9nU2VuZH0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5cbmNvbnN0IEdlbmVyYXRlTmFtZUlkU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gIGlkOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIG1hc3RlckRvaToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgfSxcbiAgaW5kZXg6IHtcbiAgICAgIHR5cGU6IFNpbXBsZVNjaGVtYS5JbnRlZ2VyLFxuICAgICAgb3B0aW9uYWw6IHRydWVcbiAgfVxufSk7XG5cbmNvbnN0IGdlbmVyYXRlTmFtZUlkID0gKG9wdEluKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyT3B0SW4gPSBvcHRJbjtcbiAgICBHZW5lcmF0ZU5hbWVJZFNjaGVtYS52YWxpZGF0ZShvdXJPcHRJbik7XG4gICAgbGV0IG5hbWVJZDtcbiAgICBpZihvcHRJbi5tYXN0ZXJEb2kpe1xuICAgICAgICBuYW1lSWQgPSBvdXJPcHRJbi5tYXN0ZXJEb2krXCItXCIrb3VyT3B0SW4uaW5kZXg7XG4gICAgICAgIGxvZ1NlbmQoXCJ1c2VkIG1hc3Rlcl9kb2kgYXMgbmFtZUlkIGluZGV4IFwiK29wdEluLmluZGV4K1wic3RvcmFnZTpcIixuYW1lSWQpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICBuYW1lSWQgPSBnZXRLZXlQYWlyKCkucHJpdmF0ZUtleTtcbiAgICAgICAgbG9nU2VuZChcImdlbmVyYXRlZCBuYW1lSWQgZm9yIGRvaWNoYWluIHN0b3JhZ2U6XCIsbmFtZUlkKTtcbiAgICB9XG5cbiAgICBPcHRJbnMudXBkYXRlKHtfaWQgOiBvdXJPcHRJbi5pZH0sIHskc2V0OntuYW1lSWQ6IG5hbWVJZH19KTtcblxuICAgIHJldHVybiBuYW1lSWQ7XG4gIH0gY2F0Y2goZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignZG9pY2hhaW4uZ2VuZXJhdGVOYW1lSWQuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2VuZXJhdGVOYW1lSWQ7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCBDcnlwdG9KUyBmcm9tICdjcnlwdG8tanMnO1xuaW1wb3J0IEJhc2U1OCBmcm9tICdiczU4JztcbmltcG9ydCB7IGlzUmVndGVzdCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2RhcHAtY29uZmlndXJhdGlvbi5qcyc7XG5pbXBvcnQge2lzVGVzdG5ldH0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2RhcHAtY29uZmlndXJhdGlvblwiO1xuXG5jb25zdCBWRVJTSU9OX0JZVEUgPSAweDM0O1xuY29uc3QgVkVSU0lPTl9CWVRFX1JFR1RFU1QgPSAweDZmO1xuY29uc3QgR2V0QWRkcmVzc1NjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBwdWJsaWNLZXk6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfVxufSk7XG5cbmNvbnN0IGdldEFkZHJlc3MgPSAoZGF0YSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgIEdldEFkZHJlc3NTY2hlbWEudmFsaWRhdGUob3VyRGF0YSk7XG4gICAgcmV0dXJuIF9nZXRBZGRyZXNzKG91ckRhdGEucHVibGljS2V5KTtcbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi5nZXRBZGRyZXNzLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIF9nZXRBZGRyZXNzKHB1YmxpY0tleSkge1xuICBjb25zdCBwdWJLZXkgPSBDcnlwdG9KUy5saWIuV29yZEFycmF5LmNyZWF0ZShCdWZmZXIuZnJvbShwdWJsaWNLZXksICdoZXgnKSk7XG4gIGxldCBrZXkgPSBDcnlwdG9KUy5TSEEyNTYocHViS2V5KTtcbiAga2V5ID0gQ3J5cHRvSlMuUklQRU1EMTYwKGtleSk7XG4gIGxldCB2ZXJzaW9uQnl0ZSA9IFZFUlNJT05fQllURTtcbiAgaWYoaXNSZWd0ZXN0KCkgfHwgaXNUZXN0bmV0KCkpIHZlcnNpb25CeXRlID0gVkVSU0lPTl9CWVRFX1JFR1RFU1Q7XG4gIGxldCBhZGRyZXNzID0gQnVmZmVyLmNvbmNhdChbQnVmZmVyLmZyb20oW3ZlcnNpb25CeXRlXSksIEJ1ZmZlci5mcm9tKGtleS50b1N0cmluZygpLCAnaGV4JyldKTtcbiAga2V5ID0gQ3J5cHRvSlMuU0hBMjU2KENyeXB0b0pTLmxpYi5Xb3JkQXJyYXkuY3JlYXRlKGFkZHJlc3MpKTtcbiAga2V5ID0gQ3J5cHRvSlMuU0hBMjU2KGtleSk7XG4gIGxldCBjaGVja3N1bSA9IGtleS50b1N0cmluZygpLnN1YnN0cmluZygwLCA4KTtcbiAgYWRkcmVzcyA9IG5ldyBCdWZmZXIoYWRkcmVzcy50b1N0cmluZygnaGV4JykrY2hlY2tzdW0sJ2hleCcpO1xuICBhZGRyZXNzID0gQmFzZTU4LmVuY29kZShhZGRyZXNzKTtcbiAgcmV0dXJuIGFkZHJlc3M7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldEFkZHJlc3M7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IGdldEJhbGFuY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2ZXIvYXBpL2RvaWNoYWluLmpzJztcbmltcG9ydCB7IENPTkZJUk1fQ0xJRU5UfSBmcm9tICcuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kb2ljaGFpbi1jb25maWd1cmF0aW9uLmpzJztcblxuXG5jb25zdCBnZXRfQmFsYW5jZSA9ICgpID0+IHtcbiAgICBcbiAgdHJ5IHtcbiAgICBjb25zdCBiYWw9Z2V0QmFsYW5jZShDT05GSVJNX0NMSUVOVCk7XG4gICAgcmV0dXJuIGJhbDtcbiAgICBcbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi5nZXRCYWxhbmNlLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXRfQmFsYW5jZTtcblxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgQ3J5cHRvSlMgZnJvbSAnY3J5cHRvLWpzJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcblxuY29uc3QgR2V0RGF0YUhhc2hTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgZGF0YToge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9XG59KTtcblxuY29uc3QgZ2V0RGF0YUhhc2ggPSAoZGF0YSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgICAgR2V0RGF0YUhhc2hTY2hlbWEudmFsaWRhdGUob3VyRGF0YSk7XG4gICAgY29uc3QgaGFzaCA9IENyeXB0b0pTLlNIQTI1NihvdXJEYXRhKS50b1N0cmluZygpO1xuICAgIHJldHVybiBoYXNoO1xuICB9IGNhdGNoKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2RvaWNoYWluLmdldERhdGFIYXNoLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGdldERhdGFIYXNoO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyByYW5kb21CeXRlcyB9IGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgc2VjcDI1NmsxIGZyb20gJ3NlY3AyNTZrMSc7XG5cbmNvbnN0IGdldEtleVBhaXIgPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgbGV0IHByaXZLZXlcbiAgICBkbyB7cHJpdktleSA9IHJhbmRvbUJ5dGVzKDMyKX0gd2hpbGUoIXNlY3AyNTZrMS5wcml2YXRlS2V5VmVyaWZ5KHByaXZLZXkpKVxuICAgIGNvbnN0IHByaXZhdGVLZXkgPSBwcml2S2V5O1xuICAgIGNvbnN0IHB1YmxpY0tleSA9IHNlY3AyNTZrMS5wdWJsaWNLZXlDcmVhdGUocHJpdmF0ZUtleSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByaXZhdGVLZXk6IHByaXZhdGVLZXkudG9TdHJpbmcoJ2hleCcpLnRvVXBwZXJDYXNlKCksXG4gICAgICBwdWJsaWNLZXk6IHB1YmxpY0tleS50b1N0cmluZygnaGV4JykudG9VcHBlckNhc2UoKVxuICAgIH1cbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi5nZXRLZXlQYWlyLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGdldEtleVBhaXI7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCBCYXNlNTggZnJvbSAnYnM1OCc7XG5cbmNvbnN0IEdldFByaXZhdGVLZXlGcm9tV2lmU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gIHdpZjoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9XG59KTtcblxuY29uc3QgZ2V0UHJpdmF0ZUtleUZyb21XaWYgPSAoZGF0YSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgIEdldFByaXZhdGVLZXlGcm9tV2lmU2NoZW1hLnZhbGlkYXRlKG91ckRhdGEpO1xuICAgIHJldHVybiBfZ2V0UHJpdmF0ZUtleUZyb21XaWYob3VyRGF0YS53aWYpO1xuICB9IGNhdGNoKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2RvaWNoYWluLmdldFByaXZhdGVLZXlGcm9tV2lmLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIF9nZXRQcml2YXRlS2V5RnJvbVdpZih3aWYpIHtcbiAgdmFyIHByaXZhdGVLZXkgPSBCYXNlNTguZGVjb2RlKHdpZikudG9TdHJpbmcoJ2hleCcpO1xuICBwcml2YXRlS2V5ID0gcHJpdmF0ZUtleS5zdWJzdHJpbmcoMiwgcHJpdmF0ZUtleS5sZW5ndGggLSA4KTtcbiAgaWYocHJpdmF0ZUtleS5sZW5ndGggPT09IDY2ICYmIHByaXZhdGVLZXkuZW5kc1dpdGgoXCIwMVwiKSkge1xuICAgIHByaXZhdGVLZXkgPSBwcml2YXRlS2V5LnN1YnN0cmluZygwLCBwcml2YXRlS2V5Lmxlbmd0aCAtIDIpO1xuICB9XG4gIHJldHVybiBwcml2YXRlS2V5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRQcml2YXRlS2V5RnJvbVdpZjtcbiIsImltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCB7bG9nU2VuZH0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5cbmltcG9ydCBnZXRPcHRJbktleSBmcm9tIFwiLi4vZG5zL2dldF9vcHQtaW4ta2V5XCI7XG5pbXBvcnQgZ2V0T3B0SW5Qcm92aWRlciBmcm9tIFwiLi4vZG5zL2dldF9vcHQtaW4tcHJvdmlkZXJcIjtcbmltcG9ydCBnZXRBZGRyZXNzIGZyb20gXCIuL2dldF9hZGRyZXNzXCI7XG5cbmNvbnN0IEdldFB1YmxpY0tleVNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICAgIGRvbWFpbjoge1xuICAgICAgICB0eXBlOiBTdHJpbmdcbiAgICB9XG59KTtcblxuY29uc3QgZ2V0UHVibGljS2V5QW5kQWRkcmVzcyA9IChkYXRhKSA9PiB7XG5cbiAgICBjb25zdCBvdXJEYXRhID0gZGF0YTtcbiAgICBHZXRQdWJsaWNLZXlTY2hlbWEudmFsaWRhdGUob3VyRGF0YSk7XG5cbiAgICBsZXQgcHVibGljS2V5ID0gZ2V0T3B0SW5LZXkoe2RvbWFpbjogb3VyRGF0YS5kb21haW59KTtcbiAgICBpZighcHVibGljS2V5KXtcbiAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBnZXRPcHRJblByb3ZpZGVyKHtkb21haW46IG91ckRhdGEuZG9tYWlufSk7XG4gICAgICAgIGxvZ1NlbmQoXCJ1c2luZyBkb2ljaGFpbiBwcm92aWRlciBpbnN0ZWFkIG9mIGRpcmVjdGx5IGNvbmZpZ3VyZWQgcHVibGljS2V5OlwiLHtwcm92aWRlcjpwcm92aWRlcn0pO1xuICAgICAgICBwdWJsaWNLZXkgPSBnZXRPcHRJbktleSh7ZG9tYWluOiBwcm92aWRlcn0pOyAvL2dldCBwdWJsaWMga2V5IGZyb20gcHJvdmlkZXIgb3IgZmFsbGJhY2sgaWYgcHVibGlja2V5IHdhcyBub3Qgc2V0IGluIGRuc1xuICAgIH1cbiAgICBjb25zdCBkZXN0QWRkcmVzcyA9ICBnZXRBZGRyZXNzKHtwdWJsaWNLZXk6IHB1YmxpY0tleX0pO1xuICAgIGxvZ1NlbmQoJ3B1YmxpY0tleSBhbmQgZGVzdEFkZHJlc3MgJywge3B1YmxpY0tleTpwdWJsaWNLZXksZGVzdEFkZHJlc3M6ZGVzdEFkZHJlc3N9KTtcbiAgICByZXR1cm4ge3B1YmxpY0tleTpwdWJsaWNLZXksZGVzdEFkZHJlc3M6ZGVzdEFkZHJlc3N9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0UHVibGljS2V5QW5kQWRkcmVzczsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCBiaXRjb3JlIGZyb20gJ2JpdGNvcmUtbGliJztcbmltcG9ydCBNZXNzYWdlIGZyb20gJ2JpdGNvcmUtbWVzc2FnZSc7XG5cbmNvbnN0IEdldFNpZ25hdHVyZVNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBtZXNzYWdlOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIHByaXZhdGVLZXk6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfVxufSk7XG5cbmNvbnN0IGdldFNpZ25hdHVyZSA9IChkYXRhKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyRGF0YSA9IGRhdGE7XG4gICAgR2V0U2lnbmF0dXJlU2NoZW1hLnZhbGlkYXRlKG91ckRhdGEpO1xuICAgIGNvbnN0IHNpZ25hdHVyZSA9IE1lc3NhZ2Uob3VyRGF0YS5tZXNzYWdlKS5zaWduKG5ldyBiaXRjb3JlLlByaXZhdGVLZXkob3VyRGF0YS5wcml2YXRlS2V5KSk7XG4gICAgcmV0dXJuIHNpZ25hdHVyZTtcbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi5nZXRTaWduYXR1cmUuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0U2lnbmF0dXJlO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyBTRU5EX0NMSUVOVCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2RvaWNoYWluLWNvbmZpZ3VyYXRpb24uanMnO1xuaW1wb3J0IGVuY3J5cHRNZXNzYWdlIGZyb20gXCIuL2VuY3J5cHRfbWVzc2FnZVwiO1xuaW1wb3J0IHtnZXRVcmx9IGZyb20gXCIuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kYXBwLWNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7bG9nQmxvY2tjaGFpbiwgbG9nU2VuZH0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQge2ZlZURvaSxuYW1lRG9pfSBmcm9tIFwiLi4vLi4vLi4vLi4vc2VydmVyL2FwaS9kb2ljaGFpblwiO1xuaW1wb3J0IHtPcHRJbnN9IGZyb20gXCIuLi8uLi8uLi9hcGkvb3B0LWlucy9vcHQtaW5zXCI7XG5pbXBvcnQgZ2V0UHVibGljS2V5QW5kQWRkcmVzcyBmcm9tIFwiLi9nZXRfcHVibGlja2V5X2FuZF9hZGRyZXNzX2J5X2RvbWFpblwiO1xuXG5cbmNvbnN0IEluc2VydFNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBuYW1lSWQ6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgc2lnbmF0dXJlOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIGRhdGFIYXNoOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIGRvbWFpbjoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9LFxuICBzb2lEYXRlOiB7XG4gICAgdHlwZTogRGF0ZVxuICB9XG59KTtcblxuY29uc3QgaW5zZXJ0ID0gKGRhdGEpID0+IHtcbiAgY29uc3Qgb3VyRGF0YSA9IGRhdGE7XG4gIHRyeSB7XG4gICAgSW5zZXJ0U2NoZW1hLnZhbGlkYXRlKG91ckRhdGEpO1xuICAgIGxvZ1NlbmQoXCJkb21haW46XCIsb3VyRGF0YS5kb21haW4pO1xuXG4gICAgY29uc3QgcHVibGljS2V5QW5kQWRkcmVzcyA9IGdldFB1YmxpY0tleUFuZEFkZHJlc3Moe2RvbWFpbjpvdXJEYXRhLmRvbWFpbn0pO1xuICAgIGNvbnN0IGZyb20gPSBlbmNyeXB0TWVzc2FnZSh7cHVibGljS2V5OiBwdWJsaWNLZXlBbmRBZGRyZXNzLnB1YmxpY0tleSwgbWVzc2FnZTogZ2V0VXJsKCl9KTtcbiAgICBsb2dTZW5kKCdlbmNyeXB0ZWQgdXJsIGZvciB1c2UgYWQgZnJvbSBpbiBkb2ljaGFpbiB2YWx1ZTonLGdldFVybCgpLGZyb20pO1xuXG4gICAgY29uc3QgbmFtZVZhbHVlID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzaWduYXR1cmU6IG91ckRhdGEuc2lnbmF0dXJlLFxuICAgICAgICBkYXRhSGFzaDogb3VyRGF0YS5kYXRhSGFzaCxcbiAgICAgICAgZnJvbTogZnJvbVxuICAgIH0pO1xuXG4gICAgLy9UT0RPICghKSB0aGlzIG11c3QgYmUgcmVwbGFjZWQgaW4gZnV0dXJlIGJ5IFwiYXRvbWljIG5hbWUgdHJhZGluZyBleGFtcGxlXCIgaHR0cHM6Ly93aWtpLm5hbWVjb2luLmluZm8vP3RpdGxlPUF0b21pY19OYW1lLVRyYWRpbmdcbiAgICBsb2dCbG9ja2NoYWluKCdzZW5kaW5nIGEgZmVlIHRvIGJvYiBzbyBoZSBjYW4gcGF5IHRoZSBkb2kgc3RvcmFnZSAoZGVzdEFkZHJlc3MpOicsIHB1YmxpY0tleUFuZEFkZHJlc3MuZGVzdEFkZHJlc3MpO1xuICAgIGNvbnN0IGZlZURvaVR4ID0gZmVlRG9pKFNFTkRfQ0xJRU5ULCBwdWJsaWNLZXlBbmRBZGRyZXNzLmRlc3RBZGRyZXNzKTtcbiAgICBsb2dCbG9ja2NoYWluKCdmZWUgc2VuZCB0eGlkIHRvIGRlc3RhZGRyZXNzJywgZmVlRG9pVHgsIHB1YmxpY0tleUFuZEFkZHJlc3MuZGVzdEFkZHJlc3MpO1xuXG4gICAgbG9nQmxvY2tjaGFpbignYWRkaW5nIGRhdGEgdG8gYmxvY2tjaGFpbiB2aWEgbmFtZV9kb2kgKG5hbWVJZCx2YWx1ZSxkZXN0QWRkcmVzcyk6Jywgb3VyRGF0YS5uYW1lSWQsbmFtZVZhbHVlLHB1YmxpY0tleUFuZEFkZHJlc3MuZGVzdEFkZHJlc3MpO1xuICAgIGNvbnN0IG5hbWVEb2lUeCA9IG5hbWVEb2koU0VORF9DTElFTlQsIG91ckRhdGEubmFtZUlkLCBuYW1lVmFsdWUsIHB1YmxpY0tleUFuZEFkZHJlc3MuZGVzdEFkZHJlc3MpO1xuICAgIGxvZ0Jsb2NrY2hhaW4oJ25hbWVfZG9pIGFkZGVkIGJsb2NrY2hhaW4uIHR4aWQ6JywgbmFtZURvaVR4KTtcblxuICAgIE9wdElucy51cGRhdGUoe25hbWVJZDogb3VyRGF0YS5uYW1lSWR9LCB7JHNldDoge3R4SWQ6bmFtZURvaVR4fX0pO1xuICAgIGxvZ0Jsb2NrY2hhaW4oJ3VwZGF0aW5nIE9wdEluIGxvY2FsbHkgd2l0aDonLCB7bmFtZUlkOiBvdXJEYXRhLm5hbWVJZCwgdHhJZDogbmFtZURvaVR4fSk7XG5cbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICAgIE9wdElucy51cGRhdGUoe25hbWVJZDogb3VyRGF0YS5uYW1lSWR9LCB7JHNldDoge2Vycm9yOkpTT04uc3RyaW5naWZ5KGV4Y2VwdGlvbi5tZXNzYWdlKX19KTtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi5pbnNlcnQuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTsgLy9UT0RPIHVwZGF0ZSBvcHQtaW4gaW4gbG9jYWwgZGIgdG8gaW5mb3JtIHVzZXIgYWJvdXQgdGhlIGVycm9yISBlLmcuIEluc3VmZmljaWVudCBmdW5kcyBldGMuXG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGluc2VydDtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHsgQ09ORklSTV9DTElFTlQgfSBmcm9tICcuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kb2ljaGFpbi1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCB7Z2V0V2lmLCBzaWduTWVzc2FnZSwgZ2V0VHJhbnNhY3Rpb24sIG5hbWVEb2ksIG5hbWVTaG93fSBmcm9tIFwiLi4vLi4vLi4vLi4vc2VydmVyL2FwaS9kb2ljaGFpblwiO1xuaW1wb3J0IHtBUElfUEFUSCwgRE9JX0NPTkZJUk1BVElPTl9OT1RJRllfUk9VVEUsIFZFUlNJT059IGZyb20gXCIuLi8uLi8uLi8uLi9zZXJ2ZXIvYXBpL3Jlc3QvcmVzdFwiO1xuaW1wb3J0IHtDT05GSVJNX0FERFJFU1N9IGZyb20gXCIuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kb2ljaGFpbi1jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQge2dldEh0dHBQVVR9IGZyb20gXCIuLi8uLi8uLi8uLi9zZXJ2ZXIvYXBpL2h0dHBcIjtcbmltcG9ydCB7bG9nQ29uZmlybX0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgZ2V0UHJpdmF0ZUtleUZyb21XaWYgZnJvbSBcIi4vZ2V0X3ByaXZhdGUta2V5X2Zyb21fd2lmXCI7XG5pbXBvcnQgZGVjcnlwdE1lc3NhZ2UgZnJvbSBcIi4vZGVjcnlwdF9tZXNzYWdlXCI7XG5pbXBvcnQge09wdEluc30gZnJvbSBcIi4uLy4uLy4uL2FwaS9vcHQtaW5zL29wdC1pbnNcIjtcblxuY29uc3QgVXBkYXRlU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gIG5hbWVJZDoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9LFxuICB2YWx1ZToge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9LFxuICBob3N0IDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgb3B0aW9uYWw6IHRydWUsXG4gIH0sXG4gIGZyb21Ib3N0VXJsIDoge1xuICAgICAgdHlwZTogU3RyaW5nXG4gIH1cbn0pO1xuXG5jb25zdCB1cGRhdGUgPSAoZGF0YSwgam9iKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyRGF0YSA9IGRhdGE7XG5cbiAgICBVcGRhdGVTY2hlbWEudmFsaWRhdGUob3VyRGF0YSk7XG5cbiAgICAvL3N0b3AgdGhpcyB1cGRhdGUgdW50aWwgdGhpcyBuYW1lIGFzIGF0IGxlYXN0IDEgY29uZmlybWF0aW9uXG4gICAgY29uc3QgbmFtZV9kYXRhID0gbmFtZVNob3coQ09ORklSTV9DTElFTlQsb3VyRGF0YS5uYW1lSWQpO1xuICAgIGlmKG5hbWVfZGF0YSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmVydW4oam9iKTtcbiAgICAgICAgbG9nQ29uZmlybSgnbmFtZSBub3QgdmlzaWJsZSAtIGRlbGF5aW5nIG5hbWUgdXBkYXRlJyxvdXJEYXRhLm5hbWVJZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb3VyX3RyYW5zYWN0aW9uID0gZ2V0VHJhbnNhY3Rpb24oQ09ORklSTV9DTElFTlQsbmFtZV9kYXRhLnR4aWQpO1xuICAgIGlmKG91cl90cmFuc2FjdGlvbi5jb25maXJtYXRpb25zPT09MCl7XG4gICAgICAgIHJlcnVuKGpvYik7XG4gICAgICAgIGxvZ0NvbmZpcm0oJ3RyYW5zYWN0aW9uIGhhcyAwIGNvbmZpcm1hdGlvbnMgLSBkZWxheWluZyBuYW1lIHVwZGF0ZScsSlNPTi5wYXJzZShvdXJEYXRhLnZhbHVlKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nQ29uZmlybSgndXBkYXRpbmcgYmxvY2tjaGFpbiB3aXRoIGRvaVNpZ25hdHVyZTonLEpTT04ucGFyc2Uob3VyRGF0YS52YWx1ZSkpO1xuICAgIGNvbnN0IHdpZiA9IGdldFdpZihDT05GSVJNX0NMSUVOVCwgQ09ORklSTV9BRERSRVNTKTtcbiAgICBjb25zdCBwcml2YXRlS2V5ID0gZ2V0UHJpdmF0ZUtleUZyb21XaWYoe3dpZjogd2lmfSk7XG4gICAgbG9nQ29uZmlybSgnZ290IHByaXZhdGUga2V5ICh3aWxsIG5vdCBzaG93IGl0IGhlcmUpIGluIG9yZGVyIHRvIGRlY3J5cHQgU2VuZC1kQXBwIGhvc3QgdXJsIGZyb20gdmFsdWU6JyxvdXJEYXRhLmZyb21Ib3N0VXJsKTtcbiAgICBjb25zdCBvdXJmcm9tSG9zdFVybCA9IGRlY3J5cHRNZXNzYWdlKHtwcml2YXRlS2V5OiBwcml2YXRlS2V5LCBtZXNzYWdlOiBvdXJEYXRhLmZyb21Ib3N0VXJsfSk7XG4gICAgbG9nQ29uZmlybSgnZGVjcnlwdGVkIGZyb21Ib3N0VXJsJyxvdXJmcm9tSG9zdFVybCk7XG4gICAgY29uc3QgdXJsID0gb3VyZnJvbUhvc3RVcmwrQVBJX1BBVEgrVkVSU0lPTitcIi9cIitET0lfQ09ORklSTUFUSU9OX05PVElGWV9ST1VURTtcblxuICAgIGxvZ0NvbmZpcm0oJ2NyZWF0aW5nIHNpZ25hdHVyZSB3aXRoIEFERFJFU1MnK0NPTkZJUk1fQUREUkVTUytcIiBuYW1lSWQ6XCIsb3VyRGF0YS52YWx1ZSk7XG4gICAgY29uc3Qgc2lnbmF0dXJlID0gc2lnbk1lc3NhZ2UoQ09ORklSTV9DTElFTlQsIENPTkZJUk1fQUREUkVTUywgb3VyRGF0YS5uYW1lSWQpOyAvL1RPRE8gd2h5IGhlcmUgb3ZlciBuYW1lSUQ/XG4gICAgbG9nQ29uZmlybSgnc2lnbmF0dXJlIGNyZWF0ZWQ6JyxzaWduYXR1cmUpO1xuXG4gICAgY29uc3QgdXBkYXRlRGF0YSA9IHtcbiAgICAgICAgbmFtZUlkOiBvdXJEYXRhLm5hbWVJZCxcbiAgICAgICAgc2lnbmF0dXJlOiBzaWduYXR1cmUsXG4gICAgICAgIGhvc3Q6IG91ckRhdGEuaG9zdFxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCB0eGlkID0gbmFtZURvaShDT05GSVJNX0NMSUVOVCwgb3VyRGF0YS5uYW1lSWQsIG91ckRhdGEudmFsdWUsIG51bGwpO1xuICAgICAgICBsb2dDb25maXJtKCd1cGRhdGUgdHJhbnNhY3Rpb24gdHhpZDonLHR4aWQpO1xuICAgIH1jYXRjaChleGNlcHRpb24pe1xuICAgICAgICAvL1xuICAgICAgICBsb2dDb25maXJtKCd0aGlzIG5hbWVET0kgZG9lc27CtHQgaGF2ZSBhIGJsb2NrIHlldCBhbmQgd2lsbCBiZSB1cGRhdGVkIHdpdGggdGhlIG5leHQgYmxvY2sgYW5kIHdpdGggdGhlIG5leHQgcXVldWUgc3RhcnQ6JyxvdXJEYXRhLm5hbWVJZCk7XG4gICAgICAgIGlmKGV4Y2VwdGlvbi50b1N0cmluZygpLmluZGV4T2YoXCJ0aGVyZSBpcyBhbHJlYWR5IGEgcmVnaXN0cmF0aW9uIGZvciB0aGlzIGRvaSBuYW1lXCIpPT0tMSkge1xuICAgICAgICAgICAgT3B0SW5zLnVwZGF0ZSh7bmFtZUlkOiBvdXJEYXRhLm5hbWVJZH0sIHskc2V0OiB7ZXJyb3I6IEpTT04uc3RyaW5naWZ5KGV4Y2VwdGlvbi5tZXNzYWdlKX19KTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi51cGRhdGUuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgICAgICAgLy99ZWxzZXtcbiAgICAgICAgLy8gICAgbG9nQ29uZmlybSgndGhpcyBuYW1lRE9JIGRvZXNuwrR0IGhhdmUgYSBibG9jayB5ZXQgYW5kIHdpbGwgYmUgdXBkYXRlZCB3aXRoIHRoZSBuZXh0IGJsb2NrIGFuZCB3aXRoIHRoZSBuZXh0IHF1ZXVlIHN0YXJ0Oicsb3VyRGF0YS5uYW1lSWQpO1xuICAgICAgICAvL31cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGdldEh0dHBQVVQodXJsLCB1cGRhdGVEYXRhKTtcbiAgICBsb2dDb25maXJtKCdpbmZvcm1lZCBzZW5kIGRBcHAgYWJvdXQgY29uZmlybWVkIGRvaSBvbiB1cmw6Jyt1cmwrJyB3aXRoIHVwZGF0ZURhdGEnK0pTT04uc3RyaW5naWZ5KHVwZGF0ZURhdGEpK1wiIHJlc3BvbnNlOlwiLHJlc3BvbnNlLmRhdGEpO1xuICAgIGpvYi5kb25lKCk7XG4gIH0gY2F0Y2goZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignZG9pY2hhaW4udXBkYXRlLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHJlcnVuKGpvYil7XG4gICAgbG9nQ29uZmlybSgncmVydW5uaW5nIHR4aWQgaW4gMTBzZWMgLSBjYW5jZWxpbmcgb2xkIGpvYicsJycpO1xuICAgIGpvYi5jYW5jZWwoKTtcbiAgICBsb2dDb25maXJtKCdyZXN0YXJ0IGJsb2NrY2hhaW4gZG9pIHVwZGF0ZScsJycpO1xuICAgIGpvYi5yZXN0YXJ0KFxuICAgICAgICB7XG4gICAgICAgICAgICAvL3JlcGVhdHM6IDYwMCwgICAvLyBPbmx5IHJlcGVhdCB0aGlzIG9uY2VcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGRlZmF1bHRcbiAgICAgICAgICAgLy8gd2FpdDogMTAwMDAgICAvLyBXYWl0IDEwIHNlYyBiZXR3ZWVuIHJlcGVhdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVmYXVsdCBpcyBwcmV2aW91cyBzZXR0aW5nXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGxvZ0NvbmZpcm0oJ3JlcnVubmluZyB0eGlkIGluIDEwc2VjOicscmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHVwZGF0ZTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IGJpdGNvcmUgZnJvbSAnYml0Y29yZS1saWInO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSAnYml0Y29yZS1tZXNzYWdlJztcbmltcG9ydCB7bG9nRXJyb3IsIGxvZ1ZlcmlmeX0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5jb25zdCBORVRXT1JLID0gYml0Y29yZS5OZXR3b3Jrcy5hZGQoe1xuICBuYW1lOiAnZG9pY2hhaW4nLFxuICBhbGlhczogJ2RvaWNoYWluJyxcbiAgcHVia2V5aGFzaDogMHgzNCxcbiAgcHJpdmF0ZWtleTogMHhCNCxcbiAgc2NyaXB0aGFzaDogMTMsXG4gIG5ldHdvcmtNYWdpYzogMHhmOWJlYjRmZSxcbn0pO1xuXG5jb25zdCBWZXJpZnlTaWduYXR1cmVTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgZGF0YToge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9LFxuICBwdWJsaWNLZXk6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgc2lnbmF0dXJlOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH1cbn0pO1xuXG5jb25zdCB2ZXJpZnlTaWduYXR1cmUgPSAoZGF0YSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgIGxvZ1ZlcmlmeSgndmVyaWZ5U2lnbmF0dXJlOicsb3VyRGF0YSk7XG4gICAgVmVyaWZ5U2lnbmF0dXJlU2NoZW1hLnZhbGlkYXRlKG91ckRhdGEpO1xuICAgIGNvbnN0IGFkZHJlc3MgPSBiaXRjb3JlLkFkZHJlc3MuZnJvbVB1YmxpY0tleShuZXcgYml0Y29yZS5QdWJsaWNLZXkob3VyRGF0YS5wdWJsaWNLZXkpLCBORVRXT1JLKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIE1lc3NhZ2Uob3VyRGF0YS5kYXRhKS52ZXJpZnkoYWRkcmVzcywgb3VyRGF0YS5zaWduYXR1cmUpO1xuICAgIH0gY2F0Y2goZXJyb3IpIHsgbG9nRXJyb3IoZXJyb3IpfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi52ZXJpZnlTaWduYXR1cmUuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgdmVyaWZ5U2lnbmF0dXJlO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyBPcHRJbnMgfSBmcm9tICcuLi8uLi8uLi9hcGkvb3B0LWlucy9vcHQtaW5zLmpzJztcbmltcG9ydCB7IFNlbmRlcnMgfSBmcm9tICcuLi8uLi8uLi9hcGkvc2VuZGVycy9zZW5kZXJzLmpzJztcbmltcG9ydCB7IFJlY2lwaWVudHMgfSBmcm9tICcuLi8uLi8uLi9hcGkvcmVjaXBpZW50cy9yZWNpcGllbnRzLmpzJztcbmltcG9ydCBnZW5lcmF0ZU5hbWVJZCBmcm9tICcuL2dlbmVyYXRlX25hbWUtaWQuanMnO1xuaW1wb3J0IGdldFNpZ25hdHVyZSBmcm9tICcuL2dldF9zaWduYXR1cmUuanMnO1xuaW1wb3J0IGdldERhdGFIYXNoIGZyb20gJy4vZ2V0X2RhdGEtaGFzaC5qcyc7XG5pbXBvcnQgYWRkSW5zZXJ0QmxvY2tjaGFpbkpvYiBmcm9tICcuLi9qb2JzL2FkZF9pbnNlcnRfYmxvY2tjaGFpbi5qcyc7XG5pbXBvcnQge2xvZ1NlbmR9IGZyb20gXCIuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9sb2ctY29uZmlndXJhdGlvblwiO1xuXG5jb25zdCBXcml0ZVRvQmxvY2tjaGFpblNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBpZDoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9XG59KTtcblxuY29uc3Qgd3JpdGVUb0Jsb2NrY2hhaW4gPSAoZGF0YSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgIFdyaXRlVG9CbG9ja2NoYWluU2NoZW1hLnZhbGlkYXRlKG91ckRhdGEpO1xuXG4gICAgY29uc3Qgb3B0SW4gPSBPcHRJbnMuZmluZE9uZSh7X2lkOiBkYXRhLmlkfSk7XG4gICAgY29uc3QgcmVjaXBpZW50ID0gUmVjaXBpZW50cy5maW5kT25lKHtfaWQ6IG9wdEluLnJlY2lwaWVudH0pO1xuICAgIGNvbnN0IHNlbmRlciA9IFNlbmRlcnMuZmluZE9uZSh7X2lkOiBvcHRJbi5zZW5kZXJ9KTtcbiAgICBsb2dTZW5kKFwib3B0SW4gZGF0YTpcIix7aW5kZXg6b3VyRGF0YS5pbmRleCwgb3B0SW46b3B0SW4scmVjaXBpZW50OnJlY2lwaWVudCxzZW5kZXI6IHNlbmRlcn0pO1xuXG5cbiAgICBjb25zdCBuYW1lSWQgPSBnZW5lcmF0ZU5hbWVJZCh7aWQ6IGRhdGEuaWQsaW5kZXg6b3B0SW4uaW5kZXgsbWFzdGVyRG9pOm9wdEluLm1hc3RlckRvaSB9KTtcbiAgICBjb25zdCBzaWduYXR1cmUgPSBnZXRTaWduYXR1cmUoe21lc3NhZ2U6IHJlY2lwaWVudC5lbWFpbCtzZW5kZXIuZW1haWwsIHByaXZhdGVLZXk6IHJlY2lwaWVudC5wcml2YXRlS2V5fSk7XG4gICAgbG9nU2VuZChcImdlbmVyYXRlZCBzaWduYXR1cmUgZnJvbSBlbWFpbCByZWNpcGllbnQgYW5kIHNlbmRlcjpcIixzaWduYXR1cmUpO1xuXG4gICAgbGV0IGRhdGFIYXNoID0gXCJcIjtcblxuICAgIGlmKG9wdEluLmRhdGEpIHtcbiAgICAgIGRhdGFIYXNoID0gZ2V0RGF0YUhhc2goe2RhdGE6IG9wdEluLmRhdGF9KTtcbiAgICAgIGxvZ1NlbmQoXCJnZW5lcmF0ZWQgZGF0YWhhc2ggZnJvbSBnaXZlbiBkYXRhOlwiLGRhdGFIYXNoKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJ0cyA9IHJlY2lwaWVudC5lbWFpbC5zcGxpdChcIkBcIik7XG4gICAgY29uc3QgZG9tYWluID0gcGFydHNbcGFydHMubGVuZ3RoLTFdO1xuICAgIGxvZ1NlbmQoXCJlbWFpbCBkb21haW4gZm9yIHB1YmxpY0tleSByZXF1ZXN0IGlzOlwiLGRvbWFpbik7XG4gICAgYWRkSW5zZXJ0QmxvY2tjaGFpbkpvYih7XG4gICAgICBuYW1lSWQ6IG5hbWVJZCxcbiAgICAgIHNpZ25hdHVyZTogc2lnbmF0dXJlLFxuICAgICAgZGF0YUhhc2g6IGRhdGFIYXNoLFxuICAgICAgZG9tYWluOiBkb21haW4sXG4gICAgICBzb2lEYXRlOiBvcHRJbi5jcmVhdGVkQXRcbiAgICB9KVxuICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdkb2ljaGFpbi53cml0ZVRvQmxvY2tjaGFpbi5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB3cml0ZVRvQmxvY2tjaGFpblxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyBIYXNoSWRzIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvZW1haWwtY29uZmlndXJhdGlvbi5qcyc7XG5cbmNvbnN0IERlY29kZURvaUhhc2hTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgaGFzaDoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9XG59KTtcblxuY29uc3QgZGVjb2RlRG9pSGFzaCA9IChoYXNoKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VySGFzaCA9IGhhc2g7XG4gICAgRGVjb2RlRG9pSGFzaFNjaGVtYS52YWxpZGF0ZShvdXJIYXNoKTtcbiAgICBjb25zdCBoZXggPSBIYXNoSWRzLmRlY29kZUhleChvdXJIYXNoLmhhc2gpO1xuICAgIGlmKCFoZXggfHwgaGV4ID09PSAnJykgdGhyb3cgXCJXcm9uZyBoYXNoXCI7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoQnVmZmVyKGhleCwgJ2hleCcpLnRvU3RyaW5nKCdhc2NpaScpKTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSBjYXRjaChleGNlcHRpb24pIHt0aHJvdyBcIldyb25nIGhhc2hcIjt9XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2VtYWlscy5kZWNvZGVfZG9pLWhhc2guZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZGVjb2RlRG9pSGFzaDtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHsgSGFzaElkcyB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2VtYWlsLWNvbmZpZ3VyYXRpb24uanMnO1xuXG5jb25zdCBHZW5lcmF0ZURvaUhhc2hTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgaWQ6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgdG9rZW46IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgcmVkaXJlY3Q6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfVxufSk7XG5cbmNvbnN0IGdlbmVyYXRlRG9pSGFzaCA9IChvcHRJbikgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ck9wdEluID0gb3B0SW47XG4gICAgR2VuZXJhdGVEb2lIYXNoU2NoZW1hLnZhbGlkYXRlKG91ck9wdEluKTtcblxuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBpZDogb3VyT3B0SW4uaWQsXG4gICAgICB0b2tlbjogb3VyT3B0SW4udG9rZW4sXG4gICAgICByZWRpcmVjdDogb3VyT3B0SW4ucmVkaXJlY3RcbiAgICB9KTtcblxuICAgIGNvbnN0IGhleCA9IEJ1ZmZlcihqc29uKS50b1N0cmluZygnaGV4Jyk7XG4gICAgY29uc3QgaGFzaCA9IEhhc2hJZHMuZW5jb2RlSGV4KGhleCk7XG4gICAgcmV0dXJuIGhhc2g7XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2VtYWlscy5nZW5lcmF0ZV9kb2ktaGFzaC5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZW5lcmF0ZURvaUhhc2g7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCB7bG9nQ29uZmlybX0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5cbmNvbnN0IFBMQUNFSE9MREVSX1JFR0VYID0gL1xcJHsoW1xcd10qKX0vZztcbmNvbnN0IFBhcnNlVGVtcGxhdGVTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgdGVtcGxhdGU6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gIH0sXG4gIGRhdGE6IHtcbiAgICB0eXBlOiBPYmplY3QsXG4gICAgYmxhY2tib3g6IHRydWVcbiAgfVxufSk7XG5cbmNvbnN0IHBhcnNlVGVtcGxhdGUgPSAoZGF0YSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgIC8vbG9nQ29uZmlybSgncGFyc2VUZW1wbGF0ZTonLG91ckRhdGEpO1xuXG4gICAgUGFyc2VUZW1wbGF0ZVNjaGVtYS52YWxpZGF0ZShvdXJEYXRhKTtcbiAgICBsb2dDb25maXJtKCdQYXJzZVRlbXBsYXRlU2NoZW1hIHZhbGlkYXRlZCcpO1xuXG4gICAgdmFyIF9tYXRjaDtcbiAgICB2YXIgdGVtcGxhdGUgPSBvdXJEYXRhLnRlbXBsYXRlO1xuICAgLy9sb2dDb25maXJtKCdkb2luZyBzb21lIHJlZ2V4IHdpdGggdGVtcGxhdGU6Jyx0ZW1wbGF0ZSk7XG5cbiAgICBkbyB7XG4gICAgICBfbWF0Y2ggPSBQTEFDRUhPTERFUl9SRUdFWC5leGVjKHRlbXBsYXRlKTtcbiAgICAgIGlmKF9tYXRjaCkgdGVtcGxhdGUgPSBfcmVwbGFjZVBsYWNlaG9sZGVyKHRlbXBsYXRlLCBfbWF0Y2gsIG91ckRhdGEuZGF0YVtfbWF0Y2hbMV1dKTtcbiAgICB9IHdoaWxlIChfbWF0Y2gpO1xuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignZW1haWxzLnBhcnNlVGVtcGxhdGUuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gX3JlcGxhY2VQbGFjZWhvbGRlcih0ZW1wbGF0ZSwgX21hdGNoLCByZXBsYWNlKSB7XG4gIHZhciByZXAgPSByZXBsYWNlO1xuICBpZihyZXBsYWNlID09PSB1bmRlZmluZWQpIHJlcCA9IFwiXCI7XG4gIHJldHVybiB0ZW1wbGF0ZS5zdWJzdHJpbmcoMCwgX21hdGNoLmluZGV4KStyZXArdGVtcGxhdGUuc3Vic3RyaW5nKF9tYXRjaC5pbmRleCtfbWF0Y2hbMF0ubGVuZ3RoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcGFyc2VUZW1wbGF0ZTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHtsb2dDb25maXJtfSBmcm9tIFwiLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvbG9nLWNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCB7IERPSV9NQUlMX0RFRkFVTFRfRU1BSUxfRlJPTSB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2VtYWlsLWNvbmZpZ3VyYXRpb24uanMnO1xuXG5jb25zdCBTZW5kTWFpbFNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBmcm9tOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBTaW1wbGVTY2hlbWEuUmVnRXguRW1haWxcbiAgfSxcbiAgdG86IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5FbWFpbFxuICB9LFxuICBzdWJqZWN0OiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICB9LFxuICBtZXNzYWdlOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICB9LFxuICByZXR1cm5QYXRoOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBTaW1wbGVTY2hlbWEuUmVnRXguRW1haWxcbiAgfVxufSk7XG5cbmNvbnN0IHNlbmRNYWlsID0gKG1haWwpID0+IHtcbiAgdHJ5IHtcblxuICAgIG1haWwuZnJvbSA9IERPSV9NQUlMX0RFRkFVTFRfRU1BSUxfRlJPTTtcblxuICAgIGNvbnN0IG91ck1haWwgPSBtYWlsO1xuICAgIGxvZ0NvbmZpcm0oJ3NlbmRpbmcgZW1haWwgd2l0aCBkYXRhOicse3RvOm1haWwudG8sIHN1YmplY3Q6bWFpbC5zdWJqZWN0fSk7XG4gICAgU2VuZE1haWxTY2hlbWEudmFsaWRhdGUob3VyTWFpbCk7XG4gICAgLy9UT0RPOiBUZXh0IGZhbGxiYWNrXG4gICAgRW1haWwuc2VuZCh7XG4gICAgICBmcm9tOiBtYWlsLmZyb20sXG4gICAgICB0bzogbWFpbC50byxcbiAgICAgIHN1YmplY3Q6IG1haWwuc3ViamVjdCxcbiAgICAgIGh0bWw6IG1haWwubWVzc2FnZSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ1JldHVybi1QYXRoJzogbWFpbC5yZXR1cm5QYXRoLFxuICAgICAgfVxuICAgIH0pO1xuXG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2VtYWlscy5zZW5kLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNlbmRNYWlsO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBKb2IgfSBmcm9tICdtZXRlb3IvdnNpdnNpOmpvYi1jb2xsZWN0aW9uJztcbmltcG9ydCB7IEJsb2NrY2hhaW5Kb2JzIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmVyL2FwaS9ibG9ja2NoYWluX2pvYnMuanMnO1xuXG5jb25zdCBhZGRDaGVja05ld1RyYW5zYWN0aW9uc0Jsb2NrY2hhaW5Kb2IgPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgam9iID0gbmV3IEpvYihCbG9ja2NoYWluSm9icywgJ2NoZWNrTmV3VHJhbnNhY3Rpb24nLCB7fSk7XG4gICAgam9iLnJldHJ5KHtyZXRyaWVzOiA2MCwgd2FpdDogMTUqMTAwMCB9KS5zYXZlKHtjYW5jZWxSZXBlYXRzOiB0cnVlfSk7XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2pvYnMuYWRkQ2hlY2tOZXdUcmFuc2FjdGlvbnNCbG9ja2NoYWluLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFkZENoZWNrTmV3VHJhbnNhY3Rpb25zQmxvY2tjaGFpbkpvYjtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHsgSm9iIH0gZnJvbSAnbWV0ZW9yL3ZzaXZzaTpqb2ItY29sbGVjdGlvbic7XG5pbXBvcnQgeyBEQXBwSm9icyB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZlci9hcGkvZGFwcF9qb2JzLmpzJztcblxuY29uc3QgQWRkRmV0Y2hEb2lNYWlsRGF0YUpvYlNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBuYW1lOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIGRvbWFpbjoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9XG59KTtcblxuY29uc3QgYWRkRmV0Y2hEb2lNYWlsRGF0YUpvYiA9IChkYXRhKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyRGF0YSA9IGRhdGE7XG4gICAgQWRkRmV0Y2hEb2lNYWlsRGF0YUpvYlNjaGVtYS52YWxpZGF0ZShvdXJEYXRhKTtcbiAgICBjb25zdCBqb2IgPSBuZXcgSm9iKERBcHBKb2JzLCAnZmV0Y2hEb2lNYWlsRGF0YScsIG91ckRhdGEpO1xuICAgIGpvYi5yZXRyeSh7cmV0cmllczogNSwgd2FpdDogMSoxMCoxMDAwIH0pLnNhdmUoKTsgLy9jaGVjayBldmVyeSAxMCBzZWNzIDUgdGltZXNcbiAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignam9icy5hZGRGZXRjaERvaU1haWxEYXRhLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFkZEZldGNoRG9pTWFpbERhdGFKb2I7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEpvYiB9IGZyb20gJ21ldGVvci92c2l2c2k6am9iLWNvbGxlY3Rpb24nO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHsgQmxvY2tjaGFpbkpvYnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2ZXIvYXBpL2Jsb2NrY2hhaW5fam9icy5qcyc7XG5cbmNvbnN0IEFkZEluc2VydEJsb2NrY2hhaW5Kb2JTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgbmFtZUlkOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIHNpZ25hdHVyZToge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9LFxuICBkYXRhSGFzaDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBvcHRpb25hbDp0cnVlXG4gIH0sXG4gIGRvbWFpbjoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9LFxuICBzb2lEYXRlOiB7XG4gICAgdHlwZTogRGF0ZVxuICB9XG59KTtcblxuY29uc3QgYWRkSW5zZXJ0QmxvY2tjaGFpbkpvYiA9IChlbnRyeSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckVudHJ5ID0gZW50cnk7XG4gICAgQWRkSW5zZXJ0QmxvY2tjaGFpbkpvYlNjaGVtYS52YWxpZGF0ZShvdXJFbnRyeSk7XG4gICAgY29uc3Qgam9iID0gbmV3IEpvYihCbG9ja2NoYWluSm9icywgJ2luc2VydCcsIG91ckVudHJ5KTtcbiAgICBqb2IucmV0cnkoe3JldHJpZXM6IDEwLCB3YWl0OiAzKjYwKjEwMDAgfSkuc2F2ZSgpOyAvL2NoZWNrIGV2ZXJ5IDEwc2VjIGZvciAxaFxuICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdqb2JzLmFkZEluc2VydEJsb2NrY2hhaW4uZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRkSW5zZXJ0QmxvY2tjaGFpbkpvYjtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgSm9iIH0gZnJvbSAnbWV0ZW9yL3ZzaXZzaTpqb2ItY29sbGVjdGlvbic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyBNYWlsSm9icyB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZlci9hcGkvbWFpbF9qb2JzLmpzJztcblxuY29uc3QgQWRkU2VuZE1haWxKb2JTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgLypmcm9tOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBTaW1wbGVTY2hlbWEuUmVnRXguRW1haWxcbiAgfSwqL1xuICB0bzoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICByZWdFeDogU2ltcGxlU2NoZW1hLlJlZ0V4LkVtYWlsXG4gIH0sXG4gIHN1YmplY3Q6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gIH0sXG4gIG1lc3NhZ2U6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gIH0sXG4gIHJldHVyblBhdGg6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5FbWFpbFxuICB9XG59KTtcblxuY29uc3QgYWRkU2VuZE1haWxKb2IgPSAobWFpbCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ck1haWwgPSBtYWlsO1xuICAgIEFkZFNlbmRNYWlsSm9iU2NoZW1hLnZhbGlkYXRlKG91ck1haWwpO1xuICAgIGNvbnN0IGpvYiA9IG5ldyBKb2IoTWFpbEpvYnMsICdzZW5kJywgb3VyTWFpbCk7XG4gICAgam9iLnJldHJ5KHtyZXRyaWVzOiA1LCB3YWl0OiA2MCoxMDAwIH0pLnNhdmUoKTtcbiAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignam9icy5hZGRTZW5kTWFpbC5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhZGRTZW5kTWFpbEpvYjtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHsgSm9iIH0gZnJvbSAnbWV0ZW9yL3ZzaXZzaTpqb2ItY29sbGVjdGlvbic7XG5pbXBvcnQgeyBCbG9ja2NoYWluSm9icyB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZlci9hcGkvYmxvY2tjaGFpbl9qb2JzLmpzJztcblxuY29uc3QgQWRkVXBkYXRlQmxvY2tjaGFpbkpvYlNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBuYW1lSWQ6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgdmFsdWU6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgZnJvbUhvc3RVcmw6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgaG9zdDoge1xuICAgICAgdHlwZTogU3RyaW5nXG4gIH1cbn0pO1xuXG5jb25zdCBhZGRVcGRhdGVCbG9ja2NoYWluSm9iID0gKGVudHJ5KSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyRW50cnkgPSBlbnRyeTtcbiAgICBBZGRVcGRhdGVCbG9ja2NoYWluSm9iU2NoZW1hLnZhbGlkYXRlKG91ckVudHJ5KTtcbiAgICBjb25zdCBqb2IgPSBuZXcgSm9iKEJsb2NrY2hhaW5Kb2JzLCAndXBkYXRlJywgb3VyRW50cnkpO1xuICAgIGpvYi5yZXRyeSh7cmV0cmllczogMzYwLCB3YWl0OiAxKjEwKjEwMDAgfSkuc2F2ZSgpO1xuICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdqb2JzLmFkZFVwZGF0ZUJsb2NrY2hhaW4uZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRkVXBkYXRlQmxvY2tjaGFpbkpvYjtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IGkxOG4gZnJvbSAnbWV0ZW9yL3VuaXZlcnNlOmkxOG4nO1xuXG4vLyB1bml2ZXJzZTppMThuIG9ubHkgYnVuZGxlcyB0aGUgZGVmYXVsdCBsYW5ndWFnZSBvbiB0aGUgY2xpZW50IHNpZGUuXG4vLyBUbyBnZXQgYSBsaXN0IG9mIGFsbCBhdmlhbGJsZSBsYW5ndWFnZXMgd2l0aCBhdCBsZWFzdCBvbmUgdHJhbnNsYXRpb24sXG4vLyBpMThuLmdldExhbmd1YWdlcygpIG11c3QgYmUgY2FsbGVkIHNlcnZlciBzaWRlLlxuY29uc3QgZ2V0TGFuZ3VhZ2VzID0gKCkgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBpMThuLmdldExhbmd1YWdlcygpO1xuICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdsYW5ndWFnZXMuZ2V0LmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGdldExhbmd1YWdlcztcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHsgTWV0YSB9IGZyb20gJy4uLy4uLy4uL2FwaS9tZXRhL21ldGEuanMnO1xuXG5jb25zdCBBZGRPclVwZGF0ZU1ldGFTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAga2V5OiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIHZhbHVlOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH1cbn0pO1xuXG5jb25zdCBhZGRPclVwZGF0ZU1ldGEgPSAoZGF0YSkgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ckRhdGEgPSBkYXRhO1xuICAgIEFkZE9yVXBkYXRlTWV0YVNjaGVtYS52YWxpZGF0ZShvdXJEYXRhKTtcbiAgICBjb25zdCBtZXRhID0gTWV0YS5maW5kT25lKHtrZXk6IG91ckRhdGEua2V5fSk7XG4gICAgaWYobWV0YSAhPT0gdW5kZWZpbmVkKSBNZXRhLnVwZGF0ZSh7X2lkIDogbWV0YS5faWR9LCB7JHNldDoge1xuICAgICAgdmFsdWU6IG91ckRhdGEudmFsdWVcbiAgICB9fSk7XG4gICAgZWxzZSByZXR1cm4gTWV0YS5pbnNlcnQoe1xuICAgICAga2V5OiBvdXJEYXRhLmtleSxcbiAgICAgIHZhbHVlOiBvdXJEYXRhLnZhbHVlXG4gICAgfSlcbiAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignbWV0YS5hZGRPclVwZGF0ZS5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhZGRPclVwZGF0ZU1ldGE7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCB7IE9wdElucyB9IGZyb20gJy4uLy4uLy4uL2FwaS9vcHQtaW5zL29wdC1pbnMuanMnO1xuXG5jb25zdCBBZGRPcHRJblNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBuYW1lOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH1cbn0pO1xuXG5jb25zdCBhZGRPcHRJbiA9IChvcHRJbikgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IG91ck9wdEluID0gb3B0SW47XG4gICAgQWRkT3B0SW5TY2hlbWEudmFsaWRhdGUob3VyT3B0SW4pO1xuICAgIGNvbnN0IG9wdElucyA9IE9wdElucy5maW5kKHtuYW1lSWQ6IG91ck9wdEluLm5hbWV9KS5mZXRjaCgpO1xuICAgIGlmKG9wdElucy5sZW5ndGggPiAwKSByZXR1cm4gb3B0SW5zWzBdLl9pZDtcbiAgICBjb25zdCBvcHRJbklkID0gT3B0SW5zLmluc2VydCh7XG4gICAgICBuYW1lSWQ6IG91ck9wdEluLm5hbWVcbiAgICB9KTtcbiAgICByZXR1cm4gb3B0SW5JZDtcbiAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignb3B0LWlucy5hZGQuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRkT3B0SW47XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCBhZGRSZWNpcGllbnQgZnJvbSAnLi4vcmVjaXBpZW50cy9hZGQuanMnO1xuaW1wb3J0IGFkZFNlbmRlciBmcm9tICcuLi9zZW5kZXJzL2FkZC5qcyc7XG5pbXBvcnQgeyBPcHRJbnMgfSBmcm9tICcuLi8uLi8uLi9hcGkvb3B0LWlucy9vcHQtaW5zLmpzJztcbmltcG9ydCB3cml0ZVRvQmxvY2tjaGFpbiBmcm9tICcuLi9kb2ljaGFpbi93cml0ZV90b19ibG9ja2NoYWluLmpzJztcbmltcG9ydCB7bG9nRXJyb3IsIGxvZ1NlbmR9IGZyb20gXCIuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9sb2ctY29uZmlndXJhdGlvblwiO1xuXG5cbmNvbnN0IEFkZE9wdEluU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gIHJlY2lwaWVudF9tYWlsOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlZ0V4OiBTaW1wbGVTY2hlbWEuUmVnRXguRW1haWxcbiAgfSxcbiAgc2VuZGVyX21haWw6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5FbWFpbFxuICB9LFxuICBkYXRhOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIG9wdGlvbmFsOiB0cnVlXG4gIH0sXG4gIG1hc3Rlcl9kb2k6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gIH0sXG4gIGluZGV4OiB7XG4gICAgICB0eXBlOiBTaW1wbGVTY2hlbWEuSW50ZWdlcixcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gIH0sXG4gIG93bmVySWQ6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5pZFxuICB9XG59KTtcblxuY29uc3QgYWRkT3B0SW4gPSAob3B0SW4pID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvdXJPcHRJbiA9IG9wdEluO1xuICAgIEFkZE9wdEluU2NoZW1hLnZhbGlkYXRlKG91ck9wdEluKTtcblxuICAgIGNvbnN0IHJlY2lwaWVudCA9IHtcbiAgICAgIGVtYWlsOiBvdXJPcHRJbi5yZWNpcGllbnRfbWFpbFxuICAgIH1cbiAgICBjb25zdCByZWNpcGllbnRJZCA9IGFkZFJlY2lwaWVudChyZWNpcGllbnQpO1xuICAgIGNvbnN0IHNlbmRlciA9IHtcbiAgICAgIGVtYWlsOiBvdXJPcHRJbi5zZW5kZXJfbWFpbFxuICAgIH1cbiAgICBjb25zdCBzZW5kZXJJZCA9IGFkZFNlbmRlcihzZW5kZXIpO1xuICAgIFxuICAgIGNvbnN0IG9wdElucyA9IE9wdElucy5maW5kKHtyZWNpcGllbnQ6IHJlY2lwaWVudElkLCBzZW5kZXI6IHNlbmRlcklkfSkuZmV0Y2goKTtcbiAgICBpZihvcHRJbnMubGVuZ3RoID4gMCkgcmV0dXJuIG9wdEluc1swXS5faWQ7IC8vVE9ETyB3aGVuIFNPSSBhbHJlYWR5IGV4aXN0cyByZXNlbmQgZW1haWw/XG5cbiAgICBpZihvdXJPcHRJbi5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIEpTT04ucGFyc2Uob3VyT3B0SW4uZGF0YSk7XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIGxvZ0Vycm9yKFwib3VyT3B0SW4uZGF0YTpcIixvdXJPcHRJbi5kYXRhKTtcbiAgICAgICAgdGhyb3cgXCJJbnZhbGlkIGRhdGEganNvbiBcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY29uc3Qgb3B0SW5JZCA9IE9wdElucy5pbnNlcnQoe1xuICAgICAgcmVjaXBpZW50OiByZWNpcGllbnRJZCxcbiAgICAgIHNlbmRlcjogc2VuZGVySWQsXG4gICAgICBpbmRleDogb3VyT3B0SW4uaW5kZXgsXG4gICAgICBtYXN0ZXJEb2kgOiBvdXJPcHRJbi5tYXN0ZXJfZG9pLFxuICAgICAgZGF0YTogb3VyT3B0SW4uZGF0YSxcbiAgICAgIG93bmVySWQ6IG91ck9wdEluLm93bmVySWRcbiAgICB9KTtcbiAgICBsb2dTZW5kKFwib3B0SW4gKGluZGV4OlwiK291ck9wdEluLmluZGV4K1wiIGFkZGVkIHRvIGxvY2FsIGRiIHdpdGggb3B0SW5JZFwiLG9wdEluSWQpO1xuXG4gICAgd3JpdGVUb0Jsb2NrY2hhaW4oe2lkOiBvcHRJbklkfSk7XG4gICAgcmV0dXJuIG9wdEluSWQ7XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ29wdC1pbnMuYWRkQW5kV3JpdGVUb0Jsb2NrY2hhaW4uZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRkT3B0SW47XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCB7IENPTkZJUk1fQ0xJRU5ULCBDT05GSVJNX0FERFJFU1MgfSBmcm9tICcuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kb2ljaGFpbi1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCB7IE9wdElucyB9IGZyb20gJy4uLy4uLy4uL2FwaS9vcHQtaW5zL29wdC1pbnMuanMnO1xuaW1wb3J0IHsgRG9pY2hhaW5FbnRyaWVzIH0gZnJvbSAnLi4vLi4vLi4vYXBpL2RvaWNoYWluL2VudHJpZXMuanMnO1xuaW1wb3J0IGRlY29kZURvaUhhc2ggZnJvbSAnLi4vZW1haWxzL2RlY29kZV9kb2ktaGFzaC5qcyc7XG5pbXBvcnQgeyBzaWduTWVzc2FnZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZlci9hcGkvZG9pY2hhaW4uanMnO1xuaW1wb3J0IGFkZFVwZGF0ZUJsb2NrY2hhaW5Kb2IgZnJvbSAnLi4vam9icy9hZGRfdXBkYXRlX2Jsb2NrY2hhaW4uanMnO1xuaW1wb3J0IHtsb2dDb25maXJtfSBmcm9tIFwiLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvbG9nLWNvbmZpZ3VyYXRpb25cIjtcblxuY29uc3QgQ29uZmlybU9wdEluU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gIGhvc3Q6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgaGFzaDoge1xuICAgIHR5cGU6IFN0cmluZ1xuICB9XG59KTtcblxuY29uc3QgY29uZmlybU9wdEluID0gKHJlcXVlc3QpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvdXJSZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICBDb25maXJtT3B0SW5TY2hlbWEudmFsaWRhdGUob3VyUmVxdWVzdCk7XG4gICAgY29uc3QgZGVjb2RlZCA9IGRlY29kZURvaUhhc2goe2hhc2g6IHJlcXVlc3QuaGFzaH0pO1xuICAgIGNvbnN0IG9wdEluID0gT3B0SW5zLmZpbmRPbmUoe19pZDogZGVjb2RlZC5pZH0pO1xuICAgIGlmKG9wdEluID09PSB1bmRlZmluZWQgfHwgb3B0SW4uY29uZmlybWF0aW9uVG9rZW4gIT09IGRlY29kZWQudG9rZW4pIHRocm93IFwiSW52YWxpZCBoYXNoXCI7XG4gICAgY29uc3QgY29uZmlybWVkQXQgPSBuZXcgRGF0ZSgpO1xuXG4gICAgT3B0SW5zLnVwZGF0ZSh7X2lkIDogb3B0SW4uX2lkfSx7JHNldDp7Y29uZmlybWVkQXQ6IGNvbmZpcm1lZEF0LCBjb25maXJtZWRCeTogb3VyUmVxdWVzdC5ob3N0fSwgJHVuc2V0OiB7Y29uZmlybWF0aW9uVG9rZW46IFwiXCJ9fSk7XG5cbiAgICAvL1RPRE8gaGVyZSBmaW5kIGFsbCBEb2ljaGFpbkVudHJpZXMgaW4gdGhlIGxvY2FsIGRhdGFiYXNlICBhbmQgYmxvY2tjaGFpbiB3aXRoIHRoZSBzYW1lIG1hc3RlckRvaVxuICAgIGNvbnN0IGVudHJpZXMgPSBEb2ljaGFpbkVudHJpZXMuZmluZCh7JG9yOiBbe25hbWU6IG9wdEluLm5hbWVJZH0sIHttYXN0ZXJEb2k6IG9wdEluLm5hbWVJZH1dfSk7XG4gICAgaWYoZW50cmllcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBcIkRvaWNoYWluIGVudHJ5L2VudHJpZXMgbm90IGZvdW5kXCI7XG5cbiAgICBlbnRyaWVzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICBsb2dDb25maXJtKCdjb25maXJtaW5nIERvaUNoYWluRW50cnk6JyxlbnRyeSk7XG5cbiAgICAgICAgY29uc3QgdmFsdWUgPSBKU09OLnBhcnNlKGVudHJ5LnZhbHVlKTtcbiAgICAgICAgbG9nQ29uZmlybSgnZ2V0U2lnbmF0dXJlIChvbmx5IG9mIHZhbHVlISknLCB2YWx1ZSk7XG5cbiAgICAgICAgY29uc3QgZG9pU2lnbmF0dXJlID0gc2lnbk1lc3NhZ2UoQ09ORklSTV9DTElFTlQsIENPTkZJUk1fQUREUkVTUywgdmFsdWUuc2lnbmF0dXJlKTtcbiAgICAgICAgbG9nQ29uZmlybSgnZ290IGRvaVNpZ25hdHVyZTonLGRvaVNpZ25hdHVyZSk7XG4gICAgICAgIGNvbnN0IGZyb21Ib3N0VXJsID0gdmFsdWUuZnJvbTtcblxuICAgICAgICBkZWxldGUgdmFsdWUuZnJvbTtcbiAgICAgICAgdmFsdWUuZG9pVGltZXN0YW1wID0gY29uZmlybWVkQXQudG9JU09TdHJpbmcoKTtcbiAgICAgICAgdmFsdWUuZG9pU2lnbmF0dXJlID0gZG9pU2lnbmF0dXJlO1xuICAgICAgICBjb25zdCBqc29uVmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIGxvZ0NvbmZpcm0oJ3VwZGF0aW5nIERvaWNoYWluIG5hbWVJZDonK29wdEluLm5hbWVJZCsnIHdpdGggdmFsdWU6Jyxqc29uVmFsdWUpO1xuXG4gICAgICAgIGFkZFVwZGF0ZUJsb2NrY2hhaW5Kb2Ioe1xuICAgICAgICAgICAgbmFtZUlkOiBlbnRyeS5uYW1lLFxuICAgICAgICAgICAgdmFsdWU6IGpzb25WYWx1ZSxcbiAgICAgICAgICAgIGZyb21Ib3N0VXJsOiBmcm9tSG9zdFVybCxcbiAgICAgICAgICAgIGhvc3Q6IG91clJlcXVlc3QuaG9zdFxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBsb2dDb25maXJtKCdyZWRpcmVjdGluZyB1c2VyIHRvOicsZGVjb2RlZC5yZWRpcmVjdCk7XG4gICAgcmV0dXJuIGRlY29kZWQucmVkaXJlY3Q7XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ29wdC1pbnMuY29uZmlybS5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maXJtT3B0SW5cbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHsgcmFuZG9tQnl0ZXMgfSBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgT3B0SW5zIH0gZnJvbSAnLi4vLi4vLi4vYXBpL29wdC1pbnMvb3B0LWlucy5qcyc7XG5cbmNvbnN0IEdlbmVyYXRlRG9pVG9rZW5TY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgaWQ6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfVxufSk7XG5cbmNvbnN0IGdlbmVyYXRlRG9pVG9rZW4gPSAob3B0SW4pID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvdXJPcHRJbiA9IG9wdEluO1xuICAgIEdlbmVyYXRlRG9pVG9rZW5TY2hlbWEudmFsaWRhdGUob3VyT3B0SW4pO1xuICAgIGNvbnN0IHRva2VuID0gcmFuZG9tQnl0ZXMoMzIpLnRvU3RyaW5nKCdoZXgnKTtcbiAgICBPcHRJbnMudXBkYXRlKHtfaWQgOiBvdXJPcHRJbi5pZH0seyRzZXQ6e2NvbmZpcm1hdGlvblRva2VuOiB0b2tlbn19KTtcbiAgICByZXR1cm4gdG9rZW47XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ29wdC1pbnMuZ2VuZXJhdGVfZG9pLXRva2VuLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGdlbmVyYXRlRG9pVG9rZW5cbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IHsgT3B0SW5zIH0gZnJvbSAnLi4vLi4vLi4vYXBpL29wdC1pbnMvb3B0LWlucy5qcyc7XG5pbXBvcnQgeyBSZWNpcGllbnRzIH0gZnJvbSAnLi4vLi4vLi4vYXBpL3JlY2lwaWVudHMvcmVjaXBpZW50cy5qcyc7XG5pbXBvcnQgdmVyaWZ5U2lnbmF0dXJlIGZyb20gJy4uL2RvaWNoYWluL3ZlcmlmeV9zaWduYXR1cmUuanMnO1xuaW1wb3J0IHtsb2dTZW5kfSBmcm9tIFwiLi4vLi4vLi4vc3RhcnR1cC9zZXJ2ZXIvbG9nLWNvbmZpZ3VyYXRpb25cIjtcbmltcG9ydCBnZXRQdWJsaWNLZXlBbmRBZGRyZXNzIGZyb20gXCIuLi9kb2ljaGFpbi9nZXRfcHVibGlja2V5X2FuZF9hZGRyZXNzX2J5X2RvbWFpblwiO1xuXG5jb25zdCBVcGRhdGVPcHRJblN0YXR1c1NjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBuYW1lSWQ6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgc2lnbmF0dXJlOiB7XG4gICAgdHlwZTogU3RyaW5nXG4gIH0sXG4gIGhvc3Q6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gIH1cbn0pO1xuXG5cbmNvbnN0IHVwZGF0ZU9wdEluU3RhdHVzID0gKGRhdGEpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvdXJEYXRhID0gZGF0YTtcbiAgICBsb2dTZW5kKCdjb25maXJtIGRBcHAgY29uZmlybXMgb3B0SW46JyxKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgVXBkYXRlT3B0SW5TdGF0dXNTY2hlbWEudmFsaWRhdGUob3VyRGF0YSk7XG4gICAgY29uc3Qgb3B0SW4gPSBPcHRJbnMuZmluZE9uZSh7bmFtZUlkOiBvdXJEYXRhLm5hbWVJZH0pO1xuICAgIGlmKG9wdEluID09PSB1bmRlZmluZWQpIHRocm93IFwiT3B0LUluIG5vdCBmb3VuZFwiO1xuICAgIGxvZ1NlbmQoJ2NvbmZpcm0gZEFwcCBjb25maXJtcyBvcHRJbjonLG91ckRhdGEubmFtZUlkKTtcblxuICAgIGNvbnN0IHJlY2lwaWVudCA9IFJlY2lwaWVudHMuZmluZE9uZSh7X2lkOiBvcHRJbi5yZWNpcGllbnR9KTtcbiAgICBpZihyZWNpcGllbnQgPT09IHVuZGVmaW5lZCkgdGhyb3cgXCJSZWNpcGllbnQgbm90IGZvdW5kXCI7XG4gICAgY29uc3QgcGFydHMgPSByZWNpcGllbnQuZW1haWwuc3BsaXQoXCJAXCIpO1xuICAgIGNvbnN0IGRvbWFpbiA9IHBhcnRzW3BhcnRzLmxlbmd0aC0xXTtcbiAgICBjb25zdCBwdWJsaWNLZXlBbmRBZGRyZXNzID0gZ2V0UHVibGljS2V5QW5kQWRkcmVzcyh7ZG9tYWluOmRvbWFpbn0pO1xuXG4gICAgLy9UT0RPIGdldHRpbmcgaW5mb3JtYXRpb24gZnJvbSBCb2IgdGhhdCBhIGNlcnRhaW4gbmFtZUlkIChET0kpIGdvdCBjb25maXJtZWQuXG4gICAgaWYoIXZlcmlmeVNpZ25hdHVyZSh7cHVibGljS2V5OiBwdWJsaWNLZXlBbmRBZGRyZXNzLnB1YmxpY0tleSwgZGF0YTogb3VyRGF0YS5uYW1lSWQsIHNpZ25hdHVyZTogb3VyRGF0YS5zaWduYXR1cmV9KSkge1xuICAgICAgdGhyb3cgXCJBY2Nlc3MgZGVuaWVkXCI7XG4gICAgfVxuICAgIGxvZ1NlbmQoJ3NpZ25hdHVyZSB2YWxpZCBmb3IgcHVibGljS2V5JywgcHVibGljS2V5QW5kQWRkcmVzcy5wdWJsaWNLZXkpO1xuXG4gICAgT3B0SW5zLnVwZGF0ZSh7X2lkIDogb3B0SW4uX2lkfSx7JHNldDp7Y29uZmlybWVkQXQ6IG5ldyBEYXRlKCksIGNvbmZpcm1lZEJ5OiBvdXJEYXRhLmhvc3R9fSk7XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2RhcHBzLnNlbmQudXBkYXRlT3B0SW5TdGF0dXMuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgdXBkYXRlT3B0SW5TdGF0dXM7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCB7IFZFUklGWV9DTElFTlQgfSBmcm9tICcuLi8uLi8uLi9zdGFydHVwL3NlcnZlci9kb2ljaGFpbi1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCB7IG5hbWVTaG93IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmVyL2FwaS9kb2ljaGFpbi5qcyc7XG5pbXBvcnQgZ2V0T3B0SW5Qcm92aWRlciBmcm9tICcuLi9kbnMvZ2V0X29wdC1pbi1wcm92aWRlci5qcyc7XG5pbXBvcnQgZ2V0T3B0SW5LZXkgZnJvbSAnLi4vZG5zL2dldF9vcHQtaW4ta2V5LmpzJztcbmltcG9ydCB2ZXJpZnlTaWduYXR1cmUgZnJvbSAnLi4vZG9pY2hhaW4vdmVyaWZ5X3NpZ25hdHVyZS5qcyc7XG5pbXBvcnQge2xvZ1ZlcmlmeX0gZnJvbSBcIi4uLy4uLy4uL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgZ2V0UHVibGljS2V5QW5kQWRkcmVzcyBmcm9tIFwiLi4vZG9pY2hhaW4vZ2V0X3B1YmxpY2tleV9hbmRfYWRkcmVzc19ieV9kb21haW5cIjtcblxuY29uc3QgVmVyaWZ5T3B0SW5TY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgcmVjaXBpZW50X21haWw6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5FbWFpbFxuICB9LFxuICBzZW5kZXJfbWFpbDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICByZWdFeDogU2ltcGxlU2NoZW1hLlJlZ0V4LkVtYWlsXG4gIH0sXG4gIG5hbWVfaWQ6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfSxcbiAgcmVjaXBpZW50X3B1YmxpY19rZXk6IHtcbiAgICB0eXBlOiBTdHJpbmdcbiAgfVxufSk7XG5cbmNvbnN0IHZlcmlmeU9wdEluID0gKGRhdGEpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBvdXJEYXRhID0gZGF0YTtcbiAgICBWZXJpZnlPcHRJblNjaGVtYS52YWxpZGF0ZShvdXJEYXRhKTtcbiAgICBjb25zdCBlbnRyeSA9IG5hbWVTaG93KFZFUklGWV9DTElFTlQsIG91ckRhdGEubmFtZV9pZCk7XG4gICAgaWYoZW50cnkgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGVudHJ5RGF0YSA9IEpTT04ucGFyc2UoZW50cnkudmFsdWUpO1xuICAgIGNvbnN0IGZpcnN0Q2hlY2sgPSB2ZXJpZnlTaWduYXR1cmUoe1xuICAgICAgZGF0YTogb3VyRGF0YS5yZWNpcGllbnRfbWFpbCtvdXJEYXRhLnNlbmRlcl9tYWlsLFxuICAgICAgc2lnbmF0dXJlOiBlbnRyeURhdGEuc2lnbmF0dXJlLFxuICAgICAgcHVibGljS2V5OiBvdXJEYXRhLnJlY2lwaWVudF9wdWJsaWNfa2V5XG4gICAgfSlcblxuICAgIGlmKCFmaXJzdENoZWNrKSByZXR1cm4ge2ZpcnN0Q2hlY2s6IGZhbHNlfTtcbiAgICBjb25zdCBwYXJ0cyA9IG91ckRhdGEucmVjaXBpZW50X21haWwuc3BsaXQoXCJAXCIpOyAvL1RPRE8gcHV0IHRoaXMgaW50byBnZXRQdWJsaWNLZXlBbmRBZGRyZXNzXG4gICAgY29uc3QgZG9tYWluID0gcGFydHNbcGFydHMubGVuZ3RoLTFdO1xuICAgIGNvbnN0IHB1YmxpY0tleUFuZEFkZHJlc3MgPSBnZXRQdWJsaWNLZXlBbmRBZGRyZXNzKHtkb21haW46IGRvbWFpbn0pO1xuXG4gICAgY29uc3Qgc2Vjb25kQ2hlY2sgPSB2ZXJpZnlTaWduYXR1cmUoe1xuICAgICAgZGF0YTogZW50cnlEYXRhLnNpZ25hdHVyZSxcbiAgICAgIHNpZ25hdHVyZTogZW50cnlEYXRhLmRvaVNpZ25hdHVyZSxcbiAgICAgIHB1YmxpY0tleTogcHVibGljS2V5QW5kQWRkcmVzcy5wdWJsaWNLZXlcbiAgICB9KVxuXG4gICAgaWYoIXNlY29uZENoZWNrKSByZXR1cm4ge3NlY29uZENoZWNrOiBmYWxzZX07XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ29wdC1pbnMudmVyaWZ5LmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHZlcmlmeU9wdEluXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCB7IFJlY2lwaWVudHMgfSBmcm9tICcuLi8uLi8uLi9hcGkvcmVjaXBpZW50cy9yZWNpcGllbnRzLmpzJztcbmltcG9ydCBnZXRLZXlQYWlyIGZyb20gJy4uL2RvaWNoYWluL2dldF9rZXktcGFpci5qcyc7XG5cbmNvbnN0IEFkZFJlY2lwaWVudFNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBlbWFpbDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICByZWdFeDogU2ltcGxlU2NoZW1hLlJlZ0V4LkVtYWlsXG4gIH1cbn0pO1xuXG5jb25zdCBhZGRSZWNpcGllbnQgPSAocmVjaXBpZW50KSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyUmVjaXBpZW50ID0gcmVjaXBpZW50O1xuICAgIEFkZFJlY2lwaWVudFNjaGVtYS52YWxpZGF0ZShvdXJSZWNpcGllbnQpO1xuICAgIGNvbnN0IHJlY2lwaWVudHMgPSBSZWNpcGllbnRzLmZpbmQoe2VtYWlsOiByZWNpcGllbnQuZW1haWx9KS5mZXRjaCgpO1xuICAgIGlmKHJlY2lwaWVudHMubGVuZ3RoID4gMCkgcmV0dXJuIHJlY2lwaWVudHNbMF0uX2lkO1xuICAgIGNvbnN0IGtleVBhaXIgPSBnZXRLZXlQYWlyKCk7XG4gICAgcmV0dXJuIFJlY2lwaWVudHMuaW5zZXJ0KHtcbiAgICAgIGVtYWlsOiBvdXJSZWNpcGllbnQuZW1haWwsXG4gICAgICBwcml2YXRlS2V5OiBrZXlQYWlyLnByaXZhdGVLZXksXG4gICAgICBwdWJsaWNLZXk6IGtleVBhaXIucHVibGljS2V5XG4gICAgfSlcbiAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcigncmVjaXBpZW50cy5hZGQuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRkUmVjaXBpZW50O1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG5pbXBvcnQgeyBTZW5kZXJzIH0gZnJvbSAnLi4vLi4vLi4vYXBpL3NlbmRlcnMvc2VuZGVycy5qcyc7XG5cbmNvbnN0IEFkZFNlbmRlclNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICBlbWFpbDoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICByZWdFeDogU2ltcGxlU2NoZW1hLlJlZ0V4LkVtYWlsXG4gIH1cbn0pO1xuXG5jb25zdCBhZGRTZW5kZXIgPSAoc2VuZGVyKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3VyU2VuZGVyID0gc2VuZGVyO1xuICAgIEFkZFNlbmRlclNjaGVtYS52YWxpZGF0ZShvdXJTZW5kZXIpO1xuICAgIGNvbnN0IHNlbmRlcnMgPSBTZW5kZXJzLmZpbmQoe2VtYWlsOiBzZW5kZXIuZW1haWx9KS5mZXRjaCgpO1xuICAgIGlmKHNlbmRlcnMubGVuZ3RoID4gMCkgcmV0dXJuIHNlbmRlcnNbMF0uX2lkO1xuICAgIHJldHVybiBTZW5kZXJzLmluc2VydCh7XG4gICAgICBlbWFpbDogb3VyU2VuZGVyLmVtYWlsXG4gICAgfSlcbiAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignc2VuZGVycy5hZGQuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgYWRkU2VuZGVyO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RlYnVnKCkge1xuICBpZihNZXRlb3Iuc2V0dGluZ3MgIT09IHVuZGVmaW5lZCAmJlxuICAgICBNZXRlb3Iuc2V0dGluZ3MuYXBwICE9PSB1bmRlZmluZWQgJiZcbiAgICAgTWV0ZW9yLnNldHRpbmdzLmFwcC5kZWJ1ZyAhPT0gdW5kZWZpbmVkKSByZXR1cm4gTWV0ZW9yLnNldHRpbmdzLmFwcC5kZWJ1Z1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZ3Rlc3QoKSB7XG4gIGlmKE1ldGVvci5zZXR0aW5ncyAhPT0gdW5kZWZpbmVkICYmXG4gICAgIE1ldGVvci5zZXR0aW5ncy5hcHAgIT09IHVuZGVmaW5lZCAmJlxuICAgICBNZXRlb3Iuc2V0dGluZ3MuYXBwLnJlZ3Rlc3QgIT09IHVuZGVmaW5lZCkgcmV0dXJuIE1ldGVvci5zZXR0aW5ncy5hcHAucmVndGVzdFxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Rlc3RuZXQoKSB7XG4gICAgaWYoTWV0ZW9yLnNldHRpbmdzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgTWV0ZW9yLnNldHRpbmdzLmFwcCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIE1ldGVvci5zZXR0aW5ncy5hcHAudGVzdG5ldCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gTWV0ZW9yLnNldHRpbmdzLmFwcC50ZXN0bmV0XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VXJsKCkge1xuICBpZihNZXRlb3Iuc2V0dGluZ3MgIT09IHVuZGVmaW5lZCAmJlxuICAgICBNZXRlb3Iuc2V0dGluZ3MuYXBwICE9PSB1bmRlZmluZWQgJiZcbiAgICAgTWV0ZW9yLnNldHRpbmdzLmFwcC5ob3N0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICBsZXQgcG9ydCA9IDMwMDA7XG4gICAgICAgaWYoTWV0ZW9yLnNldHRpbmdzLmFwcC5wb3J0ICE9PSB1bmRlZmluZWQpIHBvcnQgPSBNZXRlb3Iuc2V0dGluZ3MuYXBwLnBvcnRcbiAgICAgICByZXR1cm4gXCJodHRwOi8vXCIrTWV0ZW9yLnNldHRpbmdzLmFwcC5ob3N0K1wiOlwiK3BvcnQrXCIvXCI7XG4gIH1cbiAgcmV0dXJuIE1ldGVvci5hYnNvbHV0ZVVybCgpO1xufVxuIiwiZXhwb3J0IGNvbnN0IEZBTExCQUNLX1BST1ZJREVSID0gXCJkb2ljaGFpbi5vcmdcIjtcbiIsImltcG9ydCBuYW1lY29pbiBmcm9tICduYW1lY29pbic7XG5pbXBvcnQgeyBTRU5EX0FQUCwgQ09ORklSTV9BUFAsIFZFUklGWV9BUFAsIGlzQXBwVHlwZSB9IGZyb20gJy4vdHlwZS1jb25maWd1cmF0aW9uLmpzJztcblxudmFyIHNlbmRTZXR0aW5ncyA9IE1ldGVvci5zZXR0aW5ncy5zZW5kO1xudmFyIHNlbmRDbGllbnQgPSB1bmRlZmluZWQ7XG5pZihpc0FwcFR5cGUoU0VORF9BUFApKSB7XG4gIGlmKCFzZW5kU2V0dGluZ3MgfHwgIXNlbmRTZXR0aW5ncy5kb2ljaGFpbilcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFwiY29uZmlnLnNlbmQuZG9pY2hhaW5cIiwgXCJTZW5kIGFwcCBkb2ljaGFpbiBzZXR0aW5ncyBub3QgZm91bmRcIilcbiAgc2VuZENsaWVudCA9IGNyZWF0ZUNsaWVudChzZW5kU2V0dGluZ3MuZG9pY2hhaW4pO1xufVxuZXhwb3J0IGNvbnN0IFNFTkRfQ0xJRU5UID0gc2VuZENsaWVudDtcblxudmFyIGNvbmZpcm1TZXR0aW5ncyA9IE1ldGVvci5zZXR0aW5ncy5jb25maXJtO1xudmFyIGNvbmZpcm1DbGllbnQgPSB1bmRlZmluZWQ7XG52YXIgY29uZmlybUFkZHJlc3MgPSB1bmRlZmluZWQ7XG5pZihpc0FwcFR5cGUoQ09ORklSTV9BUFApKSB7XG4gIGlmKCFjb25maXJtU2V0dGluZ3MgfHwgIWNvbmZpcm1TZXR0aW5ncy5kb2ljaGFpbilcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFwiY29uZmlnLmNvbmZpcm0uZG9pY2hhaW5cIiwgXCJDb25maXJtIGFwcCBkb2ljaGFpbiBzZXR0aW5ncyBub3QgZm91bmRcIilcbiAgY29uZmlybUNsaWVudCA9IGNyZWF0ZUNsaWVudChjb25maXJtU2V0dGluZ3MuZG9pY2hhaW4pO1xuICBjb25maXJtQWRkcmVzcyA9IGNvbmZpcm1TZXR0aW5ncy5kb2ljaGFpbi5hZGRyZXNzO1xufVxuZXhwb3J0IGNvbnN0IENPTkZJUk1fQ0xJRU5UID0gY29uZmlybUNsaWVudDtcbmV4cG9ydCBjb25zdCBDT05GSVJNX0FERFJFU1MgPSBjb25maXJtQWRkcmVzcztcblxudmFyIHZlcmlmeVNldHRpbmdzID0gTWV0ZW9yLnNldHRpbmdzLnZlcmlmeTtcbnZhciB2ZXJpZnlDbGllbnQgPSB1bmRlZmluZWQ7XG5pZihpc0FwcFR5cGUoVkVSSUZZX0FQUCkpIHtcbiAgaWYoIXZlcmlmeVNldHRpbmdzIHx8ICF2ZXJpZnlTZXR0aW5ncy5kb2ljaGFpbilcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFwiY29uZmlnLnZlcmlmeS5kb2ljaGFpblwiLCBcIlZlcmlmeSBhcHAgZG9pY2hhaW4gc2V0dGluZ3Mgbm90IGZvdW5kXCIpXG4gIHZlcmlmeUNsaWVudCA9IGNyZWF0ZUNsaWVudCh2ZXJpZnlTZXR0aW5ncy5kb2ljaGFpbik7XG59XG5leHBvcnQgY29uc3QgVkVSSUZZX0NMSUVOVCA9IHZlcmlmeUNsaWVudDtcblxuZnVuY3Rpb24gY3JlYXRlQ2xpZW50KHNldHRpbmdzKSB7XG4gIHJldHVybiBuZXcgbmFtZWNvaW4uQ2xpZW50KHtcbiAgICBob3N0OiBzZXR0aW5ncy5ob3N0LFxuICAgIHBvcnQ6IHNldHRpbmdzLnBvcnQsXG4gICAgdXNlcjogc2V0dGluZ3MudXNlcm5hbWUsXG4gICAgcGFzczogc2V0dGluZ3MucGFzc3dvcmRcbiAgfSk7XG59XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFNFTkRfQVBQLCBDT05GSVJNX0FQUCwgaXNBcHBUeXBlIH0gZnJvbSAnLi90eXBlLWNvbmZpZ3VyYXRpb24uanMnO1xuaW1wb3J0IEhhc2hpZHMgZnJvbSAnaGFzaGlkcyc7XG4vL2NvbnN0IEhhc2hpZHMgPSByZXF1aXJlKCdoYXNoaWRzJykuZGVmYXVsdDtcbmltcG9ydCB7bG9nQ29uZmlybX0gZnJvbSBcIi4vbG9nLWNvbmZpZ3VyYXRpb25cIjtcblxuZXhwb3J0IGNvbnN0IEhhc2hJZHMgPSBuZXcgSGFzaGlkcygnMHh1Z21MZTdOeWVlNnZrMWlGODgoNkNtd3Bxb0c0aFEqLVQ3NHRqWXdeTzJ2T08oWGwtOTF3QTgqbkNnX2xYJCcpO1xuXG52YXIgc2VuZFNldHRpbmdzID0gTWV0ZW9yLnNldHRpbmdzLnNlbmQ7XG52YXIgZG9pTWFpbEZldGNoVXJsID0gdW5kZWZpbmVkO1xuXG5pZihpc0FwcFR5cGUoU0VORF9BUFApKSB7XG4gIGlmKCFzZW5kU2V0dGluZ3MgfHwgIXNlbmRTZXR0aW5ncy5kb2lNYWlsRmV0Y2hVcmwpXG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcImNvbmZpZy5zZW5kLmVtYWlsXCIsIFwiU2V0dGluZ3Mgbm90IGZvdW5kXCIpO1xuICBkb2lNYWlsRmV0Y2hVcmwgPSBzZW5kU2V0dGluZ3MuZG9pTWFpbEZldGNoVXJsO1xufVxuZXhwb3J0IGNvbnN0IERPSV9NQUlMX0ZFVENIX1VSTCA9IGRvaU1haWxGZXRjaFVybDtcblxudmFyIGRlZmF1bHRGcm9tID0gdW5kZWZpbmVkO1xuaWYoaXNBcHBUeXBlKENPTkZJUk1fQVBQKSkge1xuICB2YXIgY29uZmlybVNldHRpbmdzID0gTWV0ZW9yLnNldHRpbmdzLmNvbmZpcm07XG5cbiAgaWYoIWNvbmZpcm1TZXR0aW5ncyB8fCAhY29uZmlybVNldHRpbmdzLnNtdHApXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXCJjb25maWcuY29uZmlybS5zbXRwXCIsIFwiQ29uZmlybSBhcHAgZW1haWwgc210cCBzZXR0aW5ncyBub3QgZm91bmRcIilcblxuICBpZighY29uZmlybVNldHRpbmdzLnNtdHAuZGVmYXVsdEZyb20pXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXCJjb25maWcuY29uZmlybS5kZWZhdWx0RnJvbVwiLCBcIkNvbmZpcm0gYXBwIGVtYWlsIGRlZmF1bHRGcm9tIG5vdCBmb3VuZFwiKVxuXG4gIGRlZmF1bHRGcm9tICA9ICBjb25maXJtU2V0dGluZ3Muc210cC5kZWZhdWx0RnJvbTtcblxuICBsb2dDb25maXJtKCdzZW5kaW5nIHdpdGggZGVmYXVsdEZyb206JyxkZWZhdWx0RnJvbSk7XG5cbiAgTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuXG4gICBpZihjb25maXJtU2V0dGluZ3Muc210cC51c2VybmFtZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICBwcm9jZXNzLmVudi5NQUlMX1VSTCA9ICdzbXRwOi8vJyArXG4gICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChjb25maXJtU2V0dGluZ3Muc210cC5zZXJ2ZXIpICtcbiAgICAgICAgICAgJzonICtcbiAgICAgICAgICAgY29uZmlybVNldHRpbmdzLnNtdHAucG9ydDtcbiAgIH1lbHNle1xuICAgICAgIHByb2Nlc3MuZW52Lk1BSUxfVVJMID0gJ3NtdHA6Ly8nICtcbiAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpcm1TZXR0aW5ncy5zbXRwLnVzZXJuYW1lKSArXG4gICAgICAgICAgICc6JyArIGVuY29kZVVSSUNvbXBvbmVudChjb25maXJtU2V0dGluZ3Muc210cC5wYXNzd29yZCkgK1xuICAgICAgICAgICAnQCcgKyBlbmNvZGVVUklDb21wb25lbnQoY29uZmlybVNldHRpbmdzLnNtdHAuc2VydmVyKSArXG4gICAgICAgICAgICc6JyArXG4gICAgICAgICAgIGNvbmZpcm1TZXR0aW5ncy5zbXRwLnBvcnQ7XG4gICB9XG5cbiAgIGxvZ0NvbmZpcm0oJ3VzaW5nIE1BSUxfVVJMOicscHJvY2Vzcy5lbnYuTUFJTF9VUkwpO1xuXG4gICBpZihjb25maXJtU2V0dGluZ3Muc210cC5OT0RFX1RMU19SRUpFQ1RfVU5BVVRIT1JJWkVEIT09dW5kZWZpbmVkKVxuICAgICAgIHByb2Nlc3MuZW52Lk5PREVfVExTX1JFSkVDVF9VTkFVVEhPUklaRUQgPSBjb25maXJtU2V0dGluZ3Muc210cC5OT0RFX1RMU19SRUpFQ1RfVU5BVVRIT1JJWkVEOyAvLzBcbiAgfSk7XG59XG5leHBvcnQgY29uc3QgRE9JX01BSUxfREVGQVVMVF9FTUFJTF9GUk9NID0gZGVmYXVsdEZyb207XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJvbGVzIH0gZnJvbSAnbWV0ZW9yL2FsYW5uaW5nOnJvbGVzJztcblxuTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICBpZihNZXRlb3IudXNlcnMuZmluZCgpLmNvdW50KCkgPT09IDApIHtcbiAgICBjb25zdCBpZCA9IEFjY291bnRzLmNyZWF0ZVVzZXIoe1xuICAgICAgdXNlcm5hbWU6ICdhZG1pbicsXG4gICAgICBlbWFpbDogJ2FkbWluQHNlbmRlZmZlY3QuZGUnLFxuICAgICAgcGFzc3dvcmQ6ICdwYXNzd29yZCdcbiAgICB9KTtcbiAgICBSb2xlcy5hZGRVc2Vyc1RvUm9sZXMoaWQsICdhZG1pbicpO1xuICB9XG59KTtcbiIsImltcG9ydCAnLi9sb2ctY29uZmlndXJhdGlvbi5qcyc7XG5pbXBvcnQgJy4vZGFwcC1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCAnLi90eXBlLWNvbmZpZ3VyYXRpb24uanMnO1xuaW1wb3J0ICcuL2Rucy1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCAnLi9kb2ljaGFpbi1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCAnLi9maXh0dXJlcy5qcyc7XG5pbXBvcnQgJy4vcmVnaXN0ZXItYXBpLmpzJztcbmltcG9ydCAnLi91c2VyYWNjb3VudHMtY29uZmlndXJhdGlvbi5qcyc7XG5pbXBvcnQgJy4vc2VjdXJpdHkuanMnO1xuaW1wb3J0ICcuL2VtYWlsLWNvbmZpZ3VyYXRpb24uanMnO1xuaW1wb3J0ICcuL2pvYnMuanMnO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBNYWlsSm9icyB9IGZyb20gJy4uLy4uLy4uL3NlcnZlci9hcGkvbWFpbF9qb2JzLmpzJztcbmltcG9ydCB7IEJsb2NrY2hhaW5Kb2JzIH0gZnJvbSAnLi4vLi4vLi4vc2VydmVyL2FwaS9ibG9ja2NoYWluX2pvYnMuanMnO1xuaW1wb3J0IHsgREFwcEpvYnMgfSBmcm9tICcuLi8uLi8uLi9zZXJ2ZXIvYXBpL2RhcHBfam9icy5qcyc7XG5pbXBvcnQgeyBDT05GSVJNX0FQUCwgaXNBcHBUeXBlIH0gZnJvbSAnLi90eXBlLWNvbmZpZ3VyYXRpb24uanMnO1xuaW1wb3J0IGFkZENoZWNrTmV3VHJhbnNhY3Rpb25zQmxvY2tjaGFpbkpvYiBmcm9tICcuLi8uLi9tb2R1bGVzL3NlcnZlci9qb2JzL2FkZF9jaGVja19uZXdfdHJhbnNhY3Rpb25zLmpzJztcblxuTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICBNYWlsSm9icy5zdGFydEpvYlNlcnZlcigpO1xuICBCbG9ja2NoYWluSm9icy5zdGFydEpvYlNlcnZlcigpO1xuICBEQXBwSm9icy5zdGFydEpvYlNlcnZlcigpO1xuICBpZihpc0FwcFR5cGUoQ09ORklSTV9BUFApKSBhZGRDaGVja05ld1RyYW5zYWN0aW9uc0Jsb2NrY2hhaW5Kb2IoKTtcbn0pO1xuIiwiaW1wb3J0IHtpc0RlYnVnfSBmcm9tIFwiLi9kYXBwLWNvbmZpZ3VyYXRpb25cIjtcblxucmVxdWlyZSgnc2NyaWJlLWpzJykoKTtcblxuZXhwb3J0IGNvbnN0IGNvbnNvbGUgPSBwcm9jZXNzLmNvbnNvbGU7XG5leHBvcnQgY29uc3Qgc2VuZE1vZGVUYWdDb2xvciA9IHttc2cgOiAnc2VuZC1tb2RlJywgY29sb3JzIDogWyd5ZWxsb3cnLCAnaW52ZXJzZSddfTtcbmV4cG9ydCBjb25zdCBjb25maXJtTW9kZVRhZ0NvbG9yID0ge21zZyA6ICdjb25maXJtLW1vZGUnLCBjb2xvcnMgOiBbJ2JsdWUnLCAnaW52ZXJzZSddfTtcbmV4cG9ydCBjb25zdCB2ZXJpZnlNb2RlVGFnQ29sb3IgPSB7bXNnIDogJ3ZlcmlmeS1tb2RlJywgY29sb3JzIDogWydncmVlbicsICdpbnZlcnNlJ119O1xuZXhwb3J0IGNvbnN0IGJsb2NrY2hhaW5Nb2RlVGFnQ29sb3IgPSB7bXNnIDogJ2Jsb2NrY2hhaW4tbW9kZScsIGNvbG9ycyA6IFsnd2hpdGUnLCAnaW52ZXJzZSddfTtcbmV4cG9ydCBjb25zdCB0ZXN0aW5nTW9kZVRhZ0NvbG9yID0ge21zZyA6ICd0ZXN0aW5nLW1vZGUnLCBjb2xvcnMgOiBbJ29yYW5nZScsICdpbnZlcnNlJ119O1xuXG5leHBvcnQgZnVuY3Rpb24gbG9nU2VuZChtZXNzYWdlLHBhcmFtKSB7XG4gICAgaWYoaXNEZWJ1ZygpKSB7Y29uc29sZS50aW1lKCkudGFnKHNlbmRNb2RlVGFnQ29sb3IpLmxvZyhtZXNzYWdlLHBhcmFtP3BhcmFtOicnKTt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dDb25maXJtKG1lc3NhZ2UscGFyYW0pIHtcbiAgICBpZihpc0RlYnVnKCkpIHtjb25zb2xlLnRpbWUoKS50YWcoY29uZmlybU1vZGVUYWdDb2xvcikubG9nKG1lc3NhZ2UsIHBhcmFtP3BhcmFtOicnKTt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dWZXJpZnkobWVzc2FnZSwgcGFyYW0pIHtcbiAgICBpZihpc0RlYnVnKCkpIHtjb25zb2xlLnRpbWUoKS50YWcodmVyaWZ5TW9kZVRhZ0NvbG9yKS5sb2cobWVzc2FnZSwgcGFyYW0/cGFyYW06JycpO31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0Jsb2NrY2hhaW4obWVzc2FnZSwgcGFyYW0pIHtcbiAgICBpZihpc0RlYnVnKCkpe2NvbnNvbGUudGltZSgpLnRhZyhibG9ja2NoYWluTW9kZVRhZ0NvbG9yKS5sb2cobWVzc2FnZSwgcGFyYW0/cGFyYW06JycpO31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ01haW4obWVzc2FnZSwgcGFyYW0pIHtcbiAgICBpZihpc0RlYnVnKCkpe2NvbnNvbGUudGltZSgpLnRhZyhibG9ja2NoYWluTW9kZVRhZ0NvbG9yKS5sb2cobWVzc2FnZSwgcGFyYW0/cGFyYW06JycpO31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0Vycm9yKG1lc3NhZ2UsIHBhcmFtKSB7XG4gICAgaWYoaXNEZWJ1ZygpKXtjb25zb2xlLnRpbWUoKS50YWcoYmxvY2tjaGFpbk1vZGVUYWdDb2xvcikuZXJyb3IobWVzc2FnZSwgcGFyYW0/cGFyYW06JycpO31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRlc3RMb2dnaW5nKG1lc3NhZ2UsIHBhcmFtKSB7XG4gICAgaWYoaXNEZWJ1ZygpKXtjb25zb2xlLnRpbWUoKS50YWcodGVzdGluZ01vZGVUYWdDb2xvcikubG9nKG1lc3NhZ2UsIHBhcmFtP3BhcmFtOicnKTt9XG59IiwiaW1wb3J0ICcuLi8uLi9hcGkvbGFuZ3VhZ2VzL21ldGhvZHMuanMnO1xuaW1wb3J0ICcuLi8uLi9hcGkvZG9pY2hhaW4vbWV0aG9kcy5qcyc7XG5pbXBvcnQgJy4uLy4uL2FwaS9yZWNpcGllbnRzL3NlcnZlci9wdWJsaWNhdGlvbnMuanMnO1xuaW1wb3J0ICcuLi8uLi9hcGkvb3B0LWlucy9tZXRob2RzLmpzJztcbmltcG9ydCAnLi4vLi4vYXBpL29wdC1pbnMvc2VydmVyL3B1YmxpY2F0aW9ucy5qcyc7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEREUFJhdGVMaW1pdGVyIH0gZnJvbSAnbWV0ZW9yL2RkcC1yYXRlLWxpbWl0ZXInO1xuaW1wb3J0IHsgXyB9IGZyb20gJ21ldGVvci91bmRlcnNjb3JlJztcblxuLy8gRG9uJ3QgbGV0IHBlb3BsZSB3cml0ZSBhcmJpdHJhcnkgZGF0YSB0byB0aGVpciAncHJvZmlsZScgZmllbGQgZnJvbSB0aGUgY2xpZW50XG5NZXRlb3IudXNlcnMuZGVueSh7XG4gIHVwZGF0ZSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbn0pO1xuXG4vLyBHZXQgYSBsaXN0IG9mIGFsbCBhY2NvdW50cyBtZXRob2RzIGJ5IHJ1bm5pbmcgYE1ldGVvci5zZXJ2ZXIubWV0aG9kX2hhbmRsZXJzYCBpbiBtZXRlb3Igc2hlbGxcbmNvbnN0IEFVVEhfTUVUSE9EUyA9IFtcbiAgJ2xvZ2luJyxcbiAgJ2xvZ291dCcsXG4gICdsb2dvdXRPdGhlckNsaWVudHMnLFxuICAnZ2V0TmV3VG9rZW4nLFxuICAncmVtb3ZlT3RoZXJUb2tlbnMnLFxuICAnY29uZmlndXJlTG9naW5TZXJ2aWNlJyxcbiAgJ2NoYW5nZVBhc3N3b3JkJyxcbiAgJ2ZvcmdvdFBhc3N3b3JkJyxcbiAgJ3Jlc2V0UGFzc3dvcmQnLFxuICAndmVyaWZ5RW1haWwnLFxuICAnY3JlYXRlVXNlcicsXG4gICdBVFJlbW92ZVNlcnZpY2UnLFxuICAnQVRDcmVhdGVVc2VyU2VydmVyJyxcbiAgJ0FUUmVzZW5kVmVyaWZpY2F0aW9uRW1haWwnLFxuXTtcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAvLyBPbmx5IGFsbG93IDIgbG9naW4gYXR0ZW1wdHMgcGVyIGNvbm5lY3Rpb24gcGVyIDUgc2Vjb25kc1xuICBERFBSYXRlTGltaXRlci5hZGRSdWxlKHtcbiAgICBuYW1lKG5hbWUpIHtcbiAgICAgIHJldHVybiBfLmNvbnRhaW5zKEFVVEhfTUVUSE9EUywgbmFtZSk7XG4gICAgfSxcblxuICAgIC8vIFJhdGUgbGltaXQgcGVyIGNvbm5lY3Rpb24gSURcbiAgICBjb25uZWN0aW9uSWQoKSB7IHJldHVybiB0cnVlOyB9LFxuICB9LCAyLCA1MDAwKTtcbn1cbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuZXhwb3J0IGNvbnN0IFNFTkRfQVBQID0gXCJzZW5kXCI7XG5leHBvcnQgY29uc3QgQ09ORklSTV9BUFAgPSBcImNvbmZpcm1cIjtcbmV4cG9ydCBjb25zdCBWRVJJRllfQVBQID0gXCJ2ZXJpZnlcIjtcbmV4cG9ydCBmdW5jdGlvbiBpc0FwcFR5cGUodHlwZSkge1xuICBpZihNZXRlb3Iuc2V0dGluZ3MgPT09IHVuZGVmaW5lZCB8fCBNZXRlb3Iuc2V0dGluZ3MuYXBwID09PSB1bmRlZmluZWQpIHRocm93IFwiTm8gc2V0dGluZ3MgZm91bmQhXCJcbiAgY29uc3QgdHlwZXMgPSBNZXRlb3Iuc2V0dGluZ3MuYXBwLnR5cGVzO1xuICBpZih0eXBlcyAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdHlwZXMuaW5jbHVkZXModHlwZSk7XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsImltcG9ydCB7IEFjY291bnRzIH0gZnJvbSAnbWV0ZW9yL2FjY291bnRzLWJhc2UnO1xuQWNjb3VudHMuY29uZmlnKHtcbiAgICBzZW5kVmVyaWZpY2F0aW9uRW1haWw6IHRydWUsXG4gICAgZm9yYmlkQ2xpZW50QWNjb3VudENyZWF0aW9uOiB0cnVlXG59KTtcblxuXG5cbkFjY291bnRzLmVtYWlsVGVtcGxhdGVzLmZyb209J2RvaWNoYWluQGxlLXNwYWNlLmRlJzsiLCJpbXBvcnQgeyBBcGksIERPSV9XQUxMRVROT1RJRllfUk9VVEUsIERPSV9DT05GSVJNQVRJT05fUk9VVEUgfSBmcm9tICcuLi9yZXN0LmpzJztcbmltcG9ydCBjb25maXJtT3B0SW4gZnJvbSAnLi4vLi4vLi4vLi4vaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9vcHQtaW5zL2NvbmZpcm0uanMnXG5pbXBvcnQgY2hlY2tOZXdUcmFuc2FjdGlvbiBmcm9tIFwiLi4vLi4vLi4vLi4vaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kb2ljaGFpbi9jaGVja19uZXdfdHJhbnNhY3Rpb25zXCI7XG5pbXBvcnQge2xvZ0NvbmZpcm19IGZyb20gXCIuLi8uLi8uLi8uLi9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG4vL2Rva3Ugb2YgbWV0ZW9yLXJlc3RpdnVzIGh0dHBzOi8vZ2l0aHViLmNvbS9rYWhtYWxpL21ldGVvci1yZXN0aXZ1c1xuQXBpLmFkZFJvdXRlKERPSV9DT05GSVJNQVRJT05fUk9VVEUrJy86aGFzaCcsIHthdXRoUmVxdWlyZWQ6IGZhbHNlfSwge1xuICBnZXQ6IHtcbiAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgaGFzaCA9IHRoaXMudXJsUGFyYW1zLmhhc2g7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgaXAgPSB0aGlzLnJlcXVlc3QuaGVhZGVyc1sneC1mb3J3YXJkZWQtZm9yJ10gfHxcbiAgICAgICAgICB0aGlzLnJlcXVlc3QuY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzIHx8XG4gICAgICAgICAgdGhpcy5yZXF1ZXN0LnNvY2tldC5yZW1vdGVBZGRyZXNzIHx8XG4gICAgICAgICAgKHRoaXMucmVxdWVzdC5jb25uZWN0aW9uLnNvY2tldCA/IHRoaXMucmVxdWVzdC5jb25uZWN0aW9uLnNvY2tldC5yZW1vdGVBZGRyZXNzOiBudWxsKTtcblxuICAgICAgICAgIGlmKGlwLmluZGV4T2YoJywnKSE9LTEpaXA9aXAuc3Vic3RyaW5nKDAsaXAuaW5kZXhPZignLCcpKTtcblxuICAgICAgICAgIGxvZ0NvbmZpcm0oJ1JFU1Qgb3B0LWluL2NvbmZpcm0gOicse2hhc2g6aGFzaCwgaG9zdDppcH0pO1xuICAgICAgICAgIGNvbnN0IHJlZGlyZWN0ID0gY29uZmlybU9wdEluKHtob3N0OiBpcCwgaGFzaDogaGFzaH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdHVzQ29kZTogMzAzLFxuICAgICAgICAgIGhlYWRlcnM6IHsnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nLCAnTG9jYXRpb24nOiByZWRpcmVjdH0sXG4gICAgICAgICAgYm9keTogJ0xvY2F0aW9uOiAnK3JlZGlyZWN0XG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzQ29kZTogNTAwLCBib2R5OiB7c3RhdHVzOiAnZmFpbCcsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2V9fTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG5BcGkuYWRkUm91dGUoRE9JX1dBTExFVE5PVElGWV9ST1VURSwge1xuICAgIGdldDoge1xuICAgICAgICBhdXRoUmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy5xdWVyeVBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHR4aWQgPSBwYXJhbXMudHg7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2hlY2tOZXdUcmFuc2FjdGlvbih0eGlkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge3N0YXR1czogJ3N1Y2Nlc3MnLCAgZGF0YTondHhpZDonK3R4aWQrJyB3YXMgcmVhZCBmcm9tIGJsb2NrY2hhaW4nfTtcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge3N0YXR1czogJ2ZhaWwnLCBlcnJvcjogZXJyb3IubWVzc2FnZX07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcbiIsImltcG9ydCB7IEFwaSB9IGZyb20gJy4uL3Jlc3QuanMnO1xuQXBpLmFkZFJvdXRlKCdkZWJ1Zy9tYWlsJywge2F1dGhSZXF1aXJlZDogZmFsc2V9LCB7XG4gIGdldDoge1xuICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICBcImZyb21cIjogXCJub3JlcGx5QGRvaWNoYWluLm9yZ1wiLFxuICAgICAgICBcInN1YmplY3RcIjogXCJEb2ljaGFpbi5vcmcgTmV3c2xldHRlciBCZXN0w6R0aWd1bmdcIixcbiAgICAgICAgXCJyZWRpcmVjdFwiOiBcImh0dHBzOi8vd3d3LmRvaWNoYWluLm9yZy92aWVsZW4tZGFuay9cIixcbiAgICAgICAgXCJyZXR1cm5QYXRoXCI6IFwibm9yZXBseUBkb2ljaGFpbi5vcmdcIixcbiAgICAgICAgXCJjb250ZW50XCI6XCI8c3R5bGUgdHlwZT0ndGV4dC9jc3MnIG1lZGlhPSdzY3JlZW4nPlxcblwiICtcbiAgICAgICAgICAgIFwiKiB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRsaW5lLWhlaWdodDogaW5oZXJpdDtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcIi5FeHRlcm5hbENsYXNzICoge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0bGluZS1oZWlnaHQ6IDEwMCU7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJib2R5LCBwIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdG1hcmdpbjogMDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHBhZGRpbmc6IDA7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRtYXJnaW4tYm90dG9tOiAwO1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0LXdlYmtpdC10ZXh0LXNpemUtYWRqdXN0OiBub25lO1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0LW1zLXRleHQtc2l6ZS1hZGp1c3Q6IG5vbmU7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJpbWcge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0bGluZS1oZWlnaHQ6IDEwMCU7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRvdXRsaW5lOiBub25lO1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0dGV4dC1kZWNvcmF0aW9uOiBub25lO1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0LW1zLWludGVycG9sYXRpb24tbW9kZTogYmljdWJpYztcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcImEgaW1nIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGJvcmRlcjogbm9uZTtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcIiNiYWNrZ3JvdW5kVGFibGUge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0bWFyZ2luOiAwO1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0cGFkZGluZzogMDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJhLCBhOmxpbmssIC5uby1kZXRlY3QtbG9jYWwgYSwgLmFwcGxlTGlua3MgYSB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRjb2xvcjogIzU1NTVmZiAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0dGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCIuRXh0ZXJuYWxDbGFzcyB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRkaXNwbGF5OiBibG9jayAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0d2lkdGg6IDEwMCU7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCIuRXh0ZXJuYWxDbGFzcywgLkV4dGVybmFsQ2xhc3MgcCwgLkV4dGVybmFsQ2xhc3Mgc3BhbiwgLkV4dGVybmFsQ2xhc3MgZm9udCwgLkV4dGVybmFsQ2xhc3MgdGQsIC5FeHRlcm5hbENsYXNzIGRpdiB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRsaW5lLWhlaWdodDogaW5oZXJpdDtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRhYmxlIHRkIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRtc28tdGFibGUtbHNwYWNlOiAwcHQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRtc28tdGFibGUtcnNwYWNlOiAwcHQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJzdXAge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0cG9zaXRpb246IHJlbGF0aXZlO1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0dG9wOiA0cHg7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRsaW5lLWhlaWdodDogN3B4ICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRmb250LXNpemU6IDExcHggIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcIi5tb2JpbGVfbGluayBhW2hyZWZePSd0ZWwnXSwgLm1vYmlsZV9saW5rIGFbaHJlZl49J3NtcyddIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHRleHQtZGVjb3JhdGlvbjogZGVmYXVsdDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGNvbG9yOiAjNTU1NWZmICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRwb2ludGVyLWV2ZW50czogYXV0bztcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGN1cnNvcjogZGVmYXVsdDtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcIi5uby1kZXRlY3QgYSB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHR0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRjb2xvcjogIzU1NTVmZjtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHBvaW50ZXItZXZlbnRzOiBhdXRvO1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0Y3Vyc29yOiBkZWZhdWx0O1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwie1xcblwiICtcbiAgICAgICAgICAgIFwiY29sb3I6ICM1NTU1ZmY7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJzcGFuIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGNvbG9yOiBpbmhlcml0O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0Ym9yZGVyLWJvdHRvbTogbm9uZTtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInNwYW46aG92ZXIge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0YmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCIubm91bmRlcmxpbmUge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0dGV4dC1kZWNvcmF0aW9uOiBub25lICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJoMSwgaDIsIGgzIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdG1hcmdpbjogMDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHBhZGRpbmc6IDA7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJwIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdE1hcmdpbjogMHB4ICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJ0YWJsZVtjbGFzcz0nZW1haWwtcm9vdC13cmFwcGVyJ10ge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0d2lkdGg6IDYwMHB4ICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJib2R5IHtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcImJvZHkge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0bWluLXdpZHRoOiAyODBweDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAxMDAlO1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwidGRbY2xhc3M9J3BhdHRlcm4nXSAuYzExMnAyMHIge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0d2lkdGg6IDIwJTtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRkW2NsYXNzPSdwYXR0ZXJuJ10gLmMzMzZwNjByIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiA2MC4wMDAwMDAwMDAwMDAyNTYlO1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwiPC9zdHlsZT5cXG5cIiArXG4gICAgICAgICAgICBcIjxzdHlsZT5cXG5cIiArXG4gICAgICAgICAgICBcIkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTk5cHgpLCBvbmx5IHNjcmVlbiBhbmQgKG1heC1kZXZpY2Utd2lkdGg6IDU5OXB4KSwgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwMHB4KSwgb25seSBzY3JlZW4gYW5kIChtYXgtZGV2aWNlLXdpZHRoOiA0MDBweCkge1xcblwiICtcbiAgICAgICAgICAgIFwiLmVtYWlsLXJvb3Qtd3JhcHBlciB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHR3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwiLmZ1bGwtd2lkdGgge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0d2lkdGg6IDEwMCUgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGhlaWdodDogYXV0byAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0dGV4dC1hbGlnbjogY2VudGVyO1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwiLmZ1bGx3aWR0aGhhbGZsZWZ0IHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCIuZnVsbHdpZHRoaGFsZnJpZ2h0IHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCIuZnVsbHdpZHRoaGFsZmlubmVyIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRtYXJnaW46IDAgYXV0byAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0ZmxvYXQ6IG5vbmUgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdG1hcmdpbi1sZWZ0OiBhdXRvICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRtYXJnaW4tcmlnaHQ6IGF1dG8gIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGNsZWFyOiBib3RoICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCIuaGlkZSB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHR3aWR0aDogMHB4ICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRoZWlnaHQ6IDBweCAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0b3ZlcmZsb3c6IGhpZGRlbjtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcIi5kZXNrdG9wLWhpZGUge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0ZGlzcGxheTogYmxvY2sgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRoZWlnaHQ6IGF1dG8gIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdG92ZXJmbG93OiBoaWRkZW47XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRtYXgtaGVpZ2h0OiBpbmhlcml0ICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCIuYzExMnAyMHIge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0d2lkdGg6IDEwMCUgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGZsb2F0OiBub25lO1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwiLmMzMzZwNjByIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRmbG9hdDogbm9uZTtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcIjwvc3R5bGU+XFxuXCIgK1xuICAgICAgICAgICAgXCI8c3R5bGU+XFxuXCIgK1xuICAgICAgICAgICAgXCJAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDYwMHB4KSB7XFxuXCIgK1xuICAgICAgICAgICAgXCJ0ZFtjbGFzcz0ncGF0dGVybiddIC5jMTEycDIwciB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHR3aWR0aDogMTEycHggIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRkW2NsYXNzPSdwYXR0ZXJuJ10gLmMzMzZwNjByIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAzMzZweCAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCJAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDU5OXB4KSwgb25seSBzY3JlZW4gYW5kIChtYXgtZGV2aWNlLXdpZHRoOiA1OTlweCksIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MDBweCksIG9ubHkgc2NyZWVuIGFuZCAobWF4LWRldmljZS13aWR0aDogNDAwcHgpIHtcXG5cIiArXG4gICAgICAgICAgICBcInRhYmxlW2NsYXNzPSdlbWFpbC1yb290LXdyYXBwZXInXSB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHR3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwidGRbY2xhc3M9J3dyYXAnXSAuZnVsbC13aWR0aCB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHR3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0aGVpZ2h0OiBhdXRvICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJ0ZFtjbGFzcz0nd3JhcCddIC5mdWxsd2lkdGhoYWxmbGVmdCB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHR3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwidGRbY2xhc3M9J3dyYXAnXSAuZnVsbHdpZHRoaGFsZnJpZ2h0IHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJ0ZFtjbGFzcz0nd3JhcCddIC5mdWxsd2lkdGhoYWxmaW5uZXIge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0d2lkdGg6IDEwMCUgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdG1hcmdpbjogMCBhdXRvICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRmbG9hdDogbm9uZSAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0bWFyZ2luLWxlZnQ6IGF1dG8gIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdG1hcmdpbi1yaWdodDogYXV0byAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0Y2xlYXI6IGJvdGggIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRkW2NsYXNzPSd3cmFwJ10gLmhpZGUge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0ZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0d2lkdGg6IDBweDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGhlaWdodDogMHB4O1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0b3ZlcmZsb3c6IGhpZGRlbjtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRkW2NsYXNzPSdwYXR0ZXJuJ10gLmMxMTJwMjByIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJ0ZFtjbGFzcz0ncGF0dGVybiddIC5jMzM2cDYwciB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHR3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCJAbWVkaWEgeWFob28ge1xcblwiICtcbiAgICAgICAgICAgIFwidGFibGUge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0ZmxvYXQ6IG5vbmUgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGhlaWdodDogYXV0bztcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRhYmxlW2FsaWduPSdsZWZ0J10ge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0ZmxvYXQ6IGxlZnQgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRkW2FsaWduPSdsZWZ0J10ge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0ZmxvYXQ6IGxlZnQgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGhlaWdodDogYXV0bztcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRhYmxlW2FsaWduPSdjZW50ZXInXSB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRtYXJnaW46IDAgYXV0bztcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRkW2FsaWduPSdjZW50ZXInXSB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRtYXJnaW46IDAgYXV0bztcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGhlaWdodDogYXV0bztcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcInRhYmxlW2FsaWduPSdyaWdodCddIHtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdGZsb2F0OiByaWdodCAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwidGRbYWxpZ249J3JpZ2h0J10ge1xcblwiICtcbiAgICAgICAgICAgIFwiXFx0ZmxvYXQ6IHJpZ2h0ICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRoZWlnaHQ6IGF1dG87XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCI8L3N0eWxlPlxcblwiICtcbiAgICAgICAgICAgIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCI8IS0tW2lmIChndGUgSUUgNykgJiAodm1sKV0+XFxuXCIgK1xuICAgICAgICAgICAgXCI8c3R5bGUgdHlwZT0ndGV4dC9jc3MnPlxcblwiICtcbiAgICAgICAgICAgIFwiaHRtbCwgYm9keSB7bWFyZ2luOjAgIWltcG9ydGFudDsgcGFkZGluZzowcHggIWltcG9ydGFudDt9XFxuXCIgK1xuICAgICAgICAgICAgXCJpbWcuZnVsbC13aWR0aCB7IHBvc2l0aW9uOiByZWxhdGl2ZSAhaW1wb3J0YW50OyB9XFxuXCIgK1xuICAgICAgICAgICAgXCJcXG5cIiArXG4gICAgICAgICAgICBcIi5pbWcyNDB4MzAgeyB3aWR0aDogMjQwcHggIWltcG9ydGFudDsgaGVpZ2h0OiAzMHB4ICFpbXBvcnRhbnQ7fVxcblwiICtcbiAgICAgICAgICAgIFwiLmltZzIweDIwIHsgd2lkdGg6IDIwcHggIWltcG9ydGFudDsgaGVpZ2h0OiAyMHB4ICFpbXBvcnRhbnQ7fVxcblwiICtcbiAgICAgICAgICAgIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCI8L3N0eWxlPlxcblwiICtcbiAgICAgICAgICAgIFwiPCFbZW5kaWZdLS0+XFxuXCIgK1xuICAgICAgICAgICAgXCJcXG5cIiArXG4gICAgICAgICAgICBcIjwhLS1baWYgZ3RlIG1zbyA5XT5cXG5cIiArXG4gICAgICAgICAgICBcIjxzdHlsZSB0eXBlPSd0ZXh0L2Nzcyc+XFxuXCIgK1xuICAgICAgICAgICAgXCIubXNvLWZvbnQtZml4LWFyaWFsIHsgZm9udC1mYW1pbHk6IEFyaWFsLCBzYW5zLXNlcmlmO31cXG5cIiArXG4gICAgICAgICAgICBcIi5tc28tZm9udC1maXgtZ2VvcmdpYSB7IGZvbnQtZmFtaWx5OiBHZW9yZ2lhLCBzYW5zLXNlcmlmO31cXG5cIiArXG4gICAgICAgICAgICBcIi5tc28tZm9udC1maXgtdGFob21hIHsgZm9udC1mYW1pbHk6IFRhaG9tYSwgc2Fucy1zZXJpZjt9XFxuXCIgK1xuICAgICAgICAgICAgXCIubXNvLWZvbnQtZml4LXRpbWVzX25ld19yb21hbiB7IGZvbnQtZmFtaWx5OiAnVGltZXMgTmV3IFJvbWFuJywgc2Fucy1zZXJpZjt9XFxuXCIgK1xuICAgICAgICAgICAgXCIubXNvLWZvbnQtZml4LXRyZWJ1Y2hldF9tcyB7IGZvbnQtZmFtaWx5OiAnVHJlYnVjaGV0IE1TJywgc2Fucy1zZXJpZjt9XFxuXCIgK1xuICAgICAgICAgICAgXCIubXNvLWZvbnQtZml4LXZlcmRhbmEgeyBmb250LWZhbWlseTogVmVyZGFuYSwgc2Fucy1zZXJpZjt9XFxuXCIgK1xuICAgICAgICAgICAgXCI8L3N0eWxlPlxcblwiICtcbiAgICAgICAgICAgIFwiPCFbZW5kaWZdLS0+XFxuXCIgK1xuICAgICAgICAgICAgXCJcXG5cIiArXG4gICAgICAgICAgICBcIjwhLS1baWYgZ3RlIG1zbyA5XT5cXG5cIiArXG4gICAgICAgICAgICBcIjxzdHlsZSB0eXBlPSd0ZXh0L2Nzcyc+XFxuXCIgK1xuICAgICAgICAgICAgXCJ0YWJsZSwgdGQge1xcblwiICtcbiAgICAgICAgICAgIFwiYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZSAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwibXNvLXRhYmxlLWxzcGFjZTogMHB4ICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJtc28tdGFibGUtcnNwYWNlOiAwcHggIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcIlxcblwiICtcbiAgICAgICAgICAgIFwiLmVtYWlsLXJvb3Qtd3JhcHBlciB7IHdpZHRoIDYwMHB4ICFpbXBvcnRhbnQ7fVxcblwiICtcbiAgICAgICAgICAgIFwiLmltZ2xpbmsgeyBmb250LXNpemU6IDBweDsgfVxcblwiICtcbiAgICAgICAgICAgIFwiLmVkbV9idXR0b24geyBmb250LXNpemU6IDBweDsgfVxcblwiICtcbiAgICAgICAgICAgIFwiPC9zdHlsZT5cXG5cIiArXG4gICAgICAgICAgICBcIjwhW2VuZGlmXS0tPlxcblwiICtcbiAgICAgICAgICAgIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCI8IS0tW2lmIGd0ZSBtc28gMTVdPlxcblwiICtcbiAgICAgICAgICAgIFwiPHN0eWxlIHR5cGU9J3RleHQvY3NzJz5cXG5cIiArXG4gICAgICAgICAgICBcInRhYmxlIHtcXG5cIiArXG4gICAgICAgICAgICBcImZvbnQtc2l6ZTowcHg7XFxuXCIgK1xuICAgICAgICAgICAgXCJtc28tbWFyZ2luLXRvcC1hbHQ6MHB4O1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCIuZnVsbHdpZHRoaGFsZmxlZnQge1xcblwiICtcbiAgICAgICAgICAgIFwid2lkdGg6IDQ5JSAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwiZmxvYXQ6bGVmdCAhaW1wb3J0YW50O1xcblwiICtcbiAgICAgICAgICAgIFwifVxcblwiICtcbiAgICAgICAgICAgIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCIuZnVsbHdpZHRoaGFsZnJpZ2h0IHtcXG5cIiArXG4gICAgICAgICAgICBcIndpZHRoOiA1MCUgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcImZsb2F0OnJpZ2h0ICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJ9XFxuXCIgK1xuICAgICAgICAgICAgXCI8L3N0eWxlPlxcblwiICtcbiAgICAgICAgICAgIFwiPCFbZW5kaWZdLS0+XFxuXCIgK1xuICAgICAgICAgICAgXCI8c3R5bGUgdHlwZT0ndGV4dC9jc3MnIG1lZGlhPScocG9pbnRlcikgYW5kIChtaW4tY29sb3ItaW5kZXg6MCknPlxcblwiICtcbiAgICAgICAgICAgIFwiaHRtbCwgYm9keSB7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRiYWNrZ3JvdW5kLWltYWdlOiBub25lICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRiYWNrZ3JvdW5kLWNvbG9yOiAjZWJlYmViICFpbXBvcnRhbnQ7XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRtYXJnaW46IDAgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHBhZGRpbmc6IDAgIWltcG9ydGFudDtcXG5cIiArXG4gICAgICAgICAgICBcIn1cXG5cIiArXG4gICAgICAgICAgICBcIjwvc3R5bGU+XFxuXCIgK1xuICAgICAgICAgICAgXCI8L2hlYWQ+XFxuXCIgK1xuICAgICAgICAgICAgXCI8Ym9keSBsZWZ0bWFyZ2luPScwJyBtYXJnaW53aWR0aD0nMCcgdG9wbWFyZ2luPScwJyBtYXJnaW5oZWlnaHQ9JzAnIG9mZnNldD0nMCcgYmFja2dyb3VuZD1cXFwiXFxcIiBiZ2NvbG9yPScjZWJlYmViJyBzdHlsZT0nZm9udC1mYW1pbHk6QXJpYWwsIHNhbnMtc2VyaWY7IGZvbnQtc2l6ZTowcHg7bWFyZ2luOjA7cGFkZGluZzowOyAnPlxcblwiICtcbiAgICAgICAgICAgIFwiPCEtLVtpZiB0XT48IVtlbmRpZl0tLT48IS0tW2lmIHRdPjwhW2VuZGlmXS0tPjwhLS1baWYgdF0+PCFbZW5kaWZdLS0+PCEtLVtpZiB0XT48IVtlbmRpZl0tLT48IS0tW2lmIHRdPjwhW2VuZGlmXS0tPjwhLS1baWYgdF0+PCFbZW5kaWZdLS0+XFxuXCIgK1xuICAgICAgICAgICAgXCI8dGFibGUgYWxpZ249J2NlbnRlcicgYm9yZGVyPScwJyBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIGJhY2tncm91bmQ9XFxcIlxcXCIgIGhlaWdodD0nMTAwJScgd2lkdGg9JzEwMCUnIGlkPSdiYWNrZ3JvdW5kVGFibGUnPlxcblwiICtcbiAgICAgICAgICAgIFwiICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgPHRkIGNsYXNzPSd3cmFwJyBhbGlnbj0nY2VudGVyJyB2YWxpZ249J3RvcCcgd2lkdGg9JzEwMCUnPlxcblwiICtcbiAgICAgICAgICAgIFwiXFx0XFx0PGNlbnRlcj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgPCEtLSBjb250ZW50IC0tPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICBcXHQ8ZGl2IHN0eWxlPSdwYWRkaW5nOiAwcHg7Jz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgXFx0ICA8dGFibGUgY2VsbHBhZGRpbmc9JzAnIGNlbGxzcGFjaW5nPScwJyBib3JkZXI9JzAnIHdpZHRoPScxMDAlJyBiZ2NvbG9yPScjZWJlYmViJz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgXFx0XFx0IDx0cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgIFxcdFxcdCAgPHRkIHZhbGlnbj0ndG9wJyBzdHlsZT0ncGFkZGluZzogMHB4Oyc+XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRcXHRcXHRcXHRcXHRcXHQgIDx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIHdpZHRoPSc2MDAnIGFsaWduPSdjZW50ZXInIHN0eWxlPSdtYXgtd2lkdGg6IDYwMHB4O21pbi13aWR0aDogMjQwcHg7bWFyZ2luOiAwIGF1dG87JyBjbGFzcz0nZW1haWwtcm9vdC13cmFwcGVyJz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgXFx0XFx0IFxcdFxcdDx0cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICBcXHRcXHRcXHRcXHRcXHQgPHRkIHZhbGlnbj0ndG9wJyBzdHlsZT0ncGFkZGluZzogMHB4Oyc+XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHQgXFx0XFx0PHRhYmxlIGNlbGxwYWRkaW5nPScwJyBjZWxsc3BhY2luZz0nMCcgYm9yZGVyPScwJyB3aWR0aD0nMTAwJScgYmdjb2xvcj0nI0ZGRkZGRicgc3R5bGU9J2JvcmRlcjogMHB4IG5vbmU7YmFja2dyb3VuZC1jb2xvcjogI0ZGRkZGRjsnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICBcXHRcXHRcXHRcXHRcXHRcXHQgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICBcXHRcXHRcXHQgIFxcdFxcdFxcdFxcdCA8dGQgdmFsaWduPSd0b3AnIHN0eWxlPSdwYWRkaW5nLXRvcDogMzBweDtwYWRkaW5nLXJpZ2h0OiAyMHB4O3BhZGRpbmctYm90dG9tOiAzNXB4O3BhZGRpbmctbGVmdDogMjBweDsnPlxcblwiICtcbiAgICAgICAgICAgIFwiXFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0ICAgXFx0XFx0XFx0XFx0XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHQ8dGFibGUgY2VsbHBhZGRpbmc9JzAnXFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRjZWxsc3BhY2luZz0nMCcgYm9yZGVyPScwJyBhbGlnbj0nY2VudGVyJyB3aWR0aD0nMjQwJyAgc3R5bGU9J2JvcmRlcjogMHB4IG5vbmU7aGVpZ2h0OiBhdXRvOycgY2xhc3M9J2Z1bGwtd2lkdGgnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXHQgXFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0PHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHQ8dGQgdmFsaWduPSd0b3AnIHN0eWxlPSdwYWRkaW5nOiAwcHg7Jz48aW1nIHNyYz0naHR0cHM6Ly9zZjI2LnNlbmRzZnguY29tL2FkbWluL3RlbXAvdXNlci8xNy9kb2ljaGFpbl8xMDBoLnBuZycgd2lkdGg9JzI0MCcgaGVpZ2h0PSczMCcgYWx0PVxcXCJcXFwiIGJvcmRlcj0nMCcgc3R5bGU9J2Rpc3BsYXk6IGJsb2NrO3dpZHRoOiAxMDAlO2hlaWdodDogYXV0bzsnIGNsYXNzPSdmdWxsLXdpZHRoIGltZzI0MHgzMCcgLz48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXHQgXFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0PC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHQ8L3RhYmxlPlxcblwiICtcbiAgICAgICAgICAgIFwiXFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0XFxuXCIgK1xuICAgICAgICAgICAgXCJcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHQ8L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgIFxcdFxcdCAgXFx0XFx0XFx0XFx0PC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICBcXHRcXHRcXHRcXHRcXHQ8L3RhYmxlPlxcblwiICtcbiAgICAgICAgICAgIFwiXFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0IFxcblwiICtcbiAgICAgICAgICAgIFwiXFx0XFx0XFx0XFx0XFx0XFx0XFx0XFx0IFxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIGJvcmRlcj0nMCcgd2lkdGg9JzEwMCUnIGJnY29sb3I9JyMwMDcxYWEnIHN0eWxlPSdib3JkZXI6IDBweCBub25lO2JhY2tncm91bmQtY29sb3I6ICMwMDcxYWE7YmFja2dyb3VuZC1pbWFnZTogdXJsKCdodHRwczovL3NmMjYuc2VuZHNmeC5jb20vYWRtaW4vdGVtcC91c2VyLzE3L2JsdWUtYmcuanBnJyk7YmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdCA7YmFja2dyb3VuZC1wb3NpdGlvbjogY2VudGVyOyc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB2YWxpZ249J3RvcCcgc3R5bGU9J3BhZGRpbmctdG9wOiA0MHB4O3BhZGRpbmctcmlnaHQ6IDIwcHg7cGFkZGluZy1ib3R0b206IDQ1cHg7cGFkZGluZy1sZWZ0OiAyMHB4Oyc+PHRhYmxlIGNlbGxwYWRkaW5nPScwJyBjZWxsc3BhY2luZz0nMCcgd2lkdGg9JzEwMCUnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9J3BhZGRpbmc6IDBweDsnIGNsYXNzPSdwYXR0ZXJuJz48dGFibGUgY2VsbHBhZGRpbmc9JzAnIGNlbGxzcGFjaW5nPScwJyBib3JkZXI9JzAnIHdpZHRoPScxMDAlJz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHZhbGlnbj0ndG9wJyBzdHlsZT0ncGFkZGluZy1ib3R0b206IDEwcHg7Jz48ZGl2IHN0eWxlPSd0ZXh0LWFsaWduOiBsZWZ0O2ZvbnQtZmFtaWx5OiBhcmlhbDtmb250LXNpemU6IDIwcHg7Y29sb3I6ICNmZmZmZmY7bGluZS1oZWlnaHQ6IDMwcHg7bXNvLWxpbmUtaGVpZ2h0OiBleGFjdGx5O21zby10ZXh0LXJhaXNlOiA1cHg7Jz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwXFxuXCIgK1xuICAgICAgICAgICAgXCJzdHlsZT0ncGFkZGluZzogMDsgbWFyZ2luOiAwO3RleHQtYWxpZ246IGNlbnRlcjsnPkJpdHRlIGJlc3TDpHRpZ2VuIFNpZSBJaHJlIEFubWVsZHVuZzwvcD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIGJvcmRlcj0nMCcgd2lkdGg9JzEwMCUnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgdmFsaWduPSd0b3AnIHN0eWxlPSdwYWRkaW5nOiAwO21zby1jZWxsc3BhY2luZzogMGluOyc+PHRhYmxlIGNlbGxwYWRkaW5nPScwJyBjZWxsc3BhY2luZz0nMCcgYm9yZGVyPScwJyBhbGlnbj0nbGVmdCcgd2lkdGg9JzExMicgIHN0eWxlPSdmbG9hdDogbGVmdDsnIGNsYXNzPSdjMTEycDIwcic+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB2YWxpZ249J3RvcCcgc3R5bGU9J3BhZGRpbmc6IDBweDsnPjx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIGJvcmRlcj0nMCcgd2lkdGg9JzEwMCUnIHN0eWxlPSdib3JkZXI6IDBweCBub25lOycgY2xhc3M9J2hpZGUnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgdmFsaWduPSd0b3AnIHN0eWxlPSdwYWRkaW5nOiAwcHg7Jz48dGFibGUgY2VsbHBhZGRpbmc9JzAnIGNlbGxzcGFjaW5nPScwJyB3aWR0aD0nMTAwJSc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT0ncGFkZGluZzogMHB4Oyc+PHRhYmxlIGNlbGxwYWRkaW5nPScwJyBjZWxsc3BhY2luZz0nMCcgd2lkdGg9JzEwMCUnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgYWxpZ249J2NlbnRlcicgc3R5bGU9J3BhZGRpbmc6IDBweDsnPjx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIGJvcmRlcj0nMCcgYWxpZ249J2NlbnRlcicgd2lkdGg9JzIwJyAgc3R5bGU9J2JvcmRlcjogMHB4IG5vbmU7aGVpZ2h0OiBhdXRvOyc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB2YWxpZ249J3RvcCcgc3R5bGU9J3BhZGRpbmc6IDBweDsnPjxpbWdcXG5cIiArXG4gICAgICAgICAgICBcInNyYz0naHR0cHM6Ly9zZjI2LnNlbmRzZnguY29tL2FkbWluL3RlbXAvdXNlci8xNy9pbWdfODk4MzczMTgucG5nJyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIGFsdD1cXFwiXFxcIiBib3JkZXI9JzAnIHN0eWxlPSdkaXNwbGF5OiBibG9jazsnIGNsYXNzPSdpbWcyMHgyMCcgLz48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPjwvdGQ+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPjwvdGQ+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLVtpZiBndGUgbXNvIDldPjwvdGQ+PHRkIHZhbGlnbj0ndG9wJyBzdHlsZT0ncGFkZGluZzowOyc+PCFbZW5kaWZdLS0+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNlbGxwYWRkaW5nPScwJyBjZWxsc3BhY2luZz0nMCcgYm9yZGVyPScwJyBhbGlnbj0nbGVmdCcgd2lkdGg9JzMzNicgIHN0eWxlPSdmbG9hdDogbGVmdDsnIGNsYXNzPSdjMzM2cDYwcic+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB2YWxpZ249J3RvcCcgc3R5bGU9J3BhZGRpbmc6IDBweDsnPjx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIGJvcmRlcj0nMCcgd2lkdGg9JzEwMCUnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgdmFsaWduPSd0b3AnIHN0eWxlPSdwYWRkaW5nLWJvdHRvbTogMzBweDsnPjx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIHdpZHRoPScxMDAlJz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPSdwYWRkaW5nOiAwcHg7Jz48dGFibGUgY2VsbHBhZGRpbmc9JzAnIGNlbGxzcGFjaW5nPScwJyBib3JkZXI9JzAnIHdpZHRoPScxMDAlJyBzdHlsZT0nYm9yZGVyLXRvcDogMnB4IHNvbGlkICNmZmZmZmY7Jz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHZhbGlnbj0ndG9wJz48dGFibGUgY2VsbHBhZGRpbmc9JzAnIGNlbGxzcGFjaW5nPScwJyB3aWR0aD0nMTAwJSc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT0ncGFkZGluZzogMHB4Oyc+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPjwvdGQ+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS1baWYgZ3RlIG1zbyA5XT48L3RkPjx0ZCB2YWxpZ249J3RvcCcgc3R5bGU9J3BhZGRpbmc6MDsnPjwhW2VuZGlmXS0tPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIGJvcmRlcj0nMCcgYWxpZ249J2xlZnQnIHdpZHRoPScxMTInICBzdHlsZT0nZmxvYXQ6IGxlZnQ7JyBjbGFzcz0nYzExMnAyMHInPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgdmFsaWduPSd0b3AnIHN0eWxlPSdwYWRkaW5nOiAwcHg7Jz48dGFibGUgY2VsbHBhZGRpbmc9JzAnIGNlbGxzcGFjaW5nPScwJyBib3JkZXI9JzAnIHdpZHRoPScxMDAlJyBzdHlsZT0nYm9yZGVyOiAwcHggbm9uZTsnIGNsYXNzPSdoaWRlJz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHZhbGlnbj0ndG9wJyBzdHlsZT0ncGFkZGluZzogMHB4Oyc+PHRhYmxlIGNlbGxwYWRkaW5nPScwJyBjZWxsc3BhY2luZz0nMCcgd2lkdGg9JzEwMCUnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9J3BhZGRpbmc6IDBweDsnPjx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIHdpZHRoPScxMDAlJz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGFsaWduPSdjZW50ZXInIHN0eWxlPSdwYWRkaW5nOiAwcHg7Jz48dGFibGUgY2VsbHBhZGRpbmc9JzAnIGNlbGxzcGFjaW5nPScwJyBib3JkZXI9JzAnIGFsaWduPSdjZW50ZXInIHdpZHRoPScyMCcgIHN0eWxlPSdib3JkZXI6IDBweCBub25lO2hlaWdodDogYXV0bzsnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgdmFsaWduPSd0b3AnIHN0eWxlPSdwYWRkaW5nOiAwcHg7Jz48aW1nIHNyYz0naHR0cHM6Ly9zZjI2LnNlbmRzZnguY29tL2FkbWluL3RlbXAvdXNlci8xNy9pbWdfODk4MzczMTgucG5nJyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIGFsdD1cXFwiXFxcIiBib3JkZXI9JzAnIHN0eWxlPSdkaXNwbGF5OiBibG9jazsnIGNsYXNzPSdpbWcyMHgyMCdcXG5cIiArXG4gICAgICAgICAgICBcIi8+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPjwvdGQ+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPjwvdGQ+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNlbGxwYWRkaW5nPScwJyBjZWxsc3BhY2luZz0nMCcgYm9yZGVyPScwJyB3aWR0aD0nMTAwJSc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB2YWxpZ249J3RvcCcgc3R5bGU9J3BhZGRpbmctYm90dG9tOiAyMHB4Oyc+PGRpdiBzdHlsZT0ndGV4dC1hbGlnbjogbGVmdDtmb250LWZhbWlseTogYXJpYWw7Zm9udC1zaXplOiAxNnB4O2NvbG9yOiAjZmZmZmZmO2xpbmUtaGVpZ2h0OiAyNnB4O21zby1saW5lLWhlaWdodDogZXhhY3RseTttc28tdGV4dC1yYWlzZTogNXB4Oyc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBzdHlsZT0ncGFkZGluZzogMDsgbWFyZ2luOiAwO3RleHQtYWxpZ246IGNlbnRlcjsnPlZpZWxlbiBEYW5rLCBkYXNzIFNpZSBzaWNoIGbDvHIgdW5zZXJlbiBOZXdzbGV0dGVyIGFuZ2VtZWxkZXQgaGFiZW4uPC9wPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9J3BhZGRpbmc6IDA7IG1hcmdpbjogMDt0ZXh0LWFsaWduOiBjZW50ZXI7Jz5VbSBkaWVzZSBFLU1haWwtQWRyZXNzZSB1bmQgSWhyZSBrb3N0ZW5sb3NlIEFubWVsZHVuZyB6dSBiZXN0w6R0aWdlbiwga2xpY2tlbiBTaWUgYml0dGUgamV0enQgYXVmIGRlbiBmb2xnZW5kZW4gQnV0dG9uOjwvcD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIHdpZHRoPScxMDAlJz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGFsaWduPSdjZW50ZXInIHN0eWxlPSdwYWRkaW5nOiAwcHg7Jz48dGFibGUgY2VsbHBhZGRpbmc9JzAnIGNlbGxzcGFjaW5nPScwJyBib3JkZXI9JzAnIGFsaWduPSdjZW50ZXInIHN0eWxlPSd0ZXh0LWFsaWduOiBjZW50ZXI7Y29sb3I6ICMwMDA7JyBjbGFzcz0nZnVsbC13aWR0aCc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB2YWxpZ249J3RvcCcgYWxpZ249J2NlbnRlcicgc3R5bGU9J3BhZGRpbmctcmlnaHQ6IDEwcHg7cGFkZGluZy1ib3R0b206IDMwcHg7cGFkZGluZy1sZWZ0OiAxMHB4Oyc+PHRhYmxlIGNlbGxwYWRkaW5nPScwJyBjZWxsc3BhY2luZz0nMCcgYm9yZGVyPScwJyBiZ2NvbG9yPScjODVhYzFjJyBzdHlsZT0nYm9yZGVyOiAwcHggbm9uZTtib3JkZXItcmFkaXVzOiA1cHg7Ym9yZGVyLWNvbGxhcHNlOiBzZXBhcmF0ZSAhaW1wb3J0YW50O2JhY2tncm91bmQtY29sb3I6ICM4NWFjMWM7JyBjbGFzcz0nZnVsbC13aWR0aCc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB2YWxpZ249J3RvcCcgYWxpZ249J2NlbnRlcicgc3R5bGU9J3BhZGRpbmc6IDEycHg7Jz48YSBocmVmPScke2NvbmZpcm1hdGlvbl91cmx9JyB0YXJnZXQ9J19ibGFuaycgc3R5bGU9J3RleHQtZGVjb3JhdGlvbjogbm9uZTsnIGNsYXNzPSdlZG1fYnV0dG9uJz48c3BhbiBzdHlsZT0nZm9udC1mYW1pbHk6IGFyaWFsO2ZvbnQtc2l6ZTogMThweDtjb2xvcjogI2ZmZmZmZjtsaW5lLWhlaWdodDogMjhweDt0ZXh0LWRlY29yYXRpb246IG5vbmU7Jz48c3BhblxcblwiICtcbiAgICAgICAgICAgIFwic3R5bGU9J2ZvbnQtc2l6ZTogMThweDsnPkpldHp0IEFubWVsZHVuZyBiZXN0JmF1bWw7dGlnZW48L3NwYW4+PC9zcGFuPiA8L2E+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPjwvdGQ+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT0ndGV4dC1hbGlnbjogbGVmdDtmb250LWZhbWlseTogYXJpYWw7Zm9udC1zaXplOiAxMnB4O2NvbG9yOiAjZmZmZmZmO2xpbmUtaGVpZ2h0OiAyMnB4O21zby1saW5lLWhlaWdodDogZXhhY3RseTttc28tdGV4dC1yYWlzZTogNXB4Oyc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBzdHlsZT0ncGFkZGluZzogMDsgbWFyZ2luOiAwO3RleHQtYWxpZ246IGNlbnRlcjsnPldlbm4gU2llIGlocmUgRS1NYWlsLUFkcmVzc2UgbmljaHQgYmVzdMOkdGlnZW4sIGvDtm5uZW4ga2VpbmUgTmV3c2xldHRlciB6dWdlc3RlbGx0IHdlcmRlbi4gSWhyIEVpbnZlcnN0w6RuZG5pcyBrw7ZubmVuIFNpZSBzZWxic3R2ZXJzdMOkbmRsaWNoIGplZGVyemVpdCB3aWRlcnJ1ZmVuLiBTb2xsdGUgZXMgc2ljaCBiZWkgZGVyIEFubWVsZHVuZyB1bSBlaW4gVmVyc2VoZW4gaGFuZGVsbiBvZGVyIHd1cmRlIGRlciBOZXdzbGV0dGVyIG5pY2h0IGluIElocmVtIE5hbWVuIGJlc3RlbGx0LCBrw7ZubmVuIFNpZSBkaWVzZSBFLU1haWwgZWluZmFjaCBpZ25vcmllcmVuLiBJaG5lbiB3ZXJkZW4ga2VpbmUgd2VpdGVyZW4gTmFjaHJpY2h0ZW4genVnZXNjaGlja3QuPC9wPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PjwvdGQ+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2VsbHBhZGRpbmc9JzAnIGNlbGxzcGFjaW5nPScwJyBib3JkZXI9JzAnIHdpZHRoPScxMDAlJyBiZ2NvbG9yPScjZmZmZmZmJyBzdHlsZT0nYm9yZGVyOiAwcHggbm9uZTtiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmZmZmOyc+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB2YWxpZ249J3RvcCcgc3R5bGU9J3BhZGRpbmctdG9wOiAzMHB4O3BhZGRpbmctcmlnaHQ6IDIwcHg7cGFkZGluZy1ib3R0b206IDM1cHg7cGFkZGluZy1sZWZ0OiAyMHB4Oyc+PHRhYmxlIGNlbGxwYWRkaW5nPScwJyBjZWxsc3BhY2luZz0nMCcgd2lkdGg9JzEwMCUnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9J3BhZGRpbmc6IDBweDsnPjx0YWJsZSBjZWxscGFkZGluZz0nMCcgY2VsbHNwYWNpbmc9JzAnIGJvcmRlcj0nMCcgd2lkdGg9JzEwMCUnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgdmFsaWduPSd0b3AnIHN0eWxlPSdwYWRkaW5nLWJvdHRvbTogMjVweDsnPjxkaXYgc3R5bGU9J3RleHQtYWxpZ246IGxlZnQ7Zm9udC1mYW1pbHk6IGFyaWFsO2ZvbnQtc2l6ZTogMTJweDtjb2xvcjogIzMzMzMzMztsaW5lLWhlaWdodDogMjJweDttc28tbGluZS1oZWlnaHQ6IGV4YWN0bHk7bXNvLXRleHQtcmFpc2U6IDVweDsnPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9J3BhZGRpbmc6IDA7IG1hcmdpbjogMDt0ZXh0LWFsaWduOiBjZW50ZXI7Jz48c3BhbiBzdHlsZT0nbGluZS1oZWlnaHQ6IDM7Jz48c3Ryb25nPktvbnRha3Q8L3N0cm9uZz48L3NwYW4+PGJyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlQHNlbmRlZmZlY3QuZGU8YnI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHd3dy5zZW5kZWZmZWN0LmRlPGJyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUZWxlZm9uOiArNDkgKDApIDg1NzEgLSA5NyAzOSAtIDY5LTA8L3A+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPSd0ZXh0LWFsaWduOiBsZWZ0O2ZvbnQtZmFtaWx5OiBhcmlhbDtmb250LXNpemU6IDEycHg7Y29sb3I6ICMzMzMzMzM7bGluZS1oZWlnaHQ6IDIycHg7bXNvLWxpbmUtaGVpZ2h0OiBleGFjdGx5O21zby10ZXh0LXJhaXNlOiA1cHg7Jz5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIHN0eWxlPSdwYWRkaW5nOiAwOyBtYXJnaW46IDA7dGV4dC1hbGlnbjogY2VudGVyOyc+PHNwYW4gc3R5bGU9J2xpbmUtaGVpZ2h0OiAzOyc+PHN0cm9uZz5JbXByZXNzdW08L3N0cm9uZz48L3NwYW4+PGJyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBbnNjaHJpZnQ6IFNjaHVsZ2Fzc2UgNSwgRC04NDM1OSBTaW1iYWNoIGFtIElubiwgZU1haWw6IHNlcnZpY2VAc2VuZGVmZmVjdC5kZTxicj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQmV0cmVpYmVyOiBXRUJhbml6ZXIgQUcsIFJlZ2lzdGVyZ2VyaWNodDogQW10c2dlcmljaHQgTGFuZHNodXQgSFJCIDUxNzcsIFVzdElkLjogREUgMjA2OCA2MiAwNzA8YnI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZvcnN0YW5kOiBPdHRtYXIgTmV1YnVyZ2VyLCBBdWZzaWNodHNyYXQ6IFRvYmlhcyBOZXVidXJnZXI8L3A+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPjwvdGQ+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgICAgICAgICA8L3RyPlxcblwiICtcbiAgICAgICAgICAgIFwiICAgICAgICAgICAgICAgIDwvdGFibGU+PC90ZD5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgICAgIDwvdHI+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgICAgPC90YWJsZT5cXG5cIiArXG4gICAgICAgICAgICBcIiAgICAgICAgPC9kaXY+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICAgIDwhLS0gY29udGVudCBlbmQgLS0+XFxuXCIgK1xuICAgICAgICAgICAgXCIgICAgICA8L2NlbnRlcj48L3RkPlxcblwiICtcbiAgICAgICAgICAgIFwiICA8L3RyPlxcblwiICtcbiAgICAgICAgICAgIFwiPC90YWJsZT5cIlxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1wic3RhdHVzXCI6IFwic3VjY2Vzc1wiLCBcImRhdGFcIjogZGF0YX07XG4gICAgfVxuICB9XG59KTtcbiIsImltcG9ydCB7IEFwaSwgRE9JX0ZFVENIX1JPVVRFLCBET0lfQ09ORklSTUFUSU9OX05PVElGWV9ST1VURSB9IGZyb20gJy4uL3Jlc3QuanMnO1xuaW1wb3J0IGFkZE9wdEluIGZyb20gJy4uLy4uLy4uLy4uL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvb3B0LWlucy9hZGRfYW5kX3dyaXRlX3RvX2Jsb2NrY2hhaW4uanMnO1xuaW1wb3J0IHVwZGF0ZU9wdEluU3RhdHVzIGZyb20gJy4uLy4uLy4uLy4uL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvb3B0LWlucy91cGRhdGVfc3RhdHVzLmpzJztcbmltcG9ydCBnZXREb2lNYWlsRGF0YSBmcm9tICcuLi8uLi8uLi8uLi9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2RhcHBzL2dldF9kb2ktbWFpbC1kYXRhLmpzJztcbmltcG9ydCB7bG9nRXJyb3IsIGxvZ1NlbmR9IGZyb20gXCIuLi8uLi8uLi8uLi9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyL2xvZy1jb25maWd1cmF0aW9uXCI7XG5pbXBvcnQge0RPSV9FWFBPUlRfUk9VVEV9IGZyb20gXCIuLi9yZXN0XCI7XG5pbXBvcnQgZXhwb3J0RG9pcyBmcm9tIFwiLi4vLi4vLi4vLi4vaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kYXBwcy9leHBvcnRfZG9pc1wiO1xuaW1wb3J0IHtPcHRJbnN9IGZyb20gXCIuLi8uLi8uLi8uLi9pbXBvcnRzL2FwaS9vcHQtaW5zL29wdC1pbnNcIjtcbmltcG9ydCB7Um9sZXN9IGZyb20gXCJtZXRlb3IvYWxhbm5pbmc6cm9sZXNcIjtcblxuLy9kb2t1IG9mIG1ldGVvci1yZXN0aXZ1cyBodHRwczovL2dpdGh1Yi5jb20va2FobWFsaS9tZXRlb3ItcmVzdGl2dXNcblxuQXBpLmFkZFJvdXRlKERPSV9DT05GSVJNQVRJT05fTk9USUZZX1JPVVRFLCB7XG4gIHBvc3Q6IHtcbiAgICBhdXRoUmVxdWlyZWQ6IHRydWUsXG4gICAgLy9yb2xlUmVxdWlyZWQ6IFsnYWRtaW4nXSxcbiAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgcVBhcmFtcyA9IHRoaXMucXVlcnlQYXJhbXM7XG4gICAgICBjb25zdCBiUGFyYW1zID0gdGhpcy5ib2R5UGFyYW1zO1xuICAgICAgbGV0IHBhcmFtcyA9IHt9XG4gICAgICBpZihxUGFyYW1zICE9PSB1bmRlZmluZWQpIHBhcmFtcyA9IHsuLi5xUGFyYW1zfVxuICAgICAgaWYoYlBhcmFtcyAhPT0gdW5kZWZpbmVkKSBwYXJhbXMgPSB7Li4ucGFyYW1zLCAuLi5iUGFyYW1zfVxuXG4gICAgICBjb25zdCB1aWQgPSB0aGlzLnVzZXJJZDtcblxuICAgICAgaWYoIVJvbGVzLnVzZXJJc0luUm9sZSh1aWQsICdhZG1pbicpIHx8IC8vaWYgaXRzIG5vdCBhbiBhZG1pbiBhbHdheXMgdXNlIHVpZCBhcyBvd25lcklkXG4gICAgICAgICAgKFJvbGVzLnVzZXJJc0luUm9sZSh1aWQsICdhZG1pbicpICYmIChwYXJhbXNbXCJvd25lcklkXCJdPT1udWxsIHx8IHBhcmFtc1tcIm93bmVySWRcIl09PXVuZGVmaW5lZCkpKSB7ICAvL2lmIGl0cyBhbiBhZG1pbiBvbmx5IHVzZSB1aWQgaW4gY2FzZSBubyBvd25lcklkIHdhcyBnaXZlblxuICAgICAgICAgIHBhcmFtc1tcIm93bmVySWRcIl0gPSB1aWQ7XG4gICAgICB9XG5cbiAgICAgIGxvZ1NlbmQoJ3BhcmFtZXRlciByZWNlaXZlZCBmcm9tIGJyb3dzZXI6JyxwYXJhbXMpO1xuICAgICAgaWYocGFyYW1zLnNlbmRlcl9tYWlsLmNvbnN0cnVjdG9yID09PSBBcnJheSl7IC8vdGhpcyBpcyBhIFNPSSB3aXRoIGNvLXNwb25zb3JzIGZpcnN0IGVtYWlsIGlzIG1haW4gc3BvbnNvclxuICAgICAgICAgIHJldHVybiBwcmVwYXJlQ29ET0kocGFyYW1zKTtcbiAgICAgIH1lbHNle1xuICAgICAgICAgcmV0dXJuIHByZXBhcmVBZGQocGFyYW1zKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHB1dDoge1xuICAgIGF1dGhSZXF1aXJlZDogZmFsc2UsXG4gICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHFQYXJhbXMgPSB0aGlzLnF1ZXJ5UGFyYW1zO1xuICAgICAgY29uc3QgYlBhcmFtcyA9IHRoaXMuYm9keVBhcmFtcztcblxuICAgICAgbG9nU2VuZCgncVBhcmFtczonLHFQYXJhbXMpO1xuICAgICAgbG9nU2VuZCgnYlBhcmFtczonLGJQYXJhbXMpO1xuXG4gICAgICBsZXQgcGFyYW1zID0ge31cbiAgICAgIGlmKHFQYXJhbXMgIT09IHVuZGVmaW5lZCkgcGFyYW1zID0gey4uLnFQYXJhbXN9XG4gICAgICBpZihiUGFyYW1zICE9PSB1bmRlZmluZWQpIHBhcmFtcyA9IHsuLi5wYXJhbXMsIC4uLmJQYXJhbXN9XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB2YWwgPSB1cGRhdGVPcHRJblN0YXR1cyhwYXJhbXMpO1xuICAgICAgICBsb2dTZW5kKCdvcHQtSW4gc3RhdHVzIHVwZGF0ZWQnLHZhbCk7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiAnc3VjY2VzcycsIGRhdGE6IHttZXNzYWdlOiAnT3B0LUluIHN0YXR1cyB1cGRhdGVkJ319O1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICByZXR1cm4ge3N0YXR1c0NvZGU6IDUwMCwgYm9keToge3N0YXR1czogJ2ZhaWwnLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlfX07XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxuQXBpLmFkZFJvdXRlKERPSV9GRVRDSF9ST1VURSwge2F1dGhSZXF1aXJlZDogZmFsc2V9LCB7XG4gIGdldDoge1xuICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLnF1ZXJ5UGFyYW1zO1xuICAgICAgdHJ5IHtcbiAgICAgICAgICBsb2dTZW5kKCdyZXN0IGFwaSAtIERPSV9GRVRDSF9ST1VURSBjYWxsZWQgYnkgYm9iIHRvIHJlcXVlc3QgZW1haWwgdGVtcGxhdGUnLEpTT04uc3RyaW5naWZ5KHBhcmFtcykpO1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBnZXREb2lNYWlsRGF0YShwYXJhbXMpO1xuICAgICAgICAgIGxvZ1NlbmQoJ2dvdCBkb2ktbWFpbC1kYXRhIChpbmNsdWRpbmcgdGVtcGxhbHRlKSByZXR1cm5pbmcgdG8gYm9iJyx7c3ViamVjdDpkYXRhLnN1YmplY3QsIHJlY2lwaWVudDpkYXRhLnJlY2lwaWVudH0pO1xuICAgICAgICByZXR1cm4ge3N0YXR1czogJ3N1Y2Nlc3MnLCBkYXRhfTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgbG9nRXJyb3IoJ2Vycm9yIHdoaWxlIGdldHRpbmcgRG9pTWFpbERhdGEnLGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6ICdmYWlsJywgZXJyb3I6IGVycm9yLm1lc3NhZ2V9O1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cbkFwaS5hZGRSb3V0ZShET0lfRVhQT1JUX1JPVVRFLCB7XG4gICAgZ2V0OiB7XG4gICAgICAgIGF1dGhSZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgLy9yb2xlUmVxdWlyZWQ6IFsnYWRtaW4nXSxcbiAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCBwYXJhbXMgPSB0aGlzLnF1ZXJ5UGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgdWlkID0gdGhpcy51c2VySWQ7XG4gICAgICAgICAgICBpZighUm9sZXMudXNlcklzSW5Sb2xlKHVpZCwgJ2FkbWluJykpe1xuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHt1c2VyaWQ6dWlkLHJvbGU6J3VzZXInfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gey4uLnBhcmFtcyxyb2xlOidhZG1pbid9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxvZ1NlbmQoJ3Jlc3QgYXBpIC0gRE9JX0VYUE9SVF9ST1VURSBjYWxsZWQnLEpTT04uc3RyaW5naWZ5KHBhcmFtcykpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBleHBvcnREb2lzKHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgbG9nU2VuZCgnZ290IGRvaXMgZnJvbSBkYXRhYmFzZScsSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7c3RhdHVzOiAnc3VjY2VzcycsIGRhdGF9O1xuICAgICAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgICAgIGxvZ0Vycm9yKCdlcnJvciB3aGlsZSBleHBvcnRpbmcgY29uZmlybWVkIGRvaXMnLGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge3N0YXR1czogJ2ZhaWwnLCBlcnJvcjogZXJyb3IubWVzc2FnZX07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuZnVuY3Rpb24gcHJlcGFyZUNvRE9JKHBhcmFtcyl7XG5cbiAgICBsb2dTZW5kKCdpcyBhcnJheSAnLHBhcmFtcy5zZW5kZXJfbWFpbCk7XG5cbiAgICBjb25zdCBzZW5kZXJzID0gcGFyYW1zLnNlbmRlcl9tYWlsO1xuICAgIGNvbnN0IHJlY2lwaWVudF9tYWlsID0gcGFyYW1zLnJlY2lwaWVudF9tYWlsO1xuICAgIGNvbnN0IGRhdGEgPSBwYXJhbXMuZGF0YTtcbiAgICBjb25zdCBvd25lcklEID0gcGFyYW1zLm93bmVySWQ7XG5cbiAgICBsZXQgY3VycmVudE9wdEluSWQ7XG4gICAgbGV0IHJldFJlc3BvbnNlID0gW107XG4gICAgbGV0IG1hc3Rlcl9kb2k7XG4gICAgc2VuZGVycy5mb3JFYWNoKChzZW5kZXIsaW5kZXgpID0+IHtcblxuICAgICAgICBjb25zdCByZXRfcmVzcG9uc2UgPSBwcmVwYXJlQWRkKHtzZW5kZXJfbWFpbDpzZW5kZXIscmVjaXBpZW50X21haWw6cmVjaXBpZW50X21haWwsZGF0YTpkYXRhLCBtYXN0ZXJfZG9pOm1hc3Rlcl9kb2ksIGluZGV4OiBpbmRleCwgb3duZXJJZDpvd25lcklEfSk7XG4gICAgICAgIGxvZ1NlbmQoJ0NvRE9JOicscmV0X3Jlc3BvbnNlKTtcbiAgICAgICAgaWYocmV0X3Jlc3BvbnNlLnN0YXR1cyA9PT0gdW5kZWZpbmVkIHx8IHJldF9yZXNwb25zZS5zdGF0dXM9PT1cImZhaWxlZFwiKSB0aHJvdyBcImNvdWxkIG5vdCBhZGQgY28tb3B0LWluXCI7XG4gICAgICAgIHJldFJlc3BvbnNlLnB1c2gocmV0X3Jlc3BvbnNlKTtcbiAgICAgICAgY3VycmVudE9wdEluSWQgPSByZXRfcmVzcG9uc2UuZGF0YS5pZDtcblxuICAgICAgICBpZihpbmRleD09PTApXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxvZ1NlbmQoJ21haW4gc3BvbnNvciBvcHRJbklkOicsY3VycmVudE9wdEluSWQpO1xuICAgICAgICAgICAgY29uc3Qgb3B0SW4gPSBPcHRJbnMuZmluZE9uZSh7X2lkOiBjdXJyZW50T3B0SW5JZH0pO1xuICAgICAgICAgICAgbWFzdGVyX2RvaSA9IG9wdEluLm5hbWVJZDtcbiAgICAgICAgICAgIGxvZ1NlbmQoJ21haW4gc3BvbnNvciBuYW1lSWQ6JyxtYXN0ZXJfZG9pKTtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBsb2dTZW5kKHJldFJlc3BvbnNlKTtcblxuICAgIHJldHVybiByZXRSZXNwb25zZTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUFkZChwYXJhbXMpe1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdmFsID0gYWRkT3B0SW4ocGFyYW1zKTtcbiAgICAgICAgbG9nU2VuZCgnb3B0LUluIGFkZGVkIElEOicsdmFsKTtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6ICdzdWNjZXNzJywgZGF0YToge2lkOiB2YWwsIHN0YXR1czogJ3N1Y2Nlc3MnLCBtZXNzYWdlOiAnT3B0LUluIGFkZGVkLid9fTtcbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzQ29kZTogNTAwLCBib2R5OiB7c3RhdHVzOiAnZmFpbCcsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2V9fTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQXBpIH0gZnJvbSAnLi4vcmVzdC5qcyc7XG5pbXBvcnQge01ldGVvcn0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQge0FjY291bnRzfSBmcm9tICdtZXRlb3IvYWNjb3VudHMtYmFzZSdcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcbmltcG9ydCB7Um9sZXN9IGZyb20gXCJtZXRlb3IvYWxhbm5pbmc6cm9sZXNcIjtcbmltcG9ydCB7bG9nTWFpbn0gZnJvbSBcIi4uLy4uLy4uLy4uL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvbG9nLWNvbmZpZ3VyYXRpb25cIjtcblxuY29uc3QgbWFpbFRlbXBsYXRlU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gICAgc3ViamVjdDoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIG9wdGlvbmFsOnRydWUgXG4gICAgfSxcbiAgICByZWRpcmVjdDoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHJlZ0V4OiBcIkAoaHR0cHM/fGZ0cCk6Ly8oLVxcXFwuKT8oW15cXFxccy8/XFxcXC4jLV0rXFxcXC4/KSsoL1teXFxcXHNdKik/JEBcIixcbiAgICAgICAgb3B0aW9uYWw6dHJ1ZSBcbiAgICB9LFxuICAgIHJldHVyblBhdGg6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICByZWdFeDogU2ltcGxlU2NoZW1hLlJlZ0V4LkVtYWlsLFxuICAgICAgICBvcHRpb25hbDp0cnVlIFxuICAgIH0sXG4gICAgdGVtcGxhdGVVUkw6e1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHJlZ0V4OiBcIkAoaHR0cHM/fGZ0cCk6Ly8oLVxcXFwuKT8oW15cXFxccy8/XFxcXC4jLV0rXFxcXC4/KSsoL1teXFxcXHNdKik/JEBcIixcbiAgICAgICAgb3B0aW9uYWw6dHJ1ZSBcbiAgICB9XG59KTtcblxuY29uc3QgY3JlYXRlVXNlclNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICAgIHVzZXJuYW1lOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICByZWdFeDogXCJeW0EtWixhLXosMC05LCEsXywkLCNdezQsMjR9JFwiICAvL09ubHkgdXNlcm5hbWVzIGJldHdlZW4gNC0yNCBjaGFyYWN0ZXJzIGZyb20gQS1aLGEteiwwLTksISxfLCQsIyBhbGxvd2VkXG4gICAgfSxcbiAgICBlbWFpbDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5FbWFpbFxuICAgIH0sXG4gICAgcGFzc3dvcmQ6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIHJlZ0V4OiBcIl5bQS1aLGEteiwwLTksISxfLCQsI117OCwyNH0kXCIgLy9Pbmx5IHBhc3N3b3JkcyBiZXR3ZWVuIDgtMjQgY2hhcmFjdGVycyBmcm9tIEEtWixhLXosMC05LCEsXywkLCMgYWxsb3dlZFxuICAgIH0sXG4gICAgbWFpbFRlbXBsYXRlOntcbiAgICAgICAgdHlwZTogbWFpbFRlbXBsYXRlU2NoZW1hLFxuICAgICAgICBvcHRpb25hbDp0cnVlIFxuICAgIH1cbiAgfSk7XG4gIGNvbnN0IHVwZGF0ZVVzZXJTY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcbiAgICBtYWlsVGVtcGxhdGU6e1xuICAgICAgICB0eXBlOiBtYWlsVGVtcGxhdGVTY2hlbWFcbiAgICB9XG59KTtcblxuLy9UT0RPOiBjb2xsZWN0aW9uIG9wdGlvbnMgc2VwYXJhdGVcbmNvbnN0IGNvbGxlY3Rpb25PcHRpb25zID1cbiAge1xuICAgIHBhdGg6XCJ1c2Vyc1wiLFxuICAgIHJvdXRlT3B0aW9uczpcbiAgICB7XG4gICAgICAgIGF1dGhSZXF1aXJlZCA6IHRydWVcbiAgICAgICAgLy8scm9sZVJlcXVpcmVkIDogXCJhZG1pblwiXG4gICAgfSxcbiAgICBleGNsdWRlZEVuZHBvaW50czogWydwYXRjaCcsJ2RlbGV0ZUFsbCddLFxuICAgIGVuZHBvaW50czpcbiAgICB7XG4gICAgICAgIGRlbGV0ZTp7cm9sZVJlcXVpcmVkIDogXCJhZG1pblwifSxcbiAgICAgICAgcG9zdDpcbiAgICAgICAge1xuICAgICAgICAgICAgcm9sZVJlcXVpcmVkIDogXCJhZG1pblwiLFxuICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGNvbnN0IHFQYXJhbXMgPSB0aGlzLnF1ZXJ5UGFyYW1zO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJQYXJhbXMgPSB0aGlzLmJvZHlQYXJhbXM7XG4gICAgICAgICAgICAgICAgbGV0IHBhcmFtcyA9IHt9O1xuICAgICAgICAgICAgICAgIGlmKHFQYXJhbXMgIT09IHVuZGVmaW5lZCkgcGFyYW1zID0gey4uLnFQYXJhbXN9XG4gICAgICAgICAgICAgICAgaWYoYlBhcmFtcyAhPT0gdW5kZWZpbmVkKSBwYXJhbXMgPSB7Li4ucGFyYW1zLCAuLi5iUGFyYW1zfVxuICAgICAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVzZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlVXNlclNjaGVtYS52YWxpZGF0ZShwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICBsb2dNYWluKCd2YWxpZGF0ZWQnLHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHBhcmFtcy5tYWlsVGVtcGxhdGUgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQgPSBBY2NvdW50cy5jcmVhdGVVc2VyKHt1c2VybmFtZTpwYXJhbXMudXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6cGFyYW1zLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOnBhcmFtcy5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlOnttYWlsVGVtcGxhdGU6cGFyYW1zLm1haWxUZW1wbGF0ZX19KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkID0gQWNjb3VudHMuY3JlYXRlVXNlcih7dXNlcm5hbWU6cGFyYW1zLnVzZXJuYW1lLGVtYWlsOnBhcmFtcy5lbWFpbCxwYXNzd29yZDpwYXJhbXMucGFzc3dvcmQsIHByb2ZpbGU6e319KTtcbiAgICAgICAgICAgICAgICAgICAgfSAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtzdGF0dXM6ICdzdWNjZXNzJywgZGF0YToge3VzZXJpZDogdXNlcklkfX07XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHtzdGF0dXNDb2RlOiA0MDAsIGJvZHk6IHtzdGF0dXM6ICdmYWlsJywgbWVzc2FnZTogZXJyb3IubWVzc2FnZX19O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcHV0OlxuICAgICAgICB7XG4gICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCl7ICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3QgcVBhcmFtcyA9IHRoaXMucXVlcnlQYXJhbXM7XG4gICAgICAgICAgICAgICAgY29uc3QgYlBhcmFtcyA9IHRoaXMuYm9keVBhcmFtcztcbiAgICAgICAgICAgICAgICBsZXQgcGFyYW1zID0ge307XG4gICAgICAgICAgICAgICAgbGV0IHVpZD10aGlzLnVzZXJJZDtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJhbUlkPXRoaXMudXJsUGFyYW1zLmlkO1xuICAgICAgICAgICAgICAgIGlmKHFQYXJhbXMgIT09IHVuZGVmaW5lZCkgcGFyYW1zID0gey4uLnFQYXJhbXN9XG4gICAgICAgICAgICAgICAgaWYoYlBhcmFtcyAhPT0gdW5kZWZpbmVkKSBwYXJhbXMgPSB7Li4ucGFyYW1zLCAuLi5iUGFyYW1zfVxuXG4gICAgICAgICAgICAgICAgdHJ5eyAvL1RPRE8gdGhpcyBpcyBub3QgbmVjZXNzYXJ5IGhlcmUgYW5kIGNhbiBwcm9iYWJseSBnbyByaWdodCBpbnRvIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBSRVNUIE1FVEhPRCBuZXh0IHRvIHB1dCAoIT8hKVxuICAgICAgICAgICAgICAgICAgICBpZighUm9sZXMudXNlcklzSW5Sb2xlKHVpZCwgJ2FkbWluJykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodWlkIT09cGFyYW1JZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJObyBQZXJtaXNzaW9uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVVzZXJTY2hlbWEudmFsaWRhdGUocGFyYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoIU1ldGVvci51c2Vycy51cGRhdGUodGhpcy51cmxQYXJhbXMuaWQseyRzZXQ6e1wicHJvZmlsZS5tYWlsVGVtcGxhdGVcIjpwYXJhbXMubWFpbFRlbXBsYXRlfX0pKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiRmFpbGVkIHRvIHVwZGF0ZSB1c2VyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7c3RhdHVzOiAnc3VjY2VzcycsIGRhdGE6IHt1c2VyaWQ6IHRoaXMudXJsUGFyYW1zLmlkLCBtYWlsVGVtcGxhdGU6cGFyYW1zLm1haWxUZW1wbGF0ZX19O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7c3RhdHVzQ29kZTogNDAwLCBib2R5OiB7c3RhdHVzOiAnZmFpbCcsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2V9fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5BcGkuYWRkQ29sbGVjdGlvbihNZXRlb3IudXNlcnMsY29sbGVjdGlvbk9wdGlvbnMpOyIsImltcG9ydCB7IEFwaSB9IGZyb20gJy4uL3Jlc3QuanMnO1xuaW1wb3J0IHZlcmlmeU9wdEluIGZyb20gJy4uLy4uLy4uLy4uL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvb3B0LWlucy92ZXJpZnkuanMnO1xuXG5BcGkuYWRkUm91dGUoJ29wdC1pbi92ZXJpZnknLCB7YXV0aFJlcXVpcmVkOiB0cnVlfSwge1xuICBnZXQ6IHtcbiAgICBhdXRoUmVxdWlyZWQ6IGZhbHNlLFxuICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHFQYXJhbXMgPSB0aGlzLnF1ZXJ5UGFyYW1zO1xuICAgICAgICBjb25zdCBiUGFyYW1zID0gdGhpcy5ib2R5UGFyYW1zO1xuICAgICAgICBsZXQgcGFyYW1zID0ge31cbiAgICAgICAgaWYocVBhcmFtcyAhPT0gdW5kZWZpbmVkKSBwYXJhbXMgPSB7Li4ucVBhcmFtc31cbiAgICAgICAgaWYoYlBhcmFtcyAhPT0gdW5kZWZpbmVkKSBwYXJhbXMgPSB7Li4ucGFyYW1zLCAuLi5iUGFyYW1zfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB2YWwgPSB2ZXJpZnlPcHRJbihwYXJhbXMpO1xuICAgICAgICByZXR1cm4ge3N0YXR1czogXCJzdWNjZXNzXCIsIGRhdGE6IHt2YWx9fTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXNDb2RlOiA1MDAsIGJvZHk6IHtzdGF0dXM6ICdmYWlsJywgbWVzc2FnZTogZXJyb3IubWVzc2FnZX19O1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG4iLCJpbXBvcnQgeyBSZXN0aXZ1cyB9IGZyb20gJ21ldGVvci9uaW1ibGU6cmVzdGl2dXMnO1xuaW1wb3J0IHsgaXNEZWJ1ZyB9IGZyb20gJy4uLy4uLy4uL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvZGFwcC1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCB7IFNFTkRfQVBQLCBDT05GSVJNX0FQUCwgVkVSSUZZX0FQUCwgaXNBcHBUeXBlIH0gZnJvbSAnLi4vLi4vLi4vaW1wb3J0cy9zdGFydHVwL3NlcnZlci90eXBlLWNvbmZpZ3VyYXRpb24uanMnO1xuXG5leHBvcnQgY29uc3QgRE9JX0NPTkZJUk1BVElPTl9ST1VURSA9IFwib3B0LWluL2NvbmZpcm1cIjtcbmV4cG9ydCBjb25zdCBET0lfQ09ORklSTUFUSU9OX05PVElGWV9ST1VURSA9IFwib3B0LWluXCI7XG5leHBvcnQgY29uc3QgRE9JX1dBTExFVE5PVElGWV9ST1VURSA9IFwid2FsbGV0bm90aWZ5XCI7XG5leHBvcnQgY29uc3QgRE9JX0ZFVENIX1JPVVRFID0gXCJkb2ktbWFpbFwiO1xuZXhwb3J0IGNvbnN0IERPSV9FWFBPUlRfUk9VVEUgPSBcImV4cG9ydFwiO1xuZXhwb3J0IGNvbnN0IFVTRVJTX0NPTExFQ1RJT05fUk9VVEUgPSBcInVzZXJzXCJcbmV4cG9ydCBjb25zdCBBUElfUEFUSCA9IFwiYXBpL1wiO1xuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSBcInYxXCI7XG5cbmV4cG9ydCBjb25zdCBBcGkgPSBuZXcgUmVzdGl2dXMoe1xuICBhcGlQYXRoOiBBUElfUEFUSCxcbiAgdmVyc2lvbjogVkVSU0lPTixcbiAgdXNlRGVmYXVsdEF1dGg6IHRydWUsXG4gIHByZXR0eUpzb246IHRydWVcbn0pO1xuXG5pZihpc0RlYnVnKCkpIHJlcXVpcmUoJy4vaW1wb3J0cy9kZWJ1Zy5qcycpO1xuaWYoaXNBcHBUeXBlKFNFTkRfQVBQKSkgcmVxdWlyZSgnLi9pbXBvcnRzL3NlbmQuanMnKTtcbmlmKGlzQXBwVHlwZShDT05GSVJNX0FQUCkpIHJlcXVpcmUoJy4vaW1wb3J0cy9jb25maXJtLmpzJyk7XG5pZihpc0FwcFR5cGUoVkVSSUZZX0FQUCkpIHJlcXVpcmUoJy4vaW1wb3J0cy92ZXJpZnkuanMnKTtcbnJlcXVpcmUoJy4vaW1wb3J0cy91c2VyLmpzJyk7XG4iLCJcbmltcG9ydCB7IEpvYkNvbGxlY3Rpb24sSm9iIH0gZnJvbSAnbWV0ZW9yL3ZzaXZzaTpqb2ItY29sbGVjdGlvbic7XG5leHBvcnQgY29uc3QgQmxvY2tjaGFpbkpvYnMgPSBKb2JDb2xsZWN0aW9uKCdibG9ja2NoYWluJyk7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBpbnNlcnQgZnJvbSAnLi4vLi4vaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kb2ljaGFpbi9pbnNlcnQuanMnO1xuaW1wb3J0IHVwZGF0ZSBmcm9tICcuLi8uLi9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2RvaWNoYWluL3VwZGF0ZS5qcyc7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqLyAvL1RPRE8gcmUtZW5hYmxlIHRoaXMhXG5pbXBvcnQgY2hlY2tOZXdUcmFuc2FjdGlvbiBmcm9tICcuLi8uLi9pbXBvcnRzL21vZHVsZXMvc2VydmVyL2RvaWNoYWluL2NoZWNrX25ld190cmFuc2FjdGlvbnMuanMnO1xuaW1wb3J0IHsgQ09ORklSTV9BUFAsIGlzQXBwVHlwZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvdHlwZS1jb25maWd1cmF0aW9uLmpzJztcbmltcG9ydCB7bG9nTWFpbn0gZnJvbSBcIi4uLy4uL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvbG9nLWNvbmZpZ3VyYXRpb25cIjtcblxuQmxvY2tjaGFpbkpvYnMucHJvY2Vzc0pvYnMoJ2luc2VydCcsIHt3b3JrVGltZW91dDogMzAqMTAwMH0sZnVuY3Rpb24gKGpvYiwgY2IpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBlbnRyeSA9IGpvYi5kYXRhO1xuICAgIGluc2VydChlbnRyeSk7XG4gICAgam9iLmRvbmUoKTtcbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICBqb2IuZmFpbCgpO1xuXG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdqb2JzLmJsb2NrY2hhaW4uaW5zZXJ0LmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH0gZmluYWxseSB7XG4gICAgY2IoKTtcbiAgfVxufSk7XG5cbkJsb2NrY2hhaW5Kb2JzLnByb2Nlc3NKb2JzKCd1cGRhdGUnLCB7d29ya1RpbWVvdXQ6IDMwKjEwMDB9LGZ1bmN0aW9uIChqb2IsIGNiKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZW50cnkgPSBqb2IuZGF0YTtcbiAgICB1cGRhdGUoZW50cnksam9iKTtcbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICBqb2IuZmFpbCgpO1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2pvYnMuYmxvY2tjaGFpbi51cGRhdGUuZXhjZXB0aW9uJywgZXhjZXB0aW9uKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBjYigpO1xuICB9XG59KTtcblxuQmxvY2tjaGFpbkpvYnMucHJvY2Vzc0pvYnMoJ2NoZWNrTmV3VHJhbnNhY3Rpb24nLCB7d29ya1RpbWVvdXQ6IDMwKjEwMDB9LGZ1bmN0aW9uIChqb2IsIGNiKSB7XG4gIHRyeSB7XG4gICAgaWYoIWlzQXBwVHlwZShDT05GSVJNX0FQUCkpIHtcbiAgICAgIGpvYi5wYXVzZSgpO1xuICAgICAgam9iLmNhbmNlbCgpO1xuICAgICAgam9iLnJlbW92ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL2NoZWNrTmV3VHJhbnNhY3Rpb24obnVsbCxqb2IpO1xuICAgIH1cbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICBqb2IuZmFpbCgpO1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2pvYnMuYmxvY2tjaGFpbi5jaGVja05ld1RyYW5zYWN0aW9ucy5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9IGZpbmFsbHkge1xuICAgIGNiKCk7XG4gIH1cbn0pO1xuXG5uZXcgSm9iKEJsb2NrY2hhaW5Kb2JzLCAnY2xlYW51cCcsIHt9KVxuICAgIC5yZXBlYXQoeyBzY2hlZHVsZTogQmxvY2tjaGFpbkpvYnMubGF0ZXIucGFyc2UudGV4dChcImV2ZXJ5IDUgbWludXRlc1wiKSB9KVxuICAgIC5zYXZlKHtjYW5jZWxSZXBlYXRzOiB0cnVlfSk7XG5cbmxldCBxID0gQmxvY2tjaGFpbkpvYnMucHJvY2Vzc0pvYnMoJ2NsZWFudXAnLHsgcG9sbEludGVydmFsOiBmYWxzZSwgd29ya1RpbWVvdXQ6IDYwKjEwMDAgfSAsZnVuY3Rpb24gKGpvYiwgY2IpIHtcbiAgY29uc3QgY3VycmVudCA9IG5ldyBEYXRlKClcbiAgICBjdXJyZW50LnNldE1pbnV0ZXMoY3VycmVudC5nZXRNaW51dGVzKCkgLSA1KTtcblxuICBjb25zdCBpZHMgPSBCbG9ja2NoYWluSm9icy5maW5kKHtcbiAgICAgICAgICBzdGF0dXM6IHskaW46IEpvYi5qb2JTdGF0dXNSZW1vdmFibGV9LFxuICAgICAgICAgIHVwZGF0ZWQ6IHskbHQ6IGN1cnJlbnR9fSxcbiAgICAgICAgICB7ZmllbGRzOiB7IF9pZDogMSB9fSk7XG5cbiAgICBsb2dNYWluKCdmb3VuZCAgcmVtb3ZhYmxlIGJsb2NrY2hhaW4gam9iczonLGlkcyk7XG4gICAgQmxvY2tjaGFpbkpvYnMucmVtb3ZlSm9icyhpZHMpO1xuICAgIGlmKGlkcy5sZW5ndGggPiAwKXtcbiAgICAgIGpvYi5kb25lKFwiUmVtb3ZlZCAje2lkcy5sZW5ndGh9IG9sZCBqb2JzXCIpO1xuICAgIH1cbiAgICBjYigpO1xufSk7XG5cbkJsb2NrY2hhaW5Kb2JzLmZpbmQoeyB0eXBlOiAnam9iVHlwZScsIHN0YXR1czogJ3JlYWR5JyB9KVxuICAgIC5vYnNlcnZlKHtcbiAgICAgICAgYWRkZWQ6IGZ1bmN0aW9uICgpIHsgcS50cmlnZ2VyKCk7IH1cbiAgICB9KTtcbiIsImltcG9ydCB7IEpvYkNvbGxlY3Rpb24sIEpvYiB9IGZyb20gJ21ldGVvci92c2l2c2k6am9iLWNvbGxlY3Rpb24nO1xuaW1wb3J0IGZldGNoRG9pTWFpbERhdGEgZnJvbSAnLi4vLi4vaW1wb3J0cy9tb2R1bGVzL3NlcnZlci9kYXBwcy9mZXRjaF9kb2ktbWFpbC1kYXRhLmpzJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHtsb2dNYWlufSBmcm9tIFwiLi4vLi4vaW1wb3J0cy9zdGFydHVwL3NlcnZlci9sb2ctY29uZmlndXJhdGlvblwiO1xuaW1wb3J0IHtCbG9ja2NoYWluSm9ic30gZnJvbSBcIi4vYmxvY2tjaGFpbl9qb2JzXCI7XG5cbmV4cG9ydCBjb25zdCBEQXBwSm9icyA9IEpvYkNvbGxlY3Rpb24oJ2RhcHAnKTtcblxuREFwcEpvYnMucHJvY2Vzc0pvYnMoJ2ZldGNoRG9pTWFpbERhdGEnLCBmdW5jdGlvbiAoam9iLCBjYikge1xuICB0cnkge1xuICAgIGNvbnN0IGRhdGEgPSBqb2IuZGF0YTtcbiAgICBmZXRjaERvaU1haWxEYXRhKGRhdGEpO1xuICAgIGpvYi5kb25lKCk7XG4gIH0gY2F0Y2goZXhjZXB0aW9uKSB7XG4gICAgam9iLmZhaWwoKTtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdqb2JzLmRhcHAuZmV0Y2hEb2lNYWlsRGF0YS5leGNlcHRpb24nLCBleGNlcHRpb24pO1xuICB9IGZpbmFsbHkge1xuICAgIGNiKCk7XG4gIH1cbn0pO1xuXG5cbm5ldyBKb2IoREFwcEpvYnMsICdjbGVhbnVwJywge30pXG4gICAgLnJlcGVhdCh7IHNjaGVkdWxlOiBEQXBwSm9icy5sYXRlci5wYXJzZS50ZXh0KFwiZXZlcnkgNSBtaW51dGVzXCIpIH0pXG4gICAgLnNhdmUoe2NhbmNlbFJlcGVhdHM6IHRydWV9KTtcblxubGV0IHEgPSBEQXBwSm9icy5wcm9jZXNzSm9icygnY2xlYW51cCcseyBwb2xsSW50ZXJ2YWw6IGZhbHNlLCB3b3JrVGltZW91dDogNjAqMTAwMCB9ICxmdW5jdGlvbiAoam9iLCBjYikge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBuZXcgRGF0ZSgpXG4gICAgY3VycmVudC5zZXRNaW51dGVzKGN1cnJlbnQuZ2V0TWludXRlcygpIC0gNSk7XG5cbiAgICBjb25zdCBpZHMgPSBEQXBwSm9icy5maW5kKHtcbiAgICAgICAgICAgIHN0YXR1czogeyRpbjogSm9iLmpvYlN0YXR1c1JlbW92YWJsZX0sXG4gICAgICAgICAgICB1cGRhdGVkOiB7JGx0OiBjdXJyZW50fX0sXG4gICAgICAgIHtmaWVsZHM6IHsgX2lkOiAxIH19KTtcblxuICAgIGxvZ01haW4oJ2ZvdW5kICByZW1vdmFibGUgYmxvY2tjaGFpbiBqb2JzOicsaWRzKTtcbiAgICBEQXBwSm9icy5yZW1vdmVKb2JzKGlkcyk7XG4gICAgaWYoaWRzLmxlbmd0aCA+IDApe1xuICAgICAgICBqb2IuZG9uZShcIlJlbW92ZWQgI3tpZHMubGVuZ3RofSBvbGQgam9ic1wiKTtcbiAgICB9XG4gICAgY2IoKTtcbn0pO1xuXG5EQXBwSm9icy5maW5kKHsgdHlwZTogJ2pvYlR5cGUnLCBzdGF0dXM6ICdyZWFkeScgfSlcbiAgICAub2JzZXJ2ZSh7XG4gICAgICAgIGFkZGVkOiBmdW5jdGlvbiAoKSB7IHEudHJpZ2dlcigpOyB9XG4gICAgfSk7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBkbnMgZnJvbSAnZG5zJztcbmltcG9ydCB7bG9nU2VuZH0gZnJvbSBcIi4uLy4uL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvbG9nLWNvbmZpZ3VyYXRpb25cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVUeHQoa2V5LCBkb21haW4pIHtcbiAgY29uc3Qgc3luY0Z1bmMgPSBNZXRlb3Iud3JhcEFzeW5jKGRuc19yZXNvbHZlVHh0KTtcbiAgdHJ5IHtcbiAgICBjb25zdCByZWNvcmRzID0gc3luY0Z1bmMoa2V5LCBkb21haW4pO1xuICAgIGlmKHJlY29yZHMgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBsZXQgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgcmVjb3Jkcy5mb3JFYWNoKHJlY29yZCA9PiB7XG4gICAgICBpZihyZWNvcmRbMF0uc3RhcnRzV2l0aChrZXkpKSB7XG4gICAgICAgIGNvbnN0IHZhbCA9IHJlY29yZFswXS5zdWJzdHJpbmcoa2V5Lmxlbmd0aCsxKTtcbiAgICAgICAgdmFsdWUgPSB2YWwudHJpbSgpO1xuXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9IGNhdGNoKGVycm9yKSB7XG4gICAgaWYoZXJyb3IubWVzc2FnZS5zdGFydHNXaXRoKFwicXVlcnlUeHQgRU5PREFUQVwiKSB8fFxuICAgICAgICBlcnJvci5tZXNzYWdlLnN0YXJ0c1dpdGgoXCJxdWVyeVR4dCBFTk9URk9VTkRcIikpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgZWxzZSB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBkbnNfcmVzb2x2ZVR4dChrZXksIGRvbWFpbiwgY2FsbGJhY2spIHtcbiAgICBsb2dTZW5kKFwicmVzb2x2aW5nIGRucyB0eHQgYXR0cmlidXRlOiBcIiwge2tleTprZXksZG9tYWluOmRvbWFpbn0pO1xuICAgIGRucy5yZXNvbHZlVHh0KGRvbWFpbiwgKGVyciwgcmVjb3JkcykgPT4ge1xuICAgIGNhbGxiYWNrKGVyciwgcmVjb3Jkcyk7XG4gIH0pO1xufVxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQge2xvZ0Jsb2NrY2hhaW4sIGxvZ0NvbmZpcm0sIGxvZ0Vycm9yfSBmcm9tIFwiLi4vLi4vaW1wb3J0cy9zdGFydHVwL3NlcnZlci9sb2ctY29uZmlndXJhdGlvblwiO1xuXG5cbmNvbnN0IE5BTUVTUEFDRSA9ICdlLyc7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFdpZihjbGllbnQsIGFkZHJlc3MpIHtcbiAgaWYoIWFkZHJlc3Mpe1xuICAgICAgICBhZGRyZXNzID0gZ2V0QWRkcmVzc2VzQnlBY2NvdW50KFwiXCIpWzBdO1xuICAgICAgICBsb2dCbG9ja2NoYWluKCdhZGRyZXNzIHdhcyBub3QgZGVmaW5lZCBzbyBnZXR0aW5nIHRoZSBmaXJzdCBleGlzdGluZyBvbmUgb2YgdGhlIHdhbGxldDonLGFkZHJlc3MpO1xuICB9XG4gIGlmKCFhZGRyZXNzKXtcbiAgICAgICAgYWRkcmVzcyA9IGdldE5ld0FkZHJlc3MoXCJcIik7XG4gICAgICAgIGxvZ0Jsb2NrY2hhaW4oJ2FkZHJlc3Mgd2FzIG5ldmVyIGRlZmluZWQgIGF0IGFsbCBnZW5lcmF0ZWQgbmV3IGFkZHJlc3MgZm9yIHRoaXMgd2FsbGV0OicsYWRkcmVzcyk7XG4gIH1cbiAgY29uc3Qgc3luY0Z1bmMgPSBNZXRlb3Iud3JhcEFzeW5jKGRvaWNoYWluX2R1bXBwcml2a2V5KTtcbiAgcmV0dXJuIHN5bmNGdW5jKGNsaWVudCwgYWRkcmVzcyk7XG59XG5cbmZ1bmN0aW9uIGRvaWNoYWluX2R1bXBwcml2a2V5KGNsaWVudCwgYWRkcmVzcywgY2FsbGJhY2spIHtcbiAgY29uc3Qgb3VyQWRkcmVzcyA9IGFkZHJlc3M7XG4gIGNsaWVudC5jbWQoJ2R1bXBwcml2a2V5Jywgb3VyQWRkcmVzcywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgaWYoZXJyKSAgbG9nRXJyb3IoJ2RvaWNoYWluX2R1bXBwcml2a2V5OicsZXJyKTtcbiAgICBjYWxsYmFjayhlcnIsIGRhdGEpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFkZHJlc3Nlc0J5QWNjb3VudChjbGllbnQsIGFjY291dCkge1xuICAgIGNvbnN0IHN5bmNGdW5jID0gTWV0ZW9yLndyYXBBc3luYyhkb2ljaGFpbl9nZXRhZGRyZXNzZXNieWFjY291bnQpO1xuICAgIHJldHVybiBzeW5jRnVuYyhjbGllbnQsIGFjY291dCk7XG59XG5cbmZ1bmN0aW9uIGRvaWNoYWluX2dldGFkZHJlc3Nlc2J5YWNjb3VudChjbGllbnQsIGFjY291bnQsIGNhbGxiYWNrKSB7XG4gICAgY29uc3Qgb3VyQWNjb3VudCA9IGFjY291bnQ7XG4gICAgY2xpZW50LmNtZCgnZ2V0YWRkcmVzc2VzYnlhY2NvdW50Jywgb3VyQWNjb3VudCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmKGVycikgIGxvZ0Vycm9yKCdnZXRhZGRyZXNzZXNieWFjY291bnQ6JyxlcnIpO1xuICAgICAgICBjYWxsYmFjayhlcnIsIGRhdGEpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmV3QWRkcmVzcyhjbGllbnQsIGFjY291dCkge1xuICAgIGNvbnN0IHN5bmNGdW5jID0gTWV0ZW9yLndyYXBBc3luYyhkb2ljaGFpbl9nZXRuZXdhZGRyZXNzKTtcbiAgICByZXR1cm4gc3luY0Z1bmMoY2xpZW50LCBhY2NvdXQpO1xufVxuZnVuY3Rpb24gZG9pY2hhaW5fZ2V0bmV3YWRkcmVzcyhjbGllbnQsIGFjY291bnQsIGNhbGxiYWNrKSB7XG4gICAgY29uc3Qgb3VyQWNjb3VudCA9IGFjY291bnQ7XG4gICAgY2xpZW50LmNtZCgnZ2V0bmV3YWRkcmVzc3MnLCBvdXJBY2NvdW50LCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgaWYoZXJyKSAgbG9nRXJyb3IoJ2dldG5ld2FkZHJlc3NzOicsZXJyKTtcbiAgICAgICAgY2FsbGJhY2soZXJyLCBkYXRhKTtcbiAgICB9KTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2lnbk1lc3NhZ2UoY2xpZW50LCBhZGRyZXNzLCBtZXNzYWdlKSB7XG4gICAgY29uc3Qgc3luY0Z1bmMgPSBNZXRlb3Iud3JhcEFzeW5jKGRvaWNoYWluX3NpZ25NZXNzYWdlKTtcbiAgICByZXR1cm4gc3luY0Z1bmMoY2xpZW50LCBhZGRyZXNzLCBtZXNzYWdlKTtcbn1cblxuZnVuY3Rpb24gZG9pY2hhaW5fc2lnbk1lc3NhZ2UoY2xpZW50LCBhZGRyZXNzLCBtZXNzYWdlLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IG91ckFkZHJlc3MgPSBhZGRyZXNzO1xuICAgIGNvbnN0IG91ck1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIGNsaWVudC5jbWQoJ3NpZ25tZXNzYWdlJywgb3VyQWRkcmVzcywgb3VyTWVzc2FnZSwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgIGNhbGxiYWNrKGVyciwgZGF0YSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuYW1lU2hvdyhjbGllbnQsIGlkKSB7XG4gIGNvbnN0IHN5bmNGdW5jID0gTWV0ZW9yLndyYXBBc3luYyhkb2ljaGFpbl9uYW1lU2hvdyk7XG4gIHJldHVybiBzeW5jRnVuYyhjbGllbnQsIGlkKTtcbn1cblxuZnVuY3Rpb24gZG9pY2hhaW5fbmFtZVNob3coY2xpZW50LCBpZCwgY2FsbGJhY2spIHtcbiAgY29uc3Qgb3VySWQgPSBjaGVja0lkKGlkKTtcbiAgbG9nQ29uZmlybSgnZG9pY2hhaW4tY2xpIG5hbWVfc2hvdyA6JyxvdXJJZCk7XG4gIGNsaWVudC5jbWQoJ25hbWVfc2hvdycsIG91cklkLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICBpZihlcnIgIT09IHVuZGVmaW5lZCAmJiBlcnIgIT09IG51bGwgJiYgZXJyLm1lc3NhZ2Uuc3RhcnRzV2l0aChcIm5hbWUgbm90IGZvdW5kXCIpKSB7XG4gICAgICBlcnIgPSB1bmRlZmluZWQsXG4gICAgICBkYXRhID0gdW5kZWZpbmVkXG4gICAgfVxuICAgIGNhbGxiYWNrKGVyciwgZGF0YSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmVlRG9pKGNsaWVudCwgYWRkcmVzcykge1xuICAgIGNvbnN0IHN5bmNGdW5jID0gTWV0ZW9yLndyYXBBc3luYyhkb2ljaGFpbl9mZWVEb2kpO1xuICAgIHJldHVybiBzeW5jRnVuYyhjbGllbnQsIGFkZHJlc3MpO1xufVxuXG5mdW5jdGlvbiBkb2ljaGFpbl9mZWVEb2koY2xpZW50LCBhZGRyZXNzLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGRlc3RBZGRyZXNzID0gYWRkcmVzcztcbiAgICBjbGllbnQuY21kKCdzZW5kdG9hZGRyZXNzJywgZGVzdEFkZHJlc3MsICcwLjAyJywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgIGNhbGxiYWNrKGVyciwgZGF0YSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuYW1lRG9pKGNsaWVudCwgbmFtZSwgdmFsdWUsIGFkZHJlc3MpIHtcbiAgICBjb25zdCBzeW5jRnVuYyA9IE1ldGVvci53cmFwQXN5bmMoZG9pY2hhaW5fbmFtZURvaSk7XG4gICAgcmV0dXJuIHN5bmNGdW5jKGNsaWVudCwgbmFtZSwgdmFsdWUsIGFkZHJlc3MpO1xufVxuXG5mdW5jdGlvbiBkb2ljaGFpbl9uYW1lRG9pKGNsaWVudCwgbmFtZSwgdmFsdWUsIGFkZHJlc3MsIGNhbGxiYWNrKSB7XG4gICAgY29uc3Qgb3VyTmFtZSA9IGNoZWNrSWQobmFtZSk7XG4gICAgY29uc3Qgb3VyVmFsdWUgPSB2YWx1ZTtcbiAgICBjb25zdCBkZXN0QWRkcmVzcyA9IGFkZHJlc3M7XG4gICAgaWYoIWFkZHJlc3MpIHtcbiAgICAgICAgY2xpZW50LmNtZCgnbmFtZV9kb2knLCBvdXJOYW1lLCBvdXJWYWx1ZSwgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfWVsc2V7XG4gICAgICAgIGNsaWVudC5jbWQoJ25hbWVfZG9pJywgb3VyTmFtZSwgb3VyVmFsdWUsIGRlc3RBZGRyZXNzLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RTaW5jZUJsb2NrKGNsaWVudCwgYmxvY2spIHtcbiAgICBjb25zdCBzeW5jRnVuYyA9IE1ldGVvci53cmFwQXN5bmMoZG9pY2hhaW5fbGlzdFNpbmNlQmxvY2spO1xuICAgIHZhciBvdXJCbG9jayA9IGJsb2NrO1xuICAgIGlmKG91ckJsb2NrID09PSB1bmRlZmluZWQpIG91ckJsb2NrID0gbnVsbDtcbiAgICByZXR1cm4gc3luY0Z1bmMoY2xpZW50LCBvdXJCbG9jayk7XG59XG5cbmZ1bmN0aW9uIGRvaWNoYWluX2xpc3RTaW5jZUJsb2NrKGNsaWVudCwgYmxvY2ssIGNhbGxiYWNrKSB7XG4gICAgdmFyIG91ckJsb2NrID0gYmxvY2s7XG4gICAgaWYob3VyQmxvY2sgPT09IG51bGwpIGNsaWVudC5jbWQoJ2xpc3RzaW5jZWJsb2NrJywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgIGNhbGxiYWNrKGVyciwgZGF0YSk7XG4gICAgfSk7XG4gICAgZWxzZSBjbGllbnQuY21kKCdsaXN0c2luY2VibG9jaycsIG91ckJsb2NrLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgY2FsbGJhY2soZXJyLCBkYXRhKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zYWN0aW9uKGNsaWVudCwgdHhpZCkge1xuICAgIGNvbnN0IHN5bmNGdW5jID0gTWV0ZW9yLndyYXBBc3luYyhkb2ljaGFpbl9nZXR0cmFuc2FjdGlvbik7XG4gICAgcmV0dXJuIHN5bmNGdW5jKGNsaWVudCwgdHhpZCk7XG59XG5cbmZ1bmN0aW9uIGRvaWNoYWluX2dldHRyYW5zYWN0aW9uKGNsaWVudCwgdHhpZCwgY2FsbGJhY2spIHtcbiAgICBsb2dDb25maXJtKCdkb2ljaGFpbl9nZXR0cmFuc2FjdGlvbjonLHR4aWQpO1xuICAgIGNsaWVudC5jbWQoJ2dldHRyYW5zYWN0aW9uJywgdHhpZCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmKGVycikgIGxvZ0Vycm9yKCdkb2ljaGFpbl9nZXR0cmFuc2FjdGlvbjonLGVycik7XG4gICAgICAgIGNhbGxiYWNrKGVyciwgZGF0YSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSYXdUcmFuc2FjdGlvbihjbGllbnQsIHR4aWQpIHtcbiAgICBjb25zdCBzeW5jRnVuYyA9IE1ldGVvci53cmFwQXN5bmMoZG9pY2hhaW5fZ2V0cmF3dHJhbnNhY3Rpb24pO1xuICAgIHJldHVybiBzeW5jRnVuYyhjbGllbnQsIHR4aWQpO1xufVxuXG5mdW5jdGlvbiBkb2ljaGFpbl9nZXRyYXd0cmFuc2FjdGlvbihjbGllbnQsIHR4aWQsIGNhbGxiYWNrKSB7XG4gICAgbG9nQmxvY2tjaGFpbignZG9pY2hhaW5fZ2V0cmF3dHJhbnNhY3Rpb246Jyx0eGlkKTtcbiAgICBjbGllbnQuY21kKCdnZXRyYXd0cmFuc2FjdGlvbicsIHR4aWQsIDEsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgICBpZihlcnIpICBsb2dFcnJvcignZG9pY2hhaW5fZ2V0cmF3dHJhbnNhY3Rpb246JyxlcnIpO1xuICAgICAgICBjYWxsYmFjayhlcnIsIGRhdGEpO1xuICAgIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhbGFuY2UoY2xpZW50KSB7XG4gICAgY29uc3Qgc3luY0Z1bmMgPSBNZXRlb3Iud3JhcEFzeW5jKGRvaWNoYWluX2dldGJhbGFuY2UpO1xuICAgIHJldHVybiBzeW5jRnVuYyhjbGllbnQpO1xufVxuXG5mdW5jdGlvbiBkb2ljaGFpbl9nZXRiYWxhbmNlKGNsaWVudCwgY2FsbGJhY2spIHtcbiAgICBjbGllbnQuY21kKCdnZXRiYWxhbmNlJywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmKGVycikgeyBsb2dFcnJvcignZG9pY2hhaW5fZ2V0YmFsYW5jZTonLGVycik7fVxuICAgICAgICBjYWxsYmFjayhlcnIsIGRhdGEpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjaGVja0lkKGlkKSB7XG4gICAgY29uc3QgRE9JX1BSRUZJWCA9IFwiZG9pOiBcIjtcbiAgICBsZXQgcmV0X3ZhbCA9IGlkOyAvL2RlZmF1bHQgdmFsdWVcblxuICAgIGlmKGlkLnN0YXJ0c1dpdGgoRE9JX1BSRUZJWCkpIHJldF92YWwgPSBpZC5zdWJzdHJpbmcoRE9JX1BSRUZJWC5sZW5ndGgpOyAvL2luIGNhc2UgaXQgc3RhcnRzIHdpdGggZG9pOiBjdXQgIHRoaXMgYXdheVxuICAgIGlmKCFpZC5zdGFydHNXaXRoKE5BTUVTUEFDRSkpIHJldF92YWwgPSBOQU1FU1BBQ0UraWQ7IC8vaW4gY2FzZSBpdCBkb2Vzbid0IHN0YXJ0IHdpdGggZS8gcHV0IGl0IGluIGZyb250IG5vdy5cbiAgcmV0dXJuIHJldF92YWw7XG59XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IEhUVFAgfSBmcm9tICdtZXRlb3IvaHR0cCdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEh0dHBHRVQodXJsLCBxdWVyeSkge1xuICBjb25zdCBzeW5jRnVuYyA9IE1ldGVvci53cmFwQXN5bmMoX2dldCk7XG4gIHJldHVybiBzeW5jRnVuYyh1cmwsIHF1ZXJ5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEh0dHBHRVRkYXRhKHVybCwgZGF0YSkge1xuICAgIGNvbnN0IHN5bmNGdW5jID0gTWV0ZW9yLndyYXBBc3luYyhfZ2V0RGF0YSk7XG4gICAgcmV0dXJuIHN5bmNGdW5jKHVybCwgZGF0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIdHRwUE9TVCh1cmwsIGRhdGEpIHtcbiAgICBjb25zdCBzeW5jRnVuYyA9IE1ldGVvci53cmFwQXN5bmMoX3Bvc3QpO1xuICAgIHJldHVybiBzeW5jRnVuYyh1cmwsIGRhdGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SHR0cFBVVCh1cmwsIGRhdGEpIHtcbiAgICBjb25zdCBzeW5jRnVuYyA9IE1ldGVvci53cmFwQXN5bmMoX3B1dCk7XG4gICAgcmV0dXJuIHN5bmNGdW5jKHVybCwgZGF0YSk7XG59XG5cbmZ1bmN0aW9uIF9nZXQodXJsLCBxdWVyeSwgY2FsbGJhY2spIHtcbiAgY29uc3Qgb3VyVXJsID0gdXJsO1xuICBjb25zdCBvdXJRdWVyeSA9IHF1ZXJ5O1xuICBIVFRQLmdldChvdXJVcmwsIHtxdWVyeTogb3VyUXVlcnl9LCBmdW5jdGlvbihlcnIsIHJldCkge1xuICAgIGNhbGxiYWNrKGVyciwgcmV0KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIF9nZXREYXRhKHVybCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBvdXJVcmwgPSB1cmw7XG4gICAgY29uc3Qgb3VyRGF0YSA9IGRhdGE7XG4gICAgSFRUUC5nZXQob3VyVXJsLCBvdXJEYXRhLCBmdW5jdGlvbihlcnIsIHJldCkge1xuICAgICAgICBjYWxsYmFjayhlcnIsIHJldCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIF9wb3N0KHVybCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBvdXJVcmwgPSB1cmw7XG4gICAgY29uc3Qgb3VyRGF0YSA9ICBkYXRhO1xuXG4gICAgSFRUUC5wb3N0KG91clVybCwgb3VyRGF0YSwgZnVuY3Rpb24oZXJyLCByZXQpIHtcbiAgICAgICAgY2FsbGJhY2soZXJyLCByZXQpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBfcHV0KHVybCwgdXBkYXRlRGF0YSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBvdXJVcmwgPSB1cmw7XG4gICAgY29uc3Qgb3VyRGF0YSA9IHtcbiAgICAgICAgZGF0YTogdXBkYXRlRGF0YVxuICAgIH1cblxuICAgIEhUVFAucHV0KG91clVybCwgb3VyRGF0YSwgZnVuY3Rpb24oZXJyLCByZXQpIHtcbiAgICAgIGNhbGxiYWNrKGVyciwgcmV0KTtcbiAgICB9KTtcbn1cbiIsImltcG9ydCAnLi9tYWlsX2pvYnMuanMnO1xuaW1wb3J0ICcuL2RvaWNoYWluLmpzJztcbmltcG9ydCAnLi9ibG9ja2NoYWluX2pvYnMuanMnO1xuaW1wb3J0ICcuL2RhcHBfam9icy5qcyc7XG5pbXBvcnQgJy4vZG5zLmpzJztcbmltcG9ydCAnLi9yZXN0L3Jlc3QuanMnO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBKb2JDb2xsZWN0aW9uLCBKb2IgfSBmcm9tICdtZXRlb3IvdnNpdnNpOmpvYi1jb2xsZWN0aW9uJztcbmV4cG9ydCBjb25zdCBNYWlsSm9icyA9IEpvYkNvbGxlY3Rpb24oJ2VtYWlscycpO1xuaW1wb3J0IHNlbmRNYWlsIGZyb20gJy4uLy4uL2ltcG9ydHMvbW9kdWxlcy9zZXJ2ZXIvZW1haWxzL3NlbmQuanMnO1xuaW1wb3J0IHtsb2dNYWlufSBmcm9tIFwiLi4vLi4vaW1wb3J0cy9zdGFydHVwL3NlcnZlci9sb2ctY29uZmlndXJhdGlvblwiO1xuaW1wb3J0IHtCbG9ja2NoYWluSm9ic30gZnJvbSBcIi4vYmxvY2tjaGFpbl9qb2JzXCI7XG5cblxuXG5NYWlsSm9icy5wcm9jZXNzSm9icygnc2VuZCcsIGZ1bmN0aW9uIChqb2IsIGNiKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZW1haWwgPSBqb2IuZGF0YTtcbiAgICBzZW5kTWFpbChlbWFpbCk7XG4gICAgam9iLmRvbmUoKTtcbiAgfSBjYXRjaChleGNlcHRpb24pIHtcbiAgICBqb2IuZmFpbCgpO1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2pvYnMubWFpbC5zZW5kLmV4Y2VwdGlvbicsIGV4Y2VwdGlvbik7XG4gIH0gZmluYWxseSB7XG4gICAgY2IoKTtcbiAgfVxufSk7XG5cblxubmV3IEpvYihNYWlsSm9icywgJ2NsZWFudXAnLCB7fSlcbiAgICAucmVwZWF0KHsgc2NoZWR1bGU6IE1haWxKb2JzLmxhdGVyLnBhcnNlLnRleHQoXCJldmVyeSA1IG1pbnV0ZXNcIikgfSlcbiAgICAuc2F2ZSh7Y2FuY2VsUmVwZWF0czogdHJ1ZX0pXG5cbmxldCBxID0gTWFpbEpvYnMucHJvY2Vzc0pvYnMoJ2NsZWFudXAnLHsgcG9sbEludGVydmFsOiBmYWxzZSwgd29ya1RpbWVvdXQ6IDYwKjEwMDAgfSAsZnVuY3Rpb24gKGpvYiwgY2IpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gbmV3IERhdGUoKVxuICAgIGN1cnJlbnQuc2V0TWludXRlcyhjdXJyZW50LmdldE1pbnV0ZXMoKSAtIDUpO1xuXG4gICAgY29uc3QgaWRzID0gTWFpbEpvYnMuZmluZCh7XG4gICAgICAgICAgICBzdGF0dXM6IHskaW46IEpvYi5qb2JTdGF0dXNSZW1vdmFibGV9LFxuICAgICAgICAgICAgdXBkYXRlZDogeyRsdDogY3VycmVudH19LFxuICAgICAgICB7ZmllbGRzOiB7IF9pZDogMSB9fSk7XG5cbiAgICBsb2dNYWluKCdmb3VuZCAgcmVtb3ZhYmxlIGJsb2NrY2hhaW4gam9iczonLGlkcyk7XG4gICAgTWFpbEpvYnMucmVtb3ZlSm9icyhpZHMpO1xuICAgIGlmKGlkcy5sZW5ndGggPiAwKXtcbiAgICAgICAgam9iLmRvbmUoXCJSZW1vdmVkICN7aWRzLmxlbmd0aH0gb2xkIGpvYnNcIik7XG4gICAgfVxuICAgIGNiKCk7XG59KTtcblxuTWFpbEpvYnMuZmluZCh7IHR5cGU6ICdqb2JUeXBlJywgc3RhdHVzOiAncmVhZHknIH0pXG4gICAgLm9ic2VydmUoe1xuICAgICAgICBhZGRlZDogZnVuY3Rpb24gKCkgeyBxLnRyaWdnZXIoKTsgfVxuICAgIH0pO1xuXG4iLCJpbXBvcnQgJy9pbXBvcnRzL3N0YXJ0dXAvc2VydmVyJztcbmltcG9ydCAnLi9hcGkvaW5kZXguanMnO1xuIl19
