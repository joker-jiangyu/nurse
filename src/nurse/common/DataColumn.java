package nurse.common;

public class DataColumn {
    private boolean readOnly;

    private DataTable table;

    private String columnName; 

    private String captionName;

    private Object tag;

    private int columnIndex;

    private int dataType;

    //private String dataTypeName;

    private boolean isDisplayed = true; 

    public DataColumn() {
        this("default1");
    }

    public DataColumn(int dataType) {
        this("default1", dataType);
    }

    public DataColumn(String columnName) {
        this(columnName, 0);
    }

    public DataColumn(String columnName, int dataType) {
        this.setDataType(dataType);
        this.columnName = columnName;
    }

    public String getColumnName() {
        return this.columnName;
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
        if (captionName == null || captionName.length() == 0) captionName = columnName;
    }

    public String getCaptionName() {
        return captionName;
    }

    public void setCaptionName(String captionName) {
        this.captionName = captionName;
    }

    public boolean isReadOnly() {
        return this.readOnly;
    }

    public void setReadOnly(boolean readOnly) {
        this.readOnly = readOnly;
    }

    public DataTable getTable() {
        return this.table;
    }

    public void setTable(DataTable table) {
        this.table = table;
    }

    /**
     * @param dataType
     */
    public void setDataType(int dataType) {
        this.dataType = dataType;
    }

    /**
     * @return the dataType
     */
    public int getDataType() {
        return dataType;
    }

    /**
     * @param columnIndex
     */
    public void setColumnIndex(int columnIndex) {
        this.columnIndex = columnIndex;
    }

    /**
     * @return the columnIndex
     */
    public int getColumnIndex() {
        return columnIndex;
    }

    public String getDataTypeName() {
        return DataTypes.getDataTypeName(dataType);
    }

    public Object convertTo(Object value) {
        return value;
    }

    @Override
    public String toString() {
        return this.columnName;
    }

    /**
     * @param tag
     */
    public void setTag(Object tag) {
        this.tag = tag;
    }

    /**
     * @return the tag
     */
    public Object getTag() {
        return tag;
    }

    /**
     * @return the isDisplayed
     */
    public boolean isDisplayed() {
        return isDisplayed;
    }

    /**
     * @param isDisplayed
     */
    public void setDisplayed(boolean isDisplayed) {
        this.isDisplayed = isDisplayed;
    }

}
