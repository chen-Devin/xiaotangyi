/**
 * Created by Administrator on 2017/7/12.
 */

//环形图 患者检测统计
function leftEchartPie(newData) {
	// var newData=pieDate(DataArr);
	var option = {
		title:{
			text:'年龄段分布'
			// padding:[0,0,0,20]
			// bottom:0,
			// right:0

		},
		legend: {
			orient: 'vertical',
			x: 'left',
			top: 40,
			right:50,
			data: [
				{
					name: '青年（40岁以下）',
					icon: 'circle'
				},
				{
					name: '中年（40-50岁）',
					icon: 'circle'
				},
				{
					name: '中老年（50-60岁）',
					icon: 'circle'
				},
				{
					name: '老年（60岁以上）',
					icon: 'circle'
				},
				{
					name: '未知',
					icon: 'circle'
				}
			]
		},

		series: [
			{
				type: 'pie',
				radius: ['40', '55'],
				hoverAnimation: false,//关闭动画
				//标签样式
				label: {
					normal: {
						textStyle: {
							color: '#000',
							fontSize: 14
						},
						formatter: function (params) {
							return params.value + '%';
						}
					}
				},
				//标签引线样式
				labelLine: {
					normal: {
						length2:0,
						lineStyle: {
							color: '#ccc'
						}
					}
				},

				data: [
					{
						value: newData[0].toFixed(2),
						name: '青年（40岁以下）',
						itemStyle: {
							normal: {
								color: '#3f7ec5'
							}
						}
					},
					{
						value: newData[1].toFixed(2),
						name: '中年（40-50岁）',
						itemStyle: {
							normal: {
								color: '#f36868'
							}
						}
					},

					{
						value: newData[2].toFixed(2),
						name: '中老年（50-60岁）',
						itemStyle: {
							normal: {
								color: '#1d9eef'
							}
						}
					},

					{
						value: newData[3].toFixed(2),
						name: '老年（60岁以上）',
						itemStyle: {
							normal: {
								color: '#2ccca7'
							}
						}
					},

					{
						value: newData[4].toFixed(2),
						name: '未知',
						itemStyle: {
							normal: {
								color: '#ec956f'
							}
						}
					}

				]
			}

		]
	};

	var initleftEchartId = echarts.init(document.getElementById('patient-test-leftPie'));
	initleftEchartId.setOption(option);
}
function rightEchartPie(newData) {
	// var newData=pieDate(DataArr);
	var option = {
		title:{
			text:'性别分布',
			left:100
			// padding:[0,0,0,20]
			// bottom:0,
			// right:0


		},
		legend: {
			orient: 'vertical',
			x: 'left',
			top: 40,
			left:100,
			data: [
				{
					name: '男性',
					icon: 'circle'
				},
				{
					name: '女性',
					icon: 'circle'
				}
			]
		},

		series: [

			{
				type: 'pie',
				radius: ['40', '55'],
				hoverAnimation: false,//关闭动画
				//标签样式
				label: {
					normal: {
						textStyle: {
							color: '#000',
							fontSize: 14
						},
						formatter: function (params) {
							return params.value + '%';
						}
					}
				},
				//标签引线样式
				labelLine: {
					normal: {
						length2:0,
						lineStyle: {
							color: '#ccc'
						}
					}
				},

				data: [
					{
						value: newData[0].toFixed(2),
						name: '男性',
						itemStyle: {
							normal: {
								color: '#1d9eef'
							}
						}
					},
					{
						value: newData[1].toFixed(2),
						name: '女性',
						itemStyle: {
							normal: {
								color: '#2ccca7'
							}
						}
					}
				]
			}

		]
	};

	var initleftEchartId = echarts.init(document.getElementById('patient-test-rightPie'));
	initleftEchartId.setOption(option);
}

//圆环图数据处理
function pieDate(DataArr){
	var newData=[];
	var point='',integer='';
	for (var i = 0; i <DataArr .length; i++) {
		var item=DataArr[i]+'';
		if(item.length>4){
			integer=item.split('.');
			point=integer[1].slice(0,2);
			item=integer[0]+'.'+point;
			newData.push(item);
		}else{
			newData.push(item);
		}
	};
	return newData;
}

//折线图 血糖预警分布统计，低血糖发生率统计，试纸用量统计
function lineChart(data) {
	var option = {
		tooltip: {
			trigger: 'item',
			backgroundColor: '#fff',
			borderWidth: 1,
			borderColor: '#ccc',
			padding: 5,
			textStyle: {
				color: '#000',
				fontSize: 12
			},
			formatter: function (obj) {
				var timeDate = obj.name.replace(/-/g, '月');
				return timeDate + '日：' + obj.value + data.dataUnit;
			}

		},
		toolbox: {
		   show: true
		},
		grid: {
			left: 0,
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			// 设置两边留白
			boundaryGap: true,
			axisTick: {
				// 轴线与日期对齐
				alignWithLabel: true
			},
			data: data.dataTimeArrX
		},
		yAxis: {
			// splitNumber: 5,
			// show:false,
			type: 'value',
			minInterval: 1,
			// 轴线设置
			axisLine: {
				show: false
			}

		},
		series: {
			// 点的大小
			symbol: 'roundRect',
			symbolSize: 10,
			symbolRotate: 45,
			itemStyle: {
				normal: {
					color: '#2fa6f0',
				}
			},
			// 跟随图标的名字
			type: 'line',
			lineStyle: {
				normal: {
					color: '#2fa6f0',
				}
			},
			areaStyle: {
				normal: {
					color: '#2fa6f0',
					opacity: 0.3
				}
			},
			data: data.dataValueArr
		}
	};
	var initChartId = echarts.init(document.getElementById(data.dataDomId));
	initChartId.setOption(option);
}

//折线图 入院出院院患者统计
function patientOutLineEchart() {
	var option = {
		tooltip: {
			trigger: 'axis',
			backgroundColor: '#fff',
			borderWidth: 1,
			borderColor: '#ccc',
			padding: 5,
			textStyle: {
				color: '#000',
				fontSize: 12
			},
			formatter:function(obj){
				console.log(obj);
				var timeDate=obj[0].name.replace(/-/g,'月');
				var name=timeDate+'日：<br/>'+
						obj[0].seriesName+'：<span style="color:#2fa6f0;">'+obj[0].value+'人</span><br/>'+
						obj[1].seriesName+'：<span style="color:#e98559;">'+obj[1].value+'人</span>';
				return name;
			}

		},

		toolbox: {
			show: true
		},

		legend: {
			left: 'right',
			data: ['入院', '出院'],
			selectedMode:false
		},

		grid: {
			left: 0,
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: {

			type: 'category',
			// 设置两边留白
			boundaryGap: true,
			axisTick: {
				// 轴线与日期对齐
				alignWithLabel: true
			},

			data: ['02-01', '02-02', '02-03', '02-04', '02-05', '02-06', '02-07']
		},
		yAxis: {
			type: 'value',
			// type : 'category',
			// 轴线设置
			axisLine: {
				show: false
			},

		},
		series: [{
			// 点的大小
			symbol: 'roundRect',
			symbolSize: 6,
			symbolRotate: 45,
			itemStyle: {
				normal: {
					color: '#2fa6f0',
				}
			},
			// 跟随图标的名字
			name:'入院',
			type: 'line',
			lineStyle: {
				normal: {
					color: '#2fa6f0',
				}
			},
			data: [20, 32, 41, 34, 30, 30, 10]
		},
			{
				// 点的大小
				symbol: 'roundRect',
				symbolSize: 6,
				symbolRotate: 45,
				itemStyle: {
					normal: {
						color: '#e98559',
					}
				},
				// 跟随图标的名字
				name:'出院',
				type: 'line',
				lineStyle: {
					normal: {
						color: '#e98559',
					}
				},
				data: [10, 2, 21, 4, 20, 10, 5]
			},
		]
	};

	var initleftEchartId = echarts.init(document.getElementById('patient-out-ehartLine'));
	initleftEchartId.setOption(option);

}



