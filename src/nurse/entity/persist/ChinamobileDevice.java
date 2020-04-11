package nurse.entity.persist;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class ChinamobileDevice {

    public String EquipId;
    public String DeviceId;
    public String DeviceName;
    public String Model;
    public String Brand;
    public String RatedCapacity;
    public String Version;
    public String BeginRunTime;
    public String DevDescribe;
    public String RoomId;
    public String RoomName;
    public String SiteID;
    public String SiteName;

    public static ArrayList<ChinamobileDevice> jsonToList(JSONObject jsonObject){
        ArrayList<ChinamobileDevice> list = new ArrayList<ChinamobileDevice>();
        JSONArray jsonArray = jsonObject.getJSONArray(jsonObject.getString("Devices"));

        Iterator<Object> iterator = jsonArray.iterator();
        while (iterator.hasNext()){
            Object next = iterator.next();

            list.add((ChinamobileDevice)next);
        }

        return list;
    }

    public static ArrayList<String> toStringList(JSONObject jsonObject){
        ArrayList<String> result = new ArrayList<String>();
        ArrayList<String> devices = new ArrayList<String>();

        JSONArray jsonArray = jsonObject.getJSONArray("Devices");

        int index = 1;
        for(int i = 0; i < jsonArray.length(); i++){
            JSONObject json = jsonArray.getJSONObject(i);

            devices.add(String.format("[DEVICE%d]",index));
            devices.add(String.format("EquipId=%s",getJsonValue(json,"equipId")));
            devices.add(String.format("DeviceId=%s",getJsonValue(json,"deviceId")));
            devices.add(String.format("DeviceName=%s",getJsonValue(json,"deviceName")));
            devices.add(String.format("Model=%s",getJsonValue(json,"model")));
            devices.add(String.format("Brand=%s",getJsonValue(json,"brand")));
            devices.add(String.format("RatedCapacity=%s",getJsonValue(json,"ratedCapacity")));
            devices.add(String.format("Version=%s",getJsonValue(json,"version")));
            devices.add(String.format("BeginRunTime=%s",getJsonValue(json,"beginRunTime")));
            devices.add(String.format("DevDescribe=%s",getJsonValue(json,"devDescribe")));
            devices.add(String.format("RoomId=%s",getJsonValue(json,"roomId")));
            devices.add(String.format("RoomName=%s",getJsonValue(json,"roomName")));
            devices.add(String.format("SiteID=%s",getJsonValue(json,"siteID")));
            devices.add(String.format("SiteName=%s",getJsonValue(json,"siteName")));

            index ++;
        }

        result.add("[DEVICE_NUM]");
        result.add(String.format("DeviceNum=%d",(index - 1)));
        result.addAll(devices);

        return result;
    }

    private static String getJsonValue(JSONObject json,String key){
        if(json.isNull(key)) return "";
        return json.getString(key);
    }

    public String getEquipId() {
        return EquipId;
    }

    public void setEquipId(String EquipId) {
        this.EquipId = EquipId;
    }

    public String getDeviceId() {
        return DeviceId;
    }

    public void setDeviceId(String DeviceId) {
        this.DeviceId = DeviceId;
    }

    public String getDeviceName() {
        return DeviceName;
    }

    public void setDeviceName(String DeviceName) {
        this.DeviceName = DeviceName;
    }

    public String getModel() {
        return Model;
    }

    public void setModel(String Model) {
        this.Model = Model;
    }

    public String getBrand() {
        return Brand;
    }

    public void setBrand(String Brand) {
        this.Brand = Brand;
    }

    public String getRatedCapacity() {
        return RatedCapacity;
    }

    public void setRatedCapacity(String RatedCapacity) {
        this.RatedCapacity = RatedCapacity;
    }

    public String getVersion() {
        return Version;
    }

    public void setVersion(String Version) {
        this.Version = Version;
    }

    public String getBeginRunTime() {
        return BeginRunTime;
    }

    public void setBeginRunTime(String BeginRunTime) {
        this.BeginRunTime = BeginRunTime;
    }

    public String getDevDescribe() {
        return DevDescribe;
    }

    public void setDevDescribe(String DevDescribe) {
        this.DevDescribe = DevDescribe;
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
}
