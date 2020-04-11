package nurse.utility;


import nurse.entity.view.DiagramPart;

public class ControlAdaptiveHelper {
    private double sideMenuWidth = 200;
    private double topBarHeight = 54;
    private double screenDefaultWidth = 1280;
    private double screenDefaultHeight = 1024;
    private double bootstrapCollapseScreenWidth = 768;

    private double screenWidth = 1920;
    private double screenHeight = 1080;
    private double innerWidth = 1920;
    private double innerHeight = 969;

    private static ControlAdaptiveHelper instance = new ControlAdaptiveHelper();
    public static ControlAdaptiveHelper getInstance() {
        return instance;
    }

    public void initDefault(double width,double height,double innerWidth,double innerHeight){
        this.screenWidth = width;
        this.screenHeight = height;
        this.innerWidth = innerWidth;
        this.innerHeight = innerHeight;
    }

    public void initDefault(String ver,double width,double height,double innerWidth,double innerHeight){
        this.screenWidth = width;
        this.screenHeight = height;
        this.innerWidth = innerWidth;
        this.innerHeight = innerHeight;

        initSize(ver);
    }

    public DiagramPart initPart(DiagramPart part){
        //initSize(ver);

        part.left = posX(part.left);
        part.top = posY(part.top);
        part.width = String.valueOf(getRealX(part.width));
        part.height = String.valueOf(getRealY(part.height));

        return part;
    }


    private void initSize(String versions){
        //versions = iView
        if(versions.equals("iView")){
            sideMenuWidth = 150;
            topBarHeight = 102;
            bootstrapCollapseScreenWidth = 768;
            screenDefaultHeight = 1080 - topBarHeight;
            screenDefaultWidth = getIViewScreenWidth() - sideMenuWidth;
            if(screenWidth > 1280){
                sideMenuWidth = sideMenuWidth + (getBlankWidth() / 2);
            }else{
                //微调偏差
                screenDefaultHeight -= 70;
                screenDefaultWidth += 30;
            }
        }
    }

    private double getRealScreenWidth() {
        return screenWidth;
        //return window.innerWidth;
    }

    private double getRealScreenHeight() {
        return screenHeight;
        //return window.innerHeight;
    }

    private double getRealX(String relativeX) {
        double rX = Double.parseDouble(relativeX);
        return (rX / screenDefaultWidth) * getRealScreenWidth();
    }

    private double getDefaultX(double absoluteX) {
        double rX = absoluteX;
        return (rX / getRealScreenWidth()) * screenDefaultWidth;
    }

    private double getRealY(String relativeY) {
        double rY = Double.parseDouble(relativeY);
        return (rY / screenDefaultHeight) * getRealScreenHeight();
    }

    private double getDefaultY(double absoluteY) {
        double rY = absoluteY;
        return (rY / getRealScreenHeight()) * screenDefaultHeight;
    }

    private String posX(String relativeX) {
        double rX = getRealX(relativeX);

        if (getRealScreenWidth() > bootstrapCollapseScreenWidth) {
            return String.valueOf(rX + sideMenuWidth);
        } else {
            return String.valueOf(rX);
        }
    }

    private double fromPosX(double absoluteX) {
        double rX = absoluteX;

        if (getRealScreenWidth() > bootstrapCollapseScreenWidth) {
            rX = rX - sideMenuWidth;
        }

        return getDefaultX(rX);
    }

    private String posY(String relativeY) {
        double rY = getRealY(relativeY);
        return String.valueOf(rY + topBarHeight);
    }

    private double fromPosY(double absoluteY) {
        double rY = absoluteY - topBarHeight;
        return getDefaultY(rY);
    }

    //宽屏模式，IView宽屏
    private double getIViewScreenWidth(){
        if(screenWidth <= 1280) return screenWidth;
        double height = innerHeight;
        double per = height / 800;
        double width = per * 1280;
        return width;
    }
    //宽屏模式，两边空白宽度
    private double getBlankWidth(){
        return innerWidth - getIViewScreenWidth();
    }
}
