package nurse.utility;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.apache.log4j.Logger;

import nurse.common.DataSet;
import nurse.common.DataTable;

public class DatabaseHelper {

	private static Logger log = Logger.getLogger(DatabaseHelper.class);
	private static String url="";
	private static String user="";
	private static String password="";
	
	
	private static Connection conn;

	static {
		// jdbc驱动名称
		String driver = "com.mysql.jdbc.Driver";

		try {
			// 调用Class.forName()方法加载驱动程序
			Class.forName(driver);
		} catch (ClassNotFoundException e1) {
			log.error("can not find MySQL driver!", e1);
		}
		
		init();
		
	}
	
	private Connection getConnection(){
		try {
			if (DatabaseHelper.conn == null || !DatabaseHelper.conn.isValid(0) || DatabaseHelper.conn.isClosed())
			{
				init();
				log.warn("create con of sql");
			}
		} catch (SQLException e) {
			init();
			e.printStackTrace();
		}
		
		return DatabaseHelper.conn;

	}

	private static void init() {
		closeConnection();
		//read mysql settings from mainconfig.xml
		String mysqlcon = MainConfigHelper.getConfig().mySql;
		String[] ss=mysqlcon.split("\\|");
		url = ss[0];
		user= ss[1];
		password = ss[2];		

		// 调用DriverManager对象的getConnection()方法，获得一个Connection对象
		try {
			// 连接数据库
			conn = DriverManager.getConnection(url, user, password);

			if (conn.isClosed()) {
				conn.close();
				conn = null;
			}

		} catch (SQLException e1) {
			log.error("fail to connect to database.", e1);
		}
	}

	public DatabaseHelper() {
		//init();
	}

	public void close(){
		
	}
	
	private static void closeConnection() {
		if (conn != null) {
			try {
				conn.close();
			} catch (SQLException e) {
				log.error("can not close connection", e);
			}
		}

		conn = null;
	}

	public int executeNoQuery(String sql) {
		try {
			Statement stat = getConnection().createStatement(); // 创建Statement对象new
			int res = stat.executeUpdate(sql);
			stat.close();
			return res;
		} catch (SQLException e) {
			log.error("fail to executeNoQuery", e);
			return -1;
		}
	}

	public Object executeScalar(String sql) {
		DataTable dt = executeToTable(sql);

		if (dt.getRowCount() == 1) {
			// 如果记录集不是只有唯一一条，则认为违反了Scalar的精神，返回空
			return dt.getRows().get(0).getValue(0);
		}

		return null;
	}
	
	public Object executeScalar(CallableStatement stat) {
		
		DataTable dt = executeQuery(stat);

		if (dt.getRowCount() == 1) {
			// 如果记录集不是只有唯一一条，则认为违反了Scalar的精神，返回空
			return dt.getRows().get(0).getValue(0);
		}

		return null;
	}

	public CallableStatement prepareProcedure(String procedureName)
	{
		return prepareProcedure(procedureName,"");
	}
	
	public CallableStatement prepareProcedure(String procedureName, String params) {
		try {
			String cmd = "{call " + procedureName + "(" + params  + ")}";
			CallableStatement stat = getConnection().prepareCall(cmd);

			return stat;
		} catch (SQLException e) {
			log.error("fail to prepareStatement", e);
			return null;
		}
	}

	// one result set
	public DataTable executeQuery(CallableStatement stat) {
		try {
			ResultSet res = stat.executeQuery();
			DataTable dt = DataTable.fromResultSet(res);
			stat.close();
			return dt;
		} catch (SQLException e) {
			log.error("fail to executeQuery", e);
			return null;
		}
	}

	// multiple result set
	public DataSet execute(CallableStatement stat) {
		try {
			Boolean res = stat.execute();
			
			DataSet ds = new DataSet();
			
			if (res) {
				ds = DataSet.fromCallableStatement(stat); 
			}
			stat.close();

			return ds;
			
		} catch (SQLException e) {
			log.error("fail to execute", e);
			return null;
		}
	}

	public DataTable executeToTable(String sql) {
		try {
			Statement stat = getConnection().createStatement(); // 创建Statement对象new
			ResultSet res = stat.executeQuery(sql);
			DataTable dt = DataTable.fromResultSet(res); 
			stat.close();
			return dt;
		} catch (SQLException e) {
			log.error("fail to executeResultSet", e);
			return null;
		}
	}

}
