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
        final Path filePath = outputDirectory.resolve(Constants.WIDGETS_DIR).resolve("memory-trend.json");
        try {
            if (!Performance.isEmpty()){
                FileWriter fw = new FileWriter(String.valueOf(filePath), true);
                BufferedWriter bw = new BufferedWriter(fw);
                ObjectMapper objectMapper = new ObjectMapper();
                String jsonStr = objectMapper.writeValueAsString(Performance);
                bw.write(String.valueOf(jsonStr));
                bw.close();
                fw.close();
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
        Map<String, Object> Performance = new HashMap<>();
        for (Path file1 : files) {
            ArrayList<Object> memoryData =new ArrayList<Object>();
            if (String.valueOf(file1.getFileName()).contains("performance")) {
                BufferedReader bufferedReader = new BufferedReader(new FileReader(String.valueOf(file1)));
                String str = null;
                double memory = 0;
                int index=0;
                Map<String, Object> tempMemory = new HashMap<>();

                while (true) {
                    try {
                        if ((str = bufferedReader.readLine()) == null) break;

                        ObjectMapper om = new ObjectMapper();
                        JsonNode root = om.readTree(str);
                        root.path("date");
                        memory = memory + root.path("memory").asDouble();
                        memoryData.add(root);
                        index+=1;
                    } catch (IOException e) {
                        LOGGER.error("生成性能报告错误",e);
                    }
                }
                tempMemory.put("memoryData",memoryData);
                tempMemory.put("average",memory/index);

                String name = String.valueOf(file1.getFileName()).replaceAll(".txt", "");
                name = name.replaceAll("performance-", "");
                Performance.put(name, tempMemory);
            }
        }

        return Performance;
    }


}
