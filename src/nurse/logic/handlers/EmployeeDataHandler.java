package nurse.logic.handlers;

import java.util.ArrayList;
import java.util.Base64;

import nurse.entity.persist.Employee;
import nurse.entity.persist.EquipmentTemplate;
import nurse.entity.persist.Station;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.EmployeeProvider;
import nurse.logic.providers.EventFilterProvider;
import nurse.logic.providers.StationProvider;
import nurse.utility.JsonHelper;

public class EmployeeDataHandler extends DataHandlerBase {
	private static final String getAllEmployees = "getAllEmployees";
	private static final String deleteEmployee = "deleteEmployee";
	private static final String insertEmployee = "insertEmployee";
	private static final String getDOEmployees = "getDOEmployees";

	
	public EmployeeDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EmployeeDataHandler.getAllEmployees)){
			rep.responseResult = HandleGetAllEmployees(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EmployeeDataHandler.deleteEmployee)){
			rep.responseResult = HandleDeleteEmployee(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EmployeeDataHandler.insertEmployee)){
			rep.responseResult = HandleInsertEmployee(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EmployeeDataHandler.getDOEmployees)){
			rep.responseResult = HandleGetDOEmployees(req.requestParams);
		}
	}
		
	
	private String HandleGetAllEmployees(String requestParams) {

		String result = "fail to get all employees";
        
        try{

			ArrayList<Employee> temp = EmployeeProvider.getInstance().GetAllEmployees();
			
			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleGetDOEmployees(String requestParams) {

		String result = "fail to get all employees";
        
        try{

			ArrayList<Employee> temp = EmployeeProvider.getInstance().GetDOEmployees();

			return JsonHelper.ListjsonString("ret", temp);
			
        } catch (Exception e) {
			e.printStackTrace();
		}
        
        return result;
	}
	
	private String HandleDeleteEmployee(String requestParams) {
		
		int employeeId = Integer.valueOf(requestParams);

		String result = "fail to delete employee";
        
        try{
        	
        	//判断人员是否为管理员
        	ArrayList<Station> station = StationProvider.getInstance().GetStationByContactId(employeeId);
        	if(station.size() > 0)
        	{
        		//人员重复
        		result = "system employee";
        	}
        	else
        	{
        		ArrayList<Employee> employees = EmployeeProvider.getInstance().GetEmployeeById(employeeId);
        		if(employees.size() > 0)
        		{
        			//删除人员，需要更新告警通知接收者
        			Employee employee = employees.get(0);
        			String EmployeeName = employee.EmployeeName;
        			String Mobile = employee.Mobile;
        			String Receiver = EmployeeName + "|" + Mobile;
        			EventFilterProvider.getInstance().DeleteEventNotifyReceiver(Receiver);
        			
        			boolean bRet = EmployeeProvider.getInstance().DelEmployee(employeeId);
    	            
    	        	if(bRet)
    	        	{
    	        		result = "OK";
    	        	}
        		}
        		else
        		{
        			result = "OK";
        		}
	        	
        	}
        
        } catch (Exception e) {
			e.printStackTrace();
			
			return result;
		}
        
        return result;
	}
	
	private String HandleInsertEmployee(String requestParams) {
		
		String result = "fail to insert employee";
        
        try{
        	
        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] paras = infoStr.split("\\|");
        	String EmployeeName = paras[0];
        	String Mobile = paras[1];
        	String Email = (paras.length==3)?paras[2]:"";
        	
        	//判断是否人员重复
        	ArrayList<Employee> employee = EmployeeProvider.getInstance().GetEmployeeByName(EmployeeName);
        	if(employee.size() > 0)
        	{
        		//人员重复
        		result = "repeat employee";
        	}
        	else
        	{
	        	int tempEmployeeID = EmployeeProvider.getInstance().InsertEmployee(EmployeeName, Mobile, Email);
	
	        	if(tempEmployeeID != -1)
	        	{
	        		result = String.format("%d", tempEmployeeID);
	        	}
        	}
        
        } catch (Exception e) {
			e.printStackTrace();
			
			return result;
		}
        
        return result;
	}
	
}
