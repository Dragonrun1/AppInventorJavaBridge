Blockly.Java.parseJBridgeColorBlock = function (colorBlock) {
  var color = colorBlock.type.toUpperCase();
  return Blockly.Java.genJBridgeColorBlock(color);
};

Blockly.Java.genJBridgeColorBlock = function (color) {
  return color;
};