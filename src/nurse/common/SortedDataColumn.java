package nurse.common;

public class SortedDataColumn {
	private DataColumn column;

	private SortType sortType;

	/**  
	 * @param column
	 */
	public void setColumn(DataColumn column) {
		this.column = column;
	}

	/**  
	 * @return  the column   
	*/
	public DataColumn getColumn() {
		return column;
	}

	/**  
	 * @param sortType
	 */
	public void setSortType(SortType sortType) {
		this.sortType = sortType;
	}

	/**  
	 * @return  the sortType   
	*/
	public SortType getSortType() {
		return sortType;
	}

}
