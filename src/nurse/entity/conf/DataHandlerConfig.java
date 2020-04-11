package nurse.entity.conf;

public class DataHandlerConfig {

	public String Namespace;
	public String ClassName;
	
	public DataHandlerConfig(String ns, String cls) {
		this.Namespace = ns;
		this.ClassName = cls;
	}
	
	public DataHandlerConfig() {
	}
}
