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
Blockly.Java.RESERVED_WORDS_ = '';

/**
 * Order of operation ENUMs.
 * https://developer.mozilla.org/en/Yail/Reference/Operators/Operator_Precedence
 */
Blockly.Java.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.Java.ORDER_NONE = 99;          // (...)

Blockly.Java.YAIL_ADD_COMPONENT = "(add-component ";
Blockly.Java.YAIL_ADD_TO_LIST = "(add-to-list ";
Blockly.Java.YAIL_BEGIN = "(begin ";
Blockly.Java.YAIL_CALL_COMPONENT_METHOD = "(call-component-method ";
Blockly.Java.YAIL_CALL_COMPONENT_TYPE_METHOD = "(call-component-type-method ";
Blockly.Java.YAIL_CALL_YAIL_PRIMITIVE = "(call-yail-primitive ";
Blockly.Java.YAIL_CLEAR_FORM = "(clear-current-form)";
// The lines below are complicated because we want to support versions of the
// Companion older then 2.20ai2 which do not have set-form-name defined
Blockly.Java.YAIL_SET_FORM_NAME_BEGIN = "(try-catch (let ((attempt (delay (set-form-name \"";
Blockly.Java.YAIL_SET_FORM_NAME_END = "\")))) (force attempt)) (exception java.lang.Throwable 'notfound))";
Blockly.Java.YAIL_CLOSE_COMBINATION = ")";
Blockly.Java.YAIL_CLOSE_BLOCK = ")\n";
Blockly.Java.YAIL_COMMENT_MAJOR = ";;; ";
Blockly.Java.YAIL_COMPONENT_REMOVE = "(remove-component ";
Blockly.Java.YAIL_COMPONENT_TYPE = "component";
Blockly.Java.YAIL_DEFINE = "(def ";
Blockly.Java.YAIL_DEFINE_EVENT = "(define-event ";
Blockly.Java.YAIL_DEFINE_FORM = "(define-form ";
Blockly.Java.YAIL_DO_AFTER_FORM_CREATION = "(do-after-form-creation ";
Blockly.Java.YAIL_DOUBLE_QUOTE = "\"";
Blockly.Java.YAIL_FALSE = "#f";
Blockly.Java.YAIL_FOREACH = "(foreach ";
Blockly.Java.YAIL_FORRANGE = "(forrange ";
Blockly.Java.YAIL_GET_COMPONENT = "(get-component ";
Blockly.Java.YAIL_GET_PROPERTY = "(get-property ";
Blockly.Java.YAIL_GET_COMPONENT_TYPE_PROPERTY = "(get-property-and-check  ";
Blockly.Java.YAIL_GET_VARIABLE = "(get-var ";
Blockly.Java.YAIL_AND_DELAYED = "(and-delayed ";
Blockly.Java.YAIL_OR_DELAYED = "(or-delayed ";
Blockly.Java.YAIL_IF = "(if ";
Blockly.Java.YAIL_INIT_RUNTIME = "(init-runtime)";
Blockly.Java.YAIL_INITIALIZE_COMPONENTS = "(call-Initialize-of-components";
Blockly.Java.YAIL_LET = "(let ";
Blockly.Java.YAIL_LEXICAL_VALUE = "(lexical-value ";
Blockly.Java.YAIL_SET_LEXICAL_VALUE = "(set-lexical! ";
Blockly.Java.YAIL_LINE_FEED = "\n";
Blockly.Java.YAIL_NULL = "(get-var *the-null-value*)";
Blockly.Java.YAIL_EMPTY_LIST = "'()";
Blockly.Java.YAIL_OPEN_BLOCK = "(";
Blockly.Java.YAIL_OPEN_COMBINATION = "(";
Blockly.Java.YAIL_QUOTE = "'";
Blockly.Java.YAIL_RENAME_COMPONENT = "(rename-component ";
Blockly.Java.YAIL_SET_AND_COERCE_PROPERTY = "(set-and-coerce-property! ";
Blockly.Java.YAIL_SET_AND_COERCE_COMPONENT_TYPE_PROPERTY = "(set-and-coerce-property-and-check! ";
Blockly.Java.YAIL_SET_SUBFORM_LAYOUT_PROPERTY = "(%set-subform-layout-property! ";
Blockly.Java.YAIL_SET_VARIABLE = "(set-var! ";
Blockly.Java.YAIL_SET_THIS_FORM = "(set-this-form)\n ";
Blockly.Java.YAIL_SPACER = " ";
Blockly.Java.YAIL_TRUE = "#t";
Blockly.Java.YAIL_WHILE = "(while ";
Blockly.Java.YAIL_LIST_CONSTRUCTOR = "*list-for-runtime*";

Blockly.Java.SIMPLE_HEX_PREFIX = "&H";
Blockly.Java.YAIL_HEX_PREFIX = "#x";

// permit leading and trailing whitespace for checking that strings are numbers
Blockly.Java.INTEGER_REGEXP = "^[\\s]*[-+]?[0-9]+[\\s]*$";
Blockly.Java.FLONUM_REGEXP = "^[\\s]*[-+]?([0-9]*)((\\.[0-9]+)|[0-9]\\.)[\\s]*$";


Blockly.Java.JBRIDGE_BASE_IMPORTS = "import com.google.appinventor.components.runtime.HandlesEventDispatching; \nimport com.google.appinventor.components.runtime.EventDispatcher; \nimport com.google.appinventor.components.runtime.Form; \nimport com.google.appinventor.components.runtime.Component; \n";
Blockly.Java.JBRIDGE_PACKAGE_NAME = "\npackage org.appinventor.Screen1; \n";

// Blockly.Java.JBRIDGE_DECLARE = [];
// Blockly.Java.JBRIDGE_DEFINE = [];
// Blockly.Java.JBRIDGE_IMPORTS = [];
var jBridgeTopBlockCodesList = [];
var jBridgeRegisterEventMap = new Object();
var jBridgeEventsList = [];
var jBridgeVariableDefinitionMap = new Object();
var jBridgeInitializationList = [];
var jBridgeComponentMap = new Object();
var JBRIDGE_COMPONENT_SKIP_PROPERTIES = ["Uuid", "$Version", "TextAlignment"]; //properties to skip when reading Json File
var JBRIDGE_JSON_TEXT_PROPERTIES = ["Title", "Text", "BackgroundImage", "Image", "Icon", "Source", "Picture", "Hint"]; //Properties that should include the double qoutes "" in the output JBridge Javacode
var jBridgeImportsMap = new Object();
var jBridgeProceduresMap = new Object();
var jBridgeIsIndividualBlock = false; // is to Identify if a block is Iduvidal root block or sub-block
var jBridgeCurrentScreen = "Screen1";
var JBRIDGE_COMPONENT_TEXT_PROPERTIES = ["text"];
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
  // TODO: check for JSON parse error
  var componentNames = [];
  var formProperties; 
  var formName;
  var code = [];
  var javaCode = [];
  if (jsonObject.Properties) {
    formProperties = jsonObject.Properties;
    formName = formProperties.$Name;
  } else {
    throw "Cannot find form properties";
  }
  if (!formName) {
    throw "Unable to determine form name";
  }
  
  code.push("\n######################################\n");
  var my_all_blocks = Blockly.mainWorkspace.getAllBlocks();
  code.push(my_all_blocks);
  code.push("\n######################################\n");

  code.push("\n------------------------------------\n");
  javaCode.push(Blockly.Java.genJBridgeCode(Blockly.mainWorkspace.getTopBlocks(true), jsonObject));
  code.push("\n------------------------------------\n");
  if (!forRepl) {
    code.push(Blockly.Java.getYailPrelude(packageName, formName));
  }
    
  var componentMap = Blockly.Component.buildComponentMap([], [], false, false);
  
  for (var comp in componentMap.components)
    componentNames.push(comp);

  var globalBlocks = componentMap.globals;
  for (var i = 0, block; block = globalBlocks[i]; i++) {
    code.push(Blockly.Java.blockToCode(block));
  }
  
  if (formProperties) {
    var sourceType = jsonObject.Source;
    if (sourceType == "Form") {
      code = code.concat(Blockly.Java.getComponentLines(formName, formProperties, null /*parent*/, 
        componentMap, false /*forRepl*/));
    } else {
      throw "Source type " + sourceType + " is invalid.";
    }
  
    // Fetch all of the components in the form, this may result in duplicates
    componentNames = Blockly.Java.getDeepNames(formProperties, componentNames);
    // Remove the duplicates
    var uniqueNames = componentNames.filter(function(elem, pos) {
        return componentNames.indexOf(elem) == pos});
    componentNames = uniqueNames;

    // Add runtime initializations
    code.push(Blockly.Java.YAIL_INIT_RUNTIME);
  
    if (forRepl) {
      code = Blockly.Java.wrapForRepl(formName, code, componentNames);
    }

    // TODO?: get rid of empty property assignments? I'm not convinced this is necessary.
    // The original code in YABlockCompiler.java attempts to do this, but it matches on 
    // "set-property" rather than "set-and-coerce-property" so I'm not sure it is actually
    // doing anything. If we do need this, something like the call below might work.
    // 
    // finalCode = code.join('\n').replace(/\\(set-property.*\"\"\\)\\n*/mg, "");
  }
  
  return javaCode.join('\n');  // Blank line between each section.
};

Blockly.Java.getDeepNames = function(componentJson, componentNames) {
  if (componentJson.$Components) {
    var children = componentJson.$Components;
    for (var i = 0, child; child = children[i]; i++) {
      componentNames.push(child.$Name);
      componentNames = Blockly.Java.getDeepNames(child, componentNames);
    }
  }
  return componentNames;
}

/**
 * Generate the beginning Yail code for an APK compilation (i.e., not the REPL)
 * 
 * @param {String} packageName  the name of the package for the app
 *     (e.g. "appinventor.ai_somebody.myproject.Screen1")
 * @param {String} formName  (e.g., "Screen1")
 * @returns {String} Yail code
 * @private
*/
Blockly.Java.getYailPrelude = function(packageName, formName) {
 return "#|\n$Source $Yail\n|#\n\n"
     + Blockly.Java.YAIL_DEFINE_FORM
     + packageName
     + Blockly.Java.YAIL_SPACER
     + formName
     + Blockly.Java.YAIL_CLOSE_BLOCK
     + "(require <com.google.youngandroid.runtime>)\n";
}

/**
 * Wraps Yail code for use in the REPL and returns the new code as an array of strings
 * 
 * @param {String} formName 
 * @param {Array} code  code strings to be wrapped
 * @param {Array} componentNames array of component names
 * @returns {Array} wrapped code strings
 * @private
 */
Blockly.Java.wrapForRepl = function(formName, code, componentNames) {
  var replCode = [];
  replCode.push(Blockly.Java.YAIL_BEGIN);
  replCode.push(Blockly.Java.YAIL_CLEAR_FORM);
  if (formName != "Screen1") {
    // If this form is not named Screen1, then the REPL won't be able to resolve any references
    // to it or to any properties on the form itself (such as Title, BackgroundColor, etc) unless
    // we tell it that "Screen1" has been renamed to formName.
    // By generating a call to rename-component here, the REPL will rename "Screen1" to formName
    // in the current environment. See rename-component in runtime.scm.
    replCode.push(Blockly.Java.getComponentRenameString("Screen1", formName));
  }
  replCode = replCode.concat(code);
  replCode.push(Blockly.Java.getComponentInitializationString(formName, componentNames));
  replCode.push(Blockly.Java.YAIL_CLOSE_BLOCK);
  return replCode;
}

/**
 * Return code to initialize all components in componentMap.
 * 
 * @param {Array} componentNames array of names of components in the workspace
 * @returns {Array} code strings
 * @private
 */
Blockly.Java.getComponentInitializationString = function(formName, componentNames) {
  var code = Blockly.Java.YAIL_INITIALIZE_COMPONENTS;
  code += " " + Blockly.Java.YAIL_QUOTE + formName;
  for (var i = 0, cName; cName = componentNames[i]; i++) {  // TODO: will we get non-component fields this way?
    if (cName != formName)                                  // Avoid duplicate initialization of the form
      code = code + " " + Blockly.Java.YAIL_QUOTE + cName;
  }
  code = code + ")";
  return code;
}

/**
 * Generate Yail code for the component described by componentJson, and all of its child
 * components (if it has any). componentJson may describe a Form or a regular component. The
 * generated code includes adding each component to the form, as well as generating code for
 * the top-level blocks for that component.
 *
 * @param {String} formName
 * @param {String} componentJson JSON string describing the component
 * @param {String} parentName  the name of the component that contains this component (which may be
 *    its Form, for top-level components).
 * @param {Object} componentMap map from component names to the top-level blocks for that component
 *    in the workspace. See the Blockly.Component.buildComponentMap description for the structure.
 * @param {Boolean} forRepl true iff we're generating code for the REPL rather than an apk.
 * @returns {Array} code strings
 * @private
 */
Blockly.Java.getComponentLines = function(formName, componentJson, parentName, componentMap, 
  forRepl) {
  var code = [];
  var componentName = componentJson.$Name;
  if (componentJson.$Type == 'Form') {
    code = Blockly.Java.getFormPropertiesLines(formName, componentJson, !forRepl);
  } else {
    code = Blockly.Java.getComponentPropertiesLines(formName, componentJson, parentName, !forRepl);
  }

  if (!forRepl) {
    // Generate code for all top-level blocks related to this component
    if (componentMap.components && componentMap.components[componentName]) {
      var componentBlocks = componentMap.components[componentName];
      for (var i = 0, block; block = componentBlocks[i]; i++) {
        code.push(Blockly.Java.blockToCode(block));
      }
    }
  }

  // Generate code for child components of this component
  if (componentJson.$Components) {
    var children = componentJson.$Components;
    for (var i = 0, child; child = children[i]; i++) {
      code = code.concat(Blockly.Java.getComponentLines(formName, child, componentName, 
        componentMap, forRepl));
    }
  }
  return code;  
};

/**
 * Generate Yail to add the component described by componentJson to its parent, followed by
 * the code that sets each property of the component (for all its properties listed in
 * componentJson).
 * 
 * @param {String} formName
 * @param {String} componentJson JSON string describing the component
 * @param {String} parentName  the name of the component that contains this component (which may be
 *    its Form, for top-level components).
 * @param {Boolean} whether to include comments in the generated code
 * @returns {Array} code strings
 * @private
 */
Blockly.Java.getComponentPropertiesLines = function(formName, componentJson, parentName, 
  includeComments) {
  var code = [];
  var componentName = componentJson.$Name;
  var componentType = componentJson.$Type;
  // generate the yail code that adds the component to its parent, followed by the code that
  // sets each property of the component
  if (includeComments) {
    code.push(Blockly.Java.YAIL_COMMENT_MAJOR + componentName + Blockly.Java.YAIL_LINE_FEED);
  }
  code.push(Blockly.Java.YAIL_ADD_COMPONENT + parentName + Blockly.Java.YAIL_SPACER + 
    componentType + Blockly.Java.YAIL_SPACER + componentName + Blockly.Java.YAIL_SPACER);
  code = code.concat(Blockly.Java.getPropertySettersLines(componentJson, componentName));
  code.push(Blockly.Java.YAIL_CLOSE_BLOCK);
  return code;
}

/**
 * Generate Yail to set the properties for the Form described by componentJson.
 * 
 * @param {String} formName
 * @param {String} componentJson JSON string describing the component
 * @param {Boolean} whether to include comments in the generated code
 * @returns {Array} code strings
 * @private
 */
Blockly.Java.getFormPropertiesLines = function(formName, componentJson, includeComments) {
  var code = [];
  if (includeComments) {
    code.push(Blockly.Java.YAIL_COMMENT_MAJOR + formName + Blockly.Java.YAIL_LINE_FEED);
  }
  var yailForComponentProperties = Blockly.Java.getPropertySettersLines(componentJson, formName);
  if (yailForComponentProperties.length > 0) {
    // getPropertySettersLine returns an array of lines.  So we need to 
    // concatenate them (using join) before pushing them onto the Yail expression.
    // WARNING:  There may be other type errors of this sort in this file, which
    // (hopefully) will be uncovered in testing. Please
    // be alert for these errors and check carefully.
    code.push(Blockly.Java.YAIL_DO_AFTER_FORM_CREATION + yailForComponentProperties.join(" ") + 
      Blockly.Java.YAIL_CLOSE_BLOCK);
  }
  return code;
}

/**
 * Generate the code to set property values for the specifed component.
 *
 * @param {Object} componentJson JSON String describing the component
 * @param {String} componentName the name of the component (also present in the $Name field in
 *    componentJson)
 * @returns {Array} code strings
 * @private
 */
Blockly.Java.getPropertySettersLines = function(componentJson, componentName) {
  var code = [];
  for (var prop in componentJson) {
    if (prop.charAt(0) != "$" && prop != "Uuid") {
      code.push(Blockly.Java.getPropertySetterString(componentName, componentJson.$Type, prop, 
        componentJson[prop]));
    }
  }
  return code;
}

/**
 * Generate the code to set a single property value.
 *
 * @param {String} componentName
 * @param {String} propertyName
 * @param {String} propertyValue
 * @returns code string
 * @private
 */
Blockly.Java.getPropertySetterString = function(componentName, componentType, propertyName, 
  propertyValue) {
  var code = Blockly.Java.YAIL_SET_AND_COERCE_PROPERTY + Blockly.Java.YAIL_QUOTE + 
    componentName + Blockly.Java.YAIL_SPACER + Blockly.Java.YAIL_QUOTE + propertyName + 
    Blockly.Java.YAIL_SPACER;
  var propType = Blockly.Java.YAIL_QUOTE + 
    Blockly.ComponentTypes[componentType].properties[propertyName].type;
  var value = Blockly.Java.getPropertyValueString(propertyValue, propType);
  code = code.concat(value + Blockly.Java.YAIL_SPACER + propType + Blockly.Java.YAIL_CLOSE_BLOCK);
  return code;
}

/**
 * Generate the Yail code for a property value. Special case handling when propertyType is
 * "'number", "'boolean", "'component", the empty string, or null. For all other property values
 * it returns the value as converted by Blockly.Java.quotifyForREPL().
 *
 * @param {String} propertyValue
 * @param {String} propertyType
 * @returns code string
 * @private
 */
Blockly.Java.getPropertyValueString = function(propertyValue, propertyType) {
  if (propertyType == "'number") {
    if (propertyValue.match(Blockly.Java.INTEGER_REGEXP) 
            || propertyValue.match(Blockly.Java.FLONUM_REGEXP)) { // integer
      return propertyValue;
    } else if (propertyValue.match(Blockly.Java.SIMPLE_HEX_PREFIX + "[0-9A-F]+")) { // hex
      return Blockly.Java.YAIL_HEX_PREFIX + 
        propertyValue.substring(Blockly.Java.SIMPLE_HEX_PREFIX.length);
    }
  } else if (propertyType == "'boolean") {
    if (-1 != propertyValue.indexOf("False")) {
      return "#f";
    } else if (-1 != propertyValue.indexOf("True")) {
      return "#t";
    }
  } else if (propertyType == "'component") {
    if (propertyValue == "") {
      return "\"\"";
    } else {
      return Blockly.Java.YAIL_GET_COMPONENT + propertyValue + ")";
    }
  }

  if (propertyValue == "" || propertyValue == "null") {  // empty string
    return "\"\"";
  }
  return Blockly.Java.quotifyForREPL(propertyValue);
}

/**
 * Generate the code to rename a component
 *
 * @param {String} oldName
 * @param {String} newName
 * @returns {String} code
 * @private
 */
Blockly.Java.getComponentRenameString = function(oldName, newName) {
  return Blockly.Java.YAIL_RENAME_COMPONENT + Blockly.Java.quotifyForREPL(oldName)
    + Blockly.Java.YAIL_SPACER + Blockly.Java.quotifyForREPL(newName)
    + Blockly.Java.YAIL_CLOSE_BLOCK;
}

/**
 * Transform a string to the Kawa input representation of the string, for sending to
 * the REPL, by using backslash to escape quotes and backslashes. But do not escape a backslash
 * if it is part of \n. Then enclose the result in quotes.
 * TODO: Extend this to a complete transformation that deals with the full set of formatting
 * characters.
 *
 * @param {String} s string to be quotified
 * @returns {String}
 * @private
 */
Blockly.Java.quotifyForREPL = function(s) {
  if (!s) {
    return null;
  } else {
    var sb = [];
    sb.push('"');
    var len = s.length;
    var lastIndex = len - 1;
    for (var i = 0; i < len; i++) {
      c = s.charAt(i);
      if (c == '\\') {
        // If this is \n don't slashify the backslash
        // TODO(user): Make this cleaner and more general
        if (!(i == lastIndex) && s.charAt(i + 1) == 'n') {
          sb.push(c);
          sb.push(s.charAt(i + 1));
          i = i + 1;
        } else {
          sb.push('\\');
          sb.push(c);
        }
      } else if (c == '"') {
        sb.push('\\');
        sb.push(c);
      } else {
        var u = s.charCodeAt(i);  // unicode of c
        if (u < ' '.charCodeAt(0) || u > '~'.charCodeAt(0)) {
          // Replace any special chars with \u1234 unicode
          var hex = "000" + u.toString(16);
          hex = hex.substring(hex.length - 4);
          sb.push("\\u" + hex);
        } else {
          sb.push(c);
        }
      }
    }
    sb.push('"');
    return sb.join("");
  }
}

/**
 * Encode a string as a properly escaped Yail string, complete with quotes.
 * @param {String} string Text to encode.
 * @return {String} Yail string.
 * @private
 */

Blockly.Java.quote_ = function(string) {
  string = Blockly.Java.quotifyForREPL(string);
  if (!string) {                // quotifyForREPL can return null for
    string = '""';              // empty string
  }
  return string;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Java.scrubNakedValue = function(line) {
  return line;
};

/**
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Yail code created for this block.
 * @param {thisOnly} if true, only return code for this block and not any following statements
 *   note that calls of scrub_ with no 3rd parameter are equivalent to thisOnly=false, which
 *   was the behavior before this parameter was added.
 * @return {string} Yail code with comments and subsequent blocks added.
 * @private
 */
Blockly.Java.scrub_ = function(block, code, thisOnly) {
  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }
  var commentCode = '';
  /* TODO: fix for Yail comments?
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.Generator.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].targetBlock();
        if (childBlock) {
          var comment = Blockly.Generator.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Generator.prefixLines(comment, '// ');
          }
        }
      }
    }
  }*/
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = thisOnly ? "" : this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

Blockly.Java.getDebuggingYail = function() {
  var code = [];
  var componentMap = Blockly.Component.buildComponentMap([], [], false, false);
  
  var globalBlocks = componentMap.globals;
  for (var i = 0, block; block = globalBlocks[i]; i++) {
    code.push(Blockly.Java.blockToCode(block));
  }
  
  var blocks = Blockly.mainWorkspace.getTopBlocks(true);
  for (var x = 0, block; block = blocks[x]; x++) {
    
    // generate Yail for each top-level language block
    if (!block.category) {
      continue;
    }
    code.push(Blockly.Java.blockToCode(block));
  }
  return code.join('\n\n');
};

/**
 * Generate code for the specified block but *not* attached blocks.
 * @param {Blockly.Block} block The block to generate code for.
 * @return {string|!Array} For statement blocks, the generated code.
 *     For value blocks, an array containing the generated code and an
 *     operator order value.  Returns '' if block is null.
 */
Blockly.Java.blockToCode1 = function(block) {
  if (!block) {
    return '';
  }
  var func = this[block.type];
  if (!func) {
    throw 'Language "' + name + '" does not know how to generate code ' +
        'for block type "' + block.type + '".';
  }
  var code = func.call(block);
  if (code instanceof Array) {
    // Value blocks return tuples of code and operator order.
    if (block.disabled) {
      code[0] = '';
    }
    return [this.scrub_(block, code[0], true), code[1]];
  } else {
    if (block.disabled) {
      code = '';
    }
    return this.scrub_(block, code, true);
  }
};


Blockly.Java.genJBridgeCode = function(topBlocks, jsonObject){
  Blockly.Java.initAllVariables();
  Blockly.Java.parseJBridgeJsonData(jsonObject);
  Blockly.Java.parseTopBlocks(topBlocks);

  var code = Blockly.Java.JBRIDGE_PACKAGE_NAME + 
  Blockly.Java.JBRIDGE_BASE_IMPORTS +
  Blockly.Java.genComponentImport(jBridgeImportsMap)+
  Blockly.Java.genJBridgeClass(topBlocks);

  return code;  
};

Blockly.Java.initAllVariables = function(){
    jBridgeTopBlockCodesList = [];
    jBridgeRegisterEventMap = new Object();
    jBridgeEventsList = [];
    jBridgeVariableDefinitionMap = new Object();
    jBridgeInitializationList = [];
    jBridgeComponentMap = new Object();
    jBridgeImportsMap = new Object();
    jBridgeProceduresMap = new Object();

};

Blockly.Java.parseJBridgeJsonData = function(jsonObject){
  var property = jsonObject.Properties;
  var title = property.Title;
  var icon = property.Icon;
  if (title != undefined){
    jBridgeInitializationList.push("this.Title(\""+title +"\");");
  }if(icon != undefined){
    jBridgeInitializationList.push("this.Icon(\""+icon +"\");");
  }
  for(var i=0;i<property.$Components.length;i++){
    Blockly.Java.parseJBridgeJsonComopnents(property.$Components[i], "this");
  } 

   

};

Blockly.Java.parseJBridgeJsonComopnents = function (componentJson, rootName){
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
        jBridgeInitializationList.push(Blockly.Java.genJBridgeJsonComopnents(name, printableKey, printableValue));
      }
    }
  }
  //Assuming that $Components Property is always an array 
  if(componentsObj != undefined){
    for(var i=0;i<componentsObj.length;i++){
      Blockly.Java.parseJBridgeJsonComopnents(componentsObj[i], name);
    } 
  }
};

Blockly.Java.genJBridgeJsonComopnents = function (componentName, property, value){
var code = componentName
           +"."
           +property
           +"("
           +value
           +");"
return code;
};

Blockly.Java.parseComponentDefinition = function(jBridgeVariableDefinitionMap){
  var code = "";
  for (var key in jBridgeVariableDefinitionMap) {
      code = code 
             + Blockly.Java.genComponentDefinition(jBridgeVariableDefinitionMap[key], key)
             +"\n";
  }
  return code;
};

Blockly.Java.genComponentDefinition = function(type, name){
  var code = "private "
             + type
             + " "
             + name
             +";";
  return code;
};

Blockly.Java.genComponentImport = function(jBridgeImportsMap){
  var code = "";
  for (var key in jBridgeImportsMap) {
      code = code 
             + '\n' 
             + jBridgeImportsMap[key];
  }
  return code;
};

Blockly.Java.genJBridgeClass =  function (topBlocks){
  var code = "\npublic class Screen1 extends Form implements HandlesEventDispatching { \n"
    + Blockly.Java.parseComponentDefinition(jBridgeVariableDefinitionMap)
    + Blockly.Java.genJBridgeDefineMethod()
    + Blockly.Java.genJBridgeDispatchEvent()
    + Blockly.Java.genJBridgeDefineProcedure(jBridgeProceduresMap)
    +"\n}\n";
  return code;
};

Blockly.Java.genJBridgeEventsRegister = function(jBridgeRegisterEventMap){
  var registeredEvents = []
  for(var key in jBridgeRegisterEventMap){
      registeredEvents.push(jBridgeRegisterEventMap[key]);
  }
  return registeredEvents.join("\n");
};

Blockly.Java.genJBridgeDefineMethod =  function (){
 var code =  "\nprotected void $define() { \n"
  + jBridgeInitializationList.join("\n")
  + "\n"
  + Blockly.Java.genJBridgeEventsRegister(jBridgeRegisterEventMap)
  +"\n}";
    return code;
};

Blockly.Java.genJBridgeDispatchEvent = function(){
  var code = "\npublic boolean dispatchEvent(Component component, String componentName, String eventName, Object[] params){\n"
  + jBridgeTopBlockCodesList.join("\n")
  +"\n return false;"
  +"\n}";

  return code;
};

Blockly.Java.genJBridgeDefineProcedure = function(jBridgeProceduresMap){
  var code = "";
  for (var key in jBridgeProceduresMap) {
      code = code 
             + '\n' 
             + jBridgeProceduresMap[key];
  }
  return code;
};

Blockly.Java.parseTopBlocks = function (topBlocks){
    for (var x = 0, block; block = topBlocks[x]; x++) {
      jBridgeTopBlockCodesList.push(Blockly.Java.parseBlock(block));
    }
};

Blockly.Java.getJBridgeInstanceName = function(block){
  return block.instanceName;
};

Blockly.Java.parseBlock = function (block){
  jBridgeIsIndividualBlock = false;
  var code = "";
  var blockCategory = block.category;
  if (blockCategory == "Component"){
      code = Blockly.Java.parseJBridgeComponentBlock(block);
  }else if (blockCategory == "Colors"){
    code = Blockly.Java.parseJBridgeColorBlock(block);
  }else if (blockCategory == "Variables"){
    code = Blockly.Java.parseJBridgeVariableBlocks(block);
  }else if(blockCategory == "Math"){
    code = Blockly.Java.parseJBridgeMathBlocks(block);
  }else if( blockCategory == "Logic"){
    code = Blockly.Java.parseJBridgeLogicBlocks(block);
  }else if (blockCategory == "Procedures"){
    code = Blockly.Java.parseJBridgeProceduresBlocks(block);
  }else if (blockCategory == "Control"){
    code = Blockly.Java.parseJBridgeControlBlocks(block);
  }else if (blockCategory == "Lists"){
    code = Blockly.Java.parseJBridgeListBlocks(block);
  }else if (blockCategory == "Text"){
    code = Blockly.Java.parseJBridgeTextTypeBlocks(block);
  }
  return code;
}
Blockly.Java.parseJBridgeControlBlocks = function(controlBlock){
  var code = "";
  var controlType = controlBlock.type;
  if(controlType == "controls_if"){
    code = Blockly.Java.parseJBridgeControlIfBlock(controlBlock);
    jBridgeIsIndividualBlock = true;
  }
  return code;

}
Blockly.Java.parseJBridgeControlIfBlock = function(controlIfBlock){
  // var conditions = [];
  // var ifElseStatements = [];
  // var ifStatement;
  // var elseStatement;
  var code = "";
  var elseCount = controlIfBlock.elseCount_;
  var elseIfCount = controlIfBlock.elseifCount_;
  var ifCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[0]);
  var ifStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[1]);
  code =  Blockly.Java.genJBridgeControlIfBlock(ifCondition, ifStatement);  
  var index = 2 + (elseIfCount * 2);
  if(elseIfCount > 0){
    for(var i=2; i< index; i=i+2){
      var elseIfCondition = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i]);
      var elseIfStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[i+1]);
      code = code 
             + Blockly.Java.genJBridgeControlElseIfBlock(elseIfCondition, elseIfStatement);
    }
  }
  if(elseCount == 1){
    var elseStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[index]);
    code = code 
           + Blockly.Java.genJBridgeControlElseIfBlock(elseStatement);
  }
  for (var x = index+elseCount ; x < controlIfBlock.childBlocks_.length; x++){
    code = code 
           + Blockly.Java.parseBlock(controlIfBlock.childBlocks_[x]);
  }

  return code;

  // conditions.push(Blockly.Java.parseBlock(controlIfBlock.childBlocks_[0]));
  // ifStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[1]);
  //   for(var x = 2; x < controlIfBlock.childBlocks_.length- elseCount; x++){
  //     if(x%2 == 0){
  //         conditions.push(Blockly.Java.parseBlock(controlIfBlock.childBlocks_[x]));
  //       }
  //       else ifElseStatements.push(Blockly.Java.parseBlock(controlIfBlock.childBlocks_[x  
  //     }
  //     if(elseCount>0) elseStatement = Blockly.Java.parseBlock(controlIfBlock.childBlocks_[controlIfBlock.childBlocks_.length-1]);
  //     return Blockly.Java.genJBridgeControlIfBlock(conditions, ifStatement, ifElseStatements, elseStatement);
};

Blockly.Java.genJBridgeControlIfBlock = function(condition, statement){
  var code = "";
  code = "if("
         +condition
         +"){ \n"
         + statement
         + "\n}"

  return code;
};

Blockly.Java.genJBridgeControlElseIfBlock = function(condition, statement){
  var code = "";
  code = "else if("
         +condition
         +"){ \n"
         + statement
         + "\n}"
  return code;
};

Blockly.Java.genJBridgeControlElseIfBlock = function(statement){
  var code = "";
  code = "else { \n"
         + statement
         + "\n}"
  return code;
};

// Blockly.Java.genJBridgeControlIfBlock = function(conditions, ifStatement, ifElseStatements, elseStatement){
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


Blockly.Java.parseJBridgeVariableBlocks = function (variableBlock){
var code = "";
  var componentType = variableBlock.type;
  if (componentType == "lexical_variable_set"){
      code = Blockly.Java.parseJBridgeVariableSetBlock(variableBlock);
      jBridgeIsIndividualBlock = true;
  }else if(componentType == "lexical_variable_get"){
      code = Blockly.Java.parseJBridgeVariableGetBlock(variableBlock);
  }else if(componentType = "global_declaration"){
      code = Blockly.Java.parseJBridgeGlobalIntializationBlock(variableBlock);
      jBridgeIsIndividualBlock = true;
  }
  return code;
};

Blockly.Java.parseJBridgeVariableGetBlock = function(variableGetBlock){
    var paramName = variableGetBlock.getFieldValue('VAR');
    var paramsMap = new Object();
    //Check if the variable is global or fuction param
    paramsMap = Blockly.Java.getJBridgeParentBlockFieldMap(variableGetBlock.parentBlock_, "component_event", "PARAMETERS");
    paramName = Blockly.Java.getJBridgeRelativeParamName(paramsMap, paramName);
    return Blockly.Java.genJBridgeVariableGetBlock(paramName);
  };

Blockly.Java.genJBridgeVariableGetBlock = function(paramName){
  var code = paramName;
  return code;
};

//It itertates through all the parent to find the specific blockType and loads fieldName map
Blockly.Java.getJBridgeParentBlockFieldMap = function (block, blockType, fieldName){
  if(block.type == blockType && block != undefined && block != null){
      return Blockly.Java.getFieldMap(block, fieldName);  
  }
  return Blockly.Java.getJBridgeParentBlockFieldMap(block.parentBlock_, blockType, fieldName);
};

Blockly.Java.parseJBridgeVariableSetBlock = function(variableSetBlock){
    var code = "";
    var leftValue = variableSetBlock.getFieldValue("VAR");
    var paramsMap = new Object();
    //Check if the variable is global or fuction param
    paramsMap = Blockly.Java.getJBridgeParentBlockFieldMap(variableSetBlock.parentBlock_, "component_event", "PARAMETERS");
    leftValue = Blockly.Java.getJBridgeRelativeParamName(paramsMap, leftValue);

    var rightValue = ""
    for(var x = 0, childBlock; childBlock = variableSetBlock.childBlocks_[x]; x++){
        var data = Blockly.Java.parseBlock(childBlock);
        rightValue = rightValue 
                     + data;
        if (jBridgeIsIndividualBlock){
           code = code + "\n" + data;
        }else {
          code = code + Blockly.Java.genJBridgeVariableIntializationBlock(leftValue, rightValue);
        }
    }
    return code;
  };


Blockly.Java.parseJBridgeComponentBlock = function(componentBlock){
  var code = "";
  var componentType = componentBlock.type;
  if (componentType == "component_event"){
       code = Blockly.Java.parseJBridgeEventBlock(componentBlock);
  }else if (componentType == "component_set_get"){
      if (componentBlock.setOrGet == "set"){
          code = Blockly.Java.parseJBridgeSetBlock(componentBlock);
          jBridgeIsIndividualBlock = true;
      }else{
          code = Blockly.Java.parseJBridgeGetBlock(componentBlock);
      }
  }else if (componentType == "component_method" ){
    code = Blockly.Java.parseJBridgeMethodCallBlock(componentBlock);
    var methodname = componentBlock.methodName;
    if(methodname != undefined && methodname.substring(0,3) != "Get"){
      jBridgeIsIndividualBlock = true;
    }
  }else{
    code =  "Invalid Component type : " + componentType ;
  }

  return code;
};

Blockly.Java.parseJBridgeMethodCallBlock = function(methodCallBlock){
  var objectName = methodCallBlock.instanceName;
  var methodName = methodCallBlock.methodName;
  var parentParamMap = Blockly.Java.getFieldMap(methodCallBlock.parentBlock_, "PARAMETERS");
  var test = methodCallBlock.parentBlock_.getFieldValue("PARAMETERS");
  var paramsList = [];
  var code = "";
  //parse all the params Block
  for (var y = 0, paramBlock; paramBlock = methodCallBlock.childBlocks_[y]; y++){
      var genCode = Blockly.Java.parseBlock(paramBlock);
      if(jBridgeIsIndividualBlock){
        code = code + genCode+"\n";
      }else{
        paramsList.push(genCode);
      }
  }
  var jBridgeParamList = [];

  for (var y = 0, param; param = paramsList[y]; y++){
    jBridgeParamList.push(Blockly.Java.getJBridgeRelativeParamName(parentParamMap, param));
  }
  code = code + Blockly.Java.genJBridgeMethodCallBlock(objectName ,methodName, jBridgeParamList);
  return code;
};

//This function identifies if the param is a global variable or functional variable 
//and returns the appropriate name
Blockly.Java.getJBridgeRelativeParamName = function(paramsMap, paramName){
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

Blockly.Java.getFieldMap = function(block, fieldName){
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

Blockly.Java.getFieldList = function(block, fieldName){
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

Blockly.Java.getProcName = function(block, inputName, fieldName){
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

Blockly.Java.genJBridgeMethodCallBlock = function(objectName, methodName, paramsList){
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

Blockly.Java.parseJBridgeColorBlock = function(colorBlock){
  // TOOD Fix the copy pasted or duplicated color palette block 
  var color = colorBlock.type.toUpperCase();
  return Blockly.Java.genJBridgeColorBlock(color);
};

Blockly.Java.genJBridgeColorBlock = function(color){
    return color;
};

Blockly.Java.parseJBridgeGetBlock = function(getBlock){
  var componentName = Blockly.Java.getJBridgeInstanceName(getBlock);
  var property = getBlock.propertyName;
  return Blockly.Java.genJBridgeGetBlock(componentName, property);
};

Blockly.Java.genJBridgeGetBlock = function(componentName, property){
  var code = componentName
             +"."
             +property
             +"()";
  return code;
};

Blockly.Java.parseJBridgeSetBlock = function(setBlock){
  var componentName = Blockly.Java.getJBridgeInstanceName(setBlock);
  var property = setBlock.propertyName;

  var value = "";
  var code = "";
  for (var x = 0, childBlock; childBlock = setBlock.childBlocks_[x]; x++) {
    var genCode = Blockly.Java.parseBlock(childBlock);
     if(jBridgeIsIndividualBlock){
        code = code + genCode + "\n";
      }else{
        value = value + genCode;
      }
  }

  if(JBRIDGE_COMPONENT_TEXT_PROPERTIES.indexOf(property.toLowerCase()) > -1){
    value = "String.valueOf(" +value+")";
  }
  code = code + Blockly.Java.genJBridgeSetBlock(componentName, property, value);
  return code;
};

Blockly.Java.genJBridgeSetBlock = function(componentName, property, value){
  var code = componentName
             +"."
             +property
             +"("
             +value
             +");";
  return code;
};

// Blockly.Java.paseJBridgeEventBlock = function(eventBlock){
//   var code = "";
//   var eventName = eventBlock.eventName;
//   var componentName = eventBlock.instanceName;

//   code = Blockly.Java.parseJBridgeEventBlock(eventBlock);

//   //Add to RegisterEventsMap
//   jBridgeRegisterEventMap[eventName] = Blockly.Java.genJBridgeEventDispatcher(eventName); 

//   return code;
// };


Blockly.Java.parseJBridgeEventBlock = function(eventBlock, isChildBlock){
  var code = "";
  isChildBlock = typeof isChildBlock !== 'undefined' ? isChildBlock : false;
  var componentName = eventBlock.instanceName;
  var eventName = eventBlock.eventName;
  var body = "";
  for (var x = 0, childBlock; childBlock = eventBlock.childBlocks_[x]; x++) {
      body = body 
             + "\n"
             + Blockly.Java.parseBlock(childBlock);
  }
  //This is to handle the if the component is the Screen Object
  if(componentName == jBridgeCurrentScreen){
    componentName = "this";
  }
  code = Blockly.Java.genJBridgeEventBlock(componentName, eventName, body);

  //Add to RegisterEventsMap
  jBridgeRegisterEventMap[eventName] = Blockly.Java.genJBridgeEventDispatcher(eventName); 

  return code;
};

//Event Blocks are actualy the "When Blocks"
Blockly.Java.genJBridgeEventBlock = function(componentName, eventName, body){
  var code = "\nif( component.equals("+componentName+") && eventName.equals(\""+eventName+"\") ){\n"
    + body + "\n"
    +"return true;\n"
    +"}";

  return code;
}; 

Blockly.Java.genJBridgeEventDispatcher = function(eventName){
  return "EventDispatcher.registerEventForDelegation( this, \"" + eventName +"Event\", \""+ eventName +"\" );";
};

Blockly.Java.parseJBridgeMathBlocks = function(mathBlock){
  var code = "";
  var type = mathBlock.type;
  if( type == "math_number"){
    code = Blockly.Java.parseJBridgeMathNumberBlock(mathBlock);
  }else if(type == "math_random_int"){
    code = Blockly.Java.parseJBridgeMathRandomInt(mathBlock);
  }else if(type == "math_add"){
    code = Blockly.Java.parseJBridgeMathAdd(mathBlock);
  }else if(type == "math_subtract"){
    code = Blockly.Java.parseJBridgeMathSubtract(mathBlock);
  }else if(type == "math_multiply"){
    code = Blockly.Java.parseJBridgeMathMultiply(mathBlock);
  }else if(type == "math_division"){
    code = Blockly.Java.parseJBridgeMathDivision(mathBlock);
  }else if(type == "math_compare"){
    code = Blockly.Java.parseJBridgeMathCompare(mathBlock);
  }
  return code;
};
Blockly.Java.parseJBridgeMathNumberBlock = function(mathBlock){
  var numberValue ;
  //Assuming numver value always in the fieldRow[0] in inputlist[0].
  numberValue = mathBlock.getFieldValue('NUM');
  return Blockly.Java.genJBridgeMathNumberBlock(numberValue);
};

Blockly.Java.parseJBridgeMathAdd = function(mathBlock){
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "+");
};

Blockly.Java.parseJBridgeMathSubtract = function(mathBlock){
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "-");
};

Blockly.Java.parseJBridgeMathMultiply = function(mathBlock){
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "*");
};

Blockly.Java.parseJBridgeMathDivision = function(mathBlock){
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Java.genJBridgeMathOperation(leftValue, rightValue, "/");
};

Blockly.Java.parseJBridgeMathRandomInt = function(mathBlock){
    var name = "random";
    if(!jBridgeVariableDefinitionMap[name]){
        jBridgeVariableDefinitionMap[name] = "Random";
        jBridgeInitializationList.push("random = new Random();");
        jBridgeImportsMap[name] = "import java.util.Random;";
    }
    var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
    var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);
    return Blockly.Java.genJBridgeMathRandomInt(leftValue, rightValue);
};


Blockly.Java.genJBridgeMathRandomInt = function(leftValue, rightValue){
    var code = "random.nextInt("
             + rightValue
             + " - "
             + leftValue
             + ")"
             + " + "
             + leftValue;
    return code;
};

Blockly.Java.genJBridgeMathOperation = function(leftValue, rightValue, operand){
    var code = "(" 
               +leftValue
               + " "
               + operand
               + " "
               + rightValue
               + ")";
    return code;
};

Blockly.Java.genJBridgeMathNumberBlock= function(numberValue){
   var code="";
   code = numberValue;
   return code;
};

Blockly.Java.parseJBridgeGlobalIntializationBlock = function(globalBlock){
  var leftValue ;
  var rightValue ;

  leftValue = globalBlock.getFieldValue('NAME').replace("global ", "");
  rightValue = ""
  for(var x = 0, childBlock; childBlock = globalBlock.childBlocks_[x]; x++){
        rightValue = rightValue 
                     + Blockly.Java.parseBlock(childBlock);
  }

  jBridgeComponentMap[leftValue] = [];
  var childType = globalBlock.childBlocks_[0].category;
  var variableType = Blockly.Java.getValueType(childType, rightValue);  

  jBridgeComponentMap[leftValue].push({"Type" : variableType});
  jBridgeVariableDefinitionMap[leftValue] = variableType;


  jBridgeInitializationList.push(Blockly.Java.genJBridgeVariableIntializationBlock(leftValue, rightValue));
  
  return "";
};
Blockly.Java.getValueType = function(childType, value){
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

Blockly.Java.genJBridgeVariableIntializationBlock = function(leftValue, rightValue){
  var code = ""
  code = leftValue 
         + " = "
         + rightValue
         +";";
  return code
};

Blockly.Java.parseJBridgeLogicBlocks = function (logicBlock){
var code = "";
  var componentType = logicBlock.type;
  if (componentType == "logic_boolean"){
      code = Blockly.Java.parseJBridgeBooleanBlock(logicBlock);
  }
  return code;
};
  
Blockly.Java.parseJBridgeBooleanBlock = function(logicBlock){
  var value = logicBlock.getFieldValue("BOOL");
  return Blockly.Java.genJBridgeBooleanBlock(value);
};

Blockly.Java.genJBridgeBooleanBlock = function(value){
  return value.toLowerCase();
};

Blockly.Java.parseJBridgeProceduresBlocks = function(proceduresBlock){
  var code = "";
  var proceduresType = proceduresBlock.type;
  if(proceduresType == "procedures_defnoreturn"){
     code = Blockly.Java.parseJBridgeProcDefNoReturn(proceduresBlock);
  }else if(proceduresType == "procedures_callnoreturn"){
     code = Blockly.Java.parseJBridgeProcCallNoReturn(proceduresBlock);
  }
  return code;
};

Blockly.Java.parseJBridgeProcDefNoReturn = function(proceduresBlock){
  var code = "";
  var procName = proceduresBlock.getFieldValue("NAME");
  var procParms = "";  //TO DO
  if (proceduresBlock.getParameters.length != 0){
      //TO DO
  }
  var statementList = [];
  for (var x = 0, childBlock; childBlock = proceduresBlock.childBlocks_[x]; x++) {
    statementList.push(Blockly.Java.parseBlock(childBlock));
  }
  
  jBridgeProceduresMap[procName] = Blockly.Java.genJBridgeProcDefNoReturn(procName, procParms, statementList.join("\n"));

  return code;
};

Blockly.Java.genJBridgeProcDefNoReturn = function (procedureName, procedureParams, body){
  var code = "\npublic void " 
       + procedureName
       + "("
       + procedureParams 
       + "){\n"
       + body
       + "\n}"; 
  return code;
}

Blockly.Java.parseJBridgeProcCallNoReturn = function(proceduresBlock){
  var params = "";
  var procName = proceduresBlock.getFieldValue("PROCNAME");
  return Blockly.Java.genJBridgeProcCallNoReturn(procName, params);
};

Blockly.Java.genJBridgeProcCallNoReturn = function(procName, params){
  var code = procName
             + "("
             + params
             +");";
  
  return code;
};

Blockly.Java.parseJBridgeTextTypeBlocks = function(textBlock){
  var code = "";
  var type = textBlock.type;
  if (type == "text"){
    code = Blockly.Java.parseJBridgeTextBlock(textBlock);
  }
  return code;
};

Blockly.Java.parseJBridgeTextBlock = function(textBlock){
  var textData = textBlock.getFieldValue("TEXT");
  return Blockly.Java.genJBridgeTextBlock(textData);
};

Blockly.Java.genJBridgeTextBlock = function(text){
  var code = "\""+text+"\"";
  return code;
};

Blockly.Java.parseJBridgeListBlocks = function(listBlock){
  var code = "";
  var type = listBlock.type;
  if( type == "lists_create_with"){
      code = Blockly.Java.parseJBridgeListsCreateWithBlock(listBlock);
  }else if (type == "lists_select_item"){
      code = Blockly.Java.parseJBridgeListSelectItemBlock(listBlock);
  }else if(type == "lists_length"){
      code = Blockly.Java.parseJBridgeListLengthBlock(listBlock);
  }
  return code;
};

Blockly.Java.parseJBridgeListsCreateWithBlock = function(listBlock){
   var code = "";
   var childType;
   var listName = listBlock.parentBlock_.getFieldValue('NAME').replace("global ", "")
   for (var x = 0, childBlock; childBlock = listBlock.childBlocks_[x]; x++) {
     var addItemData = Blockly.Java.parseBlock(childBlock);
     childType = Blockly.Java.getValueType(childBlock.type, addItemData);
     if(childType == "int"){
      childType = "Integer";
     }else if(childType == "float"){
      childType = "Float";
     }
     code = code 
            + Blockly.Java.genJBridgeListsAddItemBlock(listName, addItemData);
   }
   code = Blockly.Java.genJBridgeNewList(childType) 
          +"\n"
          + code;

   return code;
};

Blockly.Java.parseJBridgeListSelectItemBlock = function(listBlock){
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  var index = Blockly.Java.parseBlock(listBlock.childBlocks_[1]);
  return Blockly.Java.genJBridgeListSelectItemBlock(listName, index);  
};
Blockly.Java.genJBridgeListSelectItemBlock = function(listName, index){
  var code = listName + "[" + index + "]";
  return code;
};
Blockly.Java.genJBridgeNewList = function(type){
  var code = "new ArrayList<"+type+">(); \n";
  return code;
};

Blockly.Java.genJBridgeListsAddItemBlock = function(listName, addItem){
   var code = listName+".add("+addItem+"); \n";
   return code;
};

Blockly.Java.parseJBridgeMathCompare = function (mathBlock){
  var operator = mathBlock.getFieldValue("OP");
  var leftValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[0]);
  var rightValue = Blockly.Java.parseBlock(mathBlock.childBlocks_[1]);

  return Blockly.Java.genJBridgeMathCompare(leftValue, rightValue, Blockly.Java.getJBridgeOperator(operator));
};

Blockly.Java.genJBridgeMathCompare = function (leftValue, rightValue, operator){
  var code = leftValue
             + operator
             + rightValue;
  return code;
};

Blockly.Java.getJBridgeOperator = function(operator){
  var op = "";
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
  }
  return op;
};

Blockly.Java.parseJBridgeListLengthBlock = function(listBlock){
  var listName = Blockly.Java.parseBlock(listBlock.childBlocks_[0]);
  return Blockly.Java.genJBridgeListLengthBlock(listName);
};

Blockly.Java.genJBridgeListLengthBlock = function(listName){
  var code = listName + ".size()"
  return code;
};