/**
 * Created by SPT on 2017/8/31.
 */

$(".titleRightBtn").append($("<span id='healthSpan'></span>"));

$("#healthSpan").load("./include/patientInfo_longling.html #healthTipBtn", function() {
    // 显示新增干预信息弹窗
    $("#healthTipBtn").click(function() {
        $('.PopMask').show();
        $('#healthTipBox').show();
    });

});

// 新增干预消息的弹窗模块
$(".PopMask").append($("<span id='healthPopSpan'></span>"));
$("#healthPopSpan").load("./include/patientInfo_longling.html #healthTipBox", function() {

    // 取消新增干预消息
    $('#healthCloseAdd,#healthTipCancel').click(function() {
        $('.tipContent').find('textarea').val("");

        $('.PopMask').hide();
        $('#healthTipBox').hide();

    });

    // 发送干预信息
    $("#healthTipSubmit").click(function() {
        var patientId = baseInfo.patientId;
        var content = $('.tipContent').find('textarea').val();

        // console.log(baseInfo.mobile);
        if (baseInfo.mobile == null || baseInfo.mobile == undefined || baseInfo.mobile == "") {
            $("#healthErrorTips").html("患者信息手机号为空");
            $("#healthErrorTips").show();
            setTimeout(function() {
                $("#healthErrorTips").hide();
            }, 1000);
            return;
        }

        if (content == undefined || content == null || content.length <= 0) {
            $("#healthErrorTips").html("请填写留言内容");
            $("#healthErrorTips").show();
            setTimeout(function() {
                $("#healthErrorTips").hide();
            }, 1000);

            return;
        }


        var dataParms = {
            patientId: patientId,
            content: content
        };

        $('.PopMask').hide();
        $('#healthTipBox').hide();

        ajaxCommon(null, null, null, dataParms, pcurl + 'patient/addHealthTip',
            function(res) {
                wetoast('发送成功');
                $('.tipContent').find('textarea').val("");

                // 查询患者健康干预记录
                getPatientHealthPushes();

            },
            function() {
                wetoast('发送失败');
            });
    });

});

// 新增干预消息的弹窗模块
$(".PopMask").append($("<span id='healthPopShowSpan'></span>"));
$("#healthPopShowSpan").load("./include/patientInfo_longling.html #healthTipShowBox", function() {
    // 取消新增干预消息
    $('#healthCloseShow').click(function() {
        $('.tipContent').find('textarea').val("");

        $('.PopMask').hide();
        $('#healthTipShowBox').hide();

    });
});



var ltemplates;
var pages = { currentPage: 1, condition: 1, count: 1, statusPage: 1 };

// 健康干预记录模块
$(".tabLeft").append($("<div id='tabLeftHealthDiv'></div>"));
$("#tabLeftHealthDiv").load("./include/patientInfo_longling.html #healthTipTotalDiv", function(responseTxt, statusTxt, xhr) {

    ltemplates = {
        template9: _.template($(responseTxt).find("#healthTipTotal-list-template").html())
    };

    $("#healthTipTotal .timeBtn a").click(function() {
        var obj = this;
        $("#healthTipTotal .timeBtn a").each(function(index, element) {

            if (element != obj) {
                $(element).removeClass("bg_sel");
            } else {
                $(element).addClass("bg_sel");
            }
        });

        // 查询患者健康干预记录
        pages = { currentPage: 1, condition: 1, count: 1, statusPage: 1 };
        getPatientHealthPushes();

    });
});

var hasLoad = false;
// 打开患者明细详情模块时加载健康干预列表
$(".basicInfoDetail").bind('DOMNodeInserted', function(e) {

    if (hasLoad == true) {
        return;
    }
    hasLoad = true;
    // 查询患者健康干预记录

    setTimeout(function() {
        getPatientHealthPushes();
    }, 500);

});

// 模块化通过轮询方式最多重试30次查询患者详细页面是否已经加载完成树状下拉列表患者数据
var times = 0;
var interval = setInterval(function() {

    if ($(".levelTwo li").length > 0) {
        clearInterval(interval);

        $(".levelTwo li").bind("click", function() {
            pages = { currentPage: 1, condition: 1, count: 1, statusPage: 1 };
            baseInfo.patientId = $(this).attr("data-patientid");
            getPatientHealthPushes();
        });

    } else if (times > 30) {
        clearInterval(interval);
    }
    times++;
}, 1000);

// 查询下拉框li绑定事件
setInterval(function() {
    $(".searchPatientPop li").bind("click", function() {
        pages = { currentPage: 1, condition: 1, count: 1, statusPage: 1 };

        baseInfo.patientId = $(this).attr("data-patientid");
        getPatientHealthPushes();
    });
}, 200);




function getPatientHealthPushes() {

    ajaxCommon(null, null, null, {
        patientId: baseInfo.patientId,
        page: pages.statusPage,
        condition: $("#healthTipTotal .timeBtn .bg_sel").parent("li").attr("data-time")
    }, pcurl + 'patient/getHealthPushRecords', function(res) {
        var list = res.ret.pushes;
        pages.count = res.ret.pages; //总页数

        $('.healthTipTotal tbody').html(ltemplates.template9(list));
        if (pages.count > 1) {
            $('.healthTipTotal .page').show();
            var open = false;
            $('.healthTipTotal .page').createPage(function(n) { //分页
                if (!open) {
                    open = true;
                    return;
                }

                pages.statusPage = n;
                ajaxCommon(null, null, null, {
                    patientId: baseInfo.patientId,
                    page: pages.statusPage,
                    condition: $("#healthTipTotal .timeBtn .bg_sel").parent("li").attr("data-time")
                }, pcurl + 'patient/getHealthPushRecords', function(res) {
                    var list = res.ret.pushes;
                    pages.totalage = res.ret.pages; //总页数

                    $('.healthTipTotal tbody').html(ltemplates.template9(list));

                }, function() {})

            }, {
                pageCount: pages.count, //总页数
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false, //是否显示总页码
                current: pages.statusPage
            });
        } else {
            $('.healthTipTotal .page').hide();
        }
    }, function() {});

}


function reSendSmsPush(pushId) {
    ajaxCommon(null, null, null, {
        pushId: pushId
    }, pcurl + 'patient/reSendHealthSMSPush', function(res) {
        wetoast("重发成功");
        // 重新获取健康干预列表记录
        getPatientHealthPushes();
    }, function() {
        wetoast("重发失败");
    });
}

function viewSmsPush(pushTime, content, pushId) {

    $("#healthTipPushTimelb").text(pushTime);
    $("#healthTipShowBox textarea").val(content);

    $('.PopMask').show();
    $('#healthTipShowBox').show();
}