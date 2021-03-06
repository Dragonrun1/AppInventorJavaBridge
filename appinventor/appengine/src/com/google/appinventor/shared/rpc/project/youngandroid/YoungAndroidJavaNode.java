// Copyright 2012 Massachusetts Institute of Technology. All rights reserved.
package com.google.appinventor.shared.rpc.project.youngandroid;

import com.google.appinventor.shared.storage.StorageUtil;
import com.google.appinventor.shared.youngandroid.YoungAndroidSourceAnalyzer;


/**
 * Young Android yail file node in the project tree (stored as a source file, even though it
 * is generated by the blocks editor)
 *
 * @author sharon@google.com (Sharon Perl)
 */
public final class YoungAndroidJavaNode extends YoungAndroidSourceNode {

  /**
   * Default constructor (for serialization only).
   */
  public YoungAndroidJavaNode() {
  }

  /**
   * Creates a new Young Android yail  file project node.
   *
   * @param fileId  file id
   */
  public YoungAndroidJavaNode(String fileId) {
    super(StorageUtil.basename(fileId), fileId);
  }

  public static String getJavaFileId(String qualifiedName) {
    return SRC_PREFIX + qualifiedName.replace('.', '/') 
        + YoungAndroidSourceAnalyzer.JAVA_FILE_EXTENSION;
  }
}
