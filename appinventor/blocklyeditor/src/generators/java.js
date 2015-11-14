// -*- mode: java; c-basic-offset: 2; -*-
// Copyright 2012 Massachusetts Institute of Technology. All rights reserved.

/**
 * @fileoverview Helper functions for generating Java for blocks.
 * @author andrew.f.mckinney@gmail.com (Andrew F. McKinney)
 * @author sharon@google.com (Sharon Perl)
 */

'use strict';

goog.provide('Blockly.Java');

goog.require('Blockly.Generator');

Blockly.Java = new Blockly.Generator('Java');

/**
 * List of illegal variable names. This is not intended to be a security feature.  Blockly is 
 * 100% client-side, so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * 
 * TODO: fill this in or remove it.
 * @private
 */
Blockly.Yail.RESERVED_WORDS_ = '';

/**
 * Order of operation ENUMs.
 * https://developer.mozilla.org/en/Yail/Reference/Operators/Operator_Precedence
 */
Blockly.Yail.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Yail.ORDER_NONE = 99;          // (...)

Blockly.Yail.YAIL_ADD_COMPONENT = "(add-component ";
Blockly.Yail.YAIL_ADD_TO_LIST = "(add-to-list ";
Blockly.Yail.YAIL_BEGIN = "(begin ";
Blockly.Yail.YAIL_CALL_COMPONENT_METHOD = "(call-component-method ";
Blockly.Yail.YAIL_CALL_COMPONENT_TYPE_METHOD = "(call-component-type-method ";
Blockly.Yail.YAIL_CALL_YAIL_PRIMITIVE = "(call-yail-primitive ";
Blockly.Yail.YAIL_CLEAR_FORM = "(clear-current-form)";
// The lines below are complicated because we want to support versions of the
// Companion older then 2.20ai2 which do not have set-form-name defined
Blockly.Yail.YAIL_SET_FORM_NAME_BEGIN = "(try-catch (let ((attempt (delay (set-form-name \"";
Blockly.Yail.YAIL_SET_FORM_NAME_END = "\")))) (force attempt)) (exception java.lang.Throwable 'notfound))";
Blockly.Yail.YAIL_CLOSE_COMBINATION = ")";
Blockly.Yail.YAIL_CLOSE_BLOCK = ")\n";
Blockly.Yail.YAIL_COMMENT_MAJOR = ";;; ";
Blockly.Yail.YAIL_COMPONENT_REMOVE = "(remove-component ";
Blockly.Yail.YAIL_COMPONENT_TYPE = "component";
Blockly.Yail.YAIL_DEFINE = "(def ";
Blockly.Yail.YAIL_DEFINE_EVENT = "(define-event ";
Blockly.Yail.YAIL_DEFINE_FORM = "(define-form ";
Blockly.Yail.YAIL_DO_AFTER_FORM_CREATION = "(do-after-form-creation ";
Blockly.Yail.YAIL_DOUBLE_QUOTE = "\"";
Blockly.Yail.YAIL_FALSE = "#f";
Blockly.Yail.YAIL_FOREACH = "(foreach ";
Blockly.Yail.YAIL_FORRANGE = "(forrange ";
Blockly.Yail.YAIL_GET_COMPONENT = "(get-component ";
Blockly.Yail.YAIL_GET_PROPERTY = "(get-property ";
Blockly.Yail.YAIL_GET_COMPONENT_TYPE_PROPERTY = "(get-property-and-check  ";
Blockly.Yail.YAIL_GET_VARIABLE = "(get-var ";
Blockly.Yail.YAIL_AND_DELAYED = "(and-delayed ";
Blockly.Yail.YAIL_OR_DELAYED = "(or-delayed ";
Blockly.Yail.YAIL_IF = "(if ";
Blockly.Yail.YAIL_INIT_RUNTIME = "(init-runtime)";
Blockly.Yail.YAIL_INITIALIZE_COMPONENTS = "(call-Initialize-of-components";
Blockly.Yail.YAIL_LET = "(let ";
Blockly.Yail.YAIL_LEXICAL_VALUE = "(lexical-value ";
Blockly.Yail.YAIL_SET_LEXICAL_VALUE = "(set-lexical! ";
Blockly.Yail.YAIL_LINE_FEED = "\n";
Blockly.Yail.YAIL_NULL = "(get-var *the-null-value*)";
Blockly.Yail.YAIL_EMPTY_LIST = "'()";
Blockly.Yail.YAIL_OPEN_BLOCK = "(";
Blockly.Yail.YAIL_OPEN_COMBINATION = "(";
Blockly.Yail.YAIL_QUOTE = "'";
Blockly.Yail.YAIL_RENAME_COMPONENT = "(rename-component ";
Blockly.Yail.YAIL_SET_AND_COERCE_PROPERTY = "(set-and-coerce-property! ";
Blockly.Yail.YAIL_SET_AND_COERCE_COMPONENT_TYPE_PROPERTY = "(set-and-coerce-property-and-check! ";
Blockly.Yail.YAIL_SET_SUBFORM_LAYOUT_PROPERTY = "(%set-subform-layout-property! ";
Blockly.Yail.YAIL_SET_VARIABLE = "(set-var! ";
Blockly.Yail.YAIL_SET_THIS_FORM = "(set-this-form)\n ";
Blockly.Yail.YAIL_SPACER = " ";
Blockly.Yail.YAIL_TRUE = "#t";
Blockly.Yail.YAIL_WHILE = "(while ";
Blockly.Yail.YAIL_LIST_CONSTRUCTOR = "*list-for-runtime*";

Blockly.Yail.SIMPLE_HEX_PREFIX = "&H";
Blockly.Yail.YAIL_HEX_PREFIX = "#x";

// permit leading and trailing whitespace for checking that strings are numbers
Blockly.Yail.INTEGER_REGEXP = "^[\\s]*[-+]?[0-9]+[\\s]*$";
Blockly.Yail.FLONUM_REGEXP = "^[\\s]*[-+]?([0-9]*)((\\.[0-9]+)|[0-9]\\.)[\\s]*$";


Blockly.Yail.JBRIDGE_BASE_IMPORTS = "import com.google.appinventor.components.runtime.HandlesEventDispatching; \nimport com.google.appinventor.components.runtime.EventDispatcher; \nimport com.google.appinventor.components.runtime.Form; \nimport com.google.appinventor.components.runtime.Component; \n";
Blockly.Yail.JBRIDGE_PACKAGE_NAME = "\npackage org.appinventor.Screen1; \n";

// Blockly.Yail.JBRIDGE_DECLARE = [];
// Blockly.Yail.JBRIDGE_DEFINE = [];
// Blockly.Yail.JBRIDGE_IMPORTS = [];
var jBridgeTopBlockCodesList = [];
var jBridgeRegisterEventMap = new Object();
var jBridgeEventsList = [];
var jBridgeVariableDefinitionMap = new Object();
var jBridgeInitializationList = [];
var jBridgeComponentMap = new Object();
var JBRIDGE_COMPONENT_SKIP_PROPERTIES = ["Uuid", "$Version", "TextAlignment"]; //properties to skip when reading Json File
var JBRIDGE_JSON_TEXT_PROPERTIES = ["Title", "Text", "BackgroundImage", "Image", "Icon", "Source", "Picture", "Hint", "Action", "ActivityClass", "ActivityPackage"]; //Properties that should include the double qoutes "" in the output JBridge Javacode
var jBridgeImportsMap = new Object();
var jBridgeProceduresMap = new Object();
var jBridgeIsIndividualBlock = false; // is to Identify if a block is Iduvidal root block or sub-block
var jBridgeCurrentScreen = "Screen1";
var JBRIDGE_COMPONENT_TEXT_PROPERTIES = ["text", "picture", "source"];

var jBridgePermissionToAdd = new Object; //this should be a set
var jBridgeIntentsToAdd = new Object; // this should be a set
var jBridgeAndroidPermisions = new Object();
var jBridgeAndroidIntents = new Object();
var jBridgeMethodAndTypeToPermisions = new Object();

/**
 * Generate the Yail code for this blocks workspace, given its associated form specification.
 * 
 * @param {String} formJson JSON string describing the contents of the form. This is the JSON
 *    content from the ".scm" file for this form.
 * @param {String} packageName the name of the package (to put in the define-form call)
 * @param {Boolean} forRepl  true if the code is being generated for the REPL, false if for an apk
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.getFormJava = function(formJson, packageName, forRepl) {
  var jsonObject = JSON.parse(formJson); 
  var javaCode = [];
  javaCode.push(Blockly.Yail.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), jsonObject));
  
  prityPrintCode = Blockly.Java.prityPrintJBridgeCode(javaCode.join('\n')); 
  return prityPrintCode;
};


Blockly.Yail.genJBridgeCode = function(topBlocks, jsonObject){
  Blockly.Yail.initAllVariables();
  Blockly.Yail.parseJBridgeJsonData(jsonObject);
  Blockly.Yail.parseTopBlocks(topBlocks);

  var code = Blockly.Yail.JBRIDGE_PACKAGE_NAME + 
  Blockly.Yail.JBRIDGE_BASE_IMPORTS +
  Blockly.Yail.genComponentImport(jBridgeImportsMap)+
  Blockly.Yail.genJBridgeClass(topBlocks);

  return code;  
};

Blockly.Yail.initAllVariables = function(){
    jBridgeTopBlockCodesList = [];
    jBridgeRegisterEventMap = new Object();
    jBridgeEventsList = [];
    jBridgeVariableDefinitionMap = new Object();
    jBridgeInitializationList = [];
    jBridgeComponentMap = new Object();
    jBridgeImportsMap = new Object();
    jBridgeProceduresMap = new Object();

};

Blockly.Yail.parseJBridgeJsonData = function(jsonObject){
  var property = jsonObject.Properties;
  var title = property.Title;
  var icon = property.Icon;
  if (title != undefined){
    jBridgeInitializationList.push("this.Title(\""+title +"\");");
  }if(icon != undefined){
    jBridgeInitializationList.push("this.Icon(\""+icon +"\");");
  }
  for(var i=0;i<property.$Components.length;i++){
    Blockly.Yail.parseJBridgeJsonComopnents(property.$Components[i], "this");
  } 

   

};

Blockly.Yail.parseJBridgeJsonComopnents = function (componentJson, rootName){
  var name = componentJson.$Name;

  //Not sure y there are component with undefined name.
  // Assuiming if a component has no name, its not a valid component 
  if(name == undefined){
    return;
  }
  jBridgeComponentMap[name] = [];
  jBridgeComponentMap[name].push({"rootName":rootName});
  jBridgeComponentMap[name].push({"Type": componentJson.$Type});

  jBridgeVariableDefinitionMap[name] = componentJson.$Type;
  jBridgeImportsMap[componentJson.$Type] = "import com.google.appinventor.components.runtime."+componentJson.$Type+";"; 
  var newObj = name
               +" = new "
               +componentJson.$Type
               +"("
               +rootName
               +");";
  jBridgeInitializationList.push(newObj);  
  if(componentJson.$Type.toLowerCase() == "imagesprite"){
    jBridgeInitializationList.push(name +".Initialize();");  
  }
  var componentsObj = undefined;
  for (var key in componentJson) {
    if (JBRIDGE_COMPONENT_SKIP_PROPERTIES.indexOf(key) <= -1 
         && key != "$Name" && key != "$Type" && componentJson.hasOwnProperty(key)) {
      if(key == "$Components"){
        componentsObj = componentJson[key];
      }else{
        //Removing the $ sign on ceratin properties in the json file
        var printableKey = key;
        if (key.charAt(0) == "$"){
          printableKey = key.substring(1);
        }
        jBridgeComponentMap[name].push({printableKey:componentJson[key]})
        //Convert color code & lower case for boolean value
        var valueOfLowerCase =componentJson[key].toLowerCase();
        var printableValue =componentJson[key];
        if(componentJson[key].substring(0,2) == "&H" && componentJson[key].length == 10){
          printableValue ="0x"+componentJson[key].substring(2);
        }
        //for True and False properties 
        if(valueOfLowerCase == "true" || valueOfLowerCase == "false"){
              printableValue = valueOfLowerCase;
        }
        //for properties that require qoutes ""
        if(JBRIDGE_JSON_TEXT_PROPERTIES.indexOf(key) > -1){
          printableValue = "\""+ printableValue +"\"";
        }
        jBridgeInitializationList.push(Blockly.Yail.genJBridgeJsonComopnents(name, printableKey, printableValue));
      }
    }
  }
  //Assuming that $Components Property is always an array 
  if(componentsObj != undefined){
    for(var i=0;i<componentsObj.length;i++){
      Blockly.Yail.parseJBridgeJsonComopnents(componentsObj[i], name);
    } 
  }
};

Blockly.Yail.genJBridgeJsonComopnents = function (componentName, property, value){
var code = componentName
           +"."
           +property
           +"("
           +value
           +");"
return code;
};

Blockly.Yail.parseComponentDefinition = function(jBridgeVariableDefinitionMap){
  var code = "";
  for (var key in jBridgeVariableDefinitionMap) {
      code = code 
             + Blockly.Yail.genComponentDefinition(jBridgeVariableDefinitionMap[key], key)
             +"\n";
             Blockly.Java.addPermisionsAndIntents(jBridgeVariableDefinitionMap[key]);
  }
  return code;
};

Blockly.Yail.genComponentDefinition = function(type, name){
  var code = "private "
             + type
             + " "
             + name
             +";";
  return code;
};

Blockly.Yail.genComponentImport = function(jBridgeImportsMap){
  var code = "";
  for (var key in jBridgeImportsMap) {
      code = code 
             + '\n' 
             + jBridgeImportsMap[key];
  }
  return code;
};

Blockly.Yail.genJBridgeClass =  function (topBlocks){
  var code = "\npublic class Screen1 extends Form implements HandlesEventDispatching { \n"
    + Blockly.Yail.parseComponentDefinition(jBridgeVariableDefinitionMap)
    + Blockly.Yail.genJBridgeDefineMethod()
    + Blockly.Yail.genJBridgeDispatchEvent()
    + Blockly.Yail.genJBridgeDefineProcedure(jBridgeProceduresMap)
    +"\n}\n";
  return code;
};

Blockly.Yail.genJBridgeEventsRegister = function(jBridgeRegisterEventMap){
  var registeredEvents = []
  for(var key in jBridgeRegisterEventMap){
      registeredEvents.push(jBridgeRegisterEventMap[key]);
  }
  return registeredEvents.join("\n");
};

Blockly.Yail.genJBridgeDefineMethod =  function (){
 var code =  "\nprotected void $define() { \n"
  + jBridgeInitializationList.join("\n")
  + "\n"
  + Blockly.Yail.genJBridgeEventsRegister(jBridgeRegisterEventMap)
  +"\n}";
    return code;
};

Blockly.Yail.genJBridgeDispatchEvent = function(){
  var code = "\npublic boolean dispatchEvent(Component component, String componentName, String eventName, Object[] params){\n"
  + jBridgeTopBlockCodesList.join("\n")
  +"\n return false;"
  +"\n}";

  return code;
};

Blockly.Yail.genJBridgeDefineProcedure = function(jBridgeProceduresMap){
  var code = "";
  for (var key in jBridgeProceduresMap) {
      code = code 
             + '\n' 
             + jBridgeProceduresMap[key];
  }
  return code;
};

Blockly.Yail.parseTopBlocks = function (topBlocks){
    for (var x = 0, block; block = topBlocks[x]; x++) {
      jBridgeTopBlockCodesList.push(Blockly.Yail.parseBlock(block));
    }
};

Blockly.Yail.getJBridgeInstanceName = function(block){
  return block.instanceName;
};

Blockly.Yail.parseBlock = function (block){
  jBridgeIsIndividualBlock = false;
  var code = "";
  var blockCategory = block.category;
  if (blockCategory == "Component"){
      code = Blockly.Yail.parseJBridgeComponentBlock(block);
  }else if (blockCategory == "Colors"){
    code = Blockly.Yail.parseJBridgeColorBlock(block);
  }else if (blockCategory == "Variables"){
    code = Blockly.Yail.parseJBridgeVariableBlocks(block);
  }else if(blockCategory == "Math"){
    code = Blockly.Yail.parseJBridgeMathBlocks(block);
  }else if( blockCategory == "Logic"){
    code = Blockly.Yail.parseJBridgeLogicBlocks(block);
  }else if (blockCategory == "Procedures"){
    code = Blockly.Yail.parseJBridgeProceduresBlocks(block);
  }else if (blockCategory == "Control"){
    code = Blockly.Yail.parseJBridgeControlBlocks(block);
  }else if (blockCategory == "Lists"){
    code = Blockly.Yail.parseJBridgeListBlocks(block);
  }else if (blockCategory == "Text"){
    code = Blockly.Yail.parseJBridgeTextTypeBlocks(block);
  }
  return code;
}
Blockly.Yail.parseJBridgeControlBlocks = function(controlBlock){
  var code = "";
  var controlType = controlBlock.type;
  if(controlType == "controls_if"){
    code = Blockly.Yail.parseJBridgeControlIfBlock(controlBlock);
    jBridgeIsIndividualBlock = true;
  }
  return code;

}
Blockly.Yail.parseJBridgeControlIfBlock = function(controlIfBlock){
  // var conditions = [];
  // var ifElseStatements = [];
  // var ifStatement;
  // var elseStatement;
  var code = "";
  var elseCount = controlIfBlock.elseCount_;
  var elseIfCount = controlIfBlock.elseifCount_;
  var ifCondition = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[0]);
  var ifStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[1]);
  code =  Blockly.Yail.genJBridgeControlIfBlock(ifCondition, ifStatement);  
  var index = 2 + (elseIfCount * 2);
  if(elseIfCount > 0){
    for(var i=2; i< index; i=i+2){
      var elseIfCondition = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[i]);
      var elseIfStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[i+1]);
      code = code  
             + Blockly.Yail.genJBridgeControlElseIfBlock(elseIfCondition, elseIfStatement);
    }
  }
  if(elseCount == 1){
    var elseStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[index]);
    code = code 
           + Blockly.Yail.genJBridgeControlElseIfBlock(elseStatement);
  }
  for (var x = index+elseCount ; x < controlIfBlock.childBlocks_.length; x++){
    code = code 
           + Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[x]);
  }

  return code;

  // conditions.push(Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[0]));
  // ifStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[1]);
  //   for(var x = 2; x < controlIfBlock.childBlocks_.length- elseCount; x++){
  //     if(x%2 == 0){
  //         conditions.push(Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[x]));
  //       }
  //       else ifElseStatements.push(Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[x  
  //     }
  //     if(elseCount>0) elseStatement = Blockly.Yail.parseBlock(controlIfBlock.childBlocks_[controlIfBlock.childBlocks_.length-1]);
  //     return Blockly.Yail.genJBridgeControlIfBlock(conditions, ifStatement, ifElseStatements, elseStatement);
};

Blockly.Yail.genJBridgeControlIfBlock = function(condition, statement){
  var code = "";
  code = "if("
         +condition
         +"){ \n"
         + statement
         + "\n} \n"

  return code;
};

Blockly.Yail.genJBridgeControlElseIfBlock = function(condition, statement){
  var code = "";
  code = "else if("
         +condition
         +"){ \n"
         + statement
         + "\n} \n"
  return code;
};

Blockly.Yail.genJBridgeControlElseIfBlock = function(statement){
  var code = "";
  code = "else { \n"
         + statement
         + "\n} \n"
  return code;
};

// Blockly.Yail.genJBridgeControlIfBlock = function(conditions, ifStatement, ifElseStatements, elseStatement){
//   var code = "";
//   code += "if("+conditions[0]+")"
//        + "{\n" + ifStatement + "\n}\n";
//   for(var i = 1,j=0; i < ifElseStatements.length && j<i; j++,i++){
//       code += "else if("+conditions[i]+")\n"
//               + "{\n" + ifElseStatements[j] + "\n}\n";
//   }

//   if(elseStatement != undefined)
//   {
//     code += "else {"+ elseStatement+"\n}";
//   }
//   return code;
// };


Blockly.Yail.parseJBridgeVariableBlocks = function (variableBlock){
var code = "";
  var componentType = variableBlock.type;
  if (componentType == "lexical_variable_set"){
      code = Blockly.Yail.parseJBridgeVariableSetBlock(variableBlock);
      jBridgeIsIndividualBlock = true;
  }else if(componentType == "lexical_variable_get"){
      code = Blockly.Yail.parseJBridgeVariableGetBlock(variableBlock);
  }else if(componentType = "global_declaration"){
      code = Blockly.Yail.parseJBridgeGlobalIntializationBlock(variableBlock);
      jBridgeIsIndividualBlock = true;
  }
  return code;
};

Blockly.Yail.parseJBridgeVariableGetBlock = function(variableGetBlock){
    var paramName = variableGetBlock.getFieldValue('VAR');
    var paramsMap = new Object();
    //Check if the variable is global or fuction param
    paramsMap = Blockly.Yail.getJBridgeParentBlockFieldMap(variableGetBlock.parentBlock_, "component_event", "PARAMETERS");
    paramName = Blockly.Yail.getJBridgeRelativeParamName(paramsMap, paramName);
    return Blockly.Yail.genJBridgeVariableGetBlock(paramName);
  };

Blockly.Yail.genJBridgeVariableGetBlock = function(paramName){
  var code = paramName;
  return code;
};

//It itertates through all the parent to find the specific blockType and loads fieldName map
Blockly.Yail.getJBridgeParentBlockFieldMap = function (block, blockType, fieldName){
  if(block != undefined && block != null && block.type == blockType){
      return Blockly.Yail.getFieldMap(block, fieldName);  
  }
  if(block == null || block == undefined){
    return new Object();
  }
  return Blockly.Yail.getJBridgeParentBlockFieldMap(block.parentBlock_, blockType, fieldName);
};

Blockly.Yail.parseJBridgeVariableSetBlock = function(variableSetBlock){
    var code = "";
    var leftValue = variableSetBlock.getFieldValue("VAR");
    var paramsMap = new Object();
    //Check if the variable is global or fuction param
    paramsMap = Blockly.Yail.getJBridgeParentBlockFieldMap(variableSetBlock.parentBlock_, "component_event", "PARAMETERS");
    leftValue = Blockly.Yail.getJBridgeRelativeParamName(paramsMap, leftValue);

    var rightValue = ""
    for(var x = 0, childBlock; childBlock = variableSetBlock.childBlocks_[x]; x++){
        var data = Blockly.Yail.parseBlock(childBlock);
        rightValue = rightValue 
                     + data;
        if (jBridgeIsIndividualBlock){
           code = code + "\n" + data;
        }else {
          code = code + Blockly.Yail.genJBridgeVariableIntializationBlock(leftValue, rightValue);
        }
    }
    return code;
  };


Blockly.Yail.parseJBridgeComponentBlock = function(componentBlock){
  var code = "";
  var componentType = componentBlock.type;
  if (componentType == "component_event"){
       code = Blockly.Yail.parseJBridgeEventBlock(componentBlock);
  }else if (componentType == "component_set_get"){
      if (componentBlock.setOrGet == "set"){
          code = Blockly.Yail.parseJBridgeSetBlock(componentBlock);
          jBridgeIsIndividualBlock = true;
      }else{
          code = Blockly.Yail.parseJBridgeGetBlock(componentBlock);
      }
  }else if (componentType == "component_method" ){
    code = Blockly.Yail.parseJBridgeMethodCallBlock(componentBlock);
    Blockly.Java.addPermisionsAndIntents(componentBlock.methodName);
    //TODO Not sure what is the side effect of commiting below lines
    // var methodname = componentBlock.methodName;
    // if(methodname != undefined && methodname.substring(0,3) != "Get"){
      jBridgeIsIndividualBlock = true;
    // }
  }else if (componentType == "component_component_block"){
    code = Blockly.Yail.parseJBridgeComponentComponentBlock(componentBlock);
  }else{
    code =  "Invalid Component type : " + componentType ;
  }

  return code;
};

Blockly.Yail.parseJBridgeMethodCallBlock = function(methodCallBlock){
  var objectName = methodCallBlock.instanceName;
  var methodName = methodCallBlock.methodName;
  var parentParamMap = Blockly.Yail.getFieldMap(methodCallBlock.parentBlock_, "PARAMETERS");
  var test = methodCallBlock.parentBlock_.getFieldValue("PARAMETERS");
  var paramsList = [];
  var code = "";
  //parse all the params Block
  for (var y = 0, paramBlock; paramBlock = methodCallBlock.childBlocks_[y]; y++){
      var genCode = Blockly.Yail.parseBlock(paramBlock);
      if(jBridgeIsIndividualBlock){
        code = code + genCode+"\n";
      }else{
        paramsList.push(genCode);
      }
  }
  var jBridgeParamList = [];

  for (var y = 0, param; param = paramsList[y]; y++){
    jBridgeParamList.push(Blockly.Yail.getJBridgeRelativeParamName(parentParamMap, param));
  }
  code = Blockly.Yail.genJBridgeMethodCallBlock(objectName ,methodName, jBridgeParamList) + "\n" + code;
  return code;
};

//This function identifies if the param is a global variable or functional variable 
//and returns the appropriate name
Blockly.Yail.getJBridgeRelativeParamName = function(paramsMap, paramName){
  var paramIndex = paramsMap[paramName];
    if ( paramIndex == undefined ){
      //check for "global " keyword in param name and remove it
      if( paramName.substring(0,7) == "global "){
        paramName = paramName.replace("global ", "");
      }
      return paramName;
    }
    return "params[" + paramIndex+"]";
};

Blockly.Yail.getFieldMap = function(block, fieldName){
  var fieldMap = new Object();
  if(block.inputList != undefined){
    for (var x = 0, input; input = block.inputList[x]; x++) {
      var fieldIndex = 0;
      if(input.name == fieldName){
        for (var y = 0, field; field = input.fieldRow[y]; y++){
          var fieldName = field.getText();
          if (fieldName.replace(/ /g,'').length > 0){
              fieldMap[fieldName] = fieldIndex;
              fieldIndex ++;
          }
        }  
      }
    }
  }
  return fieldMap;
};

Blockly.Yail.getFieldList = function(block, fieldName){
  var fieldsList = [];
  if(block.inputList != undefined){
    for (var x = 0, input; input = block.inputList[x]; x++) {
      if(input.name == fieldName){
        for (var y = 0, field; field = input.fieldRow[y]; y++){
          var fieldName = field.getText();
          if (fieldName.replace(/ /g,'').length > 0){
              fieldsList.push(fieldName);
          }
        }  
      }
    }
  }
  return fieldsList;
};

Blockly.Yail.getProcName = function(block, inputName, fieldName){
  var procName ="";
  for (var x = 0, input; input = block.inputList[x]; x++) {
    if(input.name == inputName){
      for (var y = 0, field; field = input.fieldRow[y]; y++){
        if(field.name == fieldName){
          procName = field.text_;
        }
      }
    }
  }
  return procName;
};

Blockly.Yail.genJBridgeMethodCallBlock = function(objectName, methodName, paramsList){
var code = "";
// use splice to get all the arguments after 'methodName'
var args = Array.prototype.splice.call(arguments, 2);
code = objectName
       + "."
       +methodName
       +" ("
       + paramsList.join(", ")
       +");"  
return code;
};

Blockly.Yail.parseJBridgeColorBlock = function(colorBlock){
  // TOOD Fix the copy pasted or duplicated color palette block 
  var color = colorBlock.type.toUpperCase();
  return Blockly.Yail.genJBridgeColorBlock(color);
};

Blockly.Yail.genJBridgeColorBlock = function(color){
    return color;
};

Blockly.Yail.parseJBridgeGetBlock = function(getBlock){
  var componentName = Blockly.Yail.getJBridgeInstanceName(getBlock);
  var property = getBlock.propertyName;
  return Blockly.Yail.genJBridgeGetBlock(componentName, property);
};

Blockly.Yail.genJBridgeGetBlock = function(componentName, property){
  var code = componentName
             +"."
             +property
             +"()";
  return code;
};

Blockly.Yail.parseJBridgeSetBlock = function(setBlock){
  var componentName = Blockly.Yail.getJBridgeInstanceName(setBlock);
  var property = setBlock.propertyName;
  var ListPicker = "ListPicker";
  var YailList = "YailList";
  var value = "";
  var code = "";
  for (var x = 0, childBlock; childBlock = setBlock.childBlocks_[x]; x++) {
    var genCode = Blockly.Yail.parseBlock(childBlock);
     if(jBridgeIsIndividualBlock){
        code = code + genCode + "\n";
      }else{
        value = value + genCode;
      }
  }

  if(JBRIDGE_COMPONENT_TEXT_PROPERTIES.indexOf(property.toLowerCase()) > -1){
    value = "String.valueOf(" + value + ")";
  }

  if((componentName.slice(0, ListPicker.length) == ListPicker) && (property == "Elements")){
    if(!jBridgeImportsMap[YailList]){
      jBridgeImportsMap[YailList] = "import com.google.appinventor.components.runtime.util.YailList;";
    }
    value = "YailList.makeList(" + value + ")";  
  }
  code = Blockly.Yail.genJBridgeSetBlock(componentName, property, value) + "\n" + code;
  return code;
};

Blockly.Yail.genJBridgeSetBlock = function(componentName, property, value){
  var code = componentName
             +"."
             +property
             +"("
             +value
             +");";
  return code;
};

// Blockly.Yail.paseJBridgeEventBlock = function(eventBlock){
//   var code = "";
//   var eventName = eventBlock.eventName;
//   var componentName = eventBlock.instanceName;

//   code = Blockly.Yail.parseJBridgeEventBlock(eventBlock);

//   //Add to RegisterEventsMap
//   jBridgeRegisterEventMap[eventName] = Blockly.Yail.genJBridgeEventDispatcher(eventName); 

//   return code;
// };


Blockly.Yail.parseJBridgeEventBlock = function(eventBlock, isChildBlock){
  var code = "";
  isChildBlock = typeof isChildBlock !== 'undefined' ? isChildBlock : false;
  var componentName = eventBlock.instanceName;
  var eventName = eventBlock.eventName;
  var body = "";
  for (var x = 0, childBlock; childBlock = eventBlock.childBlocks_[x]; x++) {
      body = body 
             + "\n"
             + Blockly.Yail.parseBlock(childBlock);
  }
  //This is to handle the if the component is the Screen Object
  if(componentName == jBridgeCurrentScreen){
    componentName = "this";
  }
  code = Blockly.Yail.genJBridgeEventBlock(componentName, eventName, body);

  //Add to RegisterEventsMap
  jBridgeRegisterEventMap[eventName] = Blockly.Yail.genJBridgeEventDispatcher(eventName); 

  return code;
};

//Event Blocks are actualy the "When Blocks"
Blockly.Yail.genJBridgeEventBlock = function(componentName, eventName, body){
  var code = "\nif( component.equals("+componentName+") && eventName.equals(\""+eventName+"\") ){\n"
    + body + "\n"
    +"return true;\n"
    +"}";

  return code;
}; 

Blockly.Yail.genJBridgeEventDispatcher = function(eventName){
  return "EventDispatcher.registerEventForDelegation( this, \"" + eventName +"Event\", \""+ eventName +"\" );";
};

Blockly.Yail.parseJBridgeMathBlocks = function(mathBlock){
  var code = "";
  var type = mathBlock.type;
  if( type == "math_number"){
    code = Blockly.Yail.parseJBridgeMathNumberBlock(mathBlock);
  }else if(type == "math_random_int"){
    code = Blockly.Yail.parseJBridgeMathRandomInt(mathBlock);
  }else if(type == "math_random_float"){
    code = Blockly.Yail.parseJBridgeMathRandomFloatBlock(mathBlock);
  }else if(type == "math_add"){
    code = Blockly.Yail.parseJBridgeMathAdd(mathBlock);
  }else if(type == "math_subtract"){
    code = Blockly.Yail.parseJBridgeMathSubtract(mathBlock);
  }else if(type == "math_multiply"){
    code = Blockly.Yail.parseJBridgeMathMultiply(mathBlock);
  }else if(type == "math_division"){
    code = Blockly.Yail.parseJBridgeMathDivision(mathBlock);
  }else if(type == "math_compare"){
    code = Blockly.Yail.parseJBridgeMathCompare(mathBlock);
  }else if(type == "math_atan2"){
    code = Blockly.Yail.parseJBridgeMathAtan2(mathBlock);
  }
  return code;
};
Blockly.Yail.parseJBridgeMathNumberBlock = function(mathBlock){
  var numberValue ;
  //Assuming numver value always in the fieldRow[0] in inputlist[0].
  numberValue = mathBlock.getFieldValue('NUM');
  return Blockly.Yail.genJBridgeMathNumberBlock(numberValue);
};

Blockly.Yail.parseJBridgeMathAdd = function(mathBlock){
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathOperation(leftValue, rightValue, "+");
};

Blockly.Yail.parseJBridgeMathSubtract = function(mathBlock){
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathOperation(leftValue, rightValue, "-");
};

Blockly.Yail.parseJBridgeMathMultiply = function(mathBlock){
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathOperation(leftValue, rightValue, "*");
};

Blockly.Yail.parseJBridgeMathDivision = function(mathBlock){
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathOperation(leftValue, rightValue, "/");
};

Blockly.Yail.parseJBridgeMathRandomInt = function(mathBlock){
    var name = "random";
    if(!jBridgeVariableDefinitionMap[name]){
        jBridgeVariableDefinitionMap[name] = "Random";
        jBridgeInitializationList.push("random = new Random();");
        jBridgeImportsMap[name] = "import java.util.Random;";
    }
    var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Yail.genJBridgeMathRandomInt(leftValue, rightValue);
};

//TODO try other alternatives for Random integer like "Random.randInt(min, max)"
Blockly.Yail.genJBridgeMathRandomInt = function(leftValue, rightValue){
    var code = "(random.nextInt("
             + rightValue
             + " - "
             + leftValue
             + " + "
             + " 1 "
             + ")"
             + " + "
             + leftValue
             + ")";
    return code;
};

Blockly.Yail.genJBridgeMathOperation = function(leftValue, rightValue, operand){
    var code = "(" 
               +leftValue
               + " "
               + operand
               + " "
               + rightValue
               + ")";
    return code;
};

Blockly.Yail.genJBridgeMathNumberBlock= function(numberValue){
   var code="";
   code = numberValue;
   return code;
};

Blockly.Yail.parseJBridgeGlobalIntializationBlock = function(globalBlock){
  var leftValue ;
  var rightValue ;

  leftValue = globalBlock.getFieldValue('NAME').replace("global ", "");
  rightValue = ""
  for(var x = 0, childBlock; childBlock = globalBlock.childBlocks_[x]; x++){
        rightValue = rightValue 
                     + Blockly.Yail.parseBlock(childBlock);
  }

  jBridgeComponentMap[leftValue] = [];
  var childType = globalBlock.childBlocks_[0].category;
  var variableType = Blockly.Yail.getValueType(childType, rightValue);  

  jBridgeComponentMap[leftValue].push({"Type" : variableType});
  jBridgeVariableDefinitionMap[leftValue] = variableType;


  jBridgeInitializationList.push(Blockly.Yail.genJBridgeVariableIntializationBlock(leftValue, rightValue));
  
  return "";
};
Blockly.Yail.getValueType = function(childType, value){
  var variableType = "String";
  if (childType == "Math"){
    if(value.indexOf(".") != -1){
      variableType = "float";
    }else{
      variableType = "int";
    }
  }else if(childType == "Logic"){
    variableType = "boolean";
  }else if (childType == "Lists"){
    variableType = "ArrayList"
  }
  return variableType;
};

Blockly.Yail.genJBridgeVariableIntializationBlock = function(leftValue, rightValue){
  var code = ""
  code = leftValue 
         + " = "
         + rightValue
         +";";
  return code
};

Blockly.Yail.parseJBridgeLogicBlocks = function (logicBlock){
var code = "";
  var componentType = logicBlock.type;
  if (componentType == "logic_boolean"){
      code = Blockly.Yail.parseJBridgeBooleanBlock(logicBlock);
  }else if (componentType == "logic_operation"){
      code = Blockly.Yail.parseJBridgeLogicOperationBlock(logicBlock);
  }else if (componentType == "logic_false"){
      code = "false";
  }
  return code;
};
  
Blockly.Yail.parseJBridgeBooleanBlock = function(logicBlock){
  var value = logicBlock.getFieldValue("BOOL");
  return Blockly.Yail.genJBridgeBooleanBlock(value);
};

Blockly.Yail.genJBridgeBooleanBlock = function(value){
  return value.toLowerCase();
};

Blockly.Yail.parseJBridgeProceduresBlocks = function(proceduresBlock){
  var code = "";
  var proceduresType = proceduresBlock.type;
  if(proceduresType == "procedures_defnoreturn"){
     code = Blockly.Yail.parseJBridgeProcDefNoReturn(proceduresBlock);
  }else if(proceduresType == "procedures_callnoreturn"){
     code = Blockly.Yail.parseJBridgeProcCallNoReturn(proceduresBlock);
  }
  jBridgeIsIndividualBlock = true;
  return code;
};

Blockly.Yail.parseJBridgeProcDefNoReturn = function(proceduresBlock){
  var code = "";
  var procName = proceduresBlock.getFieldValue("NAME");
  var procParms = [];
  for (var x = 0, params; params = proceduresBlock.arguments_[x]; x++) {
    procParms.push("Object " + params);
  }
  var statementList = [];
  for (var x = 0, childBlock; childBlock = proceduresBlock.childBlocks_[x]; x++) {
    statementList.push(Blockly.Yail.parseBlock(childBlock));
  }
  
  jBridgeProceduresMap[procName] = Blockly.Yail.genJBridgeProcDefNoReturn(procName, procParms.join(", "), statementList.join("\n"));

  return code;
};

Blockly.Yail.genJBridgeProcDefNoReturn = function (procedureName, procedureParams, body){
  var code = "\npublic void " 
       + procedureName
       + "("
       + procedureParams 
       + "){\n"
       + body
       + "\n}"; 
  return code;
}

Blockly.Yail.parseJBridgeProcCallNoReturn = function(proceduresBlock){
  var procName = proceduresBlock.getFieldValue("PROCNAME");
  var paramsList = [];
  var code = "";
  var parentParamMap = Blockly.Yail.getFieldMap(proceduresBlock.parentBlock_, "PARAMETERS");
  //parse all the params Block
  for (var y = 0, paramBlock; paramBlock = proceduresBlock.childBlocks_[y]; y++){
      var genCode = Blockly.Yail.parseBlock(paramBlock);
      if(jBridgeIsIndividualBlock){
        code = code + genCode+"\n";
      }else{
        paramsList.push(genCode);
      }
  }

  var jBridgeParamList = [];

  for (var y = 0, param; param = paramsList[y]; y++){
    jBridgeParamList.push(Blockly.Yail.getJBridgeRelativeParamName(parentParamMap, param));
  }

  return Blockly.Yail.genJBridgeProcCallNoReturn(procName, jBridgeParamList) + "\n" + code;
};

Blockly.Yail.genJBridgeProcCallNoReturn = function(procName, paramsList){
  var code = procName
             + "("
             + paramsList.join(",")
             +");";
  
  return code;
};

Blockly.Yail.parseJBridgeTextTypeBlocks = function(textBlock){
  var code = "";
  var type = textBlock.type;
  if (type == "text"){
    code = Blockly.Yail.parseJBridgeTextBlock(textBlock);
  }else if(type == "text_join"){
    code = Blockly.Yail.parseJBridgeTextJoinBlock(textBlock);
  }else if(type == "text_changeCase"){
    code = Blockly.Yail.parseJBridgeTextChangeCaseBlock(textBlock);
  }
  return code;
};

Blockly.Yail.parseJBridgeTextBlock = function(textBlock){
  var textData = textBlock.getFieldValue("TEXT");
  return Blockly.Yail.genJBridgeTextBlock(textData);
};

Blockly.Yail.parseJBridgeTextJoinBlock = function(textBlock){
  var joinList = [];
  for (var y = 0, joinBlock; joinBlock = textBlock.childBlocks_[y]; y++){
    var genCode = Blockly.Yail.parseBlock(joinBlock);
    joinList.push(genCode);
  }
  if (joinList.length == 0){
    return "";
  }
  else{
    return Blockly.Yail.genJBridgeTextJoinBlock(joinList);
  }
};

Blockly.Yail.genJBridgeTextBlock = function(text){
  var code = "\""+text+"\"";
  return code;
};

Blockly.Yail.genJBridgeTextJoinBlock = function(joinList){
  var code = "";
  for (var x = 0; x < joinList.length; x++){
    if(x == (joinList.length - 1)){
      code = code + "(" + joinList[x] + ")" + ".toString()";
    }
    else{
      code = code + "(" + joinList[x] + ")" + ".toString()" + " + ";
    }
  }
  return code;
};

Blockly.Yail.parseJBridgeListBlocks = function(listBlock){
  var code = "";
  var type = listBlock.type;
  var name = "ArrayList";
  jBridgeImportsMap[name] = "import java.util.ArrayList;";
  if( type == "lists_create_with"){
    code = Blockly.Yail.parseJBridgeListsCreateWithBlock(listBlock);
  }else if (type == "lists_select_item"){
      code = Blockly.Yail.parseJBridgeListSelectItemBlock(listBlock);
  }else if(type == "lists_length"){
      code = Blockly.Yail.parseJBridgeListLengthBlock(listBlock);
  }else if(type == "lists_is_list"){
      code = Blockly.Yail.parseJBridgeListIsListBlock(listBlock);
  }else if(type == "lists_add_items"){
      code = Blockly.Yail.parseJBridgeListAddItemBlock(listBlock);
  }
  return code;
};

Blockly.Yail.parseJBridgeListAddItemBlock = function(listBlock){
  var code = "";
  var listName = Blockly.Yail.parseBlock(listBlock.childBlocks_[0]);
  var item = Blockly.Yail.parseBlock(listBlock.childBlocks_[1]);
  if (item.slice(-2) == ";\n"){
    item = item.slice(0, -2);
  }
  code = Blockly.Yail.genJBridgeListsAddItemBlock(listName, item);
  if(listBlock.childBlocks_.length > 2){
    for(var x = 2, childBlock; childBlock = listBlock.childBlocks_[x]; x++){
      code = code + Blockly.Yail.parseBlock(childBlock);
    }
  }
  return code;
};

Blockly.Yail.parseJBridgeListsCreateWithBlock = function(listBlock){
   var code = "";
   var childType = "String";
   var listName = "[Unknown]";
   if (listBlock.parentBlock_.getFieldValue('NAME') != undefined){
      listName = listBlock.parentBlock_.getFieldValue('NAME').replace("global ", "")
   }else if(listBlock.parentBlock_.getFieldValue('VAR') != undefined){
      listName = listBlock.parentBlock_.getFieldValue('VAR').replace("global ", "")
   }
   for (var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++) {
     var addItemData = Blockly.Yail.parseBlock(childBlock);
     childType = Blockly.Yail.getValueType(childBlock.type, addItemData);
     if(childType == "int"){
      childType = "Integer";
     }else if(childType == "float"){
      childType = "Float";
     }
     code = code 
            + Blockly.Yail.genJBridgeListsAddItemBlock(listName, addItemData);
   }
    code = Blockly.Yail.genJBridgeNewList(childType)
          +"\n"
          + code;

   return code;
};

Blockly.Yail.parseJBridgeListSelectItemBlock = function(listBlock){
  var listName = Blockly.Yail.parseBlock(listBlock.childBlocks_[0]);
  var index = Blockly.Yail.parseBlock(listBlock.childBlocks_[1]);
  return Blockly.Yail.genJBridgeListSelectItemBlock(listName, index);  
};
Blockly.Yail.genJBridgeListSelectItemBlock = function(listName, index){
  var code = listName + ".get(" + index + " - 1)";
  return code;
};
Blockly.Yail.genJBridgeNewList = function(type){
  var code = "new ArrayList<"+type+">(); \n";
  return code;
};

Blockly.Yail.genJBridgeListsAddItemBlock = function(listName, addItem){
   var code = listName+".add("+addItem+"); \n";
   return code;
};

Blockly.Yail.parseJBridgeMathCompare = function (mathBlock){
  var operator = mathBlock.getFieldValue("OP");
  var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
  var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
  var op = Blockly.Yail.getJBridgeOperator(operator);
  if(op == "==" && leftValue.indexOf("String.valueOf(") == 0){
    return Blockly.Yail.genJBridgeStringEqualsCompare(leftValue, rightValue, op);
  }
  return Blockly.Yail.genJBridgeMathCompare(leftValue, rightValue, op);
};

Blockly.Yail.parseJBridgeMathAtan2 = function (mathBlock){
  var leftValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[0]);
  var rightValue = Blockly.Yail.parseBlock(mathBlock.childBlocks_[1]);
  return Blockly.Yail.genJBridgeMathAtan2(leftValue, rightValue);
};

Blockly.Yail.genJBridgeMathAtan2 = function (leftValue, rightValue){
  var code = "Math.toDegrees(Math.atan2(" 
             + leftValue
             + ", "
             + rightValue
             + "))";
  return code;
};

Blockly.Yail.genJBridgeStringEqualsCompare = function (leftValue, rightValue, operator){
  var code = "(" 
             + leftValue
             + ").equals("
             + rightValue
             + ")";
  return code;
};

Blockly.Yail.genJBridgeMathCompare = function (leftValue, rightValue, operator){
  var code = leftValue
             + operator
             + rightValue;
  return code;
};

Blockly.Yail.getJBridgeOperator = function(operator){
  var op = operator;
  if(operator == "GT"){
    op = ">";
  }else if(operator == "LT"){
    op = "<";
  }else if(operator == "EQ"){
    op = "==";
  }else if(operator == "NEQ"){
    op = "!=";
  }else if(operator == "GTE"){
    op = ">=";
  }else if(operator == "LTE"){
    op = "<=";
  }else if(operator == 'AND'){
    op = "&&"
  }

  return op;
};

Blockly.Yail.parseJBridgeListLengthBlock = function(listBlock){
  var listName = Blockly.Yail.parseBlock(listBlock.childBlocks_[0]);
  return Blockly.Yail.genJBridgeListLengthBlock(listName);
};

Blockly.Yail.genJBridgeListLengthBlock = function(listName){
  var code = listName + ".size()"
  return code;
};

Blockly.Yail.parseJBridgeLogicOperationBlock = function(logicBlock){
  var operator = logicBlock.getFieldValue("OP");
  var leftValue = Blockly.Yail.parseBlock(logicBlock.childBlocks_[0]);
  var rightValue = Blockly.Yail.parseBlock(logicBlock.childBlocks_[1]);

return Blockly.Yail.genJBridgeLogicOperationBlock(leftValue, rightValue, Blockly.Yail.getJBridgeOperator(operator));
};

Blockly.Yail.genJBridgeLogicOperationBlock = function (leftValue, rightValue, operator){

  var code = leftValue
             + " "
             + operator
             + " "
             + rightValue;
  return code;
};

Blockly.Yail.parseJBridgeComponentComponentBlock = function(componentBlock){
  var name = componentBlock.instanceName;
  return Blockly.Yail.genJBridgeComponentComponentBlock(name);
};

Blockly.Yail.genJBridgeComponentComponentBlock = function(name){
  var code = name;
  return code;
};

Blockly.Yail.parseJBridgeMathRandomFloatBlock = function(mathBlock){
    var name = "random";
    if(!jBridgeVariableDefinitionMap[name]){
        jBridgeVariableDefinitionMap[name] = "Random";
        jBridgeInitializationList.push("random = new Random();");
        jBridgeImportsMap[name] = "import java.util.Random;";
    }
    return Blockly.Yail.genJBridgeMathRandomFloatBlock();
};

Blockly.Yail.genJBridgeMathRandomFloatBlock = function(){
    var code = "(random.nextFloat())"
    return code;
};

Blockly.Yail.parseJBridgeTextChangeCaseBlock = function(textBlock){
    var operator = textBlock.getFieldValue("OP");
    var op = "toLowerCase()";
    if(operator == "UPCASE"){
        op = "toUpperCase()";
    }
    var genCode = "";
    for(var x = 0, childBlock; childBlock = textBlock.childBlocks_[x]; x++){
          genCode = genCode + Blockly.Yail.parseBlock(childBlock);
    }    
    return Blockly.Yail.genJBridgeTextChangeCaseBlock(genCode, op);
};

Blockly.Yail.genJBridgeTextChangeCaseBlock = function(inputText, changeCase){
    var code = "String.valueOf("
              + inputText 
              + ")."
              + changeCase;
    return code;
};

Blockly.Yail.parseJBridgeListIsListBlock = function(listBlock){
  var genCode = ""
  for(var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++){
          genCode = genCode + Blockly.Yail.parseBlock(childBlock);
  }
  return Blockly.Yail.genJBridgeListIsListBlock(genCode);
};

Blockly.Yail.genJBridgeListIsListBlock = function(genCode){
  var code = "(("
            + genCode
            + ")"
            + " instanceof ArrayList<?>"
            + ")"
  return code;
};

Blockly.Java.prityPrintJBridgeCode = function(javaCode){
  var stack=new Array();
  var lines = javaCode.split('\n');
  var prityPrint = [];
  for(var i = 0;i < lines.length;i++){
    var line = lines[i].trim();
    if(line == ";" || line.length == 0){
      continue;
    }
    var lastChar = line.slice(-1);
    var indentation = Blockly.Java.prityPrintIndentationJBridge(stack.length);
    if(lastChar== "{"){
      stack.push("{");
    } else if(lastChar== "}"){
      stack.pop();
      indentation = Blockly.Java.prityPrintIndentationJBridge(stack.length);
    }
    prityPrint.push(indentation + line);
    
  }
  return prityPrint.join("\n");
};

Blockly.Java.prityPrintIndentationJBridge = function(indendLength){
  var indentation = "";
  for(var j=0; j<indendLength; j++){
    indentation += "  ";
  }
  return indentation;
};

Blockly.Java.getFormMainfest = function(formJson, packageName, forRepl) {
    Blockly.Java.initAndroidPermisionAndIntent();
    javaCode.push(Blockly.Yail.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), jsonObject));
    
    var androidIntents = "";
    var androidPermisions = "";
    for (var key in jBridgePermissionToAdd) {
      androidPermisions += jBridgeAndroidPermisions[key];
    }
    for (var key in jBridgeIntentsToAdd) {
      androidIntents += jBridgeAndroidIntents[key];
    }
    return Blockly.Java.genManifestString(androidPermisions, androidIntents);
    
};

Blockly.Java.initAndroidPermisionAndIntent = function(){
    //This includes method Names or Type
    jBridgeAndroidPermisions["receive_sms"] = "<uses-permission android:name=\"android.permission.RECEIVE_SMS\"/>\r\n\r\n    ";
    jBridgeAndroidPermisions["send_sms"] = "<uses-permission android:name=\"android.permission.SEND_SMS\"/>\r\n\r\n    ";
    jBridgeAndroidPermisions["voice_receive_sms"] = "<uses-permission android:name=\"com.google.android.apps.googlevoice.permission.RECEIVE_SMS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["voice_send_sms"] = "<uses-permission android:name=\"com.google.android.apps.googlevoice.permission.SEND_SMS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["manage_accounts"] = "<uses-permission android:name=\"android.permission.MANAGE_ACCOUNTS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["get_accounts"] = "<uses-permission android:name=\"android.permission.GET_ACCOUNTS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["use_credentials"] =  "<uses-permission android:name=\"android.permission.USE_CREDENTIALS\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["vibrate"] = "<uses-permission android:name=\"android.permission.VIBRATE\" />\r\n\r\n    ";
    jBridgeAndroidPermisions["internet"] = "<uses-permission android:name=\"android.permission.INTERNET\" />\r\n\r\n    ";

    jBridgeMethodAndTypeToPermisions["vibrate"] = ["vibrate"];
    jBridgeMethodAndTypeToPermisions["tinywebdb"] = ["internet"];
    jBridgeMethodAndTypeToPermisions["sendmessage"] = ["receive_sms","send_sms", "voice_receive_sms","voice_send_sms", "manage_accounts", "get_accounts","use_credentials"];
    
    //This includes method Names or Type
    jBridgeAndroidIntents["sendmessage"] = "<receiver android:name=\"com.google.appinventor.components.runtime.util.SmsBroadcastReceiver\"\r\n\r\n          android:enabled=\"true\" android:exported=\"true\">\r\n\r\n    "
                            + "<intent-filter>\r\n\r\n        \r\n\r\n        "
                            + "<action android:name=\"android.provider.Telephony.SMS_RECEIVED\"/>\r\n\r\n        "
                            + "<action android:name=\"com.google.android.apps.googlevoice.SMS_RECEIVED\"\r\n\r\n                android:permission=\"com.google.android.apps.googlevoice.permission.RECEIVE_SMS\"/>\r\n\r\n    "
                            + "</intent-filter>\r\n\r\n"
                            + "</receiver>\r\n\r\n    ";
};

Blockly.Java.addPermisionsAndIntents = function(name){
  name = name.toLowerCase();
  if(name in jBridgeMethodAndTypeToPermisions){
    var permissions = jBridgeMethodAndTypeToPermisions[name];
    for(var i=0; i<permissions.length; i++){
      jBridgePermissionToAdd[permissions[i]] = true;
    }   
  }
  if(name in jBridgeAndroidIntents){
    jBridgeIntentsToAdd[name] = true; 
  }
};

Blockly.Java.genManifestString = function(androidPermisions, androidIntents){
  var mainfestString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n\r\n"
                            + "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\r\n\r\n    package=\"com.example.redclick\"\r\n\r\n    android:versionCode=\"1\"\r\n\r\n    android:versionName=\"1.0\" >\r\n\r\n"
                            + "<uses-sdk\r\n\r\n        android:minSdkVersion=\"8\"\r\n\r\n        android:targetSdkVersion=\"21\" />\r\n\r\n    "                  
                            + androidPermisions
                            + "<application\r\n\r\n        android:allowBackup=\"true\"\r\n\r\n        android:icon=\"@drawable/ic_launcher\"\r\n\r\n        android:label=\"@string/app_name\"\r\n\r\n        android:theme=\"@style/AppTheme\" >\r\n\r\n        "
                            + "<activity\r\n\r\n            android:name=\".Screen1\"\r\n\r\n            android:label=\"@string/app_name\" >\r\n\r\n            "
                            + "<intent-filter>\r\n\r\n                "
                            + "<action android:name=\"android.intent.action.MAIN\" />\r\n\r\n\r\n\r\n                "
                            + "<category android:name=\"android.intent.category.LAUNCHER\" />\r\n\r\n            "
                            + "</intent-filter>\r\n\r\n        "
                            + androidIntents
                            + "</activity>\r\n\r\n        "
                            + "</application>\r\n\r\n\r\n\r\n"
                            + "</manifest>";
  return mainfestString;
};
