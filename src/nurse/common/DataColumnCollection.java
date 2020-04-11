package nurse.common;

import java.util.Collection;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.ListIterator;
import java.util.Vector;

public class DataColumnCollection implements List<DataColumn> {
    // key鍊间负鍒楀ご灏忓啓锛寁alue涓鸿鍒楁墍澶勭殑浣嶇疆
    private LinkedHashMap<String, DataColumn> nameMap;
    // 瀛樻斁DataColumn瀵硅薄
    private List<DataColumn> columns;

    /**
     * 鍒涘缓涓�涓柊鐨勫疄渚� DataColumnCollection.
     * 
     * @param table
     */
    public DataColumnCollection() {
        this.nameMap = new LinkedHashMap<String, DataColumn>();
        this.columns = new Vector<DataColumn>();
    }

    /**
     * 鍔熻兘鎻忚堪锛� 鏍规嵁鍒楀悕鍙栧緱璇ュ垪鍚嶆墍澶勭殑鍒椾綅缃�
     * 
     * @param
     * @return: int
     */
    public int getColumnIndex(String columnName) {
        if (this.nameMap.containsKey(columnName.toLowerCase().trim())) {
            DataColumn column = nameMap.get(columnName.toLowerCase());
            return column.getColumnIndex();
        }
        return -1;
    }

    /**
     * 鍔熻兘鎻忚堪锛� 杩斿洖DataTable鐨勫疄闄呭垪鏁�
     * 
     * @param
     * @return: int
     */
    public int size() {
        return this.columns.size();
    }

    /**
     * 鍔熻兘鎻忚堪锛� 娓呯┖columns鍜宯ameMap
     * 
     * @param
     * @return: void
     */
    public void clear() {
        this.columns.clear();
        this.nameMap.clear();
    }

    /**
     * 鍔熻兘鎻忚堪锛� 缁檆olumns鍔犲叆涓�鍒�
     * 
     * @param
     * @return: boolean
     */
    public boolean add(DataColumn column) {
        // 鍒ゆ柇鎸囧畾鍒楁槸鍚﹀凡瀛樺湪
        if (!this.nameMap.containsKey(column.getColumnName().toLowerCase())) {
            column.setColumnIndex(this.columns.size());
            boolean res = this.columns.add(column);
            this.nameMap.put(column.getColumnName().toLowerCase(), column);
            return res;
        }
        return false;
    }

    /**
     * 鍔熻兘鎻忚堪锛� 鍦ㄦ寚瀹氫綅缃� 缁檆olumns鍔犲叆涓�鍒楀苟鍚屾椂淇敼鎵�瀵瑰簲鐨刵ameMap闆嗗悎
     * 
     * @param index
     * @param dataColumn
     * @return: void
     */
    public void add(int index, DataColumn column) {

        if (!this.nameMap.containsKey(column.getColumnName().toLowerCase())) {
            this.columns.add(index, column);
            column.setColumnIndex(index);
            this.nameMap.put(column.getColumnName().toLowerCase(), column);
        }
        for (int i = index + 1; i < this.columns.size(); i++) {
            DataColumn dataColumn = this.columns.get(i);
            dataColumn.setColumnIndex(dataColumn.getColumnIndex() + 1);
            this.columns.set(i, dataColumn);
        }
    }

    public boolean addDataColumn(int index, DataColumn column) {

        if (!this.nameMap.containsKey(column.getColumnName().toLowerCase())) {
            this.columns.add(index, column);
            column.setColumnIndex(index);
            this.nameMap.put(column.getColumnName().toLowerCase(), column);

            for (int i = index + 1; i < this.columns.size(); i++) {
                DataColumn dataColumn = this.columns.get(i);
                dataColumn.setColumnIndex(dataColumn.getColumnIndex() + 1);
                this.columns.set(i, dataColumn);
            }
            return true;
        }
        return false;
    }

    public boolean remove(DataColumn column) {
        boolean res = false;
        if (this.nameMap.containsKey(column.getColumnName().toLowerCase())) {
            res = this.columns.remove(column);
            this.nameMap.remove(column.getColumnName().toLowerCase());
        }
        return res;
    }

    public DataColumn remove(int index) {
        DataColumn column = this.get(index);

        if (this.nameMap.containsKey(column.getColumnName().toLowerCase())) {
            {
                this.nameMap.remove(column.getColumnName().toLowerCase());
                return this.columns.remove(index);
            }
        }
        return null;
    }

    /**
     * 鍔熻兘鎻忚堪锛� 鏍规嵁鍒楀悕鍒犻櫎columns鐨勬寚瀹氬垪鏁版嵁
     * 
     * @param
     * @return: DataColumn
     */
    public void remove(String columnName) {
        int tempIndex = getColumnIndex(columnName.toLowerCase());
        if (tempIndex > -1) {
            remove(tempIndex);
        }
    }

    /**
     * 鍔熻兘鎻忚堪锛� 寰楀埌鎸囧畾鍒椾綅缃暟鎹�
     * 
     * @param
     * @return: DataColumn
     */
    public DataColumn get(int index) {
        return this.columns.get(index);
    }

    /**
     * 鍔熻兘鎻忚堪锛� 寰楀埌鎸囧畾鍒楀悕绉扮殑鏁版嵁
     * 
     * @param
     * @return: DataColumn
     */
    public DataColumn get(String columnName) {
        if (this.nameMap.containsKey(columnName.toLowerCase())) return this.nameMap.get(columnName.toLowerCase());
        return null;
    }

    @Override
    public boolean isEmpty() {
        return this.columns.isEmpty();
    }

    @Override
    public boolean contains(Object o) {
        return this.columns.contains(o);
    }

    @Override
    public Iterator<DataColumn> iterator() {
        return this.columns.iterator();
    }

    @Override
    public Object[] toArray() {
        return this.columns.toArray();
    }

    @Override
    public <T> T[] toArray(T[] a) {
        return this.columns.toArray(a);
    }

    @Override
    public boolean remove(Object o) {
        return this.columns.remove(o);
    }

    @Override
    public boolean containsAll(Collection<?> c) {
        return this.columns.containsAll(c);
    }

    @Override
    public boolean addAll(Collection<? extends DataColumn> c) {
        return this.columns.addAll(c);
    }

    @Override
    public boolean addAll(int index, Collection<? extends DataColumn> c) {
        return this.columns.addAll(index, c);
    }

    @Override
    public boolean removeAll(Collection<?> c) {
        return this.columns.removeAll(c);
    }

    @Override
    public boolean retainAll(Collection<?> c) {
        return this.columns.retainAll(c);
    }

    @Override
    public DataColumn set(int index, DataColumn element) {
        return this.columns.set(index, element);
    }

    @Override
    public int indexOf(Object o) {
        return this.columns.indexOf(o);
    }

    @Override
    public int lastIndexOf(Object o) {
        return this.columns.lastIndexOf(o);
    }

    @Override
    public ListIterator<DataColumn> listIterator() {
        return this.columns.listIterator();
    }

    @Override
    public ListIterator<DataColumn> listIterator(int index) {
        return this.columns.listIterator(index);
    }

    @Override
    public List<DataColumn> subList(int fromIndex, int toIndex) {
        return this.columns.subList(fromIndex, toIndex);
    }

    public DataColumn addColumn(String columnName, int dataType) throws Exception {
        DataColumn col = new DataColumn(columnName, dataType);
        col.setCaptionName(columnName);
        if (this.add(col)) return col;
        if (contains(columnName)) throw new Exception("already has column," + columnName);
        return null;
    }

    public DataColumn addColumn(int index, String columnName, int dataType) throws Exception {
        DataColumn col = new DataColumn(columnName, dataType);
        col.setCaptionName(columnName);
        if (this.addDataColumn(index, col)) return col;
        if (contains(columnName)) throw new Exception("already has column," + columnName);
        return null;
    }

    public boolean contains(String columnName) {
        return this.nameMap.containsKey(columnName.toLowerCase());
    }
}
