package nurse.entity.persist;

import org.json.JSONObject;

import java.util.ArrayList;

public class Snmpmodule {
    public String sysLocation;
    public String sysContact;
    public String sysName;
    public String sysDescr;
    public String sysObjectID;

    public static ArrayList<String> toStringList(JSONObject jsonObject){
        ArrayList<String> result = new ArrayList<String>();

        result.add(String.format("sysLocation %s",getJsonValue(jsonObject,"sysLocation")));
        result.add(String.format("sysContact %s",getJsonValue(jsonObject,"sysContact")));
        result.add(String.format("sysName %s",getJsonValue(jsonObject,"sysName")));
        result.add(String.format("sysDescr %s",getJsonValue(jsonObject,"sysDescr")));
        result.add(String.format("sysObjectID %s",getJsonValue(jsonObject,"sysObjectID")));

        return result;
    }

    private static String getJsonValue(JSONObject json,String key){
        if(json.isNull(key)) return "";
        return json.getString(key);
    }

    public String getSysLocation() {
        return sysLocation;
    }

    public void setSysLocation(String sysLocation) {
        this.sysLocation = sysLocation;
    }

    public String getSysContact() {
        return sysContact;
    }

    public void setSysContact(String sysContact) {
        this.sysContact = sysContact;
    }

    public String getSysName() {
        return sysName;
    }

    public void setSysName(String sysName) {
        this.sysName = sysName;
    }

    public String getSysDescr() {
        return sysDescr;
    }

    public void setSysDescr(String sysDescr) {
        this.sysDescr = sysDescr;
    }

    public String getSysObjectID() {
        return sysObjectID;
    }

    public void setSysObjectID(String sysObjectID) {
        this.sysObjectID = sysObjectID;
    }
}
