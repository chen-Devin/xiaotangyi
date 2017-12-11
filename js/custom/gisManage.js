/**
 * Created by admin on 2017/7/9.
 */
/*全局变量*/
var pages = { count: 0, currentPage: 1, time: 1 };
// 定义一个全局的血糖ID。
var bloodGlucoseId = '';

var templates = {
    template1: _.template($('#gispatient-list-template').html()),
    template2: _.template($('#gispatient-crewChange-sheet-template').html()), //血糖检测交接班记录表
    template3: _.template($('#addrecord-list-template').html()), // 补录列表
}
$(function() {
    secondNav();
    initEvent();
    getData();
})


function secondNav() {
    //左边菜单栏
    var navItem = $('.leftNav').find('li');
    $('.leftNav').delegate('li', 'click', function() {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');

        navItem.map(function(i, e) {
            if ($(e).hasClass('active')) {
                var str = $(e).find('img').attr('src');
                str = str.replace('normal', 'press');
                $(e).find('img').attr('src', str);
            } else {
                var str2 = $(e).find('img').attr('src');
                if (str2.indexOf('press') > 0) {
                    str2 = str2.replace('press', 'normal');
                    $(e).find('img').attr('src', str2);
                }
            }
        })
    });
}

function initEvent() {
    /*自定义下拉框*/
    $('.select').on('click', '.select-btn', function(evt) {
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;

        $(this).closest('.rightBox').find('.select').children('.list-show').hide();
        $(this).siblings('.list-show').toggle();

        var self = $(this);

        // 下拉框选项点击功能
        $(self).siblings('.list-show').find('li').unbind('click').click(function() {
            //关联科室-医生
            if ($(this).parent().hasClass('deptList')) {
                var deptid = $(this).attr('val');
                if ($(self).val() != $(this).text()) { // 如何选择和select-btn的值一样，则不改变医生的请求
                    loadDoctor(deptid);
                    loadNurse(deptid);
                }
            }

            $(self).val($(this).text());
            $(this).parent().parent().hide();
            $(self).attr('valId', $(this).attr('val'));

        })

    });

    $('.main-content').on('click', function() { // 点击其他也要关闭下拉框
        $(this).find('.list-show').hide();
    });

    /*搜索功能*/
    $('.searchNav').delegate('.btn', 'click', function() {
        $(this).addClass('activeBtn');
        $(this).siblings('.btn').removeClass('activeBtn');
    })
    $('.searchNav').delegate('.searchBtn', 'click', function() {
        var params = {}
        params.condition = $('.searchNav').find('.txt').val(); // 条件
        params.timeType = $('.searchNav').find('.select-btn').attr('valId'); // 时间段

        var item = $('.searchNav').find('.btn');
        for (var i = 0; i < item.length; i++) {
            if ($(item[i]).hasClass('activeBtn')) {
                params.time = $(item[i]).attr('value'); // 时间
            }
        }

        params.page = 1;
        if (params.condition == '') { delete params.condition; }
        if (params.timeType == 0) { delete params.timeType; }
        getData(params);

    })
    $('.searchNav').delegate('.resetBtn', 'click', function() { //条件重置功能
        // console.log('click reset');
        $('.searchNav').find('.txt').val('');
        var item = $('.searchNav').find('.btn');
        for (var i = 0; i < item.length; i++) {
            if (i > 0) {
                $(item[i]).removeClass('activeBtn');
            } else {
                $(item[i]).addClass('activeBtn');
            }
        }
        $('.searchNav .time-select').find('.select-btn').attr('valId', 0).val('全部时段');
        getData()
    })



    //添加血糖弹窗开始
    $(".addBloodSugar").on('click', function() {
        $('.addBloodSugar').attr('data-edit', 'true')
            // 点击的时候清空vul值。
        $('#addSugarNo').val('');
        $('.patient-name').val('');
        $('#addSugarMeasureTime').val('');
        $('#addSugarRemark').val('');

        isSureCode.warnSubmit = false;
        isSureCode.addSubmit = false;
        isSureCode.updatePwdSubmit = false;
        isSureCode.addSugarSubmit = true;

        $(".PopMask").show();
        $("#addSugarBox").show();
        document.documentElement.style.overflow = "hidden";
        $('.addSugarTitile p').text('添加血糖');
        $("#addSugarSubmit").attr('val', 'addSugar');
        // clearAddSugar();
        //显示当前时间
        var date = new Date();
        var strDate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
        var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        // var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        strDate += ' ' + hour + ':' + minutes;
        $('.measureTime').val(strDate);
    });
    //关闭
    $("#addSugarCloseBtn,#addSugarCancel").on('click', function() {
        $(".PopMask").hide();
        $("#addSugarBox").hide();
        document.documentElement.style.overflow = "scroll";
        // clearAddSugar();
    });
    //限制只能是小数点1位
    function clearNoNum(obj) {
        obj.value = obj.value.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
        obj.value = obj.value.replace(/^\./g, ""); //验证第一个字符是数字而不是
        obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
        obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$2'); //只能输入1个小数
    }
    //添加血糖数值判断
    function addSugarNoRange(input) {
        var val = parseFloat($(input).val());
        if (val > 0.6 && val < 33.3) {
            addSugarFlag = 1;
        } else {
            addSugarFlag = 0;
            $('.addSugarContent .noTips').show();
            setTimeout(function() {
                $('.addSugarContent .noTips').hide();
            }, 1000)
        }
    }
    // 血糖数值输入框的blur事件
    $('#addSugarNo').on('blur', function() {
        addSugarNoRange(this);
    });
    // 血糖数值输入框的keyup事件
    $('#addSugarNo').on('keyup', function() {
        clearNoNum(this)
    });
    // 时间段input点击事件，下拉框出现。
    $('#addSugarTime').on('click', function() {
        if ($('.option_box').css('display') == 'none') {
            $('.option_box').css('display', 'block');
        } else {
            $('.option_box').css('display', 'none');
        }
    });
    // 下拉框中的a标签事件。
    $('.option_box a').click(function() {
        var val = $(this).text();
        var dataVal = $(this).attr('data-value');
        $('#addSugarTime').val(val);
        $('#addSugarTime').attr('data-value', dataVal);
        $('.option_box').css('display', 'none');
    });
    /*点击其他时，关闭患者搜索下拉框*/
    $('#addSugarBox').on('click', function() { // 点击其他也要关闭下拉框
        $(this).find('.text-show').hide();
        // if ((!$('.text-serach input').attr('valId')) && $('.text-serach input').val().length > 0) {
        //     $('.text-serach input').val('');
        //     $('.addrecordPupop').find('input').val('');
        //     $('.addrecordPupop').find('.tips').show().text('请选择一个患者');
        // }
    });
    // 点击确认按键，发送请求。
    $('#addSugarSubmit').on('click', function() {
        var parms = {
            sugar: $('#addSugarNo').val(),
            timeType: $('#addSugarTime').attr('data-value'),
            createTime: $('#addSugarMeasureTime').val(),
            patientId: $('.patient-name').attr('valid'),
            remark: $('#addSugarRemark').val(),
        }
        var text = {
            sugar: $('#addSugarNo').val(),
            timeType: $('#addSugarTime').attr('data-value'),
            createTime: $('#addSugarMeasureTime').val(),
            patientId: $('.patient-name').attr('valid'),
            remark: $('#addSugarRemark').val(),
            testId: bloodGlucoseId,
        }

        var date = new Date();
        var strDate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
        var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var number1 = strDate.split('-')[0] * 365 * 24 * 60 * 60 + strDate.split('-')[1] * 30 * 24 * 60 * 60 + strDate.split('-')[2] * 24 * 60 * 60 + hour * 60 * 60 + minutes * 60;
        console.log(number1)

        var year2 = parms.createTime.split('-')[0];
        var month2 = parms.createTime.split('-')[1];
        var date2 = parms.createTime.split('-')[2].split(' ')[0]
        var hour2 = parms.createTime.split('-')[2].split(' ')[1].split(':')[0]
        var minutes2 = parms.createTime.split('-')[2].split(' ')[1].split(':')[1]
        var number2 = year2 * 365 * 24 * 60 * 60 + month2 * 30 * 24 * 60 * 60 + date2 * 24 * 60 * 60 + hour2 * 60 * 60 + minutes2 * 60;
        console.log(number2);

        var year3 = text.createTime.split('-')[0];
        var month3 = text.createTime.split('-')[1];
        var date3 = text.createTime.split('-')[2].split(' ')[0]
        var hour3 = text.createTime.split('-')[2].split(' ')[1].split(':')[0]
        var minutes3 = text.createTime.split('-')[2].split(' ')[1].split(':')[1]
        var number3 = year3 * 365 * 24 * 60 * 60 + month3 * 30 * 24 * 60 * 60 + date3 * 24 * 60 * 60 + hour3 * 60 * 60 + minutes3 * 60;
        console.log(number3);

        // console.log(text.createTime)
        if (!parms.patientId) {
            $('.choiceOnePatient').css('display', 'block')
            setTimeout(function() {
                $('.choiceOnePatient').css('display', 'none')
            }, 1500)
            return;
        }
        if (!parms.sugar) {
            $('.noTips').css('display', 'block')
            setTimeout(function() {
                $('.noTips').css('display', 'none')
            }, 1500)
            return;
        }
        if ($('.addBloodSugar').attr('data-edit') == 'true') {
            if (number2 > number1) {
                $('#rightTime').css('display', 'block')
                setTimeout(function() {
                    $('#rightTime').css('display', 'none')
                }, 1500)
                return;
            }
            ajaxCommon(null, null, null, parms, pcurl + 'test/addSugarTest', function(res) {
                $(".PopMask").hide();

                var params = {}
                params.condition = $('.searchNav').find('.txt').val(); // 条件
                params.timeType = $('.searchNav').find('.select-btn').attr('valId'); // 时间段

                var item = $('.searchNav').find('.btn');
                for (var i = 0; i < item.length; i++) {
                    if ($(item[i]).hasClass('activeBtn')) {
                        params.time = $(item[i]).attr('value'); // 时间
                    }
                }
                params.page = 1;
                if (params.condition == '') { delete params.condition; }
                if (params.timeType == 0) { delete params.timeType; }
                getData(params);

                $('.addSugarPop').css('display', 'none');
            }, function(res) { console.log(res) })
        } else {
            if (number3 > number1) {
                $('#rightTime').css('display', 'block')
                setTimeout(function() {
                    $('#rightTime').css('display', 'none')
                }, 1500)
                return;
            }
            $(".PopMask").hide();
            $('.addSugarPop').css('display', 'none');
            ajaxCommon(null, null, null, text, pcurl + 'test/updateSugarTest', function(res) {
                $(".PopMask").hide();
                // getData();

                var params = {}
                params.condition = $('.searchNav').find('.txt').val(); // 条件
                params.timeType = $('.searchNav').find('.select-btn').attr('valId'); // 时间段

                var item = $('.searchNav').find('.btn');
                for (var i = 0; i < item.length; i++) {
                    if ($(item[i]).hasClass('activeBtn')) {
                        params.time = $(item[i]).attr('value'); // 时间
                    }
                }
                params.page = 1;
                if (params.condition == '') { delete params.condition; }
                if (params.timeType == 0) { delete params.timeType; }
                getData(params);



                $('.addSugarPop').css('display', 'none');
                wetoast('修改成功')
            }, function(res) { wetoast('修改失败,请重试') })
        }
    });
    // 添加血糖弹窗结束
    // 编辑/删除开始
    $('.page1').delegate('.delete', 'click', function() {
        $(".PopMask").show();
        $('.all-del').removeClass('hideItem');
        var id = $(this).attr('data-id');
        $('.all-del').delegate('.sureBtn', 'click', function() {
            ajaxCommon(null, null, null, { testId: id }, pcurl + 'test/deleteSugarTest', function(data) {
                $('.all-del').addClass('hideItem');
                $(".PopMask").hide();

                var params = {}
                params.condition = $('.searchNav').find('.txt').val(); // 条件
                params.timeType = $('.searchNav').find('.select-btn').attr('valId'); // 时间段

                var item = $('.searchNav').find('.btn');
                for (var i = 0; i < item.length; i++) {
                    if ($(item[i]).hasClass('activeBtn')) {
                        params.time = $(item[i]).attr('value'); // 时间
                    }
                }
                params.page = 1;
                if (params.condition == '') { delete params.condition; }
                if (params.timeType == 0) { delete params.timeType; }
                getData(params);
            })
        });
    });
    $('.cancelBtn,.cancelBtn').on('click', function() {
        $('.all-del').addClass('hideItem');
        $(".PopMask").hide();
    });
    $('.page1').delegate('.edit', 'click', function() {
        $('.addBloodSugar').attr('data-edit', 'false')

        isSureCode.warnSubmit = false;
        isSureCode.addSubmit = false;
        isSureCode.updatePwdSubmit = false;
        isSureCode.addSugarSubmit = true;
        $(".PopMask").show();
        $("#addSugarBox").show();
        document.documentElement.style.overflow = "hidden";

        // 下面是填充弹框的默认值。
        $('.patient-name').attr('valid', $(this).parent().siblings('.td1').attr('data-patientId'))
            // 判断是不是文字，来显示隐藏渲染。
        if (/[\u4E00-\u9FA5]+/.test($(this).parent().siblings('.td11').text().trim()) == true) {
            $('#addSugarNo').val('');
        } else {
            $('#addSugarNo').val($(this).parent().siblings('.td11').text().trim());
        }
        $('#addSugarTime').attr($(this).parent().siblings('.td10').text().trim());
        $('#addSugarMeasureTime').val($(this).parent().siblings('.td9').text().trim());
        $('.patient-name').val($(this).parent().siblings('.td2').text().trim());
        $('#addSugarRemark').val($(this).parent().siblings('.td1').find('span').text().trim());
        $('#addSugarRemark').val($(this).parent().siblings('.td1').find('span').text().trim());
        bloodGlucoseId = $(this).siblings().attr('data-id');
    });

    // 编辑/删除结束


    //打印按钮
    $('.searchNav').delegate('.printRecordBtn', 'click', function() {
        $('.consultantsRecord').removeClass('hideItem');
        var date = new Date();
        var strDate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
        $('#printDateSel').val(strDate);

        ajaxCommon(function() {}, null, null, { date: strDate }, pcurl + 'test/getDateSugarTestRecords', function(res) {
            var data = res.ret.sugarTests;
            $('.print-content tbody').html(templates.template2(data));

            var noRecordStr = '<tr><td colspan="7" align="center">暂无记录</td></tr>';
            if (data && data.length > 0) {

            } else {
                $('.print-content tbody').append(noRecordStr);
            }

        }, function() {})

    });
    // 取消
    $('.consultantsRecord').delegate('.cancelBtn', 'click', function() {
        $(this).parent().parent().parent().addClass('hideItem');
    });


    // 打印
    $('.consultantsRecord').delegate('.print', 'click', function() {
        $(".print-content").jqprint({
            debug: false, //如果是true则可以显示iframe查看效果（iframe默认高和宽都很小，可以再源码中调大），默认是false
            importCSS: true, //true表示引进原来的页面的css，默认是true。（如果是true，先会找$("link[media=print]")，若没有会去找$("link")中的css文件）
            printContainer: true, //表示如果原来选择的对象必须被纳入打印（注意：设置为false可能会打破你的CSS规则）。
            operaSupport: true //表示如果插件也必须支持歌opera浏览器，在这种情况下，它提供了建立一个临时的打印选项卡。默认是true
        });
    });

    //导出
    $('.consultantsRecord').delegate('.export', 'click', function() {
        var exportDate = $("#printDateSel").val();
        // console.log(exportDate);
        window.location.href = pcurl + "/test/printSugarTestRecords?date=" + exportDate;
    });



    /*血糖补录功能*/
    $('.gis-addrecord .gis-addrecord-table tbody').delegate('.addrecordBtn', 'click', function() {
        $('.addrecordPupop').find('input').val('');
        $('.addrecordPupop').removeClass('hideItem');
        $('.addrecordPupop').find('.tips').hide();

        $('.addrecordPupop').find('.sureBtn').attr('testId', $(this).attr('testId'));
    });
    /*关闭补录窗口*/
    $('.addrecordPupop').delegate('.cancelBtn', 'click', function() {
            $('.addrecordPupop').addClass('hideItem');
            $('.addrecordPupop').find('.sureBtn').removeAttr('testId');
        })
        /*确认补录按钮*/
    $('.addrecordPupop').delegate('.sureBtn', 'click', function() {
            var params = {}
            params.patientId = $(this).parent().siblings('.text-content').find('.patient-name').attr('valId');
            params.testId = $(this).attr('testId');
            console.log(params);
            if (params.patientId) {
                ajaxCommon(null, null, null, params, pcurl + 'test/updateTestPatient', function(data) {
                    console.log(data);

                    $('.addrecordPupop').addClass('hideItem');
                    $('.addrecordPupop').find('.sureBtn').removeAttr('testId');

                    gisAddRecord();
                    wetoast('补录成功');

                })
            } else {
                $('.addrecordPupop').find('.tips').show();
            }
        })
        /*模糊搜索*/
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]"); // 特殊字符验证
    $('.text-serach input').bind('input propertychange', function() {
        // console.log(oldtxt+'---'+$(this).val())
        // &&oldtxt!=$(this).val()
        if ($(this).val().length > 0 && !pattern.test($(this).val())) {
            $(this).siblings('.text-show').show();
            var str = '';
            var self = $(this);
            // 加入改变了输入的值就去掉valId
            $(this).removeAttr('valId');
            ajaxCommon(null, null, null, { condition: $(this).val() }, pcurl + 'patient/getPatientsByConditionAuth', function(data) {
                // console.log(data);
                var list = data.ret.patients;

                $.each(list, function(i, e) {
                    var inhospitalTime = (e.inhospitalTime ? e.inhospitalTime.split(' ')[0] : '');
                    str += '<li val="' + e.patientId + '" time="' + inhospitalTime + '" hospitalizationNo="' + e.hospitalizationNo + '"><span>' + e.name + '</span><span>' + e.sickbedNo + '床</span><span>' + e.hospitalizationNo + '</span></li>'
                })
                if (list.length == 0) {
                    str = '<span style="font-size: 14px;padding-left: 10px;">没有查询到此人</span>';
                }
                $(self).siblings('.text-show').find('.text-list').html(str);
            })

        } else {
            $(this).siblings('.text-show').hide(); // 输入框为空的时候隐藏
            $('.addrecordPupop').find('input').val('');
        }
    });
    $('.text-serach .text-list').delegate('li', 'click', function() {
        $(this).parent().parent().siblings('input').val($(this).find('span').eq(0).text());
        $(this).parent().parent().siblings('input').attr('valId', $(this).attr('val'));
        // 默认填入信息
        $('.addrecordPupop').find('.hospitalizationNo').val($(this).attr('hospitalizationNo'));
        $('.addrecordPupop').find('.time').val($(this).attr('time'));

        $('.addrecordPupop').find('.tips').hide();

    });
    $('.addrecordPupop').on('click', function() { // 点击其他也要关闭下拉框
        $(this).find('.text-show').hide();
        if ((!$('.text-serach input').attr('valId')) && $('.text-serach input').val().length > 0) {
            $('.text-serach input').val('');
            $('.addrecordPupop').find('input').val('');
            $('.addrecordPupop').find('.tips').show().text('请选择一个患者');
        }
    });
}

/*血糖记录*/
function getData(params) {
    hideallblock(['gis-record']);
    if (!params) {
        params = { page: 1, time: 1 };
    }
    ajaxCommon(function() {}, null, null, params, pcurl + 'test/getTestsByCondition', function(data) {
        // console.log(data);
        var count = data.ret.pages;
        var list = data.ret.tests;
        list.map(function(e, i) {
            if (e.patient.birthday) {
                e.patient.age = getAge(e.patient.birthday)
            }
            if (e.createTime) {
                var tmparr = e.createTime.split(':');
                tmparr.pop();
                e.createTime = tmparr.join(':')
            }
            e.text = JSON.parse(localStorage.getItem('bloodSlucosEearlyEarning'));
        })
        $('.patientList .page1').html(templates.template1(list))

        if (count > 1) {
            $('.patientList .page').show();
            var isload = false;
            $('.patientList .page').createPage(function(n) { //分页
                if (!isload) {
                    isload = true;
                    return;
                }
                params.page = n;
                ajaxCommon(function() {}, null, null, params, pcurl + 'test/getTestsByCondition', function(data) {
                    var list = data.ret.tests;
                    list.map(function(e, i) {
                        if (e.patient.birthday) {
                            e.patient.age = getAge(e.patient.birthday)
                        }
                        if (e.createTime) {
                            var tmparr = e.createTime.split(':');
                            tmparr.pop();
                            e.createTime = tmparr.join(':')
                        }
                        e.text = JSON.parse(localStorage.getItem('bloodSlucosEearlyEarning'));
                    })
                    $('.patientList .page1').html(templates.template1(list))
                })
            }, {
                pageCount: count,
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });
        } else {
            $('.patientList .page').hide();
        }

    })
}

/*血糖补录*/
function gisAddRecord(params) {
    hideallblock(['gis-addrecord']);

    if (!params) {
        params = { page: 1 };
    }
    var count = 0;
    ajaxCommon(null, null, null, params, pcurl + 'test/getRecordsByCondition', function(data) {
        // console.log(data);
        var list = data.ret.tests;
        count = data.ret.page;
        list.map(function(e, i) {
            if (e.createTime) {
                var tmparr = e.createTime.split(':');
                tmparr.pop();
                e.createTime = tmparr.join(':')
            }
            e.text = JSON.parse(localStorage.getItem('bloodSlucosEearlyEarning'));
        })
        $('.gis-addrecord .gis-addrecord-list').html(templates.template3(list));

        var isload = false;
        $('.gis-addrecord .page').createPage(function(n) { //分页
            if (!isload) {
                isload = true;
                return;
            }
            params.page = n;
            ajaxCommon(null, null, null, params, pcurl + 'test/getRecordsByCondition', function(data) {
                var list = data.ret.tests;
                list.map(function(e, i) {
                    if (e.createTime) {
                        var tmparr = e.createTime.split(':');
                        tmparr.pop();
                        e.createTime = tmparr.join(':')
                    }
                    e.text = JSON.parse(localStorage.getItem('bloodSlucosEearlyEarning'));
                })

                $('.gis-addrecord .gis-addrecord-list').html(templates.template3(list));
            })

        }, {
            pageCount: count,
            showTurn: true, //是否显示跳转,默认可以
            showSumNum: false //是否显示总页码
        });

    })


}

//打印日期选择
function chooseDate(date) {
    // console.log(date);
    ajaxCommon(function() {}, null, null, { date: date }, pcurl + 'test/getDateSugarTestRecords', function(res) {
        var data = res.ret.sugarTests;
        $('.print-content tbody').html(templates.template2(data));

        var noRecordStr = '<tr><td colspan="7" align="center">暂无记录</td></tr>';
        if (data && data.length > 0) {

        } else {
            $('.print-content tbody').append(noRecordStr);
        }
    })


    //导出
    $('.consultantsRecord').delegate('.export', 'click', function() {
        // var exportDate=$("#printDateSel").val();
        window.location.href = pcurl + "/test/printSugarTestRecords?date=" + date;
    });
}

function getAge(strBirthday) {
    strBirthday = strBirthday.split(' ')[0];
    var returnAge;
    var strBirthdayArr = strBirthday.split("-");
    var birthYear = strBirthdayArr[0];
    var birthMonth = strBirthdayArr[1];
    var birthDay = strBirthdayArr[2];

    var d = new Date();
    var nowYear = d.getFullYear();
    var nowMonth = d.getMonth() + 1;
    var nowDay = d.getDate();

    if (nowYear == birthYear) {
        returnAge = 0; //同年 则为0岁
    } else {
        var ageDiff = nowYear - birthYear; //年之差
        if (ageDiff > 0) {
            if (nowMonth == birthMonth) {
                var dayDiff = nowDay - birthDay; //日之差
                if (dayDiff < 0) {
                    returnAge = ageDiff - 1;
                } else {
                    returnAge = ageDiff;
                }
            } else {
                var monthDiff = nowMonth - birthMonth; //月之差
                if (monthDiff < 0) {
                    returnAge = ageDiff - 1;
                } else {
                    returnAge = ageDiff;
                }
            }
        } else {
            returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天
        }
    }
    return returnAge; //返回周岁年龄

}