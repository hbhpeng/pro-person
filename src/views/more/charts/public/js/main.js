// 获取DOM元素
const userInput = document.getElementById("user-input");
const submitButton = document.getElementById("submit-button");
const loadingAnimation = document.getElementById("loading-animation");
const chartContainer = document.getElementById("chart-container");

// 初始化ECharts实例
const chart = echarts.init(chartContainer);

// 为表单添加事件监听器
document.getElementById("chart-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  userInput.disabled = true;
  submitButton.disabled = true;
  loadingAnimation.style.display = "block";

  const prompt =`${userInput.value}`;
  console.log(prompt);
  const response = await fetch("/api/generate-chart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  // console.log(data);
  userInput.disabled = false;
  submitButton.disabled = false;
  loadingAnimation.style.display = "none";

  if (data.success) {
    // 清除上一次渲染的图表内容
    chart.clear();
    
    // 使用新的图表配置渲染图表
    chart.setOption(JSON.parse(data.chartConfig));
  } else {
    alert("Error generating chart configuration. Please try again.");
  }
});
