package nurse.entity.trasfer;

import nurse.entity.persist.ActiveSignal;

public class BindingSignal {

	public int siteId;
	public int deviceId;
	public int signalId;
	public int baseTypeId;
	
	public BindingSignal() {

	}	
	
	public static BindingSignal FromString(String param)
	{
		BindingSignal bs = new BindingSignal();
		
		String[] tokens = param.split("\\:");
		
		if (tokens.length != 2) return null;
		
		//TODO: not tested
		bs.signalId = Integer.parseInt(tokens[1]);	
		
		return bs;
	}

	public static BindingSignal FromString(String s, String deviceId) {
		try{
			if(deviceId.indexOf("&") != -1)
				deviceId = deviceId.replace("&","");

			BindingSignal bs = new BindingSignal();

			String[] tokens = s.split("\\:");

			if (tokens.length != 2) return null;
			if(tokens[1].indexOf("&") != -1)
				tokens[1] = tokens[1].replace("&","");


			bs.deviceId = Integer.valueOf(deviceId);
			if (tokens[0].equals("SI")){//SI	信号编号
				if(tokens[1].equals("undefined") || tokens[1].equals(""))
					bs.signalId = 0;
				else
					bs.signalId = Integer.parseInt(tokens[1]);
			}else if (tokens[0].equals("BS")){//BS	基类编号
				if(tokens[1].equals("undefined") || tokens[1].equals(""))
					bs.baseTypeId = 0;
				else
					bs.baseTypeId = Integer.parseInt(tokens[1]);
			}else
				return null;

			return bs;
		}catch (Exception e){
			System.out.println("DeviceId:"+deviceId+", Part:"+s);
			return null;
		}
	}

	public Boolean matchSignal(ActiveSignal sig) {
		
		if (this.baseTypeId > 0)
		{
			if (sig.deviceId == this.deviceId && sig.baseTypeId == this.baseTypeId)
				return true;
		}
		else
		{
			if (sig.deviceId == this.deviceId && sig.signalId == this.signalId)
				return true;
		}
		
		return false;
	}
}
