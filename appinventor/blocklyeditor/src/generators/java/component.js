/**
 * Parses a Jbridge Component block
 * @param componentBlock The block to parse
 * @returns {string} The java code for the block
 */
Blockly.Java.parseJBridgeComponentBlock = function (componentBlock) {
  var code = "";
  var componentType = componentBlock.type;
  if (componentType == "component_event") {
    code = Blockly.Java.parseJBridgeEventBlock(componentBlock);
  } else if (componentType == "component_set_get") {
    if (componentBlock.setOrGet == "set") {
      code = Blockly.Java.parseJBridgeSetBlock(componentBlock);
      jBridgeIsIndividualBlock = true;
    } else {
      code = Blockly.Java.parseJBridgeGetBlock(componentBlock);
    }
  } else if (componentType == "component_method") {
    code = Blockly.Java.parseJBridgeMethodCallBlock(componentBlock);
    Blockly.Java.addPermisionsAndIntents(componentBlock.methodName);
    //ParentBlock is set block and the first child block of parent is currentBlock, then this is arg in the parent's block
    if ((componentBlock.parentBlock_.type == "component_set_get" && componentBlock.parentBlock_.setOrGet == "set" && componentBlock.parentBlock_.childBlocks_[0] == componentBlock)
      || (componentBlock.parentBlock_.type == "text_join")
      || (componentBlock.parentBlock_.type == "component_method" && Blockly.Java.checkInputName(componentBlock.parentBlock_, "ARG") && componentBlock.parentBlock_.childBlocks_[0] == componentBlock)
      || (componentBlock.parentBlock_.type == "lexical_variable_set")) {
      jBridgeIsIndividualBlock = false;
      if (code.slice(-2) == ";\n") {
        code = code.slice(0, -2);
      }
    }
    else {
      jBridgeIsIndividualBlZock = true;
    }
  } else if (componentType == "component_component_block") {
    code = Blockly.Java.parseJBridgeComponentComponentBlock(componentBlock);
  } else {
    code = "Invalid Component type : " + componentType;
  }

  return code;
};

/**
 * Parses each event block
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.parseJBridgeEventBlock = function (eventBlock, isChildBlock) {
  var code = "";
  isChildBlock = typeof isChildBlock !== 'undefined' ? isChildBlock : false;
  var componentName = eventBlock.instanceName;
  var eventName = eventBlock.eventName;
  methodParam = eventBlock.eventName; //method param is now eventname instead of methodname in the case of a set/get block
  var body = "";
  //reset the event method params from the last event method generation
  eventMethodParamListings = new Object();
  jBridgeParsingEventMethod = true;
  for (var x = 0, childBlock; childBlock = eventBlock.childBlocks_[x]; x++) {
    body = body
      + "\n"
      + Blockly.Java.parseBlock(childBlock);
  }
  //add any setup code (e.x. List declaration before usage)
  body = jBridgeEventMethodSetupCode + body;
  jBridgeEventMethodSetupCode = "";

  jBridgeParsingEventMethod = false;
  //This is to handle the if the component is the Screen Object
  if (componentName == jBridgeCurrentScreen) {
    componentName = "this";
  }
  code = Blockly.Java.genJBridgeEventBlock(componentName, eventName, body);

  //Add to RegisterEventsMap
  jBridgeRegisterEventMap[eventName] = Blockly.Java.genJBridgeEventDispatcher(eventName);

  return code;
};

/* Parses a set block of any component
*/
Blockly.Java.parseJBridgeSetBlock = function (setBlock) {
  var componentName = Blockly.Java.getJBridgeInstanceName(setBlock);
  var property = setBlock.propertyName;
  var ListPicker = "ListPicker";
  var YailList = "YailList";
  var value = "";
  var code = "";
  //iterate through one child or until the second to last block depending on children
  var childLength = setBlock.childBlocks_.length > 1 ? setBlock.childBlocks_.length - 1 : 1;

  //retreive param types for component set method
  var paramTypes = methodParamsMap[property];
  var supportedMethod = false;
  if (paramTypes != undefined) {
    supportedMethod = true;
  } else {
    console.log("Component Set Method (" + property + ") not supported in " + jBridgeCurrentScreen);
  }
  for (var x = 0, childBlock; x < childLength; x++) {
    childBlock = setBlock.childBlocks_[x];
    var genCode = Blockly.Java.parseBlock(childBlock);

    //assert param is casted to required type
    if (supportedMethod) {
      var paramType = paramTypes[x];
      genCode = Blockly.Java.assertType(paramType, genCode, childBlock);
    }

    if (jBridgeIsIndividualBlock) {
      code = code + genCode + "\n";
    } else {
      value = value + genCode;
    }
  }
  //always cast parameters when parsing procedure
  if (Blockly.Java.shouldParseSetBlockValue(setBlock, setBlock.childBlocks_[0])) {
    //component set methods only take one parameter
    var params = methodParamsMap[property];
    if (params != undefined) {
      var type = params[0];
      value = Blockly.Java.castToType(type, value);
    }
  }
  //If value is not already a string, apply String.valueOf(value)
  if (JBRIDGE_COMPONENT_TEXT_PROPERTIES.indexOf(property) > -1) {
    //setting a string property to an integer should call String.valueOf()
    if (setBlock.childBlocks_[0].category.toLowerCase() == "math"
      || setBlock.childBlocks_[0].category.toLowerCase() == "lists") {
      value = "String.valueOf(" + value + ")";
    }
  }
  if ((componentName.slice(0, ListPicker.length) == ListPicker) && (property == "Elements")) {
    if (!jBridgeImportsMap[YailList]) {
      jBridgeImportsMap[YailList] = "import com.google.appinventor.components.runtime.util.YailList;";
    }
    value = "YailList.makeList(" + value + ")";
  }

  if (Blockly.Java.isNumber(value)) {
    //Java Bridge requires integers, floating point numbers will throw an exception
    value = Math.round(value);
  }
  code = Blockly.Java.genJBridgeSetBlock(componentName, property, value) + "\n" + code;
  //parse the next block if there is one
  if (setBlock.childBlocks_.length > 1) {
    code += Blockly.Java.parseBlock(setBlock.childBlocks_[setBlock.childBlocks_.length - 1]);
  }
  return code;
};

/**
 * Returns whether a component set block needs to cast its value. For example, this is the case with TinyDB.getValue() where it always
 * returns a Java Object that needs to be casted to the component method's required type.
 * */
Blockly.Java.shouldParseSetBlockValue = function (setBlock, childBlock) {
  var shouldParse = false;
  if (isParsingJBridgeProcedure) {
    shouldParse = true;
  } else if (childBlock.typeName == "TinyDB") {
    shouldParse = true;
  } else if (Blockly.Java.isMathOperationBlock(childBlock)) {
    //Math operations might return doubles
    shouldParse = true;
  }
  return shouldParse;
};

Blockly.Java.parseJBridgeGetBlock = function (getBlock) {
  var componentName = Blockly.Java.getJBridgeInstanceName(getBlock);
  var property = getBlock.propertyName;
  return Blockly.Java.genJBridgeGetBlock(componentName, property);
};

/**
 * creates params list from field map generation from the particular component method
 */
Blockly.Java.parseJBridgeMethodCallBlock = function (methodCallBlock) {
  var objectName = methodCallBlock.instanceName;
  var methodName = methodCallBlock.methodName;
  var parentParamMap = Blockly.Java.getFieldMap(methodCallBlock.parentBlock_, "PARAMETERS");
  var test = methodCallBlock.parentBlock_.getFieldValue("ARG0");
  var paramsList = [];
  var code = "";

  //parse all the params Block
  var params = methodParamsMap[methodName];
  var count = 0;
  if (params != undefined) {
    for (var typeIndex in params) {
      var paramBlock = methodCallBlock.childBlocks_[count];
      var genCode = Blockly.Java.parseBlock(paramBlock);

      //assert the param is casted to type required by method
      var requiredType = params[typeIndex];
      genCode = Blockly.Java.assertType(requiredType, genCode, paramBlock);

      if (jBridgeIsIndividualBlock) {
        code = code + genCode + "\n";
      } else {
        paramsList.push(genCode);
      }
      count++;
    }

    //parse next blocks that are not parameters
    while (count < methodCallBlock.childBlocks_.length) {
      var childBlock = methodCallBlock.childBlocks_[count];
      var childCode = Blockly.Java.parseBlock(childBlock);
      code = code + childCode + "\n";
      count++;
    }

    var jBridgeParamList = [];

    for (var y = 0, param; param = paramsList[y]; y++) {
      jBridgeParamList.push(Blockly.Java.getJBridgeRelativeParamName(parentParamMap, param));
    }
    if (objectName == "TinyWebDB1" && methodName == "StoreValue") {
      var YailList = "YailList";
      if (!jBridgeImportsMap[YailList]) {
        jBridgeImportsMap[YailList] = "import com.google.appinventor.components.runtime.util.YailList;";
      }
      jBridgeParamList[1] = "YailList.makeList(" + jBridgeParamList[1] + ")";
    }

    code = Blockly.Java.genJBridgeMethodCallBlock(objectName, methodName, paramsList) + "\n" + code;
  }
  return code;
};

Blockly.Java.parseJBridgeComponentComponentBlock = function (componentBlock) {
  var name = componentBlock.instanceName;
  return Blockly.Java.genJBridgeComponentComponentBlock(name);
};

/**
 * Generates the listener within the dispatchEvent method for each component that is used and
 * their corresponding parameters.
 *
 * @param {String} componentName is the name of the component passed in
 * @param {String} eventName is the name of the event being currently handled
 * @param {String} body
 * @returns {String} the generated code if there were no errors.
 */
//Event Blocks are actualy the "When Blocks"
Blockly.Java.genJBridgeEventBlock = function (componentName, eventName, body) {
  var eventMethodName = componentName + eventName;
  var calledMethodParams = Blockly.Java.createCalledMethodParameterString(body);
  var code = "\nif( component.equals(" + componentName + ") && eventName.equals(\"" + eventName + "\") ){\n"
    + eventMethodName + "(" + calledMethodParams + ");\n" //create event method
    + "return true;\n"
    + "}";
  Blockly.Java.addComponentEventMethod(eventMethodName, body);
  return code;
};

Blockly.Java.genJBridgeEventDispatcher = function (eventName) {
  return "EventDispatcher.registerEventForDelegation(this, \"" + eventName + "Event\", \"" + eventName + "\" );";
};

Blockly.Java.genJBridgeSetBlock = function (componentName, property, value) {
  var code = componentName
    + "."
    + property
    + "("
    + value
    + ");";
  return code;
};

Blockly.Java.genJBridgeGetBlock = function (componentName, property) {
  var code = Blockly.Java.JBridgeCheckProperty(componentName, property);
  return code;
};

/**
 * Generates the method call block for the component method
 * @param objectName
 * @param methodName
 * @param paramsList
 * @returns {string}
 */
Blockly.Java.genJBridgeMethodCallBlock = function (objectName, methodName, paramsList) {
  var code = "";
// use splice to get all the arguments after 'methodName'
  var args = Array.prototype.splice.call(arguments, 2);
  code = objectName
    + "."
    + methodName
    + "("
    + paramsList.join(", ")
    + ");";

  return code;
};

Blockly.Java.genJBridgeComponentComponentBlock = function (name) {
  var code = name;
  return code;
};