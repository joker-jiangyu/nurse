package nurse.common;

import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

public class DataSet implements Collection<DataTable> {

	private String name;

	private List<DataTable> tables;	

	public List<DataTable> getDataTables() {
		return this.tables;
	}

	public DataSet() {
		if (tables == null) {
			tables = new Vector<DataTable>();
		}
	}

	public DataSet(String name) {
		this();
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void addDataTable(DataTable dtb) {
		this.tables.add(dtb);
	}

	public DataTable getDataTable(int index) {
		return this.tables.get(index);
	}

	public DataTable getDataTable(String tableName) {
		for (DataTable table : tables) {
			if (table != null && table.getTableName().equals(tableName))
				return table;
		}
		return null;
	}

	public void RemoveDataTable(String tableName) {
		int i = -1;
		for (DataTable table : tables) {
			if (table != null && table.getTableName().equals(tableName))
				i++;
		}
		if (i > -1)
			RemoveDataTable(i);

	}

	public void RemoveDataTable(int tableIndex) {
		tables.remove(tableIndex);
	}

	public int size() {
		return this.tables.size();
	}

	@Override
	public boolean isEmpty() {
		return tables.isEmpty();
	}

	@Override
	public boolean contains(Object o) {
		return tables.contains(o);
	}

	@Override
	public Iterator<DataTable> iterator() {
		return tables.iterator();
	}

	@Override
	public Object[] toArray() {
		return tables.toArray();
	}

	@Override
	public <T> T[] toArray(T[] a) {
		return tables.toArray(a);
	}

	@Override
	public boolean add(DataTable e) {
		return tables.add(e);
	}

	@Override
	public boolean remove(Object o) {
		return tables.remove(o);
	}

	@Override
	public boolean containsAll(Collection<?> c) {
		return tables.containsAll(c);
	}

	@Override
	public boolean addAll(Collection<? extends DataTable> c) {
		return tables.addAll(c);
	}

	@Override
	public boolean removeAll(Collection<?> c) {
		return tables.removeAll(c);
	}

	@Override
	public boolean retainAll(Collection<?> c) {
		return tables.retainAll(c);
	}

	@Override
	public void clear() {
		tables.clear();
	}

	public static DataSet fromCallableStatement(CallableStatement stmt) {
		
		DataSet ds = new DataSet();
		
		Boolean hasMore = true;
		 
		 //Loop through the available result sets.
	     while (hasMore) {
	           ResultSet rs;
			try {
				
				rs = stmt.getResultSet();
		        ds.add(DataTable.fromResultSet(rs));  
		        
		        //Check for next result set
		        hasMore = stmt.getMoreResults();
		        
			} catch (SQLException e) {
				e.printStackTrace();
			}
	      } 
	     
		return ds;
	}
}
