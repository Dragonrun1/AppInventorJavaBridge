<%@page import="javax.servlet.http.HttpServletRequest"%>
<%@page import="com.google.appinventor.server.util.UriBuilder"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!doctype html>
<%
String error = request.getParameter("error");
String useGoogleLabel = (String) request.getAttribute("useGoogleLabel");
String locale = request.getParameter("locale");
String redirect = request.getParameter("redirect");
String repo = (String) request.getAttribute("repo");
String galleryId = (String) request.getAttribute("galleryId");
if (locale == null) {
 locale = "en";
}

%>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <meta HTTP-EQUIV="pragma" CONTENT="no-cache"/>
  <meta HTTP-EQUIV="Cache-Control" CONTENT="no-cache, must-revalidate"/>
  <meta HTTP-EQUIV="expires" CONTENT="0"/>
  <title>MIT App Inventor</title>
</head>
  <body style="background-color:#3F9910;">
    <div style="position: absolute;margin: auto;top: 0;right: 0;bottom: 0;left: 0;">
  <center>
    <h1 style="text-transform: uppercase;
    font-weight: 500;
    font-size: 65px;
    color:white;
    margin-bottom: 0px;
    font-family: 'Courier New', Courier, monospace;">App Inventor<br>Java Bridge
    </h1>
    <h3 style="color:#ffae00;font-size: 24px;">A University of San Francisco Project</h3>
    <p style="margin-bottom: 25px;"><a href="http://www.appinventor.org/jbridge"
                            style="color:white;">
                            Learn More about the Java Bridge Project
                         </a>
                      </p>
    <img style="width:310px;margin-bottom: 50px;" class="img-scale" src="/images/JBridgeIcon.png">
  </center>
  <% if (error != null) {
    out.println("<center><font color=red><b>" + error + "</b></font></center><br/>");
  } %>
  <form method=POST action="/login">
    <center><table>
      <tr><td><input style="height: 35px;" placeholder="Email" type=text name=email value="" size="35"></td></tr>
      <tr><td></td></td>
        <tr><td><input style="height: 35px;" placeholder="Password" type=password name=password value="" size="35"></td></tr>
      </table></center>
      <% if (locale != null && !locale.equals("")) {
       %>
       <input type=hidden name=locale value="<%= locale %>">
       <% }
       if (repo != null && !repo.equals("")) {
         %>
         <input type=hidden name=repo value="<%= repo %>">
       <% }
       if (galleryId != null && !galleryId.equals("")) {
         %>
         <input type=hidden name=galleryId value="<%= galleryId %>">
       <% } %>
       <% if (redirect != null && !redirect.equals("")) {
         %>
         <input type=hidden name=redirect value="<%= redirect %>">
       <% } %>
       <p></p>
     <center>
      <input type=Submit value="${login}" style="border: 0px;padding: 10px;padding-left: 56px;border-radius: 17px;padding-right: 56px;font-size: 16px;background-color: white;">
      </center>
  </form>
   <p></p>

   <%    if (useGoogleLabel != null && useGoogleLabel.equals("true")) { %>
     <center><p><a href="<%= new UriBuilder("/login/google")
     .add("locale", locale)
     .add("repo", repo)
     .add("galleryId", galleryId)
     .add("redirect", redirect).build() %>" style="text-decoration:none;text-decoration: none;background-color: #DF4A32;color: white;padding: 10px;border-radius: 17px;">Sign in with Google</a></p>
    </center>
   <%    } %>

   <center>
         <p><a href="/login/sendlink"
               style="color:white;text-decoration:none;">
               ${passwordclickhereLabel}
            </a>
         </p>
      </center>

   <footer>
    <p></p>
    <center>
      <%    if (locale != null && locale.equals("zh_CN")) { %>
      <a href="http://www.weibo.com/mitappinventor" target="_blank"><img class="img-scale"
        src="/images/mzl.png" width="30" height="30" title="Sina WeiBo"></a>&nbsp;
        <%    } %>
        <a href="http://www.appinventor.mit.edu" target="_blank"><img class="img-scale"
          src="/images/login-app-inventor.jpg" width="50" height="30" title="MIT App Inventor"></a>
    </center>
    <p></p>
    <p style="text-align: center; clear:both;">
    <br>
    <a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/" target="_blank"></a></p>
    </footer>
    </div>
  </body>
</html>

