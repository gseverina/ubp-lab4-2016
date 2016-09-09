package ubp.lab4.imgproc.worker;

public class JobEntity {
    public String resultImageUrl;
    public String status;

    public JobEntity(String resultImageUrl, String status) {
        this.resultImageUrl = resultImageUrl;
        this.status = status;
    }
}
