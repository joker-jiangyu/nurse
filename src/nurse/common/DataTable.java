package nurse.common;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

public final class DataTable{

    private DataRowCollection rows; 
    private DataColumnCollection columns;
    private String tableName;
    private String tableLocalName;
    private String dataSourceName;
    private DataKey primeKey = new DataKey();
    private List<DataKey> dataIndexs = new ArrayList<DataKey>();
    private Map<String, Object> tag = new HashMap<String, Object>();
    private static int tableIndex = 0;

    public DataKey getPrimeKey() {
        return primeKey;
    }

    public void setPrimeKey(DataKey primeKey) {
        this.primeKey = primeKey;
    }

    public List<DataKey> getDataIndexs() {
        return dataIndexs;
    }

    public void setDataIndexs(List<DataKey> dataIndexs) {
        this.dataIndexs = dataIndexs;
    }

    public DataTable() {
        this.columns = new DataColumnCollection();
        this.rows = new DataRowCollection();
        this.rows.setColumns(columns);
    }

    public DataTable(String dataTableName) {
        this();
        this.tableName = dataTableName;
    }

    public int getRowCount() {
        return rows.size();
    }

    public String getTableName() {
        return this.tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public DataRowCollection getRows() {
        return this.rows;
    }

    public DataColumnCollection getColumns() {
        return this.columns;
    }

    public Object getValue(int row, String colName) {
        return this.rows.get(row).getValue(colName);
    }

    public Object getValue(int row, int col) {
        return this.rows.get(row).getValue(col);
    }

    public DataRow newRow() throws Exception {
        DataRow tempRow = new DataRow(this);

        int lastRowIndex = 0;
        if (this.rows.size() > 0) {
            lastRowIndex = this.rows.get(this.rows.size() - 1).getRowIndex();
        } else {
            lastRowIndex = 0;
        }

        tempRow.setColumns(this.columns);
        tempRow.setRowIndex(++lastRowIndex);
        return tempRow;
    }

    public void setValue(int row, int col, Object value) {
        this.rows.get(row).setValue(col, value);
    }

    public void setValue(int row, String colName, Object value) {
        this.rows.get(row).setValue(colName, value);
    }

    /**
     * @param tag
     */
    public void setTag(String name, Object value) {
        this.tag.put(name, value);
    }

    /**
     * @return the tag
     */
    public Object getTag(String name) {
        return tag.get(name);
    }

    public DataColumn addColumn(String columnName, int dataType) throws Exception {
        return this.columns.addColumn(columnName, dataType);
    }

    public DataColumn addColumnIndex(int index, String columnName, int dataType) throws Exception {
        return this.columns.addColumn(index, columnName, dataType);
    }

    public boolean addRow(DataRow row) throws Exception {
        if (this.rows.size() > 0) {
            row.setRowIndex(this.rows.get(this.rows.size() - 1).getRowIndex() + 1);
        } else {
            row.setRowIndex(1);
        }
        return this.rows.add(row);
    }

	private static Date strToDate(String strDate) {
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		ParsePosition pos = new ParsePosition(0);
		Date strtodate = formatter.parse(strDate, pos);
		return strtodate;
	}
    
    public static int compare(Object a, Object b) {
        if (a == null) return -1;
        if (b == null) return 1;
        try {
            if (Double.valueOf(a.toString()) > Double.valueOf(b.toString())) return 1;
            else if (Double.valueOf(a.toString()) < Double.valueOf(b.toString())) return -1;
            else return 0;
        } catch (Exception ex) {
            try {
                if (strToDate(a.toString()).after(strToDate(b.toString()))) return 1;
                else if (strToDate(a.toString()).equals(strToDate(b.toString()))) return 0;
                else return -1;

            } catch (Exception e) {
                if (a.toString().compareTo(b.toString()) == 0) return 0;
                else if (a.toString().compareTo(b.toString()) > 0) return 1;
                else return -1;
            }
        }
    }
    
    public DataTable sort(DataTable table, DataRow row, List<SortedDataColumn> sort) {
        if (table == null) return null;
        int tagetIndex = 0;
        for (DataRow r : table.rows) {
            int compareResult = 0; 
            tagetIndex++;
            for (SortedDataColumn st : sort) {
                int temp = 0;
                if (st.getSortType() == SortType.DESC) {
                    temp = compare(row.getValue(st.getColumn().getColumnName()), r.getValue(st.getColumn().getColumnName()));
                } else {
                    temp = compare(r.getValue(st.getColumn().getColumnName()), row.getValue(st.getColumn().getColumnName()));
                }
                if (temp < 0) {
                    compareResult = 0;
                    break;
                } else {
                    compareResult = compareResult + temp;
                }
                if (compareResult > 0)
                {
                    tagetIndex--;
                    break;
                }
            }
            if (compareResult > 0) break;
        }
        table.getRows().add(tagetIndex, row);
        return table;
    }

    public DataTable cloneTable() {
        try {
            DataTable table = new DataTable();
            table.setTableName(this.getTableName());
            table.setDataSourceName(this.getDataSourceName());
            table.setTableLocalName(this.getTableLocalName());
            table.setPrimeKey(primeKey);
            table.setDataIndexs(getDataIndexs());
            for (DataColumn dc : this.columns) {
                DataColumn dcc = table.addColumn(dc.getColumnName(), dc.getDataType());
                dcc.setDisplayed(dc.isDisplayed());
            }
            return table;
        } catch (Exception ex) {
            return null;
        }
    }

    public Map<String, Object> getContextMap() {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("table", this);
        for (DataColumn dc : this.getColumns()) {
            map.put(dc.getColumnName().toLowerCase(), dc.getColumnName().toLowerCase());
        }
        return map;
    }

    /**
     * @return the tableLocalName
     */
    public String getTableLocalName() {
        return tableLocalName;
    }

    /**
     * @param tableLocalName
     */
    public void setTableLocalName(String tableLocalName) {
        this.tableLocalName = tableLocalName;
    }

    /**
     * @return the dataSourceName
     */
    public String getDataSourceName() {
        return dataSourceName;
    }

    /**
     * @param dataSourceName
     */
    public void setDataSourceName(String dataSourceName) {
        this.dataSourceName = dataSourceName;
    }
    
    public static DataTable fromResultSet(ResultSet set)
    {
    	return fromResultSet(set,"table" + String.valueOf(tableIndex++));
    }
    
    public static DataTable fromResultSet(ResultSet set, String tableName)
    {
    	try {
    		DataTable dt= new DataTable();
    		
    		buidColumns(set, dt);
    		   		
			List<HashMap<String, Object>> res = getHashMap(set);
			
	        for (int j = 0; j < res.size(); j++) {
	            DataRow row = dt.newRow();
	            
	            HashMap<String, Object> col = res.get(j);
	            for(Entry<String, Object> entry : col.entrySet()) {
	                String colName = entry.getKey();
	                Object value = entry.getValue();
	                
	                row.setValue(colName, value);
	            }
	            
	            dt.addRow(row);
	        }
	        
	        dt.tableName = tableName;
	        
	    	set.close();
	    	
	    	return dt;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}    	
    }
    
	private static void buidColumns(ResultSet set, DataTable dt) {
		try {
			ResultSetMetaData metaData = set.getMetaData();
			int colCount = metaData.getColumnCount();
			for(int i=0; i< colCount; i++)
			{
				dt.addColumnIndex(i, metaData.getColumnName(i+1), metaData.getColumnType(i+1));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}

	private static List<HashMap<String, Object>> getHashMap(ResultSet rs_SubItemType) throws SQLException {
		List<HashMap<String, Object>> row = new ArrayList<HashMap<String, Object>>(); 
		ResultSetMetaData metaData = rs_SubItemType.getMetaData();
		int colCount = metaData.getColumnCount();

		while (rs_SubItemType.next()) {
			HashMap<String, Object> columns = new HashMap<String, Object>();
			for (int i = 1; i <= colCount; i++) {
				columns.put(metaData.getColumnLabel(i), rs_SubItemType.getObject(i));
			}
			
			row.add(columns);
		}
		
		return row;
	}
}
