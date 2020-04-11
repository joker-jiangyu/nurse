package nurse.entity.persist;

import org.json.JSONObject;

import java.util.ArrayList;

public class Chinamobile {
    public String SCIP;
    public String SCPort;
    public String SCURLSuffix;
    public String FSUID;
    public String FSUPort;
    public String FSUTYPE;
    public String CMBVersion;
    public String FTPUser;
    public String FTPPwd;
    public String LoginUser;
    public String LoginPwd;
    public String RoomId;
    public String RoomName;
    public String SiteID;
    public String SiteName;
    public String Type76DeviceID;
    public String Type76DeviceName;

    public String Devices;

    public static Chinamobile jsonToObject(JSONObject jsonObject){
        Chinamobile cmb = new Chinamobile();
        cmb.SCIP = jsonObject.getString("SCIP");
        cmb.SCPort = jsonObject.getString("SCPort");
        cmb.SCURLSuffix = jsonObject.getString("SCURLSuffix");

        cmb.FSUID = jsonObject.getString("FSUID");
        cmb.FSUPort = jsonObject.getString("FSUPort");
        cmb.FSUTYPE = jsonObject.getString("FSUTYPE");

        cmb.CMBVersion = jsonObject.getString("CMBVersion");

        cmb.FTPUser = jsonObject.getString("FTPUser");
        cmb.FTPPwd = jsonObject.getString("FTPPwd");
        cmb.LoginUser = jsonObject.getString("loginUser");
        cmb.LoginPwd = jsonObject.getString("loginPwd");
        cmb.Type76DeviceID = jsonObject.getString("Type76DeviceID");
        cmb.Type76DeviceName = jsonObject.getString("Type76DeviceName");

        return cmb;
    }

    public static ArrayList<String> toStringList(JSONObject jsonObject){
        ArrayList<String> result = new ArrayList<String>();

        result.add("[FSUINFO]");
        result.add(String.format("SCIP=%s",getJsonValue(jsonObject,"SCIP")));
        result.add(String.format("SCPort=%s",getJsonValue(jsonObject,"SCPort")));
        result.add(String.format("SCURLSuffix=%s",getJsonValue(jsonObject,"SCURLSuffix")));
        result.add(String.format("FSUID=%s",getJsonValue(jsonObject,"FSUID")));
        result.add(String.format("FSUPort=%s",getJsonValue(jsonObject,"FSUPort")));
        result.add(String.format("FSUTYPE=%s",getJsonValue(jsonObject,"FSUTYPE")));
        result.add(String.format("CMBVersion=%s",getJsonValue(jsonObject,"CMBVersion")));
        result.add(String.format("FTPUser=%s",getJsonValue(jsonObject,"FTPUser")));
        result.add(String.format("FTPPwd=%s",getJsonValue(jsonObject,"FTPPwd")));
        result.add(String.format("LoginUser=%s",getJsonValue(jsonObject,"loginUser")));
        result.add(String.format("LoginPwd=%s",getJsonValue(jsonObject,"loginPwd")));
        result.add(String.format("Type76DeviceID=%s",getJsonValue(jsonObject,"type76DeviceID")));
        result.add(String.format("Type76DeviceName=%s",getJsonValue(jsonObject,"type76DeviceName")));

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

    public String getSCURLSuffix() {
        return SCURLSuffix;
    }

    public void setSCURLSuffix(String SCURLSuffix) {
        this.SCURLSuffix = SCURLSuffix;
    }

    public String getFSUID() {
        return FSUID;
    }

    public void setFSUID(String FSUID) {
        this.FSUID = FSUID;
    }

    public String getFSUPort() {
        return FSUPort;
    }

    public void setFSUPort(String FSUPort) {
        this.FSUPort = FSUPort;
    }

    public String getFSUTYPE() {
        return FSUTYPE;
    }

    public void setFSUTYPE(String FSUTYPE) {
        this.FSUTYPE = FSUTYPE;
    }

    public String getCMBVersion() {
        return CMBVersion;
    }

    public void setCMBVersion(String CMBVersion) {
        this.CMBVersion = CMBVersion;
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

    public void setLoginUser(String LoginUser) {
        this.LoginUser = LoginUser;
    }

    public String getLoginPwd() {
        return LoginPwd;
    }

    public void setLoginPwd(String LoginPwd) {
        this.LoginPwd = LoginPwd;
    }

    public String getRoomId() {
        return RoomId;
    }

    public void setRoomId(String RoomId) {
        this.RoomId = RoomId;
    }

    public String getRoomName() {
        return RoomName;
    }

    public void setRoomName(String RoomName) {
        this.RoomName = RoomName;
    }

    public String getSiteID() {
        return SiteID;
    }

    public void setSiteID(String SiteID) {
        this.SiteID = SiteID;
    }

    public String getSiteName() {
        return SiteName;
    }

    public void setSiteName(String SiteName) {
        this.SiteName = SiteName;
    }

    public String getDevices() {
        return Devices;
    }

    public void setDevices(String Devices) {
        this.Devices = Devices;
    }

    public String getType76DeviceID() {
        return Type76DeviceID;
    }

    public void setType76DeviceID(String type76DeviceID) {
        Type76DeviceID = type76DeviceID;
    }

    public String getType76DeviceName() {
        return Type76DeviceName;
    }

    public void setType76DeviceName(String type76DeviceName) {
        Type76DeviceName = type76DeviceName;
    }
}
