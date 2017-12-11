/**
 * Created by admin on 2017/7/9.
 */
var templates = {
	template1: _.template($('#patient-count-template').html()),// 患者分布统计
	template2: _.template($('#blood-test-template').html()),// 科室血糖管理统计
	template3: _.template($('#patient-test-count-template1').html()),// 患者检测统计表1
	template4: _.template($('#patient-test-count-template2').html()),// 患者检测统计表2
	template5: _.template($('#blood-warn-count-template1').html()),// 血糖预警分布统计表1
	template6: _.template($('#blood-warn-count-template2').html()),// 血糖预警分布统计表2
	// template7: _.template($('').html()),//
	// template8: _.template($('').html()),//
	// template9: _.template($('').html()),//
	template10: _.template($('#paper-test-count-template1').html()),//试纸用量统计表1
	template11: _.template($('#paper-test-count-template2').html()),//试纸用量统计表2
};
var page = {count: 0, currentPage: 1};
$(function () {
    secondNav();
    initEvent();
    patientCount();// 首次加载第一页数据
})
function secondNav() {
    var secondNavList= JSON.parse(sessionStorage.getItem('countAnalysis'));
    if(secondNavList!=null){
        var item = $('.main-content').find('.leftNav').find('li');
        item.map(function(idx,ele){
            $(ele).addClass('hideItem');
            for(var i=0;i<secondNavList.length;i++){
                if($(ele).find('span').text()==secondNavList[i].name){
                    $(ele).removeClass('hideItem');
                }
            }
        })
    }
}
function initEvent() {
    var navItem = $('.leftNav').find('li');
    $('.leftNav').delegate('li','click',function () {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');

        navItem.map(function (i,e) {
            if($(e).hasClass('active')){
                var str = $(e).find('img').attr('src');
                str = str.replace('normal','press');
                $(e).find('img').attr('src',str);
            }else{
                var str2 = $(e).find('img').attr('src');
                if(str2.indexOf('press')>0){
                    str2 = str2.replace('press','normal');
                    $(e).find('img').attr('src',str2);
                }
            }
        })

        initSearch();
        // 切换刷新右侧内容
        var parent = $(this).attr('val');
        if(!$('.'+parent).hasClass('hideItem')&&$('.'+parent).siblings().hasClass('hideItem')){
            $('.'+parent).siblings().removeAttr('lang')
        }
    });

    //下拉框
    ajaxCommon(null,null,null,{},pcurl+'dept/getAllDept',function (data) {
        var list = data.ret.depts;
        var str = '<li val="all">请选择科室</li>';
        for(var i=0;i<list.length;i++){
            str += '<li val="'+list[i].departmentId+'">'+list[i].name+'</li>';
        }
        $('.select-list').html(str);
    });
    //自定义下拉框
    $('.select').delegate('.select-btn','click',function (evt) {
        var e = evt || event;
        e.stopPropagation();//阻止事件冒泡即可
        e.cancelBubble = true;

        $(this).siblings('.list-show').toggle();
        $(this).parent().parent().siblings('.item').find('.list-show').hide();
        var self = $(this);
        // 下拉框选项点击功能
        $(self).siblings('.list-show').delegate('li','click',function () {
            $(self).val($(this).text());
            $(this).parent().parent().hide();
            $(self).attr('id',$(this).attr('val'));
        })
    })
    $('.main-content').on('click',function(){// 点击其他也要关闭下拉框
        $(this).find('.list-show').hide();
    });

	/*各个搜索条件*/
	//患者分布统计
	$('.patientCount .title-search').delegate('.searchBtn', 'click', function () {
		var params = searchgetval(this);
		params.page = 1;
		if (Object.getOwnPropertyNames(params).length > 0) {// 有搜索条件的时候才触发搜索
            patientCount(params);
		}
	});

	//科室血糖检测统计
	$('.blood-test-count .title-search').delegate('.searchBtn', 'click', function () {
		var params = searchgetval(this);
		params.page = 1;
		if (Object.getOwnPropertyNames(params).length > 0) {// 有搜索条件的时候才触发搜索
            bloodTestCount(params);
		}
	});

	//患者检测统计
	$('.patient-test-count .title-search').delegate('.searchBtn', 'click', function () {
		var params = searchgetval(this);
		params.page = 1;
		if (Object.getOwnPropertyNames(params).length > 0) {// 有搜索条件的时候才触发搜索
			//年龄段分布图表
			ajaxCommon(null, null, null, params, pcurl + 'patientDetection/getAgeStatistic', function (res) {
				var data = res.ret.statisticAnalysis[0];
				var DataArr = [data.youngScale, data.midlifeScale, data.quinquagenarianScale, data.oldScale, data.unknowScale];
				leftEchartPie(DataArr);//圆环图
			}, function () {});
			//男女占比图表
			ajaxCommon(null, null, null, params, pcurl + 'patientDetection/getSexStatistic', function (res) {
				var data = res.ret.statisticAnalysis[0];
				var DataArr = [data.femaleScale, data.maleScale];
				rightEchartPie(DataArr);//圆环图
			}, function () {});
			// 表格1
			ajaxCommon(null, null, null, params, pcurl + 'patientDetection/getPatientDetectionStatistic', function (res) {
				var list = res.ret.statisticAnalysis;
				list[0].name = '青年（40岁以下）';
				list[1].name = '中年（40-50岁）';
				list[2].name = '中老年（50-60岁）';
				list[3].name = '老年（60岁以上）';
				list[4].name = '老年（年龄未知）';
				$('.patient-test-count .table1 tbody').html(templates.template3(list));
			}, function () {});
			// 表格2
			ajaxCommon(null, false, null, params, pcurl + 'patientDetection/getPatientSugarStatistic', function (data) {
				var list = data.ret.patients;
				page.count = data.ret.pages;
				$('.patient-test-count .table2 tbody').html(templates.template4(list));
			})
			if (page.count > 1) {
				$('.patient-test-count .page').show();
				var isload = false;
				$('.patient-test-count .page').createPage(function (n) {//分页
					if (!isload) {
						isload = true;
						return;
					}
					params.page = n;
					ajaxCommon(null, false, null, params, pcurl + 'patientDetection/getPatientSugarStatistic', function (data) {
						var list = data.ret.patients;
						$('.patient-test-count .table2 tbody').html(templates.template4(list));
					})
				}, {
					pageCount: page.count,
					showTurn: true,//是否显示跳转,默认可以
					showSumNum: false//是否显示总页码
				});
			} else {
				$('.patient-test-count .page').hide();
			}

		}
	});

	// 血糖预警分布统计
	$('.blood-warn-count .title-search').delegate('.searchBtn', 'click', function () {
		var params = searchgetval(this);
		params.page = 1;
		if (Object.getOwnPropertyNames(params).length >0) {// 有搜索条件的时候才触发搜索
			//折线图表
			ajaxCommon(null, null, null, params, pcurl + 'sugarBloodWarnStatistic/getPatientDayWarnStatistic', function (res) {
				var data = res.ret.dayWarnStatistics;
				var dataTimeArrX = [];
				var dataValueArr = [];
				for (var i = 0; i < data.length; i++) {
					var itemTime = data[i].date;
					dataTimeArrX.push(itemTime.substr(5, 5));
					dataValueArr.push(data[i].count);
				}
				;
				var dataUnit = '人';
				var dataDomId = 'blood-warn-ehartLine';
				lineChart({dataTimeArrX: dataTimeArrX, dataValueArr: dataValueArr, dataUnit: dataUnit, dataDomId: dataDomId});

			}, function () {});

			//表1
			ajaxCommon(null, null, null, params, pcurl + 'sugarBloodWarnStatistic/getPatientDeptWarnStatistic', function (res) {
				var list = res.ret.deptWarnStatistics;
				$('.blood-warn-count .table1 tbody').html(templates.template5(list));
			}, function () {});

			//表2

			ajaxCommon(null, false, null, params, pcurl + 'sugarBloodWarnStatistic/getTimesDayWarnStatistic', function (data) {
				var list = data.ret.timesWarnStatistic;
				page.count = data.ret.pages;
				$('.blood-warn-count .table2 tbody').html(templates.template6(list));
			})
			if (page.count > 1) {
				$('.blood-warn-count .page').show();
				var isload = false;
				$('.blood-warn-count .page').createPage(function (n) {//分页
					if (!isload) {
						isload = true;
						return;
					}
					params.page = n;
					console.log(params);
					ajaxCommon(null, false, null,params, pcurl + 'sugarBloodWarnStatistic/getTimesDayWarnStatistic', function (data) {
						var list = data.ret.timesWarnStatistic;
						//console.log(list);
						$('.blood-warn-count .table2 tbody').html(templates.template6(list));
					})
				}, {
					pageCount: page.count,
					showTurn: true,//是否显示跳转,默认可以
					showSumNum: false//是否显示总页码
				});
			} else {
				$('.blood-warn-count .page').hide();
			}


		}
	});

	// 试纸用量统计
	$('.paper-test-count .title-search').delegate('.searchBtn', 'click', function () {
		var params = searchgetval(this);
		params.page = 1;
		if (Object.getOwnPropertyNames(params).length > 0) {// 有搜索条件的时候才触发搜索
			//折线图表
			ajaxCommon(null, null, null, params, pcurl + 'testPaperUseStatistic/getTestPaperUseStatisticAll', function (res) {
				var data = res.ret.paperStatistics;
				var dataTimeArrX = [];
				var dataValueArr = [];
				for (var i = 0; i < data.length; i++) {
					var itemTime = data[i].date;
					dataTimeArrX.push(itemTime.substr(5, 5));
					dataValueArr.push(data[i].count);
				}
				;
				var dataUnit = '片';
				var dataDomId = 'paper-test-ehartLine';
				lineChart({dataTimeArrX: dataTimeArrX, dataValueArr: dataValueArr, dataUnit: dataUnit, dataDomId: dataDomId});
			}, function () {
			});

			//表1
			ajaxCommon(null, null, null, params, pcurl + 'testPaperUseStatistic/getDeptTestPaperUseStatistic', function (res) {
				var list = res.ret.paperStatistics;
				$('.paper-test-count .table1 tbody').html(templates.template10(list));
			}, function () {
			});

			//表2
			ajaxCommon(null, false, null, params, pcurl + 'testPaperUseStatistic/getTestPaperUseStatisticPage', function (data) {
				var list = data.ret.paperStatistics;
				page.count = data.ret.pages;
				$('.paper-test-count .table2 tbody').html(templates.template11(list));
			})
			if (page.count > 1) {
				$('.paper-test-count .page').show();
				var isload = false;
				$('.paper-test-count .page').createPage(function (n) {//分页
					if (!isload) {
						isload = true;
						return;
					}
					params.page = n;
					ajaxCommon(null, false, null, params, pcurl + 'testPaperUseStatistic/getTestPaperUseStatisticPage', function (data) {
						var list = data.ret.paperStatistics;
						$('.paper-test-count .table2 tbody').html(templates.template11(list));
					})
				}, {
					pageCount: page.count,
					showTurn: true,//是否显示跳转,默认可以
					showSumNum: false//是否显示总页码
				});
			} else {
				$('.paper-test-count .page').hide();
			}


		}
	});


    /*全部的重置功能-刷新功能*/
    $('.title-search').delegate('.resetBtn','click',function () {
        var params = {}
        params.deptId = $(this).parent().find('.select-btn').attr('id');
        params.dateEx = $(this).parent().find('.dateEx').val();
        params.dateAf = $(this).parent().find('.dateAf').val();
       
        if((params.deptId==undefined)&&params.dateEx==''&&params.dateAf==''){//如果没有填写搜索条件则不需要重置
            return;
        }else{
            initSearch();
            $(this).parent().parent().removeAttr('lang');
            if($(this).parent().parent().hasClass('patientCount')){
                patientCount();
            }else if($(this).parent().parent().hasClass('blood-test-count')){
                bloodTestCount();
            }else if($(this).parent().parent().hasClass('patient-test-count')){
                patientTestCount();
            }else if($(this).parent().parent().hasClass('blood-warn-count')){
                bloodWarnCount();
            }else if($(this).parent().parent().hasClass('low-blood-count')){
                lowBloodCount();
            }else if($(this).parent().parent().hasClass('average-blood-count')){
                averageBloodCount();
            }else if($(this).parent().parent().hasClass('paper-test-count')){
                paperTestCount();
            }else if($(this).parent().parent().hasClass('patient-out-count')){
                patientOutCount();
            }
        }

    })
}
function initSearch() {
    $('.title-search').find('.select-btn').removeAttr('id');
    $('.title-search').find('.select-btn').val('请选择科室');
    $('.title-search').find('.dateEx').val('');
    $('.title-search').find('.dateAf').val('');
}

function searchgetval(dom) {// 搜索功能获取搜索框的所有值
    var params = {}
    params.deptId = $(dom).parent().find('.select-btn').attr('id');
    params.dateEx = $(dom).parent().find('.dateEx').val();
    params.dateAf = $(dom).parent().find('.dateAf').val();

    if(params.dateEx&&params.dateAf&&(params.dateEx>params.dateAf)){
        wetoast('请填写正确的时间区间')
        return;
    }

    if(params.deptId==undefined||params.deptId==''||params.deptId=='all'){delete params.deptId}
    if(params.dateEx==''){delete params.dateEx}
    if(params.dateAf==''){delete params.dateAf}

    return params;
}

//患者分析统计
function patientCount(params) {
	hideallblock(['patientCount']);

	if(!params){
		params={page:1}
	}else{
        $('.patientCount').removeAttr('lang')
	}

    if (!$('.patientCount').attr('lang')) {
        var count = 0;
        ajaxCommon(null, null, null, params, pcurl + 'patientStatistic/getPatientStatistic', function (data) {
            var list = data.ret.statisticAnalysis;
            count = data.ret.pages;
            $('.patientCount tbody').html(templates.template1(list));
            $('.patientCount').attr('lang', 1);

            if (count > 1) {
                $('.patientCount .page').show();
                var isload = false;
                $('.patientCount .page').createPage(function (n) {//分页
                    if (!isload) {
                        isload = true;
                        return;
                    }
                    params.page = n;
                    ajaxCommon(null, false, null, params, pcurl + 'patientStatistic/getPatientStatistic', function (data) {
                        var list = data.ret.statisticAnalysis;
                        $('.patientCount tbody').html(templates.template1(list));
                    })
                }, {
                    pageCount: count,
                    showTurn: true,//是否显示跳转,默认可以
                    showSumNum: false//是否显示总页码
                });
            } else {
                $('.patientCount .page').hide();
            }
        })
	}


}

//科室血糖检测统计
function bloodTestCount(params) {
	hideallblock(['blood-test-count']);

	if(!params){
		params = {page:1}
	}else{
        $('.blood-test-count').removeAttr('lang');
	}
	var count = 0;
    if (!$('.blood-test-count').attr('lang')) {
        ajaxCommon(null, null, null, params, pcurl + 'deptSugarStatistic/getDeptSugarStatistic', function (data) {
            var list = data.ret.statisticAnalysis;
            count = data.ret.pages;
            $('.blood-test-count tbody').html(templates.template2(list));
            $('.blood-test-count').attr('lang',1)
            if (count > 1) {
                $('.blood-test-count .page').show();
                var isload = false;
                $('.blood-test-count .page').createPage(function (n) {//分页
                    if (!isload) {
                        isload = true;
                        return;
                    }
                    params.page = n;
                    ajaxCommon(null, false, null, params, pcurl + 'deptSugarStatistic/getDeptSugarStatistic', function (data) {
                        var list = data.ret.statisticAnalysis;
                        $('.blood-test-count tbody').html(templates.template2(list));
                    })
                }, {
                    pageCount: count,
                    showTurn: true,//是否显示跳转,默认可以
                    showSumNum: false//是否显示总页码
                });
            } else {
                $('.blood-test-count .page').hide();
            }
        })
	}

}

// 患者检测统计
function patientTestCount() {
	hideallblock(['patient-test-count']);
	//年龄段分布图表
	ajaxCommon(null, null, null, {}, pcurl + 'patientDetection/getAgeStatistic', function (res) {
		var data = res.ret.statisticAnalysis[0];
		var DataArr = [data.youngScale, data.midlifeScale, data.quinquagenarianScale, data.oldScale, data.unknowScale];
		leftEchartPie(DataArr);//圆环图
	}, function () {});
	//男女占比图表
	ajaxCommon(null, null, null, {}, pcurl + 'patientDetection/getSexStatistic', function (res) {
		var data = res.ret.statisticAnalysis[0];
		var DataArr = [data.femaleScale, data.maleScale];
		rightEchartPie(DataArr);//圆环图
	}, function () {});
	// 表格1
	ajaxCommon(null, null, null, {}, pcurl + 'patientDetection/getPatientDetectionStatistic', function (res) {
		var list = res.ret.statisticAnalysis;
		list[0].name='青年（40岁以下）';
		list[1].name='中年（40-50岁）';
		list[2].name='中老年（50-60岁）';
		list[3].name='老年（60岁以上）';
		list[4].name='未知';
		// list.pop();
		$('.patient-test-count .table1 tbody').html(templates.template3(list));
	}, function () {
	});
	// 表格2
	page.count = 0;
	page.currentPage = 1;
	if (!$('.patient-test-count').attr('lang')) {
		ajaxCommon(null, false, null, {page: 1}, pcurl + 'patientDetection/getPatientSugarStatistic', function (data) {
			var list = data.ret.patients;
			page.count = data.ret.pages;
			$('.patient-test-count .table2 tbody').html(templates.template4(list));
		})
		if (page.count > 1) {
			$('.patient-test-count .page').show();
			var isload = false;
			$('.patient-test-count .page').createPage(function (n) {//分页
				if (!isload) {
					isload = true;
					return;
				}
				page.currentPage = n;
				ajaxCommon(null, false, null, {page: page.currentPage}, pcurl + 'patientDetection/getPatientSugarStatistic', function (data) {
					var list = data.ret.patients;
					$('.patient-test-count .table2 tbody').html(templates.template4(list));
				})
			}, {
				pageCount: page.count,
				showTurn: true,//是否显示跳转,默认可以
				showSumNum: false//是否显示总页码
			});
		} else {
			$('.patient-test-count .page').hide();
		}

	}
}

// 血糖预警分布统计
function bloodWarnCount() {
	hideallblock(['blood-warn-count']);
	//折线图表
	ajaxCommon(null, null, null, {}, pcurl + 'sugarBloodWarnStatistic/getPatientDayWarnStatistic', function (res) {
		var data = res.ret.dayWarnStatistics;
		var dataTimeArrX = [];
		var dataValueArr = [];
		for (var i = 0; i < data.length; i++) {
			var itemTime = data[i].date;
			dataTimeArrX.push(itemTime.substr(5, 5));
			dataValueArr.push(data[i].count);
		}
		;
		var dataUnit = '人';
		var dataDomId = 'blood-warn-ehartLine';
		lineChart({dataTimeArrX: dataTimeArrX, dataValueArr: dataValueArr, dataUnit: dataUnit, dataDomId: dataDomId});

	}, function () {
	});

	//表1
	ajaxCommon(null, null, null, {}, pcurl + 'sugarBloodWarnStatistic/getPatientDeptWarnStatistic', function (res) {
		var list = res.ret.deptWarnStatistics;
		$('.blood-warn-count .table1 tbody').html(templates.template5(list));
	}, function () {
	});

	//表2
	page.count = 0;
	page.currentPage = 1;
	if (!$('.blood-warn-count').attr('lang')) {
		ajaxCommon(null, false, null, {page: 1}, pcurl + 'sugarBloodWarnStatistic/getTimesDayWarnStatistic', function (data) {
			var list = data.ret.timesWarnStatistic;
			page.count = data.ret.pages;
			$('.blood-warn-count .table2 tbody').html(templates.template6(list));
		})
		if (page.count > 1) {
			$('.blood-warn-count .page').show();
			var isload = false;
			$('.blood-warn-count .page').createPage(function (n) {//分页
				if (!isload) {
					isload = true;
					return;
				}
				page.currentPage = n;
				ajaxCommon(null, false, null, {page: page.currentPage}, pcurl + 'sugarBloodWarnStatistic/getTimesDayWarnStatistic', function (data) {
					var list = data.ret.timesWarnStatistic;
					$('.blood-warn-count .table2 tbody').html(templates.template6(list));
				})
			}, {
				pageCount: page.count,
				showTurn: true,//是否显示跳转,默认可以
				showSumNum: false//是否显示总页码
			});
		} else {
			$('.blood-warn-count .page').hide();
		}

	}
}
//低血糖发生率统计
function lowBloodCount() {
    hideallblock(['low-blood-count']);
	var dataTimeArrX=['02-01', '02-02', '02-03', '02-04', '02-05', '02-06', '02-07'];
	var dataValueArr=[20, 32, 41, 34, 30, 30, 10];
	var dataUnit='次';
	var dataDomId='low-blood-ehartLine';
	lineChart({dataTimeArrX:dataTimeArrX,dataValueArr:dataValueArr,dataUnit:dataUnit,dataDomId:dataDomId});
}
//血糖检测平均值统计
function averageBloodCount() {
	hideallblock(['average-blood-count'])
}
//试纸用量统计
function paperTestCount() {
	hideallblock(['paper-test-count']);
	//折线图表
	ajaxCommon(null, null, null, {}, pcurl + 'testPaperUseStatistic/getTestPaperUseStatisticAll', function (res) {
		var data = res.ret.paperStatistics;
		var dataTimeArrX = [];
		var dataValueArr = [];
		for (var i = 0; i < data.length; i++) {
			var itemTime = data[i].date;
			dataTimeArrX.push(itemTime.substr(5, 5));
			dataValueArr.push(data[i].count);
		}
		;
		var dataUnit = '片';
		var dataDomId = 'paper-test-ehartLine';
		lineChart({dataTimeArrX: dataTimeArrX, dataValueArr: dataValueArr, dataUnit: dataUnit, dataDomId: dataDomId});
	}, function () {
	});

	//表1
	ajaxCommon(null, null, null, {}, pcurl + 'testPaperUseStatistic/getDeptTestPaperUseStatistic', function (res) {
		var list = res.ret.paperStatistics;
		$('.paper-test-count .table1 tbody').html(templates.template10(list));
	}, function () {
	});

	//表2
	page.count = 0;
	page.currentPage = 1;
	if (!$('.paper-test-count').attr('lang')) {
		ajaxCommon(null, false, null, {page: 1}, pcurl + 'testPaperUseStatistic/getTestPaperUseStatisticPage', function (data) {
			var list = data.ret.paperStatistics;
			page.count = data.ret.pages;
			$('.paper-test-count .table2 tbody').html(templates.template11(list));
		})
		if (page.count > 1) {
			$('.paper-test-count .page').show();
			var isload = false;
			$('.paper-test-count .page').createPage(function (n) {//分页
				if (!isload) {
					isload = true;
					return;
				}
				page.currentPage = n;
				ajaxCommon(null, false, null, {page: page.currentPage}, pcurl + 'testPaperUseStatistic/getTestPaperUseStatisticPage', function (data) {
					var list = data.ret.paperStatistics;
					$('.paper-test-count .table2 tbody').html(templates.template11(list));
				})
			}, {
				pageCount: page.count,
				showTurn: true,//是否显示跳转,默认可以
				showSumNum: false//是否显示总页码
			});
		} else {
			$('.paper-test-count .page').hide();
		}

	}

}
//入院出院患者统计
function patientOutCount() {
	hideallblock(['patient-out-count']);
	// patientOutLineEchart();
}