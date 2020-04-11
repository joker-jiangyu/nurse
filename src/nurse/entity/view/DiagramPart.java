package nurse.entity.view;

public class DiagramPart {
    public String id;
    public String type;
    public String left;
    public String top;
    public String width;
    public String height;
    public String zIndex;
    public String options;

    public String toString(){
        return String.format("Id:%s, Type:%s, Left:%s, Top:%s, Width:%s, Height:%s, z-index:%s, Options:%s",
                id,type,left,top,width,height,zIndex,options);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLeft() {
        return left;
    }

    public void setLeft(String left) {
        this.left = left;
    }

    public String getTop() {
        return top;
    }

    public void setTop(String top) {
        this.top = top;
    }

    public String getWidth() {
        return width;
    }

    public void setWidth(String width) {
        this.width = width;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public String getzIndex() {
        return zIndex;
    }

    public void setzIndex(String zIndex) {
        this.zIndex = zIndex;
    }

    public String getOptions() {
        return options;
    }

    public void setOptions(String options) {
        this.options = options;
    }
}
