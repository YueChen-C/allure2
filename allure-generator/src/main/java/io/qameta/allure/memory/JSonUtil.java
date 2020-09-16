package io.qameta.allure.memory;
/*********************************************/

import java.util.List;

class MemoryData {
    private String date= "";
    private double num=0;
    public MemoryData() {
        /**JSON串转为Java对象时调用无惨构造函数*/
    }

    public double getNum() {
        return num;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setNum(double num) {
        this.num = num;
    }
}

class Devices {
    private List<MemoryData> Data = null;
    private double Average= 0;

    public double getAverage() {
        return Average;
    }

    public void setAverage(double average) {
        Average = average;
    }

    public List<MemoryData> getData() {
        return Data;
    }
    public void setData(List<MemoryData> data) {
        this.Data = data;
    }

}

class PerformanceUtil{
    private String type = "";
    private String unit = "";
    private Object data=null;

    public void setData(Object data) {
        this.data = data;
    }

    public Object getData() {
        return data;
    }

    public String getType() {
        return type;
    }

    public String getUnit() {
        return unit;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
