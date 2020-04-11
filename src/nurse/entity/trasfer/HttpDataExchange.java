package nurse.entity.trasfer;

public class HttpDataExchange {

	 public HttpDataExchange(String reqCommand, String reqParam, String repParam)  
	   {  
	      this.requestCommand = reqCommand;
	      this.responseCommand = reqCommand;
	      this.requestParams = reqParam;
	      this.responseResult = repParam;
	   }  
	  
	   public String requestCommand;  
	   public String requestParams;
	   public String responseCommand;
	   public String responseResult;
}
