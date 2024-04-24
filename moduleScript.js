function init() {
  script.log("Custom module init");
  local.send('< GET 0 ALL >');
  //Message received : < GET 0 ALL >< SET 0 METER_RATE 5000 > //companion init
}

function dataReceived(data) {

  script.log("Received data : "+data);
  
  }

function moduleParameterChanged(param) {
  script.log(param.name + " parameter changed, new value: " + param.get());
}

function moduleValueChanged(value) {
  script.log(value.name + " value changed, new value: " + value.get());
}

// This is the callback function for the "Custom command" command
function customCmd(val) {
  script.log("Custom command called with value " + val);
  local.parameters.moduleParam.set(val);
}