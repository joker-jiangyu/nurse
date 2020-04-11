package nurse.common;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

public class DataRowCollection implements List<DataRow> {

	List<DataRow> dataRows = new ArrayList<DataRow>();

	private DataColumnCollection columns;

	DataRowCollection() {
	}

	public int size() {
		return this.dataRows.size();
	}

	public void clear() {
		this.dataRows.clear();
	}

	public boolean add(DataRow row) {
		return this.dataRows.add(row);
	}

	public boolean remove(DataRow row) {
		if (this.dataRows.contains(row)) {
			this.dataRows.remove(row);
		}
		return false;
	}

	public DataRow remove(int index) {
		if (this.dataRows.size() >= index)
			return this.dataRows.remove(index);
		return null;
	}

	public DataRow get(int index) {
		if (this.dataRows.size() > index)
			return this.dataRows.get(index);
		return null;
	}

	/**  
	 * @param columns
	 */
	public void setColumns(DataColumnCollection columns) {
		this.columns = columns;
	}

	/**  
	 * @return  the columns   
	*/
	public DataColumnCollection getColumns() {
		return columns;
	}

	@Override
	public boolean isEmpty() {
		return this.dataRows.isEmpty();
	}

	@Override
	public boolean contains(Object o) {
		return this.dataRows.contains(o);
	}

	@Override
	public Iterator<DataRow> iterator() {
		return this.dataRows.iterator();
	}

	@Override
	public Object[] toArray() {
		return this.dataRows.toArray();
	}

	@Override
	public <T> T[] toArray(T[] a) {
		return this.dataRows.toArray(a);
	}

	@Override
	public boolean remove(Object o) {
		return this.dataRows.remove(o);
	}

	@Override
	public boolean containsAll(Collection<?> c) {
		return this.dataRows.containsAll(c);
	}

	@Override
	public boolean addAll(Collection<? extends DataRow> c) {
		return this.dataRows.addAll(c);
	}

	@Override
	public boolean addAll(int index,
			Collection<? extends DataRow> c) {
		return this.dataRows.addAll(index, c);
	}

	@Override
	public boolean removeAll(Collection<?> c) {
		return this.dataRows.removeAll(c);
	}

	@Override
	public boolean retainAll(Collection<?> c) {
		return this.dataRows.retainAll(c);
	}

	@Override
	public DataRow set(int index,
			DataRow element) {
		return this.dataRows.set(index, element);
	}

	@Override
	public void add(int index,
			DataRow element) {
		this.dataRows.add(index, element);

	}

	@Override
	public int indexOf(Object o) {
		return this.dataRows.indexOf(o);
	}

	@Override
	public int lastIndexOf(Object o) {
		return this.dataRows.lastIndexOf(o);
	}

	@Override
	public ListIterator<DataRow> listIterator() {
		return this.dataRows.listIterator();
	}

	@Override
	public ListIterator<DataRow> listIterator(int index) {
		return this.dataRows.listIterator(index);
	}

	@Override
	public List<DataRow> subList(int fromIndex,
			int toIndex) {
		return this.dataRows.subList(fromIndex, toIndex);
	}

}
