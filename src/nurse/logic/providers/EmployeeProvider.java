package nurse.logic.providers;

import java.util.ArrayList;
import java.util.Date;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.Employee;
import nurse.utility.DatabaseHelper;


public class EmployeeProvider {

	private static EmployeeProvider instance = new EmployeeProvider();
	private static Logger log = Logger.getLogger(EmployeeProvider.class);
	private static int gEmployeeId = 755000001;
	
	public EmployeeProvider() {
	}
	
	public static EmployeeProvider getInstance(){
		return instance;
	}

	public ArrayList<Employee> GetAllEmployees() {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_Employee WHERE EmployeeId > 0");  
                        
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            return Employee.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read all employees", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<Employee> GetDOEmployees() {

        try
        {
        	ArrayList<Employee> listEmployee = new ArrayList<Employee>();
        	
        	for(int i = 1; i<= 4; i++)
        	{
        		Employee employee = new Employee();
        		employee.EmployeeId = i;
        		employee.EmployeeName = "DO" + i;
        		employee.Mobile = "88888888" + i;
        		
        		listEmployee.add(employee);
        	}

            return listEmployee;
		} catch (Exception e) {
			log.error("fail to read all employees", e);
			return null;		
		} finally {
			
		}
	}
	
	public ArrayList<Employee> GetEmployeeByName(String EmployeeName) {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_Employee WHERE EmployeeName = '%s'");  
            String sql = sb.toString();
            sql = String.format(sql, EmployeeName);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return Employee.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read employee by name", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public ArrayList<Employee> GetEmployeeById(int employeeId) {
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_Employee WHERE EmployeeId = %d");  
            String sql = sb.toString();
            sql = String.format(sql, employeeId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            
            return Employee.fromDataTable(dt);
		} catch (Exception e) {
			log.error("fail to read employee by id", e);
			return null;		
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public boolean DelEmployee(int employeeId) {
		
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format("DELETE FROM TBL_Employee WHERE EmployeeId=%d", employeeId);
            dbHelper.executeNoQuery(sql);
			
			return true;

		} catch (Exception e) {
			log.error("DelEmployee() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		
		return false;
	}
	
	public int InsertEmployee(String EmployeeName, String Mobile, String Email)
    {
        int EmployeeId = -1;

        DatabaseHelper dbHelper = null;
		try
        {	
			//插入设备
            dbHelper = new DatabaseHelper();
          //插入管理员信息
            StringBuilder sbEmployee=new StringBuilder();
            sbEmployee.append("INSERT INTO TBL_Employee (EmployeeId, DepartmentId, EmployeeName, EmployeeType, EmployeeTitle, JobNumber, Gender, Mobile, Phone, Email, \r\n");
            sbEmployee.append("Address, PostAddress, Enable, Description, IsAddTempUser, UserValidTime)\r\n");
            sbEmployee.append("VALUES (%d, 0, '%s', NULL, NULL, '8888', NULL, '%s', NULL, '%s', NULL, NULL, 1, NULL, 0, 172800)");
            //EmployeeId = GetMaxEmployeeId();
            EmployeeId = GenerateEmployeeId();
            
            String sql = sbEmployee.toString();
            sql = String.format(sql, EmployeeId, EmployeeName, Mobile, Email);
            
            dbHelper.executeNoQuery(sql);
            
		} catch (Exception e) {
			log.error("EmployeeName() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}

        return EmployeeId;
    }
	
	public int GetMaxEmployeeId() {
		DatabaseHelper dbHelper = null;
		Object res = null;
		int iMaxId = -1;
		try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("SELECT MAX(EmployeeId) FROM TBL_Employee");
            String sql = sb.toString();
            
            res = dbHelper.executeScalar(sql);
            if(res == null)
			{
            	iMaxId = gEmployeeId++;
			}
			else
			{
				iMaxId = Integer.parseInt(res.toString());
				iMaxId++;
				gEmployeeId = iMaxId;
			}

		} catch (Exception e) {
			log.error("GetMaxEmployeeId() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		
		return iMaxId;
				
	}
	
	//根据时间戳生成ID
	public int GenerateEmployeeId()
	{
		Date date=new Date();  
		long lTime = date.getTime();
		int employeeId = (int)(lTime % 10000);
		
		return employeeId;
	}
	
}
