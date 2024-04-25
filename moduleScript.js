function init() {
  script.log("Custom module init");
  //setup all value fields
  
  local.send("< GET 0 ALL >");
  //Message received : < GET 0 ALL >< SET 0 METER_RATE 5000 > //companion init

}

function dataReceived(data) {
  // example of incoming messages:
  // < REP x GROUP_CHANNEL {6,100} >  |  x is repolaced by the channel number
  // < REP x CHAN_NAME {yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy} >
  // < REP MODEL {SLXD4yyyyyyyyyyyyyyyyyyyyyyyyyyy} >
  // < SAMPLE 1 ALL 102 102 086 >
  // Removing the surrounding "<" and ">"
  trimmedStr = data.substring(2, data.length - 2);

  // Splitting the string by spaces
  parts = trimmedStr.split(" ");

  // Extracting the values
  msg = [
    parts[0], 
    parseInt(parts[1]), 
  ];

  if (parts.length > 4) {
    msg.push(parts[2]);
    if (msg[0] == "SAMPLE") {
      for (i = 3; i < parts.length; i++) {
        msg.push(parts[i]);
      }
    } else {
      msg.push(
        trimmedStr.substring(
          trimmedStr.indexOf("{"),
          trimmedStr.indexOf("}") + 1
        )
      ); 
    }
  } else if (parts.length == 4) {
    msg.push(parts[2]);
    msg.push(parts[3]); 
  }

  if (msg[0] == "REP") {
    //message is a return value from the receiver
    //TODO: do something with it
  } else if (msg[0] == "SAMPLE") {
    //this is sample Data
    //TODO: do something with it
  }

  script.log("PARSED MESSAGE");
  script.log(msg);
}

function moduleParameterChanged(param) {
  script.log(param.name + " parameter changed, new value: " + param.get());
}

function moduleValueChanged(value) {
  script.log(value.name + " value changed, new value: " + value.get());
}

function requestModel() {
  //< GET MODEL >
  local.send("< GET MODEL >");
}

function requestDeviceID() {
  //< GET DEVICE_ID >
  local.send("< GET DEVICE_ID >");
}

function requestRfBand() {
  //< GET RF_BAND >
  local.send("< GET RF_BAND >");
}

function requestLockState() {
  //< GET LOCK_STATUS >
  local.send("< GET LOCK_STATUS >");
}

function requestFwVersion() {
  //< GET FW_VER >
  local.send("< GET FW_VER >");
}

function requestChName(ch) {
  //< GET x CHAN_NAME >
  local.send("< GET " + ch + " CHAN_NAME >");
}

function requestChAGain(ch) {
  //< GET x AUDIO_GAIN >
  local.send("< GET " + ch + " AUDIO_GAIN >");
}

function requestChAudioOutLvlSwitch(ch) {
  //< GET x AUDIO_OUT_LVL_SWITCH >
  local.send("< GET " + ch + " AUDIO_OUT_LVL_SWITCH >");
}

function requestChGroup(ch) {
  //< GET x GROUP_CHANNEL >
  local.send("< GET " + ch + " GROUP_CHANNEL >");
}

function requestChFreq(ch) {
  //< GET x FREQUENCY >
  local.send("< GET " + ch + " FREQUENCY >");
}

// This is the callback function for the "Custom command" command
function customCmd(val) {
  script.log("Custom command called with value " + val);
}
