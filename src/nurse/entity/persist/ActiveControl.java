package nurse.entity.persist;
/*
#define _CMD_RESULT_SUCCEED             (char)1             // ����ִ�гɹ�
#define _CMD_RESULT_FAIL                (char)2             // ����ִ��ʧ��
#define _CMD_RESULT_TIMEOUT             (char)3             // ���ʱδִ�ж�ȡ��
#define _CMD_RESULT_RUNNING             (char)4             // ��������ִ�У�δ����
#define _CMD_RESULT_ERR_ADDR            (char)5             // ���Ƶ�Ԫ��ַ��
#define _CMD_RESULT_ERR_PARA            (char)6             // ���������δִ��
#define _CMD_RESULT_UNKNOWN             (char)8             // δ֪���
*/

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class ActiveControl{
	public int SerialNo;
	public int EquipmentId;
	public int ControlId;
	public int ActionId;
	public String CmdToken;
	public String ParameterValues;
	public int Result;
	public int BaseTypeId;
	
	public String Data2String(){
		String cmd = null;
		cmd = String.format("%d#%d#%d#%d#%s",
				SerialNo,EquipmentId,ControlId,ActionId,CmdToken);
		return cmd;
	}
	
	public static ArrayList<ActiveControl> fromDataTable(DataTable dt){
		ArrayList<ActiveControl> acs = new ArrayList<ActiveControl>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		for(int i=0;i<rowCount;i++)
		{
			ActiveControl ac = new ActiveControl();
			ac.EquipmentId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
			ac.ControlId = Integer.parseInt(drs.get(i).getValueAsString("ControlId"));
			ac.SerialNo = Integer.parseInt(drs.get(i).getValueAsString("SerialNo"));
			ac.ActionId = drs.get(i).getValueAsString("ActionId") == null ? -1 :Integer.parseInt(drs.get(i).getValueAsString("ActionId"));
			ac.CmdToken = drs.get(i).getValueAsString("CmdToken");
			ac.ParameterValues = drs.get(i).getValueAsString("ParameterValues");
			ac.Result = drs.get(i).getValueAsString("ControlResultType") == null ? -1 : Integer.parseInt(drs.get(i).getValueAsString("ControlResultType"));
			ac.BaseTypeId = drs.get(i).getValueAsString("BaseTypeId") == null ? -1 : Integer.parseInt(drs.get(i).getValueAsString("BaseTypeId"));
			
			acs.add(ac);
		}
		return acs;
	}
}
