package nurse.entity.persist;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;

public class ChinaunicomDevice {
    public String DeviceId;
    public String DeviceRId;
    public String DeviceName;
    public String EquipId;

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
            devices.add(String.format("DeviceRId=%s",getJsonValue(json,"deviceRId")));
            devices.add(String.format("DeviceName=%s",getJsonValue(json,"deviceName")));
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

    public String getDeviceId() {
        return DeviceId;
    }

    public void setDeviceId(String deviceId) {
        DeviceId = deviceId;
    }

    public String getDeviceRId() {
        return DeviceRId;
    }

    public void setDeviceRId(String deviceRId) {
        DeviceRId = deviceRId;
    }

    public String getDeviceName() {
        return DeviceName;
    }

    public void setDeviceName(String deviceName) {
        DeviceName = deviceName;
    }

    public String getEquipId() {
        return EquipId;
    }

    public void setEquipId(String equipId) {
        EquipId = equipId;
    }
}
