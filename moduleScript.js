function init() {
  script.log("Custom module init");
  //setup all value fields
  getAll();
}

function dataReceived(inputData) {
  script.log("INPUT DATA");
  script.log(inputData);
  script.log(" ");
  // example of incoming messages:
  // < REP x GROUP_CHANNEL {6,100} >  |  x is repolaced by the channel number
  // < REP x CHAN_NAME {yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy} >
  // < REP MODEL {SLXD4yyyyyyyyyyyyyyyyyyyyyyyyyyy} >
  // < SAMPLE 1 ALL 102 102 086 >
  // it is possible that we receive multiple messages in one data packet, we need to split them

  splitData = inputData.split(">");
  for (item = 0; item < splitData.length; item++) {
    data = splitData[item];
    script.log("single Line:    " + data);
    // Removing the surrounding "<" and ">"
    trimmedStr = data.substring(2, data.length - 1);
    // remove possible string answers
    if (trimmedStr.indexOf("{") > -1) {
      string = trimmedStr.substring(
        trimmedStr.indexOf("{"),
        trimmedStr.indexOf("}") + 1
      );
      trimmedStr = trimmedStr.replace(string, "");
      string = string.replace("{", "").replace("}", "");
      script.log("String:    " + string);
    }

    // Splitting the string by spaces
    parts = trimmedStr.split(" ");
    script.log("Parts:    ");
    script.log(parts);
    script.log(" ");

    if (parts[0] == "REP") {
      //message is a return value from the receiver
      //TODO: do something with it
      //script.log(parts[2]);

      //DEVICE INFOS
      if (parts[1] == "MODEL") {
        local.values.device.modellName.set(string);
      }
      if (parts[1] == "DEVICE_ID") {
        local.values.device.deviceID.set(string);
      }
      if (parts[1] == "FW_VER") {
        local.values.device.fwVersion.set(string);
      }
      if (parts[1] == "RF_BAND") {
        local.values.device.rfBand.set(string);
      }
      if (parts[1] == "LOCK_STATUS") {
        local.values.device.lockStatus.setData(parts[2]);
      }
      //CHANNEL INFOS
      if (parts[2] == "CHAN_NAME") {
        local.values
          .getChild("channel" + parts[1])
          .getChild("name")
          .set(string);
      }
      if (parts[2] == "METER_RATE") {
        //root.modules.shureSLX_D.parameters.updateRateCh1
        local.parameters.getChild("updateRateCh" + parts[1]).set(parts[3]);
      }
      if (parts[2] == "GROUP_CHANNEL") {
        grp_info = string.split(",");
        //root.modules.shureSLX_D.values.channel1.rfGroup
        if (grp_info[0] == "--"){
          grp_info[0]=0;
        }
        if (grp_info[1] == "--"){
          grp_info[1]=0;
        }
        local.values
          .getChild("channel" + parts[1])
          .rfGroup.set(parseInt(grp_info[0]));
        local.values
          .getChild("channel" + parts[1])
          .rfChannel.set(parseInt(grp_info[1]));
      }
      if (parts[2] == "AUDIO_GAIN") {
        //root.modules.shureSLX_D.parameters.updateRateCh1
        local.values
          .getChild("channel" + parts[1])
          .audioGain.set(parseInt(parts[3]) - 14);
      }
      if (parts[2] == "AUDIO_LEVEL_RMS") {
        local.values
          .getChild("channel" + parts[1])
          .audioLevelRMS.set(parseInt(parts[3]) - 120);
      }
      if (parts[2] == "AUDIO_LEVEL_PEAK") {
        local.values
          .getChild("channel" + parts[1])
          .audioLevelPeak.set(parseInt(parts[3]) - 120);
      }
      if (parts[2] == "RSSI") {
        //root.modules.shureSLX_D.values.channel1.rssiAntA
        if (parts[1] == 1) {
          local.values
            .getChild("channel" + parts[1])
            .rssiAntA.set(parseInt(parts[4]) - 120);
        }else if(parts[1] == 2) {
          local.values
            .getChild("channel" + parts[1])
            .rssiAntB.set(parseInt(parts[4]) - 120);
        }
      }
      if (parts[2] == "AUDIO_LEVEL_PEAK") {
        //root.modules.shureSLX_D.parameters.updateRateCh1
        //root.modules.shureSLX_D.values.channel1.audioLevelRMS
        local.values
          .getChild("channel" + parts[1])
          .audioLevelPeak.set(parseInt(parts[3]) - 120);
      }
      if (parts[2] == "TX_BATT_BARS") {
        //root.modules.shureSLX_D.values.channel1.batteryBars
        local.values
          .getChild("channel" + parts[1])
          .batteryBars.setData(parseInt(parts[3]));
      }
      if (parts[2] == "TX_MODEL") {
        //root.modules.shureSLX_D.values.channel1.batteryBars
        local.values
          .getChild("channel" + parts[1])
          .transmitterType.set(parts[3]);
      }
      if (parts[2] == "TX_BATT_MINS") {
        //root.modules.shureSLX_D.values.channel1.batteryBars
        mins = parseInt(parts[3]);
        if(mins<=65532){
          hrs = Math.floor(mins/60);
          min = mins-hrs*60;
          lbl = hrs+" hrs "+min+" min";
        }else if(mins == 65533){
          lbl = "Battery communication warning";
        }else if(mins == 65534){
          lbl = "Battery time calculating";
        }else if(mins == 65535){
          lbl = "UNKNOWN";
        }
        local.values
          .getChild("channel" + parts[1])
          .batteryRuntime.set(lbl);
      }
    } else if (parts[0] == "SAMPLE") {
      //this is sample Data
      //TODO: do something with it
    }
  }
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

function getAll() {
  local.send("< GET 0 ALL >");
  //Message received : < GET 0 ALL >< SET 0 METER_RATE 5000 > //companion init
}

// This is the callback function for the "Custom command" command
function customCmd(val) {
  script.log("Custom command called with value " + val);
}
