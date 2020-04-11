package nurse.entity.view;

import java.util.ArrayList;
import java.util.Comparator;

import org.json.JSONArray;
import org.json.JSONObject;

import nurse.entity.persist.SignalInstance;

public class SignalPara {

	public String id;
	public String name;
	public String msGroup;
	public boolean selected;
	
	public SignalPara() {
	}

	public static JSONArray GetArrayFromInstances(ArrayList<SignalInstance> sis) {
		ArrayList<SignalPara> sps = new ArrayList<SignalPara>(); 
		JSONArray arr = new JSONArray();
		String lastDeviceName = null;
		
		sis.sort(new Comparator<SignalInstance>(){
			@Override
			public int compare(SignalInstance a, SignalInstance b) {
				return a.deviceName.compareTo(b.deviceName);
			}			
		});
		
		for(SignalInstance si : sis)
		{
			//remove unbaseType signals
			if (si.baseTypeId == 0)
			{
				//System.out.println(si.signalName);
				continue;			
			}
			
			SignalPara sp = new SignalPara();

			// 如果sps中不存在新设备组，则增加此设备组
			if (sps.stream().filter((s)->s.name.equalsIgnoreCase(si.deviceName)).count() == 0)
			{
				// 如果是不是第一个则增加前一个设备的结束
				if (sps.size() > 0)
				{
					JSONObject objGroupEnd = new JSONObject();
					objGroupEnd.put("msGroup", false);
					arr.put(objGroupEnd);
				}
					
				sp.id = "NA";
				sp.name = si.deviceName;

				lastDeviceName = si.deviceName;
				
				JSONObject objGroupStart = new JSONObject();
				objGroupStart.put("id", sp.id);
				objGroupStart.put("name", sp.name);
				objGroupStart.put("msGroup", true);
				arr.put(objGroupStart);
				sps.add(sp);
			
			}
			//else
			{
				sp= new SignalPara();
				sp.id = String.valueOf(si.deviceId) + "." + String.valueOf(si.signalId);
				sp.name = si.signalName;
				
				JSONObject objItem = new JSONObject();
				objItem.put("id", sp.id);
				objItem.put("name", sp.name);
				objItem.put("deviceName", lastDeviceName);
				arr.put(objItem);
			}
			
			sps.add(sp);
		}
		
		if (sps.size() > 0 )
		{
			JSONObject objGroupEnd = new JSONObject();
			objGroupEnd.put("msGroup", false);
			arr.put(objGroupEnd);
		}
		
		return arr;
	}

}
