package io.qameta.allure.memory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.qameta.allure.Aggregator;
import io.qameta.allure.Constants;
import io.qameta.allure.Reader;
import io.qameta.allure.core.Configuration;
import io.qameta.allure.core.LaunchResults;
import io.qameta.allure.core.ResultsVisitor;
import io.qameta.allure.plugin.DefaultPluginLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RetryMemoryPlugin implements Aggregator, Reader {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultPluginLoader.class);

    private Map<String, Object>  Performance = new HashMap<>();

    @Override
    public void aggregate(Configuration configuration, List<LaunchResults> launchesResults, Path outputDirectory) throws IOException {
//        final Path dataFolder = Files.createDirectories(outputDirectory.resolve("data")); //  将数据保存至生成的html报告位置
        try {
            if (!Performance.isEmpty()){
                for(String key : Performance.keySet()){
                    final Path filePath = outputDirectory.resolve(Constants.WIDGETS_DIR).resolve(key+"-trend.json");
                    FileWriter fw = new FileWriter(String.valueOf(filePath), true);
                    BufferedWriter bw = new BufferedWriter(fw);
                    ObjectMapper objectMapper = new ObjectMapper();
                    String jsonStr = objectMapper.writeValueAsString(Performance.get(key));
                    bw.write(String.valueOf(jsonStr));
                    bw.close();
                    fw.close();

                }
            }
        } catch (Exception e) {
            // TODO Auto-generated catch block
            LOGGER.error("生成性能报告错误",e);
        }

    }

    @Override
    public void readResults(Configuration configuration, ResultsVisitor visitor, Path directory) {
        try {
            DirectoryStream<Path> stream  = Files.newDirectoryStream(directory); // 读取原始报告目录的所有文件，解析 py 生成的文件
            Performance =  getPerformance(stream);
        } catch (IOException e) {
            LOGGER.error("读取性能数据错误",e);
        }

    }


    static Map<String, Object> getPerformance(DirectoryStream<Path> files) throws FileNotFoundException {
        Map<String, Object> Performance = new HashMap<>(); // {cpu:{},memory:{}}
        Map<String, Object> memoryPerformance = new HashMap<>();
        Map<String, Object> cpuPerformance = new HashMap<>();
        for (Path file1 : files) {
            List<MemoryData> memoryData=new ArrayList<MemoryData>();
            List<MemoryData> cpuData=new ArrayList<MemoryData>();
            if (String.valueOf(file1.getFileName()).contains("performance")) {
                BufferedReader bufferedReader = new BufferedReader(new FileReader(String.valueOf(file1)));
                String str = null;
                double memory = 0;
                double cpu=0;
                int index=0;
                while (true) {
                    try {
                        if ((str = bufferedReader.readLine()) == null) break;
                        ObjectMapper om = new ObjectMapper();
                        JsonNode root = om.readTree(str);
                        MemoryData mData=new MemoryData();
                        mData.setDate(root.path("date").asText());
                        mData.setNum(root.path("memory").asDouble());

                        MemoryData cData=new MemoryData();
                        cData.setDate(root.path("date").asText());
                        cData.setNum(root.path("cpu").asDouble());


                        memory = memory + root.path("memory").asDouble();
                        cpu = cpu + root.path("cpu").asDouble();
                        memoryData.add(mData);
                        cpuData.add(cData);

                        index+=1;
                    } catch (IOException e) {
                        LOGGER.error("生成性能报告错误",e);
                    }
                }
                Devices mDevices=new Devices();
                mDevices.setData(memoryData);
                mDevices.setAverage(memory/index);

                Devices cDevices=new Devices();
                cDevices.setData(cpuData);
                cDevices.setAverage(cpu/index);

                String name = String.valueOf(file1.getFileName()).replaceAll(".txt", "");
                name = name.replaceAll("performance-", "");
                memoryPerformance.put(name, mDevices);
                cpuPerformance.put(name, cDevices);
            }
        }
        PerformanceUtil memory =new PerformanceUtil();
        memory.setData(memoryPerformance);
        memory.setType("Memory");
        memory.setUnit("MB");

        PerformanceUtil cpu =new PerformanceUtil();
        cpu.setData(cpuPerformance);
        cpu.setType("Cpu");
        cpu.setUnit("%");

        Performance.put("memory",memory);
        Performance.put("cpu",cpu);
        return Performance;
    }


}
