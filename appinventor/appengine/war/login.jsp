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
    <p style="margin-bottom: 25px;"><a target="_blank" href="http://www.appinventor.org/jbridge"
                            style="color:white;">
                            Learn More about the Java Bridge Project
                         </a>
                      </p>
    <img style="width:310px;margin-bottom: 50px;" class="img-scale" src="/images/JBridgeIcon.png">
  </center>
  <% if (error != null) {
    out.println("<center><font color=red><b>" + error + "</b></font></center><br/>");
  } %>
   <p></p>
   <p></p>
   <p></p>
   <%    if (useGoogleLabel != null && useGoogleLabel.equals("true")) { %>
     <center><p><a href="<%= new UriBuilder("/login/google")
     .add("locale", locale)
     .add("repo", repo)
     .add("galleryId", galleryId)
     .add("redirect", redirect).build() %>" style="text-decoration:none;text-decoration: none;background-color: #DF4A32;color: white;padding: 15px;font-size: 20px;border-radius: 17px;">Sign in with Google</a></p>
    </center>
   <%    } %>

   <footer>
    <p></p>

    <p></p>
    <p style="text-align: center; clear:both;">
    <br>
    <a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/" target="_blank"></a></p>
    </footer>
    </div>
  </body>
</html>

