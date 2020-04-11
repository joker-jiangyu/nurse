package nurse.common;

public class DataTypes {

	public static final int STRING = 1;
	
	public DataTypes() {

	}

	public static String getDataTypeName(int dataType) {

		if (dataType == 1) return "String";
		
		return null;
	}

}
