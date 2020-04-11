package nurse.job;

public class NurseJob {
	public long delay = 0;
	public long period = 0;
	
	public NurseJob(long delay, long period){
		this.delay = delay;
		this.period = period;
	}

	public void work(){
		
	}
	
	public Runnable getRunner() {
		return new Runnable() {
            public void run() { 
            	work(); 
            }
        };
	}
}
