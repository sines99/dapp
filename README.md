## REST API

List of REST API Calls for the version 1

### Authentification

You need a valide token for some of the REST calls. Get the token with:

* Url: ``/api/v1/login``
* Parameter:
    + ``username`` - Authentification Username
    + ``password`` - Authentification Password

Response with valide credentials:
```
{
  "status": "success",
  "data": {
    "authToken": "BbTe9w3DTZhPNriUWv1aU6a_FDawlkYjKMQ6I2t3V2k",
    "userId": "8BxFMSZAc7Ez2iiR6"
  }
}
```
You can authorize yourself now with the request headers:
```
X-Auth-Token: BbTe9w3DTZhPNriUWv1aU6a_FDawlkYjKMQ6I2t3V2k
X-User-Id: 8BxFMSZAc7Ez2iiR6
```

### Calls

Create SOI
* Auth Required: yes
* Url: ``/api/v1/soi``
* Parameter:
    + ``recipient`` - Email recipient
    + ``sender`` - Email sender
    + ``customer_number`` - Recipient customer number
    + ``data_json`` - JSON string with recipient/SOI data

## Explanation

Some explanations for the mailid system

### NameId

The nameId is a 256-bit, ECDSA valid, number represanted as a 32 byte (64 characters) string (Same as every Bitcoin privateKey). See also: https://en.bitcoin.it/wiki/Private_key

## Useful meteor database calls
* Add test SOI to db:
``db.sois.insert({recipient: "recipient@sendeffect.de", sender: "sender@sendeffect.de", customer_number: "123456789", data_json: "{name: 'name', surname: 'surname'}", soi_timestamp: new Date()})``

* Logout all users:
``db.users.update({}, {$set: {"services.resume.loginTokens": []}}, {multi: true})``
