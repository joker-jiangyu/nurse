package nurse.entity.persist;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;

public class SnmpIp {
    public String IP;
    public String Port;

    public static ArrayList<String> toTrap2sink(JSONObject jsonObject){
        ArrayList<String> result = new ArrayList<String>();

        JSONArray jsonArray = jsonObject.getJSONArray("IPS");

        for(int i = 0; i < jsonArray.length(); i++){
            JSONObject json = jsonArray.getJSONObject(i);

            String ip = getJsonValue(json,"IP");
            String port = getJsonValue(json,"port");
            result.add(String.format("rocommunity public %s",ip));
            result.add(String.format("rwcommunity private %s",ip));
            result.add(String.format("trap2sink %s public %s",ip,port));
        }

        return result;
    }

    public static ArrayList<String> toTrapsess(JSONObject jsonObject){
        ArrayList<String> result = new ArrayList<String>();

        JSONArray jsonArray = jsonObject.getJSONArray("IPS");

        for(int i = 0; i < jsonArray.length(); i++){
            JSONObject json = jsonArray.getJSONObject(i);

            String ip = getJsonValue(json,"IP");
            String port = getJsonValue(json,"port");
            result.add(String.format("trapsess -v 3 -l authPriv -a  MD5 -A authpass -X privpass -u admin -e 0x0102030405 %s:%s",ip,port));
        }

        return result;
    }


    private static String getJsonValue(JSONObject json,String key){
        if(json.isNull(key)) return "";
        return json.getString(key);
    }

    public String getIP() {
        return IP;
    }

    public void setIP(String IP) {
        this.IP = IP;
    }

    public String getPort() {
        return Port;
    }

    public void setPort(String port) {
        Port = port;
    }
}
