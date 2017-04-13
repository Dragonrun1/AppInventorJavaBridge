// -*- mode: java; c-basic-offset: 2; -*-
// Copyright 2009-2011 Google, All Rights reserved
// Copyright 2011-2012 MIT, All rights reserved
// Released under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

package com.google.appinventor.client.editor;

import com.google.appinventor.client.ErrorReporter;
import com.google.appinventor.client.Ode;
import com.google.appinventor.client.OdeAsyncCallback;
import com.google.appinventor.client.editor.youngandroid.YaBlocksEditor;
import com.google.appinventor.client.editor.youngandroid.YailGenerationException;
import com.google.appinventor.client.explorer.project.Project;
import com.google.appinventor.client.output.OdeLog;
import com.google.appinventor.client.settings.project.ProjectSettings;
import com.google.appinventor.shared.rpc.BlocksTruncatedException;
import com.google.appinventor.shared.rpc.project.FileDescriptorWithContent;
import com.google.appinventor.shared.rpc.project.ProjectRootNode;
import com.google.common.collect.Maps;
import com.google.gwt.json.client.JSONValue;
import com.google.gwt.json.client.JSONArray;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONString;
import com.google.gwt.json.client.JSONParser;
import com.google.gwt.user.client.Command;
import com.google.gwt.user.client.Timer;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

import static com.google.appinventor.client.Ode.MESSAGES;

/**
 * Manager class for opened project editors.
 *
 * @author lizlooney@google.com (Liz Looney)
 */
public final class EditorManager {
  // Map of project IDs to open project editors
  private final Map<Long, ProjectEditor> openProjectEditors;

  // Timeout (in ms) after which changed content is auto-saved if the user did
  // not continue typing.
  // TODO(user): Make this configurable.
  private static final int AUTO_SAVE_IDLE_TIMEOUT = 5000;
  // Currently set to 5 seconds. Note: the GWT code as a ClosingHandler
  // that will perform a save when the user closes the window.

  // Timeout (in ms) after which changed content is auto-saved even if the user
  // continued typing.
  // TODO(user): Make this configurable.
  private static final int AUTO_SAVE_FORCED_TIMEOUT = 30000;

  // Fields used for saving and auto-saving.
  private final Set<ProjectSettings> dirtyProjectSettings;
  private final Set<FileEditor> dirtyFileEditors;
  private final Timer autoSaveTimer;
  private boolean autoSaveIsScheduled;
  private long autoSaveRequestTime;

  private class DateHolder {
    long date;
    long projectId;
  }

  /**
   * Creates the editor manager.
   */
  public EditorManager() {
    openProjectEditors = Maps.newHashMap();

    dirtyProjectSettings = new HashSet<ProjectSettings>();
    dirtyFileEditors = new HashSet<FileEditor>();

    autoSaveTimer = new Timer() {
      @Override
      public void run() {
        // When the timer goes off, save all dirtyProjectSettings and
        // dirtyFileEditors.
        Ode.getInstance().lockScreens(true); // Lock out changes
        saveDirtyEditors(new Command() {
            @Override
            public void execute() {
              Ode.getInstance().lockScreens(false); // I/O finished, unlock
            }
          });
      }
    };
  }

  /**
   * Opens the project editor for the given project.
   * If there is an editor already open for the project, it will be returned.
   * Otherwise, it will create an appropriate editor for the project.
   *
   * @param projectRootNode  the root node of the project to open
   * @return  project editor for the given project
   */
  public ProjectEditor openProject(ProjectRootNode projectRootNode) {
    long projectId = projectRootNode.getProjectId();
    ProjectEditor projectEditor = openProjectEditors.get(projectId);
    if (projectEditor == null) {
      // No open editor for this project yet.
      // Use the ProjectEditorRegistry to get the factory and create the project editor.
      ProjectEditorFactory factory = Ode.getProjectEditorRegistry().get(projectRootNode);
      if (factory != null) {
        projectEditor = factory.createProjectEditor(projectRootNode);

        // Add the editor to the openProjectEditors map.
        openProjectEditors.put(projectId, projectEditor);

        // Tell the DesignToolbar about this project
        Ode.getInstance().getDesignToolbar().addProject(projectId, projectRootNode.getName());

        // Prepare the project before Loading into the editor.
        // Components are prepared before the project is actually loaded.
        // Load the project into the editor. The actual loading is asynchronous.
        projectEditor.processProject();
      }
    }
    return projectEditor;
  }

  /**
   * Gets the open project editor of the given project ID.
   *
   * @param projectId the project ID
   * @return the ProjectEditor of the specified project, or null
   */
  public ProjectEditor getOpenProjectEditor(long projectId) {
    return openProjectEditors.get(projectId);
  }

  /**
   * Closes the file editors for the specified files, without saving.
   * This is used when the files are about to be deleted.
   *
   * @param projectId  project ID
   * @param fileIds  file IDs of the file editors to be closed
   */
  public void closeFileEditors(long projectId, String[] fileIds) {
    ProjectEditor projectEditor = openProjectEditors.get(projectId);
    if (projectEditor != null) {
      for (String fileId : fileIds) {
        FileEditor fileEditor = projectEditor.getFileEditor(fileId);
        // in case the file is not open in an editor (possible?) check
        // the FileEditors for null.
        if (fileEditor != null) {
          dirtyFileEditors.remove(fileEditor);
        }
      }
      projectEditor.closeFileEditors(fileIds);
    }
  }

  /**
   * Gives the names of all of the screens for the given project
   * @param projectId The id for the project
   * @return The list of screen names
   */
  public ArrayList<String> getAllScreenNames(long projectId){
    ArrayList<String> screenNames = new ArrayList<String>();

    ProjectEditor projectEditor = openProjectEditors.get(projectId);
    for (FileEditor fileEditor: projectEditor.getOpenFileEditors()){
      screenNames.add(fileEditor.getFileNode().getName().replace(".scm", ""));
    }
    return screenNames;
  }

  /**
   * Closes the project editor for a particular project, without saving.
   * Does not actually remove the editor from the ViewerBox.
   * This is used when the project is about to be deleted.
   *
   * @param projectId  ID of project whose editor is to be closed
   */
  public void closeProjectEditor(long projectId) {
    // TODO(lizlooney) - investigate whether the ProjectEditor and all its FileEditors stay in
    // memory even after we've removed them.
    Project project = Ode.getInstance().getProjectManager().getProject(projectId);
    ProjectSettings projectSettings = project.getSettings();
    dirtyProjectSettings.remove(projectSettings);
    openProjectEditors.remove(projectId);
  }

  /**
   * Schedules auto-save of the given project settings.
   * This method can be called often, as the user is modifying project settings.
   *
   * @param projectSettings the project settings for which to schedule auto-save
   */
  public void scheduleAutoSave(ProjectSettings projectSettings) {
    // Add the project settings to the dirtyProjectSettings list.
    dirtyProjectSettings.add(projectSettings);
    scheduleAutoSaveTimer();
  }

  /**
   * Schedules auto-save of the given file editor.
   * This method can be called often, as the user is modifying a file.
   *
   * @param fileEditor the file editor for which to schedule auto-save
   */
  public void scheduleAutoSave(FileEditor fileEditor) {
    // Add the file editor to the dirtyFileEditors list.
    if (!fileEditor.isDamaged()) { // Don't save damaged files
      dirtyFileEditors.add(fileEditor);
    } else {
      OdeLog.log("Not saving blocks for " + fileEditor.getFileId() + " because it is damaged.");
    }
    scheduleAutoSaveTimer();
  }

  /**
   * Schedules the auto-save timer.
   */
  private void scheduleAutoSaveTimer() {
    if (autoSaveIsScheduled) {
      // The auto-save timer is already scheduled.
      // The user is making multiple changes and, in general, we want to wait until they are idle
      // before saving. However, we don't want to delay the auto-save forever.
      // If the time that the auto-save was first requested wasn't too long ago, cancel and
      // reschedule the timer. Otherwise, leave the scheduled timer alone.
      if (System.currentTimeMillis() - autoSaveRequestTime < AUTO_SAVE_FORCED_TIMEOUT) {
        autoSaveTimer.cancel();
        autoSaveTimer.schedule(AUTO_SAVE_IDLE_TIMEOUT);
      }
    } else {
      // The auto-save timer is not already scheduled.
      // Schedule it now and set autoSaveRequestTime.
      autoSaveTimer.schedule(AUTO_SAVE_IDLE_TIMEOUT);
      autoSaveRequestTime = System.currentTimeMillis();
      autoSaveIsScheduled = true;
    }
  }

  /**
   * Saves all modified files and project settings and calls the afterSaving
   * command after they have all been saved successfully.
   *
   * If any errors occur while saving, the afterSaving command will not be
   * executed.
   * If nothing needs to be saved, the afterSavingFiles command is called
   * immediately, not asynchronously.
   *
   * @param afterSaving  optional command to be executed after project
   *                     settings and file editors are saved successfully
   */
  public void saveDirtyEditors(final Command afterSaving) {
    // Note, We don't do any saving if we are in read only mode
    if (Ode.getInstance().isReadOnly()) {
      afterSaving.execute();
      return;
    }

    // Collect the files that need to be saved.
    List<FileDescriptorWithContent> filesToSave = new ArrayList<FileDescriptorWithContent>();
    for (FileEditor fileEditor : dirtyFileEditors) {
      FileDescriptorWithContent fileContent = new FileDescriptorWithContent(
          fileEditor.getProjectId(), fileEditor.getFileId(), fileEditor.getRawFileContent());
      filesToSave.add(fileContent);
    }
    dirtyFileEditors.clear();

    // Collect the project settings that need to be saved.
    List<ProjectSettings> projectSettingsToSave = new ArrayList<ProjectSettings>();
    projectSettingsToSave.addAll(dirtyProjectSettings);
    dirtyProjectSettings.clear();

    autoSaveTimer.cancel();
    autoSaveIsScheduled = false;

    // Keep count as each save operation finishes so we can set the projects' modified date and
    // call the afterSaving command after everything has been saved.
    // Each project settings is saved as a separate operation, but all files are saved as a single
    // save operation. So the initial value of pendingSaveOperations is the size of
    // projectSettingsToSave plus 1.
    final AtomicInteger pendingSaveOperations = new AtomicInteger(projectSettingsToSave.size() + 1);
    final DateHolder dateHolder = new DateHolder();
    Command callAfterSavingCommand = new Command() {
      @Override
      public void execute() {
        if (pendingSaveOperations.decrementAndGet() == 0) {
          // Execute the afterSaving command if one was given.
          if (afterSaving != null) {
            afterSaving.execute();
          }
          // Set the project modification date to the returned date
          // for one of the saved files (it doens't really matter which one).
          if ((dateHolder.date != 0) && (dateHolder.projectId != 0)) { // We have a date back from the server
            Ode.getInstance().updateModificationDate(dateHolder.projectId, dateHolder.date);
          }
        }
      }
    };

    // Save all files at once (asynchronously).
    saveMultipleFilesAtOnce(filesToSave, callAfterSavingCommand, dateHolder);

    // Save project settings one at a time (asynchronously).
    for (ProjectSettings projectSettings : projectSettingsToSave) {
      projectSettings.saveSettings(callAfterSavingCommand);
    }
  }

  /**
   * For each block editor (screen) in the current project, generate and save yail code for the
   * blocks.
   *
   * @param successCommand  optional command to be executed if yail generation and saving succeeds.
   * @param failureCommand  optional command to be executed if yail generation and saving fails.
   */
  public void generateYailForBlocksEditors(final Command successCommand,
      final Command failureCommand) {
    List<FileDescriptorWithContent> yailFiles =  new ArrayList<FileDescriptorWithContent>();
    long currentProjectId = Ode.getInstance().getCurrentYoungAndroidProjectId();
    for (long projectId : openProjectEditors.keySet()) {
      if (projectId == currentProjectId) {
        // Generate yail for each blocks editor in this project and add it to the list of
        // yail files. If an error occurs we stop the generation process, report the error,
        // and return without executing nextCommand.
        ProjectEditor projectEditor = openProjectEditors.get(projectId);
        for (FileEditor fileEditor : projectEditor.getOpenFileEditors()) {
          if (fileEditor instanceof YaBlocksEditor) {
            YaBlocksEditor yaBlocksEditor = (YaBlocksEditor) fileEditor;
            try {
              yailFiles.add(yaBlocksEditor.getYail());
            } catch (YailGenerationException e) {
              ErrorReporter.reportInfo(MESSAGES.yailGenerationError(e.getFormName(),
                  e.getMessage()));
              if (failureCommand != null) {
                failureCommand.execute();
              }
              return;
            }
          }
        }
        break;
      }
    }

    Ode.getInstance().getProjectService().save(Ode.getInstance().getSessionId(),
        yailFiles,
        new OdeAsyncCallback<Long>(MESSAGES.saveErrorMultipleFiles()) {
      @Override
      public void onSuccess(Long date) {
        if (successCommand != null) {
          successCommand.execute();
        }
      }

      @Override
      public void onFailure(Throwable caught) {
        super.onFailure(caught);
        if (failureCommand != null) {
          failureCommand.execute();
        }
      }
    });
  }

    public void generateJavaForBlocksEditors(final Command successCommand, final Command failureCommand)
    {
        List<FileDescriptorWithContent> yailFiles =  new ArrayList<FileDescriptorWithContent>();
        long currentProjectId = Ode.getInstance().getCurrentYoungAndroidProjectId();

        boolean errors = false;
        for (long projectId : openProjectEditors.keySet())
        {
            if (projectId == currentProjectId)
            {
                // Generate yail for each blocks editor in this project and add it to the list of
                // yail files. If an error occurs we stop the generation process, report the error,
                // and return without executing nextCommand.
                ProjectEditor projectEditor = openProjectEditors.get(projectId);
                for (FileEditor fileEditor : projectEditor.getOpenFileEditors())
                {
                    if (fileEditor instanceof YaBlocksEditor)
                    {
                        YaBlocksEditor yaBlocksEditor = (YaBlocksEditor) fileEditor;
                        try
                        {
                            FileDescriptorWithContent javaJsonResponse = yaBlocksEditor.getJava();

                            String jsonResponse = javaJsonResponse.getContent();
                            jsonResponse = parseJavaJSONResponse(jsonResponse);
                            if (jsonResponse == null){
                                errors = true;
                                break;
                            }
                            javaJsonResponse.setContent(jsonResponse);
                            yailFiles.add(javaJsonResponse);
                            OdeLog.log("successful generation");
                        }
                        catch (YailGenerationException e)
                        {
                            if (failureCommand != null)
                            {
                                failureCommand.execute();
                            }
                            return;
                        }
                    }
                }
                break;
            }
        }

        if (!errors){
            Ode.getInstance().getProjectService().save(Ode.getInstance().getSessionId(),
                    yailFiles,
                    new OdeAsyncCallback<Long>(MESSAGES.saveErrorMultipleFiles()) {
                        @Override
                        public void onSuccess(Long date) {
                            if (successCommand != null) {
                                successCommand.execute();
                            }
                        }

                        @Override
                        public void onFailure(Throwable caught) {
                            super.onFailure(caught);
                            if (failureCommand != null) {
                                failureCommand.execute();
                            }
                        }
                    });
        }
    }

    /**
     * Parses the JSON object returned from the Java Bridge Generator and returns the generated code
     * @param jsonResponse The String json response
     * @return the Java Code for the generation or null if there was an error
     */
    public String parseJavaJSONResponse(String jsonResponse){
        String javaCode = null;
        JSONValue jsonValue = JSONParser.parseStrict(jsonResponse);
        JSONObject jsonContent = jsonValue.isObject();
        if (jsonContent != null){
            boolean success = Boolean.valueOf(jsonContent.get("success").toString());
            if (success){
                JSONString jsonString = jsonContent.get("java_code").isString();
                javaCode = jsonString.stringValue();
            }else {
                JSONArray errorsObject = jsonContent.get("errors").isArray();
                if (errorsObject != null){
                    ErrorReporter.reportError(errorsObject.get(0).toString());
                }
            }
        }
        return javaCode;
    }

    public void generateManifestForBlocksEditors(final Command successCommand,
                                             final Command failureCommand) {
        List<FileDescriptorWithContent> manifestJSONData =  new ArrayList<FileDescriptorWithContent>();
        long currentProjectId = Ode.getInstance().getCurrentYoungAndroidProjectId();
        for (long projectId : openProjectEditors.keySet()) {
            if (projectId == currentProjectId) {
                // get JSON permission and intent data for each screen
                ProjectEditor projectEditor = openProjectEditors.get(projectId);
                for (FileEditor fileEditor : projectEditor.getOpenFileEditors()) {
                    if (fileEditor instanceof YaBlocksEditor) {
                        YaBlocksEditor yaBlocksEditor = (YaBlocksEditor) fileEditor;
                        try {
                            manifestJSONData.add(yaBlocksEditor.getManifestJSONData());
                        } catch (YailGenerationException e) {
                            ErrorReporter.reportInfo(MESSAGES.yailGenerationError(e.getFormName(),
                                    e.getMessage()));
                            if (failureCommand != null) {
                                failureCommand.execute();
                            }
                            return;
                        }
                    }
                }
                break;
            }
        }
        //parse JSON data to create manifest
        manifestJSONData = parseManifestJSON(manifestJSONData);

        Ode.getInstance().getProjectService().save(Ode.getInstance().getSessionId(),
                manifestJSONData,
                new OdeAsyncCallback<Long>(MESSAGES.saveErrorMultipleFiles()) {
                    @Override
                    public void onSuccess(Long date) {
                        if (successCommand != null) {
                            successCommand.execute();
                        }
                    }

                    @Override
                    public void onFailure(Throwable caught) {
                        super.onFailure(caught);
                        if (failureCommand != null) {
                            failureCommand.execute();
                        }
                    }
                });
    }

    /**
     * Parses the returned JSON (containing permission/intent info) for the manifest file.
     * Returns a collection with only one file (The manifest)
     * (To save a "FileDescriptorWithContent" it must be in a collection)
     * @param manifestJSONFiles The list of JSON data files
     * @return a list containing "one" manifest file with the necessary information
     */
    private List<FileDescriptorWithContent> parseManifestJSON(List<FileDescriptorWithContent> manifestJSONFiles){
      List<FileDescriptorWithContent> singleManifest =  new ArrayList<FileDescriptorWithContent>();

      //information for creating the manifest
      String mainScreenName = "";
      ArrayList<String> alternateScreens = new ArrayList<String>();
      ArrayList<String> permissionsList = new ArrayList<String>();
      ArrayList<String> intents = new ArrayList<String>();
      //parse JSON
      for (int i=0; i <  manifestJSONFiles.size(); i++){
        FileDescriptorWithContent manifestFile = manifestJSONFiles.get(i);
        String content = manifestFile.getContent();
        JSONValue jsonValue = JSONParser.parseStrict(content);
        JSONObject jsonContent = jsonValue.isObject();

        if (jsonContent != null){
          String screenName = jsonContent.get("screenName").toString().replaceAll("\"", "");
          //main screen for app is always the first to be parsed
          if (i == 0){
            mainScreenName = screenName;
          }else {
            alternateScreens.add(screenName);
          }
          JSONArray permissions = (JSONArray) jsonContent.get("permissions");
          for (int j=0; j <permissions.size(); j++){
            JSONObject permission = (JSONObject) permissions.get(j);
            if (permission != null){
              permissionsList.add(permission.get("permission").toString().replaceAll("\"",""));
            }
          }

          JSONArray intentsJSON = (JSONArray) jsonContent.get("intents");
          for (int j=0; j <intentsJSON.size(); j++){
            JSONObject intentJSON = (JSONObject) intentsJSON.get(j);
            if (intentJSON != null){
              intents.add(intentJSON.get("intent").toString().replaceAll("\"",""));
            }
          }
        }
      }

      //replace the first file's content with the created manifest string.
      //(easier than creating another file and the files are already named "AnrdoidManifest.xml")
      manifestJSONFiles.get(0).setContent(createManifest(mainScreenName, alternateScreens, permissionsList, intents));
      //add that first file to the Collection
      singleManifest.add(manifestJSONFiles.get(0));
      return singleManifest;
    }

  /**
   * This method creates the manifest file for the generated java code
   * @param mainScreenName The main screen of the app
   * @param alternateScreens Alternative screens used in the app
   * @param permissions The app's permissions
   * @param intents The app's intents
  */
  private String createManifest(String mainScreenName, ArrayList<String> alternateScreens, ArrayList<String> permissions, ArrayList<String> intents){
    String formattedPermissions = "";
    for (String permission: permissions){
      formattedPermissions += permission + "\r\n\r\n";
    }
    String formattedIntents = "";
    for (String intent: intents){
      formattedIntents += intent;
    }
    String manifest = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n\r\n"
            + "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\r\n\r\n    package=\"org.appinventor\"\r\n\r\n    android:versionCode=\"1\"\r\n\r\n    android:versionName=\"1.0\" >\r\n\r\n"
            + "<uses-sdk\r\n\r\n        android:minSdkVersion=\"8\"\r\n\r\n        android:targetSdkVersion=\"21\" />\r\n\r\n    "
            + formattedPermissions
            + "\r\n\r\n\r\n\r\n<application\r\n\r\n        android:allowBackup=\"true\"\r\n\r\n        android:icon=\"@drawable/ic_launcher\"\r\n\r\n        android:label=\"" + mainScreenName + "\">\r\n\r\n        "
            + "<activity\r\n\r\n            android:name=\"." + mainScreenName + "\"\r\n\r\n            android:label=\"" + mainScreenName + "\" >\r\n\r\n            "
            + "<intent-filter>\r\n\r\n                "
            + "<action android:name=\"android.intent.action.MAIN\" />\r\n\r\n\r\n\r\n                "
            + "<category android:name=\"android.intent.category.LAUNCHER\" />\r\n\r\n            "
            + "</intent-filter>\r\n\r\n        "
            + formattedIntents
            + "\r\n\r\n</activity>\r\n\r\n        ";
    for (String activityName: alternateScreens){
      manifest += "<activity android:name=\"" + activityName + "\" ></activity>\n";

    }
    manifest += "</application>\r\n\r\n\r\n\r\n" + "</manifest>";
    return manifest;
  }

  /**
   * This code used to send the contents of all changed files to the server
   * in the same RPC transaction. However we are now sending them separately
   * so that we can have more fine grained control over handling errors that
   * happen only on one file. In particular, we need to handle the case where
   * a trivial blocks workspace is attempting to be written over a non-trival
   * file.
   *
   * If any unhandled errors occur while saving, the afterSavingFiles
   * command will not be executed.  If filesWithContent is empty, the
   * afterSavingFiles command is called immediately, not
   * asynchronously.
   *
   * @param filesWithContent  the files that need to be saved
   * @param afterSavingFiles  optional command to be executed after file
   *                          editors are saved.
   */
  private void saveMultipleFilesAtOnce(
      final List<FileDescriptorWithContent> filesWithContent, final Command afterSavingFiles, final DateHolder dateHolder) {
    if (filesWithContent.isEmpty()) {
      // No files needed saving.
      // Execute the afterSavingFiles command if one was given.
      if (afterSavingFiles != null) {
        afterSavingFiles.execute();
      }

    } else {
      for (FileDescriptorWithContent fileDescriptor : filesWithContent ) {
        final long projectId = fileDescriptor.getProjectId();
        final String fileId = fileDescriptor.getFileId();
        final String content = fileDescriptor.getContent();
        Ode.getInstance().getProjectService().save2(Ode.getInstance().getSessionId(),
          projectId, fileId, false, content, new OdeAsyncCallback<Long>(MESSAGES.saveErrorMultipleFiles()) {
            @Override
            public void onSuccess(Long date) {
              if (dateHolder.date != 0) {
                // This sets the project modification time to that of one of
                // the successful file saves. It doesn't really matter which
                // file date we use, they will all be close. However it is important
                // to use some files date because that will be based on the server's
                // time. If we used the local clients time, then we may be off if the
                // client's computer's time isn't set correctly.
                dateHolder.date = date;
                dateHolder.projectId = projectId;
              }
              if (afterSavingFiles != null) {
                afterSavingFiles.execute();
              }
            }
            @Override
            public void onFailure(Throwable caught) {
              // Here is where we handle BlocksTruncatedException
              if (caught instanceof BlocksTruncatedException) {
                Ode.getInstance().blocksTruncatedDialog(projectId, fileId, content, this);
              } else {
                super.onFailure(caught);
              }
            }
          });
      }
    }
  }
}
