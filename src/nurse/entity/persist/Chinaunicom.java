package nurse.entity.persist;

import org.json.JSONObject;

import java.util.ArrayList;

public class Chinaunicom {
    public String SCIP;
    public String SCPort;
    public String IPSecIP;
    public String IPSecUser;
    public String IPSecPwd;
    public String FSUID;
    public String FSURID;
    public String FTPUser;
    public String FTPPwd;
    public String LoginUser;
    public String LoginPwd;

    public static ArrayList<String> toStringList(JSONObject jsonObject){
        ArrayList<String> result = new ArrayList<String>();

        result.add("[FSUINFO]");
        result.add(String.format("SCIP=%s",getJsonValue(jsonObject,"SCIP")));
        result.add(String.format("SCPort=%s",getJsonValue(jsonObject,"SCPort")));
        result.add(String.format("IPSecIP=%s",getJsonValue(jsonObject,"IPSecIP")));
        result.add(String.format("IPSecUser=%s",getJsonValue(jsonObject,"IPSecUser")));
        result.add(String.format("IPSecPwd=%s",getJsonValue(jsonObject,"IPSecPwd")));
        result.add(String.format("FSUID=%s",getJsonValue(jsonObject,"FSUID")));
        result.add(String.format("FSURID=%s",getJsonValue(jsonObject,"FSURID")));
        result.add(String.format("FTPUser=%s",getJsonValue(jsonObject,"FTPUser")));
        result.add(String.format("FTPPwd=%s",getJsonValue(jsonObject,"FTPPwd")));
        result.add(String.format("LoginUser=%s",getJsonValue(jsonObject,"loginUser")));
        result.add(String.format("LoginPwd=%s",getJsonValue(jsonObject,"loginPwd")));

        return result;
    }

    private static String getJsonValue(JSONObject json,String key){
        if(json.isNull(key)) return "";
        return json.getString(key);
    }

    public String getSCIP() {
        return SCIP;
    }

    public void setSCIP(String SCIP) {
        this.SCIP = SCIP;
    }

    public String getSCPort() {
        return SCPort;
    }

    public void setSCPort(String SCPort) {
        this.SCPort = SCPort;
    }

    public String getIPSecIP() {
        return IPSecIP;
    }

    public void setIPSecIP(String IPSecIP) {
        this.IPSecIP = IPSecIP;
    }

    public String getIPSecUser() {
        return IPSecUser;
    }

    public void setIPSecUser(String IPSecUser) {
        this.IPSecUser = IPSecUser;
    }

    public String getIPSecPwd() {
        return IPSecPwd;
    }

    public void setIPSecPwd(String IPSecPwd) {
        this.IPSecPwd = IPSecPwd;
    }

    public String getFSUID() {
        return FSUID;
    }

    public void setFSUID(String FSUID) {
        this.FSUID = FSUID;
    }

    public String getFSURID() {
        return FSURID;
    }

    public void setFSURID(String FSURID) {
        this.FSURID = FSURID;
    }

    public String getFTPUser() {
        return FTPUser;
    }

    public void setFTPUser(String FTPUser) {
        this.FTPUser = FTPUser;
    }

    public String getFTPPwd() {
        return FTPPwd;
    }

    public void setFTPPwd(String FTPPwd) {
        this.FTPPwd = FTPPwd;
    }

    public String getLoginUser() {
        return LoginUser;
    }

    public void setLoginUser(String loginUser) {
        LoginUser = loginUser;
    }

    public String getLoginPwd() {
        return LoginPwd;
    }

    public void setLoginPwd(String loginPwd) {
        LoginPwd = loginPwd;
    }
}
