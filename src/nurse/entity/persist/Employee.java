package nurse.entity.persist;

import java.util.ArrayList;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Employee {

	public Employee() {
	}

	public int EmployeeId;
	public Integer DepartmentId;
	public String EmployeeName;
	public Integer EmployeeType;
	public Integer EmployeeTitle;
	public String JobNumber;
	public Integer Gender;
	public String Mobile;
	public String Phone;
	public String Email;
	public String Address;
	public String PostAddress;
	public boolean Enable;
	public String Description;
	public boolean IsAddTempUser;
	public Integer UserValidTime;
	
	public static ArrayList<Employee> fromDataTable(DataTable dt) {
		ArrayList<Employee> ds = new ArrayList<Employee>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Employee d = new Employee();
			
			d.EmployeeId = (int) drs.get(i).getValue("EmployeeId");
			d.DepartmentId = (Integer) drs.get(i).getValue("DepartmentId");
			d.EmployeeName = (String) drs.get(i).getValue("EmployeeName");
			d.EmployeeType = (Integer) drs.get(i).getValue("EmployeeType");
			d.EmployeeTitle = (Integer) drs.get(i).getValue("EmployeeTitle");
			d.JobNumber = (String) drs.get(i).getValue("JobNumber");
			d.Gender = (Integer) drs.get(i).getValue("Gender");
			d.Mobile = (String) drs.get(i).getValue("Mobile");
			d.Phone = (String) drs.get(i).getValue("Phone");
			d.Email = (String) drs.get(i).getValue("Email");
			d.Address = (String) drs.get(i).getValue("Address");
			d.PostAddress = (String) drs.get(i).getValue("PostAddress");
			d.Enable = (boolean) drs.get(i).getValue("Enable");
			d.Description = (String) drs.get(i).getValue("Description");
			d.IsAddTempUser = (boolean) drs.get(i).getValue("IsAddTempUser");
			d.UserValidTime = (Integer) drs.get(i).getValue("UserValidTime");

			ds.add(d);
		}		
		return ds;
	}
}
