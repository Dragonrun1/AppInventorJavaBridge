Blockly.Java.parseJBridgeProceduresBlocks = function (proceduresBlock) {
  var code = "";
  var proceduresType = proceduresBlock.type;
  if (proceduresType == "procedures_defnoreturn") {
    code = Blockly.Java.parseJBridgeProcDefNoReturn(proceduresBlock);
  } else if (proceduresType == "procedures_callnoreturn") {
    code = Blockly.Java.parseJBridgeProcCallNoReturn(proceduresBlock);
  }
  jBridgeIsIndividualBlock = true;
  return code;
};

Blockly.Java.parseJBridgeProcDefNoReturn = function (proceduresBlock) {
  var code = "";
  var procName = proceduresBlock.getFieldValue("NAME");
  var procParams = [];
  for (var x = 0, params; params = proceduresBlock.arguments_[x]; x++) {
    procParams.push("Object " + params);
  }

  isParsingJBridgeProcedure = true;
  var statementList = [];
  for (var x = 0, childBlock; childBlock = proceduresBlock.childBlocks_[x]; x++) {
    statementList.push(Blockly.Java.parseBlock(childBlock));
  }
  isParsingJBridgeProcedure = false;
  var body = statementList.join("\n");

  jBridgeProceduresMap[procName] = Blockly.Java.genJBridgeProcDefNoReturn(procName, procParams.join(", "), body);

  return code;
};

Blockly.Java.parseJBridgeProcCallNoReturn = function (proceduresBlock) {
  var procName = proceduresBlock.getFieldValue("PROCNAME");
  var paramsList = [];
  var code = "";
  var parentParamMap = Blockly.Java.getFieldMap(proceduresBlock.parentBlock_, "PARAMETERS");
  //parse all the params Block
  for (var y = 0, paramBlock; paramBlock = proceduresBlock.childBlocks_[y]; y++) {
    var genCode = Blockly.Java.parseBlock(paramBlock);
    if (jBridgeIsIndividualBlock) {
      code = code + genCode + "\n";
    } else {
      paramsList.push(genCode);
    }
  }

  var jBridgeParamList = [];

  for (var y = 0, param; param = paramsList[y]; y++) {
    jBridgeParamList.push(Blockly.Java.getJBridgeRelativeParamName(parentParamMap, param));
  }

  return Blockly.Java.genJBridgeProcCallNoReturn(procName, jBridgeParamList) + "\n" + code;
};

/**
 * Generates parameters for each method
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeProcDefNoReturn = function (procedureName, procedureParams, body) {
  var code = "\npublic void "
    + procedureName
    + "("
    + procedureParams
    + "){\n"
    + body
    + "\n}";
  return code;
};

Blockly.Java.genJBridgeProcCallNoReturn = function (procName, paramsList) {
  var code = procName
    + "("
    + paramsList.join(",")
    + ");";

  return code;
};
