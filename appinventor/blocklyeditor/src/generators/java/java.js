/**
 * @fileoverview Helper functions for generating Java for blocks.
 * More information available at http://www.appinventor.org/jbridge
 */
goog.provide('Blockly.Java');

goog.require('Blockly.Generator');

Blockly.Java = new Blockly.Generator('Java');

// Imports necessary for all java bridge generated classes
Blockly.Java.JBRIDGE_BASE_IMPORTS = "import com.google.appinventor.components.runtime.HandlesEventDispatching; \n" +
  "import com.google.appinventor.components.runtime.EventDispatcher; \n" +
  "import com.google.appinventor.components.runtime.Form; \n" +
  "import com.google.appinventor.components.runtime.Component; \n";

Blockly.Java.JBRIDGE_PACKAGE_NAME = "\npackage org.appinventor; \n";

// Global Variables used throughout generation
var jBridgeTopBlockCodesList = [];
var jBridgeRegisterEventMap = new Object();
var eventMethodParamListings = new Object();
var jBridgeEventsList = [];
//mapping the variable names to their types
var jBridgeVariableDefinitionMap = new Object();
var jBridgeInitializationList = [];
var jBridgeComponentMap = new Object();
var jBridgeGlobalVarTypes = new Object();
var jBridgeLexicalVarTypes = new Object();
var JBRIDGE_COMPONENT_SKIP_PROPERTIES = ["Uuid", "$Version", "TextAlignment"]; //properties to skip when reading Json File
var JBRIDGE_JSON_TEXT_PROPERTIES = ["Title", "Text", "BackgroundImage", "Image", "Icon", "Source", "Picture", "Hint", "Action", "ActivityClass", "ActivityPackage", "ServiceURL", "Country", "Language", "ElementsFromString", "Prompt"]; //Properties that should include the double qoutes "" in the output JBridge Javacode
var jBridgeImportsMap = new Object();
var jBridgeProceduresMap = new Object();
var jBridgeEventMethodsList = [];
var jBridgeListNames = [];
var jBridgeIsIndividualBlock = false; // is to Identify if a block is Iduvidal root block or sub-block
var jBridgeCurrentScreen;
var jBridgeParsingEventMethod = false;
var isParsingJBridgeProcedure = false;
var jBridgeEventMethodSetupCode = "";
var JBRIDGE_COMPONENT_TEXT_PROPERTIES = ["Text", "Picture", "Source"];

var jBridgePermissionToAdd = new Object; //this should be a set
var jBridgeIntentsToAdd = new Object; // this should be a set
var jBridgeAndroidPermisions = new Object();
var jBridgeAndroidIntents = new Object();
var jBridgeMethodAndTypeToPermisions = new Object();

//predefined helper methods to be declared if used
var toCSVMethod = "\npublic String toCSV(ArrayList<Object> originalList){\nStringBuilder stringBuilder = new StringBuilder();\nfor (int i=0;i < originalList.size(); i++){\nObject elem = originalList.get(i);\nstringBuilder.append(elem.toString());\nif (i < originalList.size()-1){\nstringBuilder.append(\", \");\n}\n}\nreturn stringBuilder.toString();\n}";

var singleMathJavaNames = new Map();
singleMathJavaNames.set("ROOT", "sqrt");
singleMathJavaNames.set("ABS", "abs");
singleMathJavaNames.set("LN", "log");
singleMathJavaNames.set("EXP", "exp");
singleMathJavaNames.set("ROUND", "round");
singleMathJavaNames.set("CEILING", "ceil");
singleMathJavaNames.set("FLOOR", "floor");
singleMathJavaNames.set("SIN", "sin");
singleMathJavaNames.set("COS", "cos");
singleMathJavaNames.set("TAN", "tan");
singleMathJavaNames.set("ASIN", "asin");
singleMathJavaNames.set("ACOS", "acos");
singleMathJavaNames.set("ATAN", "atan");

var singleMathTypes = ["math_single", "math_trig", "math_abs", "math_neg", "math_round", "math_ceiling", "math_floor"];
var mathOperationBlocks = ["math_add", "math_subtract", "math_multiply", "math_division", "math_compare", "math_atan2", "math_power"];

var propertyBlockSet = ["Speed"];

var JAVA_CLASS_INT = "Integer";
var JAVA_CLASS_FLOAT = "Float";
var JAVA_CLASS_DOUBLE = "Double";
var JAVA_CLASS_BOOLEAN = "Boolean";
var JAVA_INT = "int";
var JAVA_FLOAT = "float";
var JAVA_DOUBLE = "double";
var JAVA_BOOLEAN = "boolean";
var JAVA_STRING = "String";
var JAVA_SPRITE = "Sprite";
var JAVA_VIEW = "AndroidViewComponent";
var JAVA_YAIL_LIST = "YailList";
var JAVA_ARRAY_LIST = "ArrayList";
var JAVA_OBJECT = "Object";

var methodParam = new Object();
//Param type Map start. Includes methods and individual events
var methodParamsMap = {

  //string methods
  'Text': {0: JAVA_STRING},

  //canvas methods
  'BackgroundColor': {0: JAVA_INT},
  'BackgroundImage': {0: JAVA_STRING},
  'DrawCircle': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_FLOAT, 3: JAVA_BOOLEAN},
  'DrawLine': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_INT, 3: JAVA_INT},
  'DrawPoint': {0: JAVA_INT, 1: JAVA_INT},
  'DrawText': {0: JAVA_STRING, 1: JAVA_INT, 2: JAVA_INT},
  'DrawTextAtAngle': {0: JAVA_STRING, 1: JAVA_INT, 2: JAVA_INT, 3: JAVA_FLOAT},
  'findSpriteCollisions': {0: JAVA_SPRITE},
  'FontSize': {0: JAVA_FLOAT},
  'GetBackgroundPixelColor': {0: JAVA_INT, 1: JAVA_INT},
  'GetPixelColor': {0: JAVA_INT, 1: JAVA_INT},
  'Height': {0: JAVA_INT},
  'LineWidth': {0: JAVA_FLOAT},
  'SaveAs': {0: JAVA_STRING},
  'setChildHeight': {0: JAVA_VIEW, 1: JAVA_INT},
  'SetBackgroundPixelColor': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_INT},
  'PaintColor': {0: JAVA_INT},
  'TextAlignment': {0: JAVA_INT},
  'Visible': {0: JAVA_BOOLEAN},
  'Width': {0: JAVA_FLOAT},
  'WidthPercent': {0: JAVA_FLOAT},
  'MoveTo': {0: JAVA_FLOAT, 1: JAVA_FLOAT},
  'Dragged': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_INT, 3: JAVA_INT, 4: JAVA_INT, 5: JAVA_INT, 6: JAVA_BOOLEAN},
  'Flung': {0: JAVA_FLOAT, 1: JAVA_FLOAT, 2: JAVA_FLOAT, 3: JAVA_FLOAT, 4: JAVA_FLOAT, 5: JAVA_FLOAT, 6: JAVA_BOOLEAN},
  'Touched': {0: JAVA_INT, 1: JAVA_INT, 2: JAVA_BOOLEAN}, //newly added 8/23
  'TouchUp': {0: JAVA_FLOAT, 1: JAVA_FLOAT},
  'TouchDown': {0: JAVA_FLOAT, 1: JAVA_FLOAT},

  //sprite methods
  'Bounce': {0: JAVA_INT},
  'CollidedWith': {0: JAVA_SPRITE},
  'CollidingWith': {0: JAVA_SPRITE},
  'Speed': {0: JAVA_FLOAT},

  //ball methods
  'PointInDirection': {0: JAVA_FLOAT, 1: JAVA_FLOAT},
  'PointTowards': {0: JAVA_SPRITE},
  'EdgeReached': {0: JAVA_INT},
  'Enabled': {0: JAVA_BOOLEAN},
  'Heading': {0: JAVA_FLOAT},
  'Y': {0: JAVA_DOUBLE},
  'X': {0: JAVA_DOUBLE},

  //camera
  'AfterPicture': {0: JAVA_STRING},

  //videoPlayer
  'VideoPlayerError': {0: JAVA_STRING},

  //textTospeech
  'AfterSpeaking': {0: JAVA_STRING},
  'Speak': {0: JAVA_STRING},

  //sound
  'SoundError': {0: JAVA_STRING},
  'Source': {0: JAVA_STRING},
  'Vibrate': {0: JAVA_INT},

  //player
  'PlayerError': {0: JAVA_STRING},
  'Pause': {},
  'Start': {},

  //camcorder
  'AfterRecording': {0: JAVA_STRING},

  //speechRecognizer
  'AfterGettingText': {0: JAVA_STRING},

  //yandexTranslate
  'GotTranslation': {0: JAVA_STRING, 1: JAVA_STRING},
  'RequestTranslation': {0: JAVA_STRING, 2: JAVA_STRING},

  //spinner
  'AfterSelecting': {0: JAVA_STRING},

  //slider
  'PositionChanged': {0: JAVA_FLOAT},

  //notifer
  'AfterChoosing': {0: JAVA_STRING},
  'AfterTextInput': {0: JAVA_STRING},

  //orientation sensor
  'OrientationChanged': {0: JAVA_FLOAT, 1: JAVA_FLOAT, 2: JAVA_FLOAT},

  //nearField
  'TagRead': {0: JAVA_STRING},

  //location sensor
  'LongitudeFromAddress': {0: JAVA_STRING},
  'LatitudeFromAddress': {0: JAVA_STRING},
  'LocationChanged': {0: JAVA_FLOAT, 1: JAVA_FLOAT, 2: JAVA_FLOAT},
  'StatusChanged': {0: JAVA_STRING, 1: JAVA_STRING},

  //barcode scanner
  "AfterScan": {0: JAVA_STRING},

  //accelerometer sensor
  'AccelerationChanged': {0: JAVA_FLOAT, 1: JAVA_FLOAT, 2: JAVA_FLOAT},

  //pedometer
  'SimpleStep': {0: JAVA_INT, 1: JAVA_FLOAT},
  'WalkStep': {0: JAVA_INT, 1: JAVA_FLOAT},

  //proximity sensor
  'ProximityChanged': {0: JAVA_FLOAT},

  //file
  'AppendToFile': {0: JAVA_STRING, 1: JAVA_STRING},
  'Delete': {0: JAVA_STRING},
  'ReadFrom': {0: JAVA_STRING},
  'SaveFile': {0: JAVA_STRING, 1: JAVA_STRING},

  //fusionTableControls
  'GetRows': {0: JAVA_STRING, 1: JAVA_STRING},
  'GetRowsWithConditions': {0: JAVA_STRING, 1: JAVA_STRING, 2: JAVA_STRING},
  'InsertRow': {0: JAVA_STRING, 1: JAVA_STRING, 2: JAVA_STRING},

  //bluetoothServer
  'AcceptConnection': {0: JAVA_STRING},
  'AcceptConnectionWithUUID': {0: JAVA_STRING},
  'Connect': {0: JAVA_STRING},
  'ConnectWithUUID': {0: JAVA_STRING},
  'IsDevicePaired': {0: JAVA_STRING},
  'RecievedSignedBytes': {0: JAVA_INT},
  'RecievedUnsignedBytes': {0: JAVA_INT},
  'RecieveText': {0: JAVA_INT},
  'Send1ByteNumber': {0: JAVA_STRING},
  'Send2ByteNumber': {0: JAVA_STRING},
  'Send4ByteNumber': {0: JAVA_STRING},
  'SendBytes': {0: JAVA_OBJECT},
  'SendText': {0: JAVA_STRING},

  //web
  'BuildRequestData': {0: JAVA_OBJECT},
  'HtmlTextDecode': {0: JAVA_STRING},
  'JSONTextDecode': {0: JAVA_STRING},
  'PostFile': {0: JAVA_STRING},
  'PostText': {0: JAVA_STRING},
  'PostTextWithEncoding': {0: JAVA_STRING, 1: JAVA_STRING},
  'PutFile': {0: JAVA_STRING},
  'PutText': {0: JAVA_STRING},
  'PutTextWithEncoding': {0: JAVA_STRING},
  'UriEncode': {0: JAVA_STRING},
  'XMLTextDecode': {0: JAVA_STRING},

  //sharing
  'ShareFile': {0: JAVA_STRING},
  'ShareFileWithMessage': {0: JAVA_STRING, 1: JAVA_STRING},
  'ShareMessage': {0: JAVA_STRING},

  //twitter
  'DirectMessage': {0: JAVA_STRING, 1: JAVA_STRING},
  'Follow': {0: JAVA_STRING},
  'Login': {0: JAVA_STRING, 1: JAVA_STRING},
  'SearchTwitter': {0: JAVA_STRING},
  'StopFollowing': {0: JAVA_STRING},
  'Tweet': {0: JAVA_STRING},
  'TweetWithImage': {0: JAVA_STRING},

  //tinyWebDB
  'GetValue': {0: JAVA_STRING, 1: JAVA_STRING},
  'StoreValue': {0: JAVA_STRING, 1: JAVA_OBJECT},

  //firebase
  'GotValue': {0: JAVA_STRING, 1: JAVA_OBJECT},

  //tinyDB
  'ClearTag': {0: JAVA_STRING},

  //texting
  'MessageReceived': {0: JAVA_STRING, 1: JAVA_STRING},
  'PhoneNumber': {0: JAVA_STRING},
  'Message': {0: JAVA_STRING},

  //screen methods
  'OtherScreenClosed': {0: JAVA_STRING, 1: JAVA_OBJECT},

  //Image methods
  'Picture': {0: JAVA_STRING},

  //Text Box Methods
  'Hint': {0: JAVA_STRING},

  //List picker methods
  'Elements': {0: JAVA_YAIL_LIST}
};
//Map of double casting
var methodSpecialCases = new Map();

//canvas methods
methodSpecialCases.set("BackgroundColor", ["((Float)XXX).intValue()"]);
methodSpecialCases.set("DrawCircle", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "XXX", "XXX"]);
methodSpecialCases.set("DrawLine", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()"]);
methodSpecialCases.set("PaintColor", ["Integer.parseInt(String.valueOf(XXX))"]);
methodSpecialCases.set("Dragged", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Boolean)XXX).booleanValue()"]);
methodSpecialCases.set("MoveTo", ["((Float)XXX).intValue()", "((Float)XXX).intValue()"]);
methodSpecialCases.set("Flung", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Boolean)XXX).booleanValue()"]);
methodSpecialCases.set("TouchDown", ["((Float)XXX).intValue()", "((Float)XXX).intValue()"]);
methodSpecialCases.set("TouchUp", ["((Float)XXX).intValue()", "((Float)XXX).intValue()"]);
methodSpecialCases.set("Touched", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Boolean)XXX).booleanValue()"]);
methodSpecialCases.set("PointinDirection", ["((Float)XXX).intValue()", "((Float)XXX).intValue()"]);

//clock methods
methodSpecialCases.set("Duration", ["((Calendar)XXX)", "((Calendar)XXX)"]);
methodSpecialCases.set("TimerInterval", ["Integer.parseInt(String.valueOf(XXX))"]);

//location sensor
methodSpecialCases.set("LocationChanged", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()"]);

//accelerometer sensor
methodSpecialCases.set("AccelerationChanged", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()"]);

//orientation sensor
methodSpecialCases.set("OrientationChanged", ["((Float)XXX).intValue()", "((Float)XXX).intValue()", "((Float)XXX).intValue()"]);

//pedometer
methodSpecialCases.set('SimpleStep', ["(int)XXX", "((Float)XXX).intValue()"]);
methodSpecialCases.set('WalkStep', ["(int)XXX", "((Float)XXX).intValue()"]);

//proximity sensor
methodSpecialCases.set('ProximityChanged', ["((Float)XXX).intValue()"]);

//slider
methodSpecialCases.set('PositionChanged', ["((Float)XXX).intValue()"]);

//sprite
methodSpecialCases.set('Speed', ["((Float)XXX).intValue()"]);

//Map of accepted Screen Properties and castings
var screenPropertyCastMap = new Map();
screenPropertyCastMap.set("Title", ["\"XXX\""]);
screenPropertyCastMap.set("AboutScreen", ["\"XXX\""]);
screenPropertyCastMap.set("AlignHorizontal", ["XXX"]);
screenPropertyCastMap.set("AlignVertical", ["XXX"]);
screenPropertyCastMap.set("AppName", ["\"XXX\""]);
screenPropertyCastMap.set("BackgroundColor", ["Integer.parseInt(\"XXX\", 16)"]);
screenPropertyCastMap.set("BackgroundImage", ["\"XXX\""]);
screenPropertyCastMap.set("Icon", ["\"XXX\""]);
screenPropertyCastMap.set("Scrollable", ["XXX"]);

var returnTypeCastMap = new Map();
returnTypeCastMap.set("TinyDB1.GetValue,responseMessage", ["String.valueOf(XXX)"]);
returnTypeCastMap.set("TinyDB1.GetValue,members", ["(ArrayList<?>)XXX"]);
returnTypeCastMap.set("QuestionList", ["((ArrayList<?>)XXX)"]);
returnTypeCastMap.set("AnswerList", ["((ArrayList<?>)XXX)"]);
returnTypeCastMap.set("answer", ["String.valueOf(XXX)"]);
returnTypeCastMap.set("resultsList", ["(ArrayList<?>)XXX"]);
returnTypeCastMap.set("title", ["String.valueOf(XXX)"]);
returnTypeCastMap.set("cost", ["String.valueOf(XXX)"]);
returnTypeCastMap.set("isbn", ["String.valueOf(XXX)"]);

var listTypeCastMap = new Map();
listTypeCastMap.set("bookItem", ["((ArrayList<?>)XXX)"]);
/*** Type cast Map end ***/

//Java Component Types
var TYPE_JAVA_ARRAYLIST = "ArrayList<Object>";

//JSON Parameters
var JSONKEY_JAVACODE = "java_code";
var JSONKEY_SUCCESS = "success";
var JSONVALUE_UNSUCCESSFUL = false;
var JSONVALUE_SUCCESSFUL = true;
var JSONKEY_ERRORS = "errors";

/**
 * Generate the Yail code for this blocks workspace, given its associated form specification.
 *
 * @param {String} formJson JSON string describing the contents of the form. This is the JSON
 *    content from the ".scm" file for this form.
 * @param {String} packageName the name of the package (to put in the define-form call)
 * @param {Boolean} forRepl  true if the code is being generated for the REPL, false if for an apk
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.getFormJava = function (formJson, packageName, forRepl) {
  var screenJSONInfo = JSON.parse(formJson);

  var jsonResponse = new Object();
  try {
    var javaCodeList = [];
    javaCodeList.push(Blockly.Java.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), screenJSONInfo));
    var javaCode = Blockly.Java.prettyPrintJBridgeCode(javaCodeList.join('\n'));

    jsonResponse[JSONKEY_SUCCESS] = JSONVALUE_SUCCESSFUL;
    jsonResponse[JSONKEY_JAVACODE] = javaCode;
  } catch (e) {
    // catch any runtime errors
    jsonResponse[JSONKEY_SUCCESS] = JSONVALUE_UNSUCCESSFUL;
    jsonResponse[JSONKEY_ERRORS] = e;
  }

  return JSON.stringify(jsonResponse);
};

/**
 * Retrieves JSON string and imports for project.
 *
 * @param {Sting} JSON topBlocks from the Blockly mainWorkspace
 * @param {String} jsonObject
 * @returns {String} the generated code
 */
Blockly.Java.genJBridgeCode = function (topBlocks, jsonObject) {
  Blockly.Java.initAllVariables();
  Blockly.Java.parseJBridgeJsonData(jsonObject);
  Blockly.Java.sortBlocksByPriority(topBlocks);
  Blockly.Java.parseTopBlocks(topBlocks);

  var code = Blockly.Java.JBRIDGE_PACKAGE_NAME +
    Blockly.Java.JBRIDGE_BASE_IMPORTS +
    Blockly.Java.genComponentImport(jBridgeImportsMap) +
    Blockly.Java.genJBridgeClass(topBlocks);

  return code;
};

/**
 * Sorts blocks to control the order that they are parsed.
 * Used to parse blocks that have defined information first
 * @param topBlocks
 */
Blockly.Java.sortBlocksByPriority = function (topBlocks) {
  var priorityIndex = 0;
  for (var x = 0, block; block = topBlocks[x]; x++) {
    if (block.type == "global_declaration") {
      //swap priority
      var tmpBlock = topBlocks[priorityIndex];
      topBlocks[priorityIndex++] = block;
      topBlocks[x] = tmpBlock;
    }
  }
};

/**
 * Instantiates variables needed for java generation.
 */
Blockly.Java.initAllVariables = function () {
  jBridgeTopBlockCodesList = [];
  jBridgeRegisterEventMap = new Object();
  jBridgeEventsList = [];
  jBridgeVariableDefinitionMap = new Object();
  jBridgeInitializationList = [];
  jBridgeEventMethodSetupCode = "";
  jBridgeComponentMap = new Object();
  jBridgeGlobalVarTypes = new Object();
  jBridgeImportsMap = new Object();
  jBridgeProceduresMap = new Object();
  jBridgeEventMethodsList = [];
  jBridgeListNames = [];
};

/**
 * Retrieves JSON string and imports for project.
 *
 * @param {String} JSON Object that contains app inventor blocks
 */
Blockly.Java.parseJBridgeJsonData = function (jsonObject) {
  var jsonProperties = jsonObject.Properties;
  jBridgeCurrentScreen = jsonProperties.$Name;
  //iterating over the screen component properties
  for (var prop in jsonProperties) {
    if (jsonProperties[prop] !== undefined) {
      if (Blockly.Java.hasTypeCastKey(prop, screenPropertyCastMap)) {
        var castedValue = Blockly.Java.TypeCastOneValue(prop, jsonProperties[prop], screenPropertyCastMap);
        jBridgeInitializationList.push("this." + prop + "(" + castedValue + ");");

      }
    }
  }
  //parsing the lower level components (not including the "Screen" component)
  for (var i = 0; i < jsonProperties.$Components.length; i++) {
    Blockly.Java.parseJBridgeJsonComponents(jsonProperties.$Components[i], "this");
  }
};

Blockly.Java.parseJBridgeJsonComponents = function (componentJson, rootName) {
  var name = componentJson.$Name;

  // Assuiming if a component has no name, its not a valid component
  if (name == undefined) {
    name = "this";
  }
  jBridgeComponentMap[name] = [];
  jBridgeComponentMap[name].push({"rootName": rootName});
  jBridgeComponentMap[name].push({"Type": componentJson.$Type}); //<- look here?

  jBridgeVariableDefinitionMap[name] = componentJson.$Type;
  jBridgeImportsMap[componentJson.$Type] = "import com.google.appinventor.components.runtime." + componentJson.$Type + ";";
  var newObj = name
    + " = new "
    + componentJson.$Type
    + "("
    + rootName
    + ");";

  jBridgeInitializationList.push(newObj);
  if (componentJson.$Type.toLowerCase() == "imagesprite" || componentJson.$Type.toLowerCase() == "ball") { //just inserted 7/20/16 by *Elia*
    jBridgeInitializationList.push(name + ".Initialize();");
  }
  var componentsObj = undefined;
  for (var key in componentJson) {
    if (JBRIDGE_COMPONENT_SKIP_PROPERTIES.indexOf(key) <= -1
      && key != "$Name" && key != "$Type" && componentJson.hasOwnProperty(key)) {
      if (key == "$Components") {
        componentsObj = componentJson[key];
      } else {
        //Removing the $ sign on ceratin properties in the json file
        var printableKey = key;
        if (key.charAt(0) == "$") {
          printableKey = key.substring(1);
        }
        jBridgeComponentMap[name].push({printableKey: componentJson[key]})
        //Convert color code & lower case for boolean value
        var valueOfLowerCase = componentJson[key].toLowerCase();
        var printableValue = componentJson[key];
        //JSON value from height/width fill parent is -2
        if ((key == "Height" || key == "Width") && printableValue == "-2") {
          printableValue = "LENGTH_FILL_PARENT";
        }
        //Java Bridge prefers java integers over floats or doubles
        if (Blockly.Java.isNumber(printableValue) && JBRIDGE_JSON_TEXT_PROPERTIES.indexOf(key) <= -1) {
          printableValue = Math.round(printableValue);
        }
        //casting the color to HEX
        if (componentJson[key].substring(0, 2) == "&H" && componentJson[key].length == 10) {
          printableValue = "0x" + componentJson[key].substring(2);
        }
        //for True and False properties
        if (valueOfLowerCase == "true" || valueOfLowerCase == "false") {
          printableValue = valueOfLowerCase;
        }
        //for properties that require qoutes ""
        if (JBRIDGE_JSON_TEXT_PROPERTIES.indexOf(key) > -1) {
          printableValue = "\"" + printableValue.replace(/"/gi, "\'") + "\"";
        }
        jBridgeInitializationList.push(Blockly.Java.genJBridgeJsonComopnents(name, printableKey, printableValue));
      }
    }
  }
  //Assuming that $Components Property is always an array
  if (componentsObj != undefined) {
    for (var i = 0; i < componentsObj.length; i++) {
      Blockly.Java.parseJBridgeJsonComponents(componentsObj[i], name);
    }
  }
};

Blockly.Java.genJBridgeJsonComopnents = function (componentName, property, value) {
  var code = componentName
    + "."
    + property
    + "("
    + value
    + ");";
  return code;
};
/*
*/
Blockly.Java.parseComponentDefinition = function (jBridgeVariableDefinitionMap) {
  var code = "";
  for (var key in jBridgeVariableDefinitionMap) {
    code = code
      + Blockly.Java.genComponentDefinition(jBridgeVariableDefinitionMap[key], key)
      + "\n";
    Blockly.Java.addPermisionsAndIntents(jBridgeVariableDefinitionMap[key]);
  }
  return code;
};

/**
 *  Generates the corresponding code for each component as "private [type] [name] ;
 *
 * @params{String}
 * @params{String}
 */
Blockly.Java.genComponentDefinition = function (type, name) {
  var code = "private "
    + type
    + " "
    + name
    + ";";
  return code;
};


Blockly.Java.genComponentImport = function (jBridgeImportsMap) {
  var code = "";
  for (var key in jBridgeImportsMap) {
    code = code
      + '\n'
      + jBridgeImportsMap[key];
  }
  return code;
};

/**
 * Generates class declarations, event handlers, and their corresponding public methods.
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeClass = function (topBlocks) {
  var code = "\nclass " + jBridgeCurrentScreen + " extends Form implements HandlesEventDispatching { \n"
    + Blockly.Java.parseComponentDefinition(jBridgeVariableDefinitionMap)
    + Blockly.Java.genJBridgeDefineMethod()
    + Blockly.Java.genJBridgeDispatchEvent()
    + Blockly.Java.genJBridgeEventMethods()
    + Blockly.Java.genJBridgeDefineProcedure(jBridgeProceduresMap)
    + "\n}\n";
  return code;
};


/**
 * Generates class declarations, event handlers, and their corresponding public methods.
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */

Blockly.Java.genJBridgeEventsRegister = function (jBridgeRegisterEventMap) {
  var registeredEvents = [];
  for (var key in jBridgeRegisterEventMap) {
    registeredEvents.push(jBridgeRegisterEventMap[key]);
  }
  return registeredEvents.join("\n");
};

/**
 * Generates protected void $define method
 *
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeDefineMethod = function () {
  var code = "\nprotected void $define() { \n"
    + jBridgeInitializationList.join("\n")
    + "\n"
    + Blockly.Java.genJBridgeEventsRegister(jBridgeRegisterEventMap)
    + "\n}";
  return code;
};


/**
 * Generates parameters for each method in project
 *
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.genJBridgeDispatchEvent = function () {
  var code = "\npublic boolean dispatchEvent(Component component, String componentName, String eventName, Object[] params){\n"
    + jBridgeTopBlockCodesList.join("\n")
    + "\n return false;"
    + "\n}";

  return code;
};

Blockly.Java.genJBridgeEventMethods = function () {
  var code = "";
  if (jBridgeEventMethodsList !== undefined) {
    code = jBridgeEventMethodsList.join("\n") + "\n";
  }
  return code;
};

Blockly.Java.genJBridgeDefineProcedure = function (jBridgeProceduresMap) {
  var code = "";
  for (var key in jBridgeProceduresMap) {
    code = code
      + '\n'
      + jBridgeProceduresMap[key];
  }
  return code;
};

Blockly.Java.parseTopBlocks = function (topBlocks) {
  for (var x = 0, block; block = topBlocks[x]; x++) {
    if (Blockly.Java.floatingBlock(block) == false) {
      jBridgeTopBlockCodesList.push(Blockly.Java.parseBlock(block));
    }
  }
};

/**
 * Determines if the block is a floating block. Floating block is any block who's category is not component, variable, or procedure.
 * category (i.e. Colors, Variables, etc.)
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {Boolean} whether block is a floating block.
 */
Blockly.Java.floatingBlock = function (block) {
  if (block == undefined) {
    return false;
  }
  jBridgeIsIndividualBlock = false;
  var blockCategory = block.category;
  if (blockCategory == "Component") {
    return false;
  } else if (blockCategory == "Colors") {
    return true;
  } else if (blockCategory == "Variables") {
    return false;
  } else if (blockCategory == "Math") {
    return true;
  } else if (blockCategory == "Logic") {
    return true;
  } else if (blockCategory == "Procedures") {
    return false;
  } else if (blockCategory == "Control") {
    return true;
  } else if (blockCategory == "Lists") {
    return true;
  } else if (blockCategory == "Text") {
    return true;
  }
  return false;
};

Blockly.Java.getJBridgeInstanceName = function (block) {
  var name = block.instanceName;
  if (jBridgeCurrentScreen == name) {
    name = "this";
  }
  return name;
};

/**
 * Parses the event block and calls another parse method that corresponds to their block
 * category (i.e. Colors, Variables, etc.)
 *
 * @param {String} topBlocks JSON string describing the contents of the form. This is the JSON
 * content from the ".scm" file for this form.
 * @returns {String} the generated code if there were no errors.
 */

Blockly.Java.parseBlock = function (block) {
  if (block == undefined) {
    return "";
  }
  jBridgeIsIndividualBlock = false;
  var code = "";
  var blockCategory = block.category;
  if (blockCategory == "Component") {
    code = Blockly.Java.parseJBridgeComponentBlock(block);
  } else if (blockCategory == "Colors") {
    code = Blockly.Java.parseJBridgeColorBlock(block);
  } else if (blockCategory == "Variables") {
    code = Blockly.Java.parseJBridgeVariableBlocks(block);
  } else if (blockCategory == "Math") {
    code = Blockly.Java.parseJBridgeMathBlocks(block);
  } else if (blockCategory == "Logic") {
    code = Blockly.Java.parseJBridgeLogicBlocks(block);
  } else if (blockCategory == "Procedures") {
    code = Blockly.Java.parseJBridgeProceduresBlocks(block);
  } else if (blockCategory == "Control") {
    code = Blockly.Java.parseJBridgeControlBlocks(block);
  } else if (blockCategory == "Lists") {
    code = Blockly.Java.parseJBridgeListBlocks(block);
  } else if (blockCategory == "Text") {
    code = Blockly.Java.parseJBridgeTextTypeBlocks(block);
  }
  return code;
};

/**
 *  Iterates through all the parent to find the specific blockType and loads fieldName map
 */
Blockly.Java.getJBridgeParentBlockFieldMap = function (block, blockType, fieldName) {
  if (block != undefined && block != null && block.type == blockType) {
    return Blockly.Java.getFieldMap(block, fieldName);
  }
  if (block == null || block == undefined) {
    return new Object();
  }
  return Blockly.Java.getJBridgeParentBlockFieldMap(block.parentBlock_, blockType, fieldName);
};

Blockly.Java.findObjectCastType = function (javaType) {
  var castType = javaType;
  if (javaType == JAVA_INT) {
    castType = JAVA_CLASS_INT;
  } else if (javaType == JAVA_BOOLEAN) {
    castType = JAVA_CLASS_BOOLEAN
  } else if (javaType == JAVA_FLOAT) {
    castType = JAVA_CLASS_FLOAT;
  } else if (javaType == JAVA_DOUBLE) {
    castType = JAVA_CLASS_DOUBLE;
  }
  return castType;
};

/**
 *This function identifies if the param is a global variable or functional variable
 *and returns the appropriate name
 *
 * @param {String} paramsMap
 * @param {String} paramName is the name of the parameter
 * @returns {String} params[index]
 */
Blockly.Java.getJBridgeRelativeParamName = function (paramsMap, paramName) {
  var paramIndex = paramsMap[paramName];
  if (paramIndex == undefined) {
    //check for "global " keyword in param name and remove it
    if (paramName.substring(0, 7) == "global ") {
      paramName = paramName.replace("global ", "");
    }
    return paramName;
  }
  return paramName;
};

/**
 * Populates a map in which the "keys" are the fieldName given by the
 * block, and the "values" are the index of those fieldName values in the params[] java object.
 * @param block The block containing the paramters
 * @param fieldName the field name from the block
 * */
Blockly.Java.getFieldMap = function (block, fieldName) {
  var fieldMap = new Object();
  if (block.inputList != undefined) {
    for (var x = 0, input; input = block.inputList[x]; x++) {
      var fieldIndex = 0;
      if (input.name == fieldName) {
        for (var y = 0, field; field = input.fieldRow[y]; y++) {
          var fieldName = field.getText();
          if (fieldName.replace(/ /g, '').length > 0) {
            eventMethodParamListings[fieldName] = fieldIndex;
            fieldMap[fieldName] = fieldIndex;
            fieldIndex++;
          }
        }
      }
    }
  }
  return fieldMap;
};

Blockly.Java.checkInputName = function (block, inputName) {
  if (block.inputList != undefined) {
    for (var x = 0, input; input = block.inputList[x]; x++) {
      if (input.name.slice(0, inputName.length) == inputName) {
        return true;
      }
    }
  }
  return false;
};

Blockly.Java.hasTypeCastKey = function (key, typeCastMap) {
  if (typeCastMap.has(key)) {
    return true;
  }
  return false;
};

Blockly.Java.getTypeCastValue = function (key, typeCastMap) {
  if (typeCastMap.has(key)) {
    return typeCastMap.get(key);
  }
  return null;
};

/**
 * Will cast the value if the key is contained in the typeCastMap.
 * Will cast floats to whole integers and cast types in paramTypeCastMap
 * @param key The key in the cast map
 * @param value The value to be casted
 * @param typeCastMap The type cast map
 * @return The casted value
 * */
Blockly.Java.TypeCastOneValue = function (key, value, typeCastMap) {
  var v = Blockly.Java.getTypeCastValue(key, typeCastMap);
  var result = "";
  if (v != null) {
    if (Blockly.Java.isNumber(value)) {
      //Java bridge library requires ints/doubles over floats
      result = Math.round(value);
    } else {
      if (value === "True" || value == "False") {
        value = value.toLowerCase();
      }
      result = v[0].replace("XXX", value);
    }
  }
  //casting the color to HEX
  if (value.substring(0, 2) === "&H" && value.length === 10) {
    result = "0x" + value.substring(2);
  }
  return result;
};

Blockly.Java.getFieldList = function (block, fieldName) {
  var fieldsList = [];
  if (block.inputList != undefined) {
    for (var x = 0, input; input = block.inputList[x]; x++) {
      if (input.name == fieldName) {
        for (var y = 0, field; field = input.fieldRow[y]; y++) {
          var fieldName = field.getText();
          if (fieldName.replace(/ /g, '').length > 0) {
            fieldsList.push(fieldName);
          }
        }
      }
    }
  }
  return fieldsList;
};

Blockly.Java.getProcName = function (block, inputName, fieldName) {
  var procName = "";
  for (var x = 0, input; input = block.inputList[x]; x++) {
    if (input.name == inputName) {
      for (var y = 0, field; field = input.fieldRow[y]; y++) {
        if (field.name == fieldName) {
          procName = field.text_;
        }
      }
    }
  }
  return procName;
};

Blockly.Java.JBridgeCheckProperty = function (componentName, property) {
  var code = "";
  if (Blockly.Java.withinPropertySet(property)) {
    code = "((Float)" + componentName + "." + property + "()" + ").intValue()";
  }
  else {
    code = componentName + "." + property + "()";
  }
  return code;
};

Blockly.Java.withinPropertySet = function (property) {
  return propertyBlockSet.indexOf(property) > -1;
};

/**
 * Adds method names to list of methods that will be added to code at the end of block parsing
 *
 * @param {String} eventMethodName is the event that is being passed in
 * @param {String} body represents the entire code body within the project
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.addComponentEventMethod = function (eventMethodName, body) {
  var stringParam = Blockly.Java.createMethodParameterString(body);
  var code = "\npublic void " + eventMethodName + "(" + stringParam + "){\n"
    + body
    + "\n}";
  jBridgeEventMethodsList.push(code);
};

/**
 * This method searches the body of the generated method for the dispatch event
 * parameters. If any parameters are used within the method then they must be passed in
 * as the method's parameter for use in the local scope
 * @param body The body of the generated event method
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.createMethodParameterString = function (body) {
  var parameters = [];
  // var castValue = new Object();
  var index = new Object();
  for (var paramName in eventMethodParamListings) {
    index = eventMethodParamListings[paramName];
    var methodMap = methodParamsMap[methodParam];
    if (methodMap != undefined) {
      var castValue = methodParamsMap[methodParam][index];
      parameters.push(castValue + " " + paramName);
    } else {
        throw "\"Cannot find method param entry for \" + methodParam + \".\" + paramName";
    }
  }
  var stringParam = "";
  for (var i = 0; i < parameters.length; i++) {
    stringParam += parameters[i];
    //skip the comma at the end
    if (i !== parameters.length - 1) {
      stringParam += ", ";
    }
  }
  return stringParam;
};

/**
 * Generates parameters for each method name within dispatchEvent
 *
 * @param {String} body that contains the entire code generation
 * @returns {String} the generated code if there were no errors.
 */
Blockly.Java.createCalledMethodParameterString = function (body) {
  var stringParam = "";

  if (Blockly.Java.checkCast(methodParam, methodSpecialCases)) { //if it contains special casting
    stringParam = Blockly.Java.specialCast(body, methodParam, eventMethodParamListings, methodSpecialCases);
  } else { //regular cast
    stringParam = Blockly.Java.normalCast(body, methodParam, eventMethodParamListings, methodParamsMap);
  }

  return stringParam;
};

/* *
 * Checks whether or not the casting contains markers that indicate a casting within a casting
 * e.g.((Float)XXX).intValue())
 *
 * @param {Object} method that uses the parameters
 * @param {Object} mapping from method to casting
 * @returns {Boolean} whether or not the statement is true
 */
Blockly.Java.checkCast = function (methodParam, methodSpecialCases) {
  var castValue = Blockly.Java.getTypeCastValue(methodParam, methodSpecialCases);

  if (castValue == null) {
    return false;
  } else {
    return true;
  }
};

//for each value within the eventMethodParams, match the parameter number to the
/* *
 * Basic casting of parameter values (e.g. string, int)
 *
 * @param {String} generated code thus far
 * @param {Object} method that uses the parameters
 * @param {Object} list of parameters
 * @param {Object} mapping from method to casting
 * @returns {String} the generated casting in java
 */
Blockly.Java.normalCast = function (body, methodParam, eventMethodParamListings, methodParamsMap) {
  var parameters = [];
  var stringParam = "";
  var index = new Object(); //get key from methodParasMap

  for (var paramName in eventMethodParamListings) {
    index = eventMethodParamListings[paramName];
    if (methodParamsMap[methodParam] != undefined) {
      var objectCastType = Blockly.Java.findObjectCastType(methodParamsMap[methodParam][index]);
      parameters.push("(" + objectCastType + ")" + "params[" + eventMethodParamListings[paramName] + "]");
    }
  }

  for (var i = 0; i < parameters.length; i++) {
    stringParam += parameters[i];
    //skip the comma at the end
    if (i !== parameters.length - 1) {
      stringParam += ", ";
    }
  }

  return stringParam;
};


/* *
 * Deep casting of each parameter according to their cast. This is determined by
 * the typeCastMap
 *
 * @param {String} generated code thus far
 * @param {String} method that uses the parameters
 * @param {Object} list of parameters
 * @param {Object} mapping from method to casting
 * @param {Boolean} whether or not this is method will be used for casting parameters (true)
 * or within the method (false)
 * @returns {String} the generated casting in java
 */
Blockly.Java.specialCast = function (body, key, paramList, typeCastMap) {
  var v = Blockly.Java.getTypeCastValue(key, typeCastMap);
  var parameters = [];
  var x = 0;
  var stringParam = "";
  if (key == "Duration") {
    jBridgeImportsMap[key] = "import java.util.Calendar;";
  }

  if (v != null) {
    for (var paramName in paramList) {
      parameters.push(v[x].replace(/XXX/g, "params[" + paramList[paramName] + "]"));
      x++;
    }
  }

  for (var i = 0; i < parameters.length; i++) {
    stringParam += parameters[i];

    //skip the comma at the end
    if (i !== parameters.length - 1) {
      stringParam += ", ";
    }
  }

  return stringParam;
};

Blockly.Java.castValueToInteger = function (block, value) {
  var needsCasting = false;
  if (block.category != "Math" && block.category != "Logic") {
    if (block.category == "Variables") {
      if (jBridgeLexicalVarTypes[value] != undefined && jBridgeLexicalVarTypes[value] != JAVA_INT) {
        needsCasting = true;
      } else if (jBridgeGlobalVarTypes[value] != undefined && jBridgeGlobalVarTypes[value] != JAVA_INT) {
        needsCasting = true;
      }
    } else if (block.type == "component_set_get") {
      if (block.setOrGet == "get") {
        var property = block.property;
        if (property == undefined) {
          property = block.propertyName;
        }
        var params = methodParamsMap[property];
        if (params != undefined) {
          var param = params[0];
          if (param != JAVA_INT && param != JAVA_DOUBLE && param != JAVA_FLOAT) {
            needsCasting = true;
          }
        }
      }
    } else {
      if (value.search(".intValue()") < 0) {
        needsCasting = true;
      }
    }
  }
  if (needsCasting) {
    //Need to force cast Objects returned by Lists to int
    if (block.category == "Lists") {
      value = "(int)" + value
    }
    value = "Integer.valueOf(" + value + ")";
  }

  return value;
};

Blockly.Java.castObjectChildToInteger = function (block, childNumber, value) {
  if (block.childBlocks_[childNumber - 1].category != "Math") {
    if (block.childBlocks_[childNumber - 1].category != "Variables") {
      value = "(int) " + value;
    } else if (jBridgeLexicalVarTypes[value] != undefined && jBridgeLexicalVarTypes[value] != JAVA_INT) {
      value = "(int) " + value;
    }
  }
  return value;
};

/**
 * Parses an App Inventor Block that:
 * gives the min or max of two given numbers
 * @param mathBlock the App Inventor math block
 * @return the Java Code
 */
Blockly.Java.parseJBridgeMathOnListBlock = function (mathBlock) {
  var code = "";
  var operand = mathBlock.getFieldValue('OP');
  var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
  if (leftValue.slice(-7) == ".Text()") {
    leftValue = "Integer.parseInt(" + leftValue + ")";
  }
  var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
  if (rightValue.slice(-7) == ".Text()") {
    rightValue = "Integer.parseInt(" + rightValue + ")";
  }
  //Math.min() or Math.max()
  code += "Math." + operand.toLowerCase() + "(" + leftValue + ", " + rightValue + ")";
  return code;
};

/**
 * Returns whether the given value is a number or not
 * @param value The value to check
 * @return whether it is an int or not
 * */
Blockly.Java.isNumber = function (value) {
  return !isNaN(value);
};

Blockly.Java.getValueType = function (childType, value, block) {
  var variableType = JAVA_STRING;

  if (childType == "Math") {
    if (value.indexOf(".") != -1) {
      variableType = JAVA_FLOAT;
    } else {
      variableType = JAVA_INT;
    }
  } else if (childType == "Logic") {
    variableType = JAVA_BOOLEAN;
  } else if (childType == "Lists") {
    if (block.type == "lists_select_item") {
      variableType = JAVA_OBJECT;
    } else {
      variableType = TYPE_JAVA_ARRAYLIST;
    }
  } else if (childType == "Colors") {
    variableType = JAVA_INT;
  }
  return variableType;
};

Blockly.Java.isStringBlock = function (block) {
  var isString = false;
  if (JBRIDGE_COMPONENT_TEXT_PROPERTIES.indexOf(block.propertyName) == 0) {
    isString = true;
  } else if (block.category == "Variables") {
    var varName = block.fieldVar_.name;
    if (jBridgeVariableDefinitionMap[varName] == JAVA_STRING) {
      isString = true;
    }
  } else if (block.category == "Text") {
    isString = true;
  }
  return isString;
};

/**
 *  Generates string comparison in java code
 *
 * @params {String} leftValue
 * @params {String} rightValue
 * @params {String} op
 * @return {String} code if there are no errors
 */

Blockly.Java.getJBridgeTextCompareBlock = function (leftValue, rightValue, op) {
  var code = "(String.valueOf("
    + leftValue
    + ").compareTo(String.valueOf("
    + rightValue
    + ")) "
    + op
    + ")";
  return code;
};

/**
 *  Translates JBridge math operator from parsed blocks
 *
 * @params {String} operator
 * @returns {String} returns java-translated version of desired operator
 */
Blockly.Java.getJBridgeOperator = function (operator) {
  var op = operator;
  if (operator == "GT") {
    op = ">";
  } else if (operator == "LT") {
    op = "<";
  } else if (operator == "EQ" || operator == "EQUAL") {
    op = "==";
  } else if (operator == "NEQ") {
    op = "!=";
  } else if (operator == "GTE") {
    op = ">=";
  } else if (operator == "LTE") {
    op = "<=";
  } else if (operator == 'AND') {
    op = "&&";
  } else if (operator == "OR") {
    op = "||";
  }

  return op;
};

/**
 *  Allows more readable JBridge code using indentation using
 * curly brackets as indentation queues
 * @param {String} javaCode generated
 * @return{String} Prity code generated if no errors
 */
Blockly.Java.prettyPrintJBridgeCode = function (javaCode) {
  var stack = new Array();
  var lines = javaCode.split('\n');
  var prityPrint = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line == ";" || line.length == 0) {
      continue;
    }
    var lastChar = line.slice(-1);
    var indentation = Blockly.Java.prityPrintIndentationJBridge(stack.length);
    if (lastChar == "{") {
      stack.push("{");
    } else if (lastChar == "}") {
      stack.pop();
      indentation = Blockly.Java.prityPrintIndentationJBridge(stack.length);
    }
    prityPrint.push(indentation + line);

  }
  return prityPrint.join("\n");
};

/**
 *  Adds the permissions and intents to the AndroidManifest.xml file
 *
 * @param {String} indentLength
 * @return{String} indentation for corresponding method structure
 */
Blockly.Java.prityPrintIndentationJBridge = function (indentLength) {
  var indentation = "";
  for (var j = 0; j < indentLength; j++) {
    indentation += "  ";
  }
  return indentation;
};

/**
 *  Adds the permissions and intents to the AndroidManifest.xml file
 *
 * @param {String} formJson JSON string describing the contents of the form. This is the JSON
 *    content from the ".scm" file for this form.
 * @params{String} packageName the name of the package (to put in the define-form call)
 * @params{String} forRepl  true if the code is being generated for the REPL, false if for an apk
 * @return{String} code generated if no errors
 */
Blockly.Java.getManifestJSONData = function (formJson) {
  Blockly.Java.initAndroidPermisionAndIntent();
  var jsonObject = JSON.parse(formJson);
  Blockly.Java.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), jsonObject);

  //forming json return string
  var jsonReturn = "{";
  jsonReturn += "\"screenName\": \"" + jBridgeCurrentScreen + "\",";

  jsonReturn += "\"intents\": [";
  var added = false;
  for (var key in jBridgeIntentsToAdd) {
    jsonReturn += "{\"intent\": \"" + jBridgeAndroidIntents[key].replace(/["]/g, "'") + "\"},";
    added = true;
  }
  //remove last comma
  if (added == true) {
    jsonReturn = jsonReturn.slice(0, -1);
  }
  jsonReturn += "],";

  added = false;
  jsonReturn += "\"permissions\": [";
  for (var key in jBridgePermissionToAdd) {
    jsonReturn += "{\"permission\": \"" + jBridgeAndroidPermisions[key].replace(/["]/g, "'") + "\"},";
    added = true;
  }
  //remove last comma
  if (added == true) {
    jsonReturn = jsonReturn.slice(0, -1);
  }
  //removing newline characters
  jsonReturn = jsonReturn.replace(/[\r\n]*/g, "");
  jsonReturn += "]";
  jsonReturn += "}";
  return jsonReturn;
};

/**
 *  Defines the permissions and intents strings
 *
 */
Blockly.Java.initAndroidPermisionAndIntent = function () {
  //This includes method Names or Type
  jBridgeAndroidPermisions["receive_sms"] = "<uses-permission android:name=\"android.permission.RECEIVE_SMS\"/>\r\n\r\n    ";
  jBridgeAndroidPermisions["send_sms"] = "<uses-permission android:name=\"android.permission.SEND_SMS\"/>\r\n\r\n    ";
  jBridgeAndroidPermisions["voice_receive_sms"] = "<uses-permission android:name=\"com.google.android.apps.googlevoice.permission.RECEIVE_SMS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["voice_send_sms"] = "<uses-permission android:name=\"com.google.android.apps.googlevoice.permission.SEND_SMS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["manage_accounts"] = "<uses-permission android:name=\"android.permission.MANAGE_ACCOUNTS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["get_accounts"] = "<uses-permission android:name=\"android.permission.GET_ACCOUNTS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["use_credentials"] = "<uses-permission android:name=\"android.permission.USE_CREDENTIALS\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["vibrate"] = "<uses-permission android:name=\"android.permission.VIBRATE\" />\r\n\r\n    ";
  jBridgeAndroidPermisions["internet"] = "<uses-permission android:name=\"android.permission.INTERNET\" />\r\n\r\n    ";

  jBridgeMethodAndTypeToPermisions["vibrate"] = ["vibrate"];
  jBridgeMethodAndTypeToPermisions["tinywebdb"] = ["internet"];
  jBridgeMethodAndTypeToPermisions["sendmessage"] = ["receive_sms", "send_sms", "voice_receive_sms", "voice_send_sms", "manage_accounts", "get_accounts", "use_credentials"];

  //This includes method Names or Type
  jBridgeAndroidIntents["sendmessage"] = "<receiver android:name=\"com.google.appinventor.components.runtime.util.SmsBroadcastReceiver\"\r\n\r\n android:enabled=\"true\" android:exported=\"true\">\r\n\r\n"
    + "<intent-filter>\r\n\r\n        \r\n\r\n        "
    + "<action android:name=\"android.provider.Telephony.SMS_RECEIVED\"/>\r\n\r\n        "
    + "<action android:name=\"com.google.android.apps.googlevoice.SMS_RECEIVED\"/>\r\n\r\n"
    + "</intent-filter>\r\n\r\n"
    + "</receiver>\r\n\r\n    ";
};

/**
 *  Adds the permissions and intents to the AndroidManifest.xml file
 *
 * @params name
 */
Blockly.Java.addPermisionsAndIntents = function (name) {
  name = name.toLowerCase();
  if (name in jBridgeMethodAndTypeToPermisions) {
    var permissions = jBridgeMethodAndTypeToPermisions[name];
    for (var i = 0; i < permissions.length; i++) {
      jBridgePermissionToAdd[permissions[i]] = true;
    }
  }
  if (name in jBridgeAndroidIntents) {
    jBridgeIntentsToAdd[name] = true;
  }
};

/**
 * Method that strips all of the ";" and "\n" characters from the code.
 * Used for methods that are generated but wrapped within another method
 * @param {String} the code to strip
 * @return {String} the stripped code
 */
Blockly.Java.removeColonsAndNewlines = function (code) {
  return code.replace(/[;\n]*/g, "");
};

/**
 * Asserts that the given code will be casted to the required type
 * @param type The type to cast to
 * @param code The code to cast
 * @param childBlock The Block used to generate the code
 */
Blockly.Java.assertType = function (type, code, childBlock) {
  var castedCode = code;
  switch (type) {
    case JAVA_STRING:
      castedCode = Blockly.Java.castValueToString(childBlock, code);
      break;
    case JAVA_INT:
      castedCode = Blockly.Java.castValueToInteger(childBlock, code);
      break;
    case JAVA_FLOAT:
      castedCode = "Float.valueOf(" + code + ")";
      break;
    case JAVA_ARRAY_LIST:
      castedCode = Blockly.Java.castValueToArrayList(childBlock, code);
  }
  return castedCode;
};

Blockly.Java.castValueToArrayList = function (block, value) {
  var needsCasting = false;
  if (block.category != "Lists") {
    needsCasting = true;
  }
  if (needsCasting) {
    value = Blockly.Java.castToType(JAVA_ARRAY_LIST, value);
  }

  return value;
};

Blockly.Java.castValueToString = function (block, value) {
  var needsCasting = false;
  if (block.category != "Text") {
    if (block.category == "Variables") {
      if (jBridgeLexicalVarTypes[value] != undefined && jBridgeLexicalVarTypes[value] != JAVA_STRING) {
        needsCasting = true;
      } else if (jBridgeGlobalVarTypes[value] != undefined && jBridgeGlobalVarTypes[value] != JAVA_STRING) {
        needsCasting = true;
      }
    } else if (block.type == "component_set_get") {
      if (block.setOrGet == "get") {
        var property = block.property;
        if (property == undefined) {
          property = block.propertyName;
        }
        var params = methodParamsMap[property];
        if (params != undefined) {
          var param = params[0];
          if (param != JAVA_STRING) {
            needsCasting = true;
          }
        }
      }
    } else if (block.category == "Math") {
      needsCasting = true;
    }
  }
  if (needsCasting) {
    value = Blockly.Java.castToType(JAVA_STRING, value);
  }

  return value;
};

/**
 * Casts the given value to the given Java type
 */
Blockly.Java.castToType = function (type, code) {
  var castedCode = code;
  switch (type) {
    case JAVA_STRING:
      castedCode = "String.valueOf(" + code + ")";
      break;
    case JAVA_INT:
      castedCode = "Integer.valueOf(" + code + ")";
      break;
    case JAVA_FLOAT:
      castedCode = "(float) (" + code + ")";
      break;
    case JAVA_ARRAY_LIST:
      castedCode = "((List)" + code + ")";
      jBridgeImportsMap["List"] = "import java.util.List;";
      break;
  }
  return castedCode;
};
