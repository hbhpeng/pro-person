const params = new URLSearchParams(window.location.search)
const token = params.get('chartauth')
// 获取DOM元素
const userInput = document.getElementById("user-input");
const submitButton = document.getElementById("submit-button");
const loadingAnimation = document.getElementById("loading-animation");
const chartContainer = document.getElementById("chart-container");

function createTabOptions(nums) {
		var tab = document.querySelector('.tab');
		var ul = tab.querySelector('ul');
		ul.innerHTML = ''

		// 动态生成选项卡
		for (var i = 0; i < nums; i++) {
			var li = document.createElement('li');
			li.innerText = '图表'+(i+1);
			ul.appendChild(li);
		}

		var lis = ul.querySelectorAll('li');
		// 绑定点击事件到所有选项卡上
		for (var i = 0; i < lis.length; i++) {
		  lis[i].addEventListener('click', tabClick);
		}

		lis[0].classList.add('active');
}

// 点击选项卡的事件处理函数
function tabClick(event) {
	var tab = document.querySelector('.tab');
	var ul = tab.querySelector('ul');
	var lis = ul.querySelectorAll('li');
	for (var i = 0; i < lis.length; i++) {
		lis[i].classList.remove('active');
		if (lis[i] === event.target) {
			chartConfigData = chartConfigs[i];
		}
	}
	event.target.classList.add('active');
	// 清除上一次渲染的图表内容
	chart.clear();
	// 使用新的图表配置渲染图表
	chart.setOption(JSON.parse(chartConfigData));
}

function parseJsonData(data) {
	let jsData
	try {
		jsData = JSON.parse(data)
	}
	catch(error) {
		jsData = eval("(" + data + ")")
	}
	return jsData
}



// 初始化ECharts实例
const chart = echarts.init(chartContainer);
let chartConfigData;
let chartConfigs;

// 为表单添加事件监听器
document.getElementById("chart-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  userInput.disabled = true;
  submitButton.disabled = true;
  loadingAnimation.style.display = "block";

  const prompt =`${userInput.value}`;
  const response = await fetch("/api/generate-chart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
			"usertoken": token,
    },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  // console.log(data);
  userInput.disabled = false;
  submitButton.disabled = false;
  loadingAnimation.style.display = "none";

  if (data.success) {
		const index = data.chartConfig.indexOf('{')
		if (index > 0) {
			data.chartConfig = data.chartConfig.slice(index)
		}
		chartConfigs = data.chartConfig.split('@123456789')
		if (chartConfigs.length > 0) {
			chartConfigData = chartConfigs[0]
		}
		createTabOptions(chartConfigs.length)
    // 清除上一次渲染的图表内容
    chart.clear();

    // 使用新的图表配置渲染图表
    chart.setOption(parseJsonData(chartConfigData));
  } else {
    alert("Error generating chart configuration. Please try again.");
  }
});
