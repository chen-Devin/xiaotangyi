var templates = {
    template1:_.template($('#qulity-list-template').html()), // 质控管理
    template2:_.template($('#batch-list-template').html()),// 批次管理
    template3: _.template($('#consultants-manage-template').html()), // 批次管理
    template8:_.template($('#kongcontent-template').html()),// 批次管理
    template7:_.template($('#print-choose-equipment').html())// 质量管理打印选择设备
//  template9:_.template($('#patient-info-item').html())// 设备编码
};

//$('#kongcontent').html(templates.template8());


var page = { currentPages: 0, count: 0 };
var iskeydow = { bacth: false }
$(function() {
    // 下面的功能是左边导航，自己注销。
//     secondNav()
    initEvent();
    loadqulity();

    $(document).keydown(function(e){
        var theEvent = e || window.event|| arguments.callee.caller.arguments[0];
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code==13) {
            //回车执行查询
            e.preventDefault();
            if(iskeydow.bacth){
                $('.new-batch .sureBtn').click();
            }

        }
    });
})
function secondNav() {
    var secondNavList= JSON.parse(sessionStorage.getItem('qualityControl'));
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
    //左边菜单栏
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
        // 切换刷新右侧内容
        var parent = $(this).attr('val');
        // console.log(!$('.'+parent).hasClass('hideItem')&&$('.'+parent).siblings().hasClass('hideItem'))
        if(!$('.'+parent).hasClass('hideItem')&&$('.'+parent).siblings().hasClass('hideItem')){
            $('.'+parent).siblings().removeAttr('lang')
        }
    })

    /*批次管理*/// 新增批次
    $('.batch-manage').delegate('.batchBtn','click',function () {
        $('.new-batch').removeClass('hideItem');
        $('.new-batch').find('input').val('');
        $('.new-batch').find('textarea').val('');
        $('.new-batch').find('.tips').hide();
        $('.new-batch').find('.title').find('span').text('新增批次');
        $('.new-batch').attr('type','new');
        iskeydow.bacth = true;
    })
    $('.batch-manage .list tbody').delegate('.editBtn','click',function () {// 编辑批次
        $('.new-batch').removeClass('hideItem');
        $('.new-batch').find('input').val('');
        $('.new-batch').find('textarea').val('');
        $('.new-batch').find('.tips').hide();
        $('.new-batch').find('.title').find('span').text('编辑批次');
        $('.new-batch').attr('type','edit');
        iskeydow.bacth = true;



        $('.new-batch').find('.batchNo').val($(this).parent().siblings('.td1').text().trim());//批次号
        $('.new-batch').find('.productionTime').val($(this).parent().siblings('.td2').text().trim());// 生产日期
        $('.new-batch').find('.useTime').val($(this).parent().siblings('.td3').text().trim());// 使用期限
        $('.new-batch').find('.lowEx').val($(this).parent().siblings('.td4').find('span').eq(0).text().trim());// L1
        $('.new-batch').find('.lowAf').val($(this).parent().siblings('.td4').find('span').eq(1).text().trim());// L1
        $('.new-batch').find('.highEx').val($(this).parent().siblings('.td5').find('span').eq(0).text().trim());// L2
        $('.new-batch').find('.highAf').val($(this).parent().siblings('.td5').find('span').eq(1).text().trim());//L2
        $('.new-batch').find('.buyTime').val($(this).parent().siblings('.td6').text().trim());//购买时间
        $('.new-batch').find('.openTime').val($(this).parent().siblings('.td7').text().trim());// 开封日期
        $('.new-batch').find('.remark').val($(this).parent().siblings('.td10').text().trim());//备注

        $('.new-batch').find('.sureBtn').attr('batchId',$(this).attr('batchId'));


    })
    $('.batch-manage .list tbody').delegate('.delBtn','click',function () {// 删除批次
        var self = $(this);
        $('.all-del').removeClass('hideItem');
        $('.all-del').delegate('.sureBtn','click',function () {
            ajaxCommon(null, null, null, {batchId: $(self).attr('batchId')}, pcurl + 'batch/deleteBatch', function (data) {
                $(self).parent().parent().remove();
                $('.all-del').addClass('hideItem');
            })
        });
    })
    $('.all-del').delegate('.cancelBtn','click',function () {
        $('.all-del').addClass('hideItem');
    })

    $('.new-batch').delegate('.cancelBtn','click',function(){//取消批次按钮
        $('.new-batch').addClass('hideItem');
    })

    $('.new-batch').delegate('.sureBtn','click',function () {//确定按钮
        var params = {}//参数
        params.batchNo = $('.new-batch').find('.batchNo').val();//批次号
        params.productionTime = $('.new-batch').find('.productionTime').val();// 生产日期
        params.useTime = $('.new-batch').find('.useTime').val();// 使用期限
        params.lowEx = $('.new-batch').find('.lowEx').val();// L1
        params.lowAf = $('.new-batch').find('.lowAf').val();// L1
        params.highEx = $('.new-batch').find('.highEx').val();// L2
        params.highAf = $('.new-batch').find('.highAf').val();//L2
        params.buyTime = $('.new-batch').find('.buyTime').val();//购买时间
        params.openTime = $('.new-batch').find('.openTime').val();// 开封日期
        params.remark = $('.new-batch').find('.remark').val();//备注
        if(params.remark==''){
            delete params.remark;
        }

        if(params.batchNo&&params.productionTime&&params.useTime&&params.lowEx&&params.lowAf&&params.highEx&&params.highAf&&params.buyTime&&params.openTime){

            if((params.lowEx-0)<(params.lowAf-0)&&(params.highEx-0)<(params.highAf-0)){
                if($('.new-batch').attr('type')=='new'){//新增
                    ajaxCommon(null,null,null,params,pcurl+'batch/addBatch',function (data) {
                        $('.new-batch').addClass('hideItem');
                        $('.batch-manage').removeAttr('lang');
                        loadbatch();
                        wetoast('设置成功');
                        iskeydow.bacth = false;
                    },function (data) {
                        $('.new-batch').find('.tips').show();
                        $('.new-batch').find('.tips').text(data.errorMsg);
                    })
                }else if($('.new-batch').attr('type')=='edit'){//编辑
                    params.batchId = $(this).attr('batchId');
                    ajaxCommon(null,null,null,params,pcurl+'batch/updateBatch',function (data) {
                        $('.new-batch').addClass('hideItem');
                        $('.batch-manage').removeAttr('lang');
                        loadbatch();
                        wetoast('设置成功');
                        iskeydow.bacth = false;
                    },function (data) {
                        $('.new-batch').find('.tips').show();
                        $('.new-batch').find('.tips').text(data.errorMsg);
                    })
                }
            }else{
                $('.new-batch').find('.tips').show();
                $('.new-batch').find('.tips').text('注意！请填写正确的L1或者L2的范围值')
            }

        }else{
            $('.new-batch').find('.tips').show();
            $('.new-batch').find('.tips').text('请确认所有必选项是否全部填完！')
        }

    })

    // 下面是质控管理
    //自定义下拉框
    $('.quality-manage .select').delegate('.select-btn', 'click', function(evt) {
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;

        $(this).siblings('.list-show').toggle();
        $(this).parent().parent().siblings('.item').find('.list-show').hide();
        var self = $(this);
        // 下拉框选项点击功能
        $(self).siblings('.list-show').delegate('li', 'click', function() {
            $(self).val($(this).text());
            $(this).parent().parent().hide();
            $(self).attr('status', $(this).attr('status'));
        })
    });
    // 点击其他也要关闭下拉框
    $('.main-content').on('click', function() {
        $('.quality-manage .select').find('.list-show').hide();
        $('.quality-manage .select').find('.text-show').hide();
    });
    //搜索事件
    $('.quality-manage .title-search').delegate('.searchBtn', 'click', function() {
        var params = {
            'page': '1',
            'condition': $('.title-search').find('.condition').val().trim(),
            'status': $('.title-search').find('.select-btn').attr('status'),
            'dateEx': $('.title-search').find('.dateEx').val(),
            'dateAf': $('.title-search').find('.dateAf').val()
        };

        params.condition ? params.condition : delete params.condition;
        params.status ? params.status : delete params.status;
        params.dateEx ? params.dateEx : delete params.dateEx;
        params.dateAf ? params.dateAf : delete params.dateAf;

        consultantsManage(params)
    });
    /*全部的重置功能-刷新功能*/
    $('.quality-manage .title-search').delegate('.resetBtn', 'click', function() {
        initSearch();
    });
//	质控管理打印功能
    $('.quality-manage .title-search').delegate('.print-btn', 'click', function() {
 		$(".print-page").removeClass("hideItem");
   		ajaxCommon(null, false, null, {}, pcurl + 'device/getDevices', function(data) {
//			console.log(data.ret.devices);
			var list = data.ret.devices;
			 $('.print-search .select-list').html(templates.template7(list));
   		});
   		btnSearchBtnClick();

    });

    $('.quality-manage .print-page').delegate('.cancelBtn', 'click', function() {
//    	console.log(555);
 		$(".print-page").addClass("hideItem")
    });
     $('.quality-manage .print-page').delegate('.btn-searchBtn', 'click', function() {
 			btnSearchBtnClick();
       
    });
    function btnSearchBtnClick(){
    	     	var params = {
            'imei': $('#choose-equipment').val(),
            'dateEx': $('#date15').val(),
            'dateAf': $('#date16').val()
       };
       $("#patient-info-item").html($('#choose-equipment').val());
       $(".hospital-title-text").html($('.nav .firmName').text())
//     console.log($('.nav .firmName').text());
       
//     $('.patient-info .item').html(templates.template9(params.imei));
        ajaxCommon(null, false, null, params, pcurl + 'quality/printQualityTest', function(data) {
			var list = data.ret.qualityTestEntities;
//			console.log(list);
			
			$('.print-content #kongcontent').html(templates.template8(list));
   		})
    }
    
	
	
    // 下面是试纸批次管理。
    //搜索事件
    $('.batch-manage .title-search').delegate('.searchBtn', 'click', function() {
        var params = {
            'page': '1',
            'condition': $('.batch-manage .title-search').find('.condition').val().trim(),
            'productionTimeEx': $('.batch-manage .title-search #date3').val(),
            'productionTimeAf': $('.batch-manage .title-search #date4').val(),
            'buyTimeEx': $('.batch-manage .title-search #date5').val(),
            'buyTimeAf': $('.batch-manage .title-search #date6').val(),
            'operateTimeEx': $('.batch-manage .title-search #date7').val(),
            'operateTimeAf': $('.batch-manage .title-search #date8').val(),
        };
        params.condition ? params.condition : delete params.condition;
        params.productionTimeEx ? params.productionTimeEx : delete params.productionTimeEx;
        params.productionTimeAf ? params.productionTimeAf : delete params.productionTimeAf;
        params.buyTimeEx ? params.buyTimeEx : delete params.buyTimeEx;
        params.buyTimeAf ? params.buyTimeAf : delete params.buyTimeAf;
        params.operateTimeEx ? params.operateTimeEx : delete params.operateTimeEx;
        params.operateTimeAf ? params.operateTimeAf : delete params.operateTimeAf;
        consultantsBatchManage(params);
    });
    /*全部的重置功能-刷新功能*/
    $('.batch-manage .title-search').delegate('.resetBtn', 'click', function() {
        initTestPaperSearch()
    });

    // 下面是质控液备案。
    $('.KeepOnRecord-manage a').on('click', function() {
        KeepOnRecordManageInfo();
    });
    //自定义下拉框
    $('.KeepOnRecord-manage .title-search .select').delegate('.select-btn', 'click', function(evt) {
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;

        $(this).closest('.rightBox').find('.select').children('.list-show').hide();
        $(this).siblings('.list-show').toggle();

        var self = $(this);

        // 下拉框选项点击功能
        $(self).siblings('.list-show').find('li').unbind('click').click(function() {
            if ($(this).parent().hasClass('deptList')) {
                var deptid = $(this).attr('val');
            }
            $(self).val($(this).text());
            $(this).parent().parent().hide();
            $(self).attr('status', $(this).attr('val'));

        })
    });
    // 点击其他也要关闭下拉框
    $('.main-content').on('click', function() {
        $('.KeepOnRecord-manage .select').find('.list-show').hide();
        $('.KeepOnRecord-manage .select').find('.text-show').hide();
    });
    // 重置功能
    $('.KeepOnRecord-manage .title-search').delegate('.resetBtn', 'click', function(evt) {
        KeepOnRecordManageBegin()
    });
    // 搜索功能
    $('.KeepOnRecord-manage').delegate('.searchBtn', 'click', function(evt) {
        var params = {
            'liquidNo': $('.KeepOnRecord-manage .liquidNo').val().trim(),
            'type': $('.KeepOnRecord-manage .select-btn').attr('status'),
            'page': '1',
        }
        params.liquidNo ? params.liquidNo : delete params.liquidNo;
        params.type ? params.type : delete params.type;
        KeepOnRecorManage(params, 'qualityLiquid/getQualityLiquid')
    });
    // 编辑功能
    var qualityControlId = '';
    $('.KeepOnRecord-manage').delegate('.edit', 'click', function() {
        $('#IdentificationId').attr('IdentificationId', 'false')
        qualityControlId = $(this).siblings('.delet').attr('deletId')
        $('#addGroupConsultation .patient-name').val($(this).parent().siblings('.td6').text().trim())
        $(this).parent().siblings('.td3').text().trim() == 'L1' ? $('#addGroupConsultation .select-btn').attr('typeId', '1') : $('#addGroupConsultation .select-btn').attr('typeId', '2')
        $(this).parent().siblings('.td3').text().trim() == 'L1' ? $('#addGroupConsultation .select-btn').val('L1') : $('#addGroupConsultation .select-btn').val('L2');
        $('#addGroupConsultation #addSugarMeasureTime').val($(this).parent().siblings('.td2').text().trim())
        $('#addGroupConsultation #addSugarRemark').val($(this).parent().siblings('.td4').text().trim())
        $('.PopMask').show()
        $('.addGroupConsultation').show();
    });
    // 删除功能
    $('.KeepOnRecord-manage table').delegate('.delet', 'click', function(evt) {
        var liquidId = $(this).attr('deletId')
        var self = $(this);
        $('.KeepOnRecord-del').removeClass('hideItem');
        $('.KeepOnRecord-del').delegate('.cancelBtn', 'click', function() {
            $('.KeepOnRecord-del').addClass('hideItem');
        });
        $('.KeepOnRecord-del').delegate('.sureBtn', 'click', function() {
            ajaxCommon(null, null, null, { 'liquidId': liquidId }, pcurl + 'qualityLiquid/deleteQualityLiquid', function(data) {
                wetoast('删除成功');
                $(self).parent().parent().remove();
                $('.KeepOnRecord-del').addClass('hideItem');
                KeepOnRecordManageBegin()
            })
        });
    });
    // 新增功能
    $('.KeepOnRecord-manage').delegate('.addconsultants', 'click', function(evt) {
        $('#addGroupConsultation .patient-name').val('')
        $('#addGroupConsultation #addSugarMeasureTime').val('')
        $('#addGroupConsultation .select-btn').val('L1');
        $('#addGroupConsultation .select-btn').attr('typeId', '1');
        $('#addGroupConsultation #addSugarRemark').val('')
        $('#IdentificationId').attr('IdentificationId', 'true')
        $('.PopMask').show()
        $('.addGroupConsultation').show();
    });
    $('#addGroupConsultation').delegate('.patient-name', 'keyup', function() {
        // this.value = this.value.replace(/[u4e00-u9fa5]/g, "")
        this.value = this.value.replace(/([\u4E00-\u9FA5])+/g, "")
    });
    // 新增的弹窗取消
    $('#addGroupConsultation').delegate('#addSugarCloseBtn,#addSugarCancel', 'click', function(evt) {
        $('.PopMask').hide()
        $('.addGroupConsultation').hide();
    });
    // 新增和编辑的弹窗确定
    $('#addGroupConsultation').delegate('#addSugarSubmit', 'click', function(evt) {
        if ($('#IdentificationId').attr('IdentificationId') == 'true') {
            var params = {
                'liquidNo': $('#addGroupConsultation .patient-name').val(),
                'validity': $('#addGroupConsultation #addSugarMeasureTime').val(),
                'type': $('#addGroupConsultation .select-btn').attr('typeId'),
                'remark': $('#addGroupConsultation #addSugarRemark').val()
            }
        } else {
            var params = {
                'liquidNo': $('#addGroupConsultation .patient-name').val(),
                'validity': $('#addGroupConsultation #addSugarMeasureTime').val(),
                'type': $('#addGroupConsultation .select-btn').attr('typeId'),
                'remark': $('#addGroupConsultation #addSugarRemark').val(),
                'liquidId': qualityControlId,
            };
        }
        params.remark ? params.remark : delete params.remark;
        if (!params.liquidNo) {
            $('.choiceOnePatient').text('请选择一个批次号')
            $('.choiceOnePatient').show();
            setTimeout(function() {
                $('.choiceOnePatient').hide();
            }, 1000)
            return
        }
        if (!params.validity) {
            $('.choiceOnePatient').text('请选有效日期')
            $('.choiceOnePatient').show();
            setTimeout(function() {
                $('.choiceOnePatient').hide();
            }, 1000)
            return
        }
        $('.PopMask').hide()
        $('.addGroupConsultation').hide();
        if ($('#IdentificationId').attr('IdentificationId') == 'true') {
            ajaxCommon(null, false, null, params, pcurl + 'qualityLiquid/addQualityLiquid', function(data) {
                wetoast('添加成功');
                KeepOnRecordManageBegin();
            });
        } else {
            ajaxCommon(null, false, null, params, pcurl + 'qualityLiquid/updateQualityLiquid', function(data) {
                wetoast('修改成功');
                KeepOnRecordManageBegin();
            });
        }
    });

    // 下面是质控液的编辑和新增弹窗框的下拉框
    $('#addGroupConsultation .select').delegate('.select-btn', 'click', function(evt) {
        console.log(123);
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;

        $(this).siblings('.list-show').toggle();
        $(this).parent().parent().siblings('.item').find('.list-show').hide();
        var self = $(this);
        // 下拉框选项点击功能
        $(self).siblings('.list-show').delegate('li', 'click', function() {
            $(self).val($(this).text());
            $(this).parent().parent().hide();
            $(self).attr('typeId', $(this).attr('typeId'));
        })
    });
}
// 下面是质控管理
function initSearch() {
    $('.quality-manage .title-search').find('.select-btn').attr('status', '');
    $('.quality-manage .title-search').find('.select-btn').val('全部结果');
    $('.quality-manage .title-search').find('.dateEx').val('');
    $('.quality-manage .title-search').find('.dateAf').val('');
    $('.quality-manage .title-search').find('.condition').val('');
    var params = {
        'page': '1',
    };
    consultantsManage(params);
}

function consultantsManage(params) {
    hideallblock(['quality-manage']);
    if (!params) {
        params = { page: 1 }
    }
    var count;
    ajaxCommon(null, false, null, params, pcurl + 'quality/getQualityTest', function(data) {
        var list = data.ret.qualityTests;
        // console.log(list);
        count = data.ret.pages;
        $('.quality-manage .quality-content tbody').html(templates.template1(list));
        $('.quality-manage').attr('lang', 1)
    })
    if (count > 1) {
        $('.quality-manage .page').show();
        var isload = false;
        $('.quality-manage .page').createPage(function(n) { //分页
            if (!isload) {
                isload = true;
                return;
            }
            params.page = n;
            ajaxCommon(null, false, null, params, pcurl + 'quality/getQualityTest', function(data) {
                var list = data.ret.qualityTests;
                $('.quality-manage .quality-content tbody').html(templates.template1(list));
            })

        }, {
            pageCount: count,
            showTurn: true, //是否显示跳转,默认可以
            showSumNum: false //是否显示总页码
        });
    } else {
        $('.quality-manage .page').hide();
    }
};

// 下面是试纸批次管理
function initTestPaperSearch() {
    $('.batch-manage .title-search .condition').val('');
    $('.batch-manage .title-search #date3').val('');
    $('.batch-manage .title-search #date4').val('');
    $('.batch-manage .title-search #date5').val('');
    $('.batch-manage .title-search #date6').val('');
    $('.batch-manage .title-search #date7').val('');
    $('.batch-manage .title-search #date8').val('');
    var params = {
        'page': '1',
    };
    consultantsBatchManage(params);
}

function consultantsBatchManage(params) {
    hideallblock(['batch-manage']);
    if (!params) {
        params = { page: 1 }
    }
    var count;
    ajaxCommon(null, false, null, params, pcurl + 'batch/getTestPaperBatch', function(data) {
        var list = data.ret.batches;
        // console.log(list);
        count = data.ret.pages;
        $('.batch-manage tbody').html(templates.template2(list));
        $('.batch-manage').attr('lang', 1)
    })
    if (count > 1) {
        $('.batch-manage .page').show();
        var isload = false;
        $('.batch-manage .page').createPage(function(n) { //分页
            if (!isload) {
                isload = true;
                return;
            }
            params.page = n;
            ajaxCommon(null, false, null, params, pcurl + 'batch/getTestPaperBatch', function(data) {
                var list = data.ret.batches;
                $('.batch-manage tbody').html(templates.template2(list));
            })

        }, {
            pageCount: count,
            showTurn: true, //是否显示跳转,默认可以
            showSumNum: false //是否显示总页码
        });
    } else {
        $('.batch-manage .page').hide();
    }
};

/*质控管理*/
function loadqulity() {
    hideallblock(['quality-manage']);
    page.count = 0;
    page.currentPages = 1;
    if(!$('.quality-manage').attr('lang')){
        ajaxCommon(null,false,null,{page:1},pcurl+'quality/getQualityTest',function(data){
            var list = data.ret.qualityTests;
            page.count =data.ret.pages;
            $('.quality-manage .quality-content tbody').html(templates.template1(list));
            $('.quality-manage').attr('lang',1);
        });
        if(page.count>1){
            $('.quality-manage .page').show();
            var isload = false;
            $('.quality-manage .page').createPage(function(n){//分页
                if(!isload){
                    isload = true;
                    return;
                }
                page.currentPages = n
                ajaxCommon(null,null,null,{page:page.currentPages},pcurl+'quality/getQualityTest',function(data){
                    var list = data.ret.qualityTests;
                    $('.quality-manage .quality-content tbody').html(templates.template1(list));
                })

            },{
                pageCount:page.count,
                showTurn:true,//是否显示跳转,默认可以
                showSumNum:false//是否显示总页码
            });
        }else{
            $('.quality-manage .page').hide();
        }
        $('.quality-manage').attr('lang',1);

    }


}
/*统计分析*/
function loadcount() {
    hideallblock(['quality-count']);
}
/*批次管理*/
function loadbatch() {
    hideallblock(['batch-manage']);
    page.count = 0;
    page.currentPages = 1;
    if(!$('.batch-manage').attr('lang')){
        ajaxCommon(null,false,null,{page:1},pcurl+'batch/getTestPaperBatch',function(data){
            var list = data.ret.batches;
            page.count =data.ret.pages;
            $('.batch-manage tbody').html(templates.template2(list));
            $('.batch-manage').attr('lang',1);
        });
        if(page.count>1){
            $('.batch-manage .page').show()
            var isload = false;
            $('.batch-manage .page').createPage(function(n){//分页
                if(!isload){
                    isload = true;
                    return;
                }
                page.currentPages=n;
                ajaxCommon(null,false,null,{page:page.currentPages},pcurl+'batch/getTestPaperBatch',function(data){
                    var list = data.ret.batches;
                    $('.batch-manage tbody').html(templates.template2(list));
                })

            },{
                pageCount:page.count,
                showTurn:true,//是否显示跳转,默认可以
                showSumNum:false//是否显示总页码
            });
        }else{
            $('.batch-manage .page').hide();
        }
    }
}

// 质控液备案
function KeepOnRecordManageInfo() {
    hideallblock(['KeepOnRecord-manage']);
    KeepOnRecordManageBegin()
}

// 重置功能和默认展示数据。
function KeepOnRecordManageBegin() {
    $('.KeepOnRecord-manage .title-search .select-btn').val('全部类型');
    $('.KeepOnRecord-manage .title-search .select-btn').attr('status', '');
    $('.KeepOnRecord-manage .liquidNo').val('');
    var params = {
        'page': '1'
    }
    KeepOnRecorManage(params, 'qualityLiquid/getQualityLiquid')
}

function KeepOnRecorManage(params, url) {
    hideallblock(['KeepOnRecord-manage']);
    if (!params) {
        params = { page: 1 }
    }
    var count;
    ajaxCommon(null, false, null, params, pcurl + url, function(data) {
        var list = data.ret.liquids;
        for (var i = 0; i < list.length; i++) {
            list[i].validity = list[i].validity.slice(0, list[i].validity.indexOf(' '))
        }
        count = data.ret.pages;
        $('.KeepOnRecord-manage tbody').html(templates.template3(list));
        $('.KeepOnRecord-manage').attr('lang', 1)
    })
    if (count > 1) {
        $('.KeepOnRecord-manage .page').show();
        var isload = false;
        $('.KeepOnRecord-manage .page').createPage(function(n) { //分页
            if (!isload) {
                isload = true;
                return;
            }
            params.page = n;
            ajaxCommon(null, false, null, params, pcurl + url, function(data) {
                var list = data.ret.liquids;
                for (var i = 0; i < list.length; i++) {
                    list[i].validity = list[i].validity.slice(0, list[i].validity.indexOf(' '))
                }
                $('.KeepOnRecord-manage tbody').html(templates.template3(list));
            })

        }, {
            pageCount: count,
            showTurn: true, //是否显示跳转,默认可以
            showSumNum: false //是否显示总页码
        });
    } else {
        $('.KeepOnRecord-manage .page').hide();
    }
};
function text() {
    hideallblock(['KeepOnRecord-manage']);
}
//打印
    $('.print-page').delegate('.printBtn','click',function () {
    	$(".print-content").jqprint();

//      $('.print-content').jqprint({
//          debug: false, //如果是true则可以显示iframe查看效果（iframe默认高和宽都很小，可以再源码中调大），默认是false
//          importCSS: true, //true表示引进原来的页面的css，默认是true。（如果是true，先会找$("link[media=print]")，若没有会去找$("link")中的css文件）
//          printContainer: true, //表示如果原来选择的对象必须被纳入打印（注意：设置为false可能会打破你的CSS规则）。
//          operaSupport: true//表示如果插件也必须支持歌opera浏览器，在这种情况下，它提供了建立一个临时的打印选项卡。默认是true
//      });

    });
