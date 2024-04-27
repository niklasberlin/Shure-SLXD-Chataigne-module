var flashtime = 2.5; //time the flashing indicator stays lit
var device_flashtime = 0;
var channel_1_flashtime = 0;
var channel_2_flashtime = 0;
var todo = false;
var last_received = {};

function init() {
  script.setUpdateRate(2);
  //request all value fields
  getAll();
}

function update(delta) {
  if (local.values.device.flashing.get()) {
    device_flashtime += 0.5;
    if (device_flashtime >= flashtime) {
      device_flashtime = 0;
      local.values.device.flashing.set(0);
    }
  }
  if (local.values.channel1.flashing.get()) {
    channel_1_flashtime += 0.5;
    if (channel_1_flashtime >= flashtime) {
      channel_1_flashtime = 0;
      local.values.channel1.flashing.set(0);
    }
  }
  if (local.values.channel2.flashing.get()) {
    channel_2_flashtime += 0.5;
    if (channel_2_flashtime >= flashtime) {
      channel_2_flashtime = 0;
      local.values.channel2.flashing.set(0);
    }
  }
}

function toInt(input) {
  //function is used to parse strings with leading 0 to int, parseInt assumes a number in octal representation due to the leading 0, so 05000 becomes 2560. with this function 05000 will be parsed as 5000.
  string = input;
  notNull = false;
  res = "";
  for (indx = 0; indx < string.length; indx++) {
    char = string.substring(indx, indx + 1);
    if (char != 0 || notNull) {
      res += char;
      notNull = true;
    }
  }

  return parseInt(res);
}

function dataReceived(inputData) {
  // example of incoming messages:
  // < REP x GROUP_CHANNEL {6,100} >  |  x is repolaced by the channel number
  // < REP x CHAN_NAME {yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy} >
  // < REP MODEL {SLXD4yyyyyyyyyyyyyyyyyyyyyyyyyyy} >
  // < SAMPLE 1 ALL 102 102 086 >
  // it is possible that we receive multiple messages in one data packet, we need to split them

  splitData = inputData.split(">");
  for (item = 0; item < splitData.length; item++) {
    data = splitData[item];
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
    }

    // Splitting the string by spaces
    parts = trimmedStr.split(" ");

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
        last_received["deviceID"] = util.getTime();
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
      if (parts[1] == "FLASH") {
        if (parts[2] == "ON") {
          local.values.device.flashing.set(true);
        } else {
          local.values.device.flashing.set(false);
        }
      }
      //CHANNEL INFOS
      if (parts[2] == "FLASH") {
        if (parts[3] == "ON") {
          local.values.getChild("channel" + parts[1]).flashing.set(true);
        } else {
          local.values.getChild("channel" + parts[1]).flashing.set(false);
        }
      }
      if (parts[2] == "CHAN_NAME") {
        key = "channel" + parts[1] + ".name";
        last_received[key] = util.getTime();
        local.values
          .getChild("channel" + parts[1])
          .getChild("name")
          .set(string);
      }
      if (parts[2] == "METER_RATE") {
        //root.modules.shureSLX_D.parameters.updateRateCh1
        local.parameters.getChild("updateRateCh" + parts[1]).setData(parts[3]);
      }
      if (parts[2] == "GROUP_CHANNEL") {
        grp_info = string.split(",");
        //root.modules.shureSLX_D.values.channel1.rfGroup
        if (grp_info[0] == "--") {
          grp_info[0] = 0;
        }
        if (grp_info[1] == "--") {
          grp_info[1] = 0;
        }
        local.values
          .getChild("channel" + parts[1])
          .rfGroup.set(parseInt(grp_info[0]));
        local.values
          .getChild("channel" + parts[1])
          .rfChannel.set(parseInt(grp_info[1]));
      }
      if (parts[2] == "AUDIO_GAIN") {
        if (parts[3][0] == 0) {
          parts[3] = parts[3].substring(1, parts[3].length);
        }
        //root.modules.shureSLX_D.parameters.updateRateCh1
        key = "channel" + parts[1] + ".audioGain";
        last_received[key] = util.getTime();
        local.values
          .getChild("channel" + parts[1])
          .audioGain.set(parseInt(parts[3]) - 18);
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
        local.values
          .getChild("channel" + parts[1])
          .rssiAnt.set(parseInt(parts[4]) - 120);
      }
      if (parts[2] == "AUDIO_LEVEL_PEAK") {
        //root.modules.shureSLX_D.parameters.updateRateCh1
        //root.modules.shureSLX_D.values.channel1.audioLevelRMS
        local.values
          .getChild("channel" + parts[1])
          .audioLevelPeak.set(parseInt(parts[3]) - 120);
      }
      if (parts[2] == "AUDIO_OUT_LVL_SWITCH") {
        //root.modules.shureSLX_D.parameters.updateRateCh1
        //root.modules.shureSLX_D.values.channel1.audioLevelRMS
        local.values
          .getChild("channel" + parts[1])
          .audioLevelSwitch.setData(parts[3]);
      }
      if (parts[2] == "FREQUENCY") {
        //root.modules.shureSLX_D.parameters.updateRateCh1
        //root.modules.shureSLX_D.values.channel1.audioLevelRMS
        dec = parts[3].substring(parts[3].length - 3, parts[3].length);
        lead = parts[3].substring(0, parts[3].length - 3);
        if (lead[0] == 0) {
          lead = lead.substring(1, lead.length);
        }

        local.values
          .getChild("channel" + parts[1])
          .frequency.set(lead + "." + dec);
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
        if (mins <= 65532) {
          hrs = Math.floor(mins / 60);
          min = mins - hrs * 60;
          lbl = hrs + " hrs " + min + " min";
        } else if (mins == 65533) {
          lbl = "Battery communication warning";
        } else if (mins == 65534) {
          lbl = "Battery time calculating";
        } else if (mins == 65535) {
          lbl = "UNKNOWN";
        }
        local.values.getChild("channel" + parts[1]).batteryRuntime.set(lbl);
      }
    } else if (parts[0] == "SAMPLE") {
      //this is sample Data
      //TODO: do something with it
      if (parts[2] == "ALL") {
        //Level Peak
        local.values
          .getChild("channel" + parts[1])
          .audioLevelPeak.set(parseInt(parts[3]) - 120);
        //Level RMS
        local.values
          .getChild("channel" + parts[1])
          .audioLevelRMS.set(parseInt(parts[4]) - 120);
        //RSSI
        local.values
          .getChild("channel" + parts[1])
          .rssiAnt.set(parseInt(parts[5]) - 120);
      }
    }
  }
}

function moduleParameterChanged(param) {
  //script.log(param.name + " parameter changed, new value: " + param.get());
  //root.modules.shureSLX_D.parameters.output.isConnected
  if (param.name == "isConnected" && param.get() == 1) {
    getAll();
  }
  if (param.name == "updateRateCh1") {
    setMeterRate(1, param.get());
  }
  if (param.name == "updateRateCh2") {
    setMeterRate(2, param.get());
  }
}

function moduleValueChanged(value) {
  //script.log(value.name + " value changed, new value: " + value.get());
  //script.log("parent element: " + value.getParent().name);
  if (value.getParent().name == "device") {
    if (value.name == "flashing" && value.get() == 1) {
      setFlashing(0); //flash channel 0 aka device
    }
    if (value.name == "deviceID") {
      key = "deviceID";
      if (last_received[key] < util.getTime() - 0.5) {
        setDeviceID(value.get());
      }
    }
  }
  if (value.getParent().name.substring(0, 7) == "channel") {
    channel = value.getParent().name.substring(7, 8);
    if (value.name == "flashing" && value.get() == 1) {
      setFlashing(channel);
    }
    if (value.name == "name") {
      key = "channel" + channel + ".name";
      if (last_received[key] < util.getTime() - 0.5) {
        setChannelName(channel, value.get());
      }
    }
    if (value.name == "audioGain") {
      key = "channel" + channel + ".audioGain";
      if (last_received[key] < util.getTime() - 0.5) {
        //only send a message when we have not received a value in a while
        setAudioGain(channel, value.get());
      }
    }
  }
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

function setFlashing(ch) {
  if (typeof ch == "undefined" || ch == 0) {
    local.send("< SET FLASH ON >");
  } else if (ch == 1 || ch == 2) {
    local.send("< SET " + ch + " FLASH ON >");
  }
}

function setDeviceID(newid) {
  local.send("< SET DEVICE_ID {" + newid + "} >");
}

function setChannelName(ch, newName) {
  if (ch == 1 || ch == 2) {
    local.send(
      "< SET " + ch + " CHAN_NAME {" + newName.substring(0, 8) + "} >"
    );
  }
}

function setAudioGain(ch, gain) {
  //< SET x AUDIO_GAIN 40 >
  if (ch == 1 || ch == 2) {
    local.send("< SET " + ch + " AUDIO_GAIN " + (gain + 18) + " >");
  }
}

function incAudioGain(ch, addgain) {
  //< SET x AUDIO_GAIN 40 >
  if (ch == 1 || ch == 2) {
    local.send("< SET " + ch + " AUDIO_GAIN INC " + addgain + " >");
  }
}

function decAudioGain(ch, addgain) {
  //< SET x AUDIO_GAIN 40 >
  if (ch == 1 || ch == 2) {
    local.send("< SET " + ch + " AUDIO_GAIN DEC " + addgain + " >");
  }
}

function setMeterRate(ch, rate) {
  rate = toInt(rate);
  //< SET x METER_RATE 01000 >
  if ((ch == 1 || ch == 2) && ((rate >= 100 && rate <= 65535) || rate == 0)) {
    local.send("< SET " + ch + " METER_RATE " + rate + " >");
  }
}
