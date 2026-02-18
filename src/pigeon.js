var peerConnection;
var dataChannel;

var configuration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

function updateStatus(msg) {
    document.getElementById("status").innerText = msg;
}

function showHelp() {
  alert(
    "Royal Pigeon Messenger Instructions:\n\n" +
    "1. Open the app in two browsers (or devices).\n" +
    "2. On Browser A: Click 'Release Royal Pigeon (Create Offer)'.\n" +
    "3. Copy the SDP scroll from 'Royal Scroll (SDP)' and paste it into Browser B's 'Received Scroll'.\n" +
    "4. On Browser B: Click 'Receive Royal Pigeon (Create Answer)'.\n" +
    "5. Copy Browser B's scroll back into Browser A's 'Received Scroll'.\n" +
    "6. Click 'Seal the Pact' on Browser A.\n" +
    "7. Once status shows 'Pigeon Route Charted!', you can send messages.\n\n" +
    "Note: Scrolls are temporary. Recreate if connection fails."
  );
}

function createConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.ondatachannel = function(event) {
    dataChannel = event.channel;
    setupDataChannel();
  };

  peerConnection.onicecandidate = function(event) {
    if (!event.candidate) {
      document.getElementById("localSDP").value =
        JSON.stringify(peerConnection.localDescription);
      updateStatus("SDP generated, ready to copy scroll.");
    }
  };
}

function createOffer() {
  updateStatus("Creating offer… Please wait.");
  createConnection();

  dataChannel = peerConnection.createDataChannel("royalPigeon");
  setupDataChannel();

  peerConnection.createOffer().then(function(offer) {
    return peerConnection.setLocalDescription(offer);
  }).then(function() {
    updateStatus("Offer created! Copy your scroll to send to peer.");
  });
}

function createAnswer() {
  updateStatus("Creating answer… Please wait.");
  createConnection();

  var remoteDesc = new RTCSessionDescription(
    JSON.parse(document.getElementById("remoteSDP").value)
  );

  peerConnection.setRemoteDescription(remoteDesc).then(function() {
    return peerConnection.createAnswer();
  }).then(function(answer) {
    return peerConnection.setLocalDescription(answer);
  }).then(function() {
    updateStatus("Answer created! Copy your scroll back to the other peer.");
  });
}

function setRemote() {
    var remoteDesc = new RTCSessionDescription(
      JSON.parse(document.getElementById("remoteSDP").value)
    );

    peerConnection.setRemoteDescription(remoteDesc);
    updateStatus("Remote scroll applied. Waiting for connection…");
}

function setupDataChannel() {
  dataChannel.onopen = function() {
    addMessage("Pigeon Route Charted!");
    updateStatus("Connection established! You may send messages.");
  };

  dataChannel.onmessage = function(event) {
    addMessage("Scroll Received: " + event.data);
  };
}

function sendMessage() {
  var message = document.getElementById("messageBox").value;

  if (!dataChannel || dataChannel.readyState !== "open") {
    alert("The pigeon has not yet taken flight.");
    return;
  }

  dataChannel.send(message);
  addMessage("Scroll Sent: " + message);
  document.getElementById("messageBox").value = "";
}

function addMessage(text) {
  var chat = document.getElementById("chat");
  var p = document.createElement("p");
  p.innerHTML = text;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}
