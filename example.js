"use strict";
console.log("Loading browser sdk");
const axios = require('axios')
var  sdk =require('matrix-js-sdk') 

var BASE_URL = "http://192.168.88.90:8448";
var ROOM_ID = "!JxjfAAhBJrBcvxJerk:localhost";
var call;
var client
document.getElementById('login').addEventListener('submit',login) 
async function login (e){
    e.preventDefault()
    let username = document.getElementById('username').value
    let password = document.getElementById('password').value
    console.log(username,password,'wwwwwwww')
    let url = BASE_URL +'/_matrix/client/r0/login'
    try{ 
      let res = await axios.get(url)
      console.log(res.data,'get')
        let {data} = await axios.post(url,
          {
          "type":"m.login.password",
          "user":username,
          "password":password,
      })
      console.log(data)
      client = sdk.createClient({
        baseUrl: BASE_URL,
        accessToken: data.access_token,
        userId: data.user_id

    });
    client.on("sync", function(state, prevState, data) {
        switch (state) {
            case "PREPARED":
              syncComplete();
            break;
       }
    });
    client.startClient();
}catch(e){
console.log(e)
}
return false 
}



function disableButtons(place, answer, hangup) {
    document.getElementById("hangup").disabled = hangup;
    document.getElementById("answer").disabled = answer;
    document.getElementById("call").disabled = place;
}

function addListeners(call) {
    var lastError = "";
    call.on("hangup", function() {
        disableButtons(false, true, true);
        document.getElementById("result").innerHTML = (
            "<p>Call ended. Last error: "+lastError+"</p>"
        );
    });
    call.on("error", function(err) {
        lastError = err.message;
        call.hangup();
        disableButtons(false, true, true);
    });
}

window.onload = function() {
    document.getElementById("result").innerHTML = "<p>Please wait. Syncing...</p>";
    document.getElementById("config").innerHTML = "<p>" +
        "Homeserver: <code>"+BASE_URL+"</code><br/>"+
        "Room: <code>"+ROOM_ID+"</code><br/>"+
        "</p>";
    disableButtons(true, true, true);
};


function syncComplete() {
    document.getElementById("result").innerHTML = "<p>Ready for calls.</p>";
    disableButtons(false, true, true);

    document.getElementById("call").onclick = function() {
        console.log("Placing call...");
        call = sdk.createNewMatrixCall(
            client, ROOM_ID
        );
        console.log("Call => %s", call);
        addListeners(call);
        call.placeVideoCall(
            document.getElementById("remote"),
            document.getElementById("local")
        );
        document.getElementById("result").innerHTML = "<p>Placed call.</p>";
        disableButtons(true, true, false);
    };

    document.getElementById("hangup").onclick = function() {
        console.log("Hanging up call...");
        console.log("Call => %s", call);
        call.hangup();
        document.getElementById("result").innerHTML = "<p>Hungup call.</p>";
    };

    document.getElementById("answer").onclick = function() {
        console.log("Answering call...");
        console.log("Call => %s", call);
        var remoteVideo = document.getElementById('remote')
        var localVideo = document.getElementById('local')
        call.setLocalVideoElement(localVideo)
        call.setRemoteVideoElement(remoteVideo)
        call.answer();
        disableButtons(true, true, false);
        document.getElementById("result").innerHTML = "<p>Answered call.</p>";
    };

    client.on("Call.incoming", function(c) {
        console.log("Call ringing");
        disableButtons(true, false, false);
        document.getElementById("result").innerHTML = "<p>Incoming call...</p>";
        call = c;
        addListeners(call);
    });
}
