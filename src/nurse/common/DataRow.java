package nurse.common;

import java.util.LinkedHashMap;
import java.util.Map;

public class DataRow {

    private int rowIndex = -1;
    private DataColumnCollection columns;

    private DataTable table;

    private Map<String, Object> itemMap = new LinkedHashMap<String, Object>();

    public DataRow() {

    }

    public DataRow(DataTable table) {
        this.table = table;
    }

    public int getRowIndex() {
        return rowIndex;
    }

    public DataTable getTable() {
        return this.table;
    }

    /**
     * @param columns
     */
    public void setColumns(DataColumnCollection columns) {
        this.columns = columns;
    }

    /**
     * @return the columns
     */
    public DataColumnCollection getColumns() {
        return columns;
    }

    public void setValue(int index, Object value) {
        setValue(this.columns.get(index), value);
    }

    public void setValue(String columnName, Object value) {
        setValue(this.columns.get(columnName), value);
    }

    public void setValue(DataColumn column, Object value) {
        if (column != null) {
            getItemMap().put(column.getColumnName(), column.convertTo(value));
        }
    }

    public Object getValue(int index) {
        String colName = this.columns.get(index).getColumnName();
        return this.getItemMap().get(colName);
    }

    public Object getValue(String columnName) {
        return this.getItemMap().get(columnName);
    }
    
    public String getValueAsString(String columnName){
    	Object res = getValue(columnName);
    	
    	if (res == null) return null;
    	
    	return res.toString();
    }
    
    public String getValueAsString(int index)
    {
    	Object res = getValue(index);
    	if (res == null) return null;
    	return res.toString();
    }

    /**
     * @return the itemMap
     */
    public Map<String, Object> getItemMap() {
        return itemMap;
    }

    /**
     * @param rowIndex
     */
    public void setRowIndex(int rowIndex) {
        this.rowIndex = rowIndex;
    }

    public void copyFrom(DataRow row) {
        this.itemMap.clear();
        for (Object c : this.columns) {
            this.itemMap.put(c.toString(), row.getValue(c.toString()));
        }
    }

    public String valueToString() {
        String result = "$$";
        for (DataColumn column : this.getColumns()) {
            result += this.itemMap.get(column.getColumnName());
            result += "$$";
        }
        return result.substring(0, result.length() - 2);
    }

    public void parseString(String inputString) {
        String[] values = inputString.split("$$");
        itemMap.clear();
        if (values.length == this.getColumns().size()) {
            int i = 0;
            for (DataColumn dc : columns) {
                itemMap.put(dc.getColumnName(), values[i]);
                i++;
            }
        }
    }

    public String toString() {
        if (this.getTable().getPrimeKey() != null && this.getTable().getPrimeKey().getKeyColumns().size() > 0) { return getTable().getPrimeKey().getKeyString(this); }
        return this.getItemMap().toString();
    }
}
