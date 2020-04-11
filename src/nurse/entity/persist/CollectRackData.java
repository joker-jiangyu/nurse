package nurse.entity.persist;

import java.text.DateFormat;
import java.text.SimpleDateFormat;

public class CollectRackData {
	private String Code;
	private String Value;
	private String Date;
	
	public String getCode(){
		return this.Code;
	}
	
	public String getValue(){
		return this.Value;
	}
	
	public String getDate(){
		return this.Date;
	}
	
	public CollectRackData(){}
	
	DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	public CollectRackData(String Code,String Value){
		this.Code = Code;
		this.Value = Value;
		this.Date = format.format(new java.util.Date());
	}
	
	public void print(){
		System.out.println("Code:"+this.Code+", Date:"+this.Date+", Value:"+this.Value);
	}
}
