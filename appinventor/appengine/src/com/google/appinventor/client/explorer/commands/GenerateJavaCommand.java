package com.google.appinventor.client.explorer.commands;

import com.google.appinventor.client.ErrorReporter;
import com.google.appinventor.client.Ode;
import com.google.appinventor.shared.rpc.project.ProjectNode;
import com.google.gwt.user.client.Command;

import static com.google.appinventor.client.Ode.MESSAGES;


public class GenerateJavaCommand extends ChainableCommand {

    /**
     * Creates a new generate Java command, with additional behavior provided
     * by another ChainableCommand.
     *
     * @param nextCommand the command to execute after the save has finished
     */
    public GenerateJavaCommand(ChainableCommand nextCommand) {
        super(nextCommand);
    }

    @Override
    protected boolean willCallExecuteNextCommand() {
        return true;
    }

    @Override
    protected void execute(final ProjectNode node) {
        Ode.getInstance().getEditorManager().generateJavaForBlocksEditors(
                new Command() {
                    @Override
                    public void execute() {
                        executeNextCommand(node);
                    }
                },
                new Command() {
                    @Override
                    public void execute() {
                    }
                });
    }
}
