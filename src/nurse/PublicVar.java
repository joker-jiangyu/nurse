package nurse;

import java.io.File;
import java.util.concurrent.ConcurrentHashMap;

public class PublicVar {

	public static File WebRoot;
	public static ConcurrentHashMap<String, Object> Cache = new ConcurrentHashMap<String, Object>();
}
