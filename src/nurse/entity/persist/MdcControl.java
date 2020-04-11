package nurse.entity.persist;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

import java.util.ArrayList;

public class MdcControl {

    public int id;
    public String mdcId;
    public String controlName;
    public String password;
    public int equipmentId;
    public int baseTypeId;
    public String parameterValues;


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getMdcId() {
        return mdcId;
    }

    public void setMdcId(String mdcId) {
        this.mdcId = mdcId;
    }

    public String getControlName() {
        return controlName;
    }

    public void setControlName(String controlName) {
        this.controlName = controlName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(int equipmentId) {
        this.equipmentId = equipmentId;
    }

    public int getBaseTypeId() {
        return baseTypeId;
    }

    public void setBaseTypeId(int baseTypeId) {
        this.baseTypeId = baseTypeId;
    }

    public String getParameterValues() {
        return parameterValues;
    }

    public void setParameterValues(String parameterValues) {
        this.parameterValues = parameterValues;
    }

    public static ArrayList<MdcControl> fromDataTable(DataTable dt) {
        ArrayList<MdcControl> mcs = new ArrayList<MdcControl>();

        DataRowCollection drs = dt.getRows();
        int rowCount = dt.getRowCount();
        for(int i=0;i<rowCount;i++)
        {
            MdcControl mc = new MdcControl();
            mc.id = Integer.parseInt(drs.get(i).getValueAsString("Id"));
            mc.mdcId = drs.get(i).getValueAsString("MdcId");
            mc.controlName = drs.get(i).getValueAsString("ControlName");
            mc.password = drs.get(i).getValueAsString("Password");
            mc.equipmentId = Integer.parseInt(drs.get(i).getValueAsString("EquipmentId"));
            mc.baseTypeId = Integer.parseInt(drs.get(i).getValueAsString("BaseTypeId"));
            mc.parameterValues = drs.get(i).getValueAsString("ParameterValues");

            mcs.add(mc);
        }
        return mcs;
    }

    public String print(){
        String result = String.format("{\"password\":\"%s\",\"controlName\":\"%s\",\"mdcId\":\"%s\",\"baseTypeId\":\"%s\",\"id\":\"%s\",\"equipmentId\":\"%s\",\"parameterValues\":\"%s\"}",
                this.password,this.controlName,this.mdcId,this.baseTypeId,this.id,this.equipmentId,this.parameterValues);
        return result;
    }
}
