package nurse.entity.conf;

import java.util.ArrayList;

public class FeatureConfig {
	public String name;
	public String isShow;

	
	public FeatureConfig(String name, String isShow) {
		this.name = name;
		this.isShow = isShow;
	}
	
	public FeatureConfig() {
	}
	
	public static boolean getFeatureShow(ArrayList<FeatureConfig> features,String name){
		try {
			for(FeatureConfig fc : features){
				if(fc.name.equals(name))
					return Boolean.parseBoolean(fc.isShow);
			}
			return false;
		} catch (Exception e) {
			return false;
		}
	}
}
