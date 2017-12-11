/**
 * Created by admin on 2017/7/25.
 */
/**
 * Created by admin on 2017/7/8.
 */
/*全局变量*/
var templates = {
    template1: _.template($('#patient-list-template').html()), //患者列表
    template2: _.template($('#beg-list-template').html()), // 床位模式
    template3: _.template($('#newest-list-template').html()), // 最新动态列表
    template4: _.template($('#outpatient-list-template').html()), // 出院患者列表
    template5: _.template($('#patient-baseInfo-template').html()), // 基本信息
    template6: _.template($('#sugarStatus-list-template').html()), //血糖概况表格
    template7: _.template($('#sugarTotal-list-template').html()), //血糖统计
    template8: _.template($('#gis-print-template').html()), // 患者血糖打印1
    template9: _.template($('#gis-print2-template').html()), // 患者血糖打印2
    template10: _.template($('#gis-print3-template').html()), // 患者血糖打印3
    template11: _.template($('#gis-print2-info-template').html()), // 患者血糖打印2，，患者信息
    template12: _.template($('#table-vertical-template').html()), // 血糖概况--时间表格

    template13: _.template($('#details-content-template').html()), // 患者血糖打印1血糖记录明细单
    //  template5: _.template($('#gis-print-template').html()),// 患者血糖打印1血糖检测统计单
    template14: _.template($('#implement-content-template').html()), // 患者血糖打印1血糖检测执行单
    template15: _.template($('#select-list-template-nurse').html()), // 患者血糖打印1血糖记录明细单执行人列表
}



//存患者基本信息
var baseInfo = {};


var addSugarFlag = 0;

$(function() {
    init();

});


// 自己测试代码
function getOrganization() {
    ajaxCommon(null, null, null, {}, pcurl + 'organization/getOrganization', function(data) {
        if (!data.ret.organization) {
            $('#logo img').attr('src', '../../../image/logo1.png');
        } else {
            $('.firmName').text(data.ret.organization.name);
            $('#logo img').attr('src', pcurl + 'organization/getPhoto');
        }
    })
}


var pages = { currentPage: 1, condition: 1, count: 1, currentPage: 1 };
var objCall = {}
$(function() {
    secondNav();
    initEvent();
    loadnewestpage();
    //科室
    loadDept();
});


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
        initSearchNav()
    });
}

function initEvent() {
    /*添加患者跳到首页*/
    $('.searchNav').delegate('.addPatient', 'click', function() {
        window.location.href = linkUrl + 'index.html?addpatient=1'
    })

    /*自定义下拉框*/
    $('.select').on('click', '.select-btn', function(evt) {
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;

        $(this).closest('.rightBox').find('.select').children('.list-show').hide();
        $(this).siblings('.list-show').toggle();

        var self = $(this);
        console.log('zidingzi');

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
    $('.searchNav').delegate('.searchBtn', 'click', function() {
        var searchId = $(this).parent().parent().find('.txt').val();
        var searchSex = $(this).parent().parent().find('.sex').find('.select-btn').attr('valId'); // 1男2女
        var searchType = $(this).parent().parent().find('.teamName').find('.select-btn').attr('valId'); // 糖尿病类型


        var params = {
            page: 1,
            condition: searchId,
            sex: searchSex,
            diabetesType: searchType,
        }


        if (searchSex == 0) { delete params.sex; }
        if (searchType == 0) { delete params.diabetesType; }
        if (searchId == '') { delete params.condition; }

        // console.log(params);
        if ($(this).parent().parent().parent().parent().hasClass('inpatient')) { // 住院患者搜索

            params.special = $(this).parent().parent().find('.special').find('.select-btn').attr('valId');
            params.special < 0 ? delete params.special : params.special;

            params.model = 1;

            if ($(this).parent().parent().parent().attr('type') == 'patientList') {
                params.model = 1;
            } else if ($(this).parent().parent().parent().attr('type') == 'begList') {
                params.model = 2;
            }
            ajaxCommon(null, null, null, params, pcurl + 'patient/getPatientsByNameOrHosNo', function(data) {
                var list = data.ret.patients;
                pages.count = data.ret.pages;
                list.map(function(e, i) {
                    if (e.birthday) {
                        e.age = getAge(e.birthday);
                    }
                })

                if (params.model == 1) {
                    hideallblock(['inpatient', 'patientList']);
                    $('.patientList tbody').html(templates.template1(list));
                } else if (params.model = 2) {
                    hideallblock(['inpatient', 'begList']);
                    $('.begList .list').html(templates.template2(list));
                }

                if (pages.count > 1) {
                    $('.inpatient .page').show();
                    $('.begList .page').show();
                    var isload = false;
                    $('.inpatient .page').createPage(function(n) { //分页
                        if (!isload) {
                            isload = true;
                            return;
                        }
                        params.page = n;
                        ajaxCommon(function() {}, null, null, params, pcurl + 'patient/getPatientsByNameOrHosNo', function(data) {
                            // console.log(data);
                            var list = data.ret.patients;
                            list.map(function(e, i) {
                                if (e.birthday) {
                                    e.age = getAge(e.birthday);
                                }
                            })
                            if (params.model == 1) {
                                hideallblock(['inpatient', 'patientList']);
                                $('.patientList tbody').html(templates.template1(list));
                            } else if (params.model = 2) {
                                hideallblock(['inpatient', 'begList']);
                                $('.begList .list').html(templates.template2(list));
                            }

                        })
                    }, {
                        pageCount: pages.count,
                        showTurn: true, //是否显示跳转,默认可以
                        showSumNum: false //是否显示总页码
                    });
                } else {
                    $('.inpatient .page').hide();
                    $('.begList .page').hide();
                }
            })
        } else if ($(this).parent().parent().parent().parent().hasClass('newest')) {
            loadnewestpage(params);
        } else if ($(this).parent().parent().parent().parent().hasClass('outpatient')) {
            loadoutpatientpage(params);
        }



    })

    $('.searchNav').delegate('.resetBtn', 'click', function() { //条件重置功能
        $(this).parent().parent().find('.txt').val('');

        $(this).parent().parent().find('.sex').find('.select-btn').val('全部性别');
        $(this).parent().parent().find('.sex').find('.select-btn').attr('valId', 0);

        $(this).parent().parent().find('.teamName').find('.select-btn').val('全部分组');
        $(this).parent().parent().find('.teamName').find('.select-btn').attr('valId', 0);

        $(this).parent().parent().find('.special').find('.select-btn').val('全部患者');
        $(this).parent().parent().find('.special').find('.select-btn').attr('valId', -1);

        if ($(this).parent().parent().parent().parent().hasClass('newest')) {
            loadnewestpage();
        } else if ($(this).parent().parent().parent().parent().hasClass('inpatient')) {

            if ($(this).parent().parent().parent().attr('type') == 'patientList') {
                $('.patientList').removeAttr('lang');
                gethomeData();
                $('.isChecked').prop('checked', false);
            } else if ($(this).parent().parent().parent().attr('type') == 'begList') {
                $('.begList').removeAttr('lang');
                getBegList();
            }
        } else if ($(this).parent().parent().parent().parent().hasClass('outpatient')) {
            loadoutpatientpage()
        }
    })

    $('.searchNav').delegate('.begBtn', 'click', function() { // 切换模式
        initSearchNav(); // 初始化搜索功能

        var val = $(this).attr('value');
        if (val == 'patientList') {
            $(this).attr('value', 'begList');
            $(this).text('列表模式');
            hideallblock(['inpatient', 'begList']);
            getBegList();
            $('.searchNav').attr('type', 'begList');
        } else if (val == 'begList') {
            $(this).attr('value', 'patientList');
            $(this).text('床位模式');
            hideallblock(['inpatient', 'patientList']);
            $('.searchNav').attr('type', 'patientList');
            gethomeData();
        }
    })

    $('.patientList thead').delegate('.td1', 'click', function() { //全选功能
        // console.log($(this).find('input').is(':checked'))
        if ($(this).find('input').is(':checked')) {
            $('.patientList tbody').find('.td1').children('input').attr('checked', true);
        } else {
            $('.patientList tbody').find('.td1').children('input').attr('checked', false);
        }
    })

    $('.patientList tbody').delegate('.td1', 'click', function(evt) {
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;
    })

    $('.patientList tbody').delegate('.td15', 'click', function(evt) { //特别关注
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;

        var canclick = $(this).attr('timeout');
        if (canclick == 'true') {
            var special = $(this).attr('special');
            var patientId = $(this).attr('patientId');
            special == 0 ? special = 1 : special = 0;

            var self = $(this);
            ajaxCommon(function() {}, null, null, { patientId: patientId, special: special }, pcurl + 'patient/updateSpecialById', function(data) {
                // console.log(data)
                var isStar = self.attr('value');
                if (isStar == 'star' && special == 1) {
                    self.find('img').attr('src', linkUrl + 'image/user_special_but_on.png');
                    self.attr('value', 'noStar');
                    self.attr('special', 1);
                    wetoast('关注成功');
                } else if (isStar == 'noStar' && special == 0) {
                    self.find('img').attr('src', linkUrl + 'image/user_special_but_off.png');
                    self.attr('value', 'star');
                    self.attr('special', 0);
                    wetoast('已取消关注');
                }
                self.attr('timeout', 'true');
                // setTimeout(function () {
                //     self.attr('timeout','true');
                // },3000)
            })
        } else {
            // wetoast('请三秒之后，再进行操作');
        }

    });

    $('.begList .list').delegate('.start', 'click', function() { // 床位模式关注

        var canclick = $(this).attr('timeout');
        if (canclick == 'true') {
            var special = $(this).attr('special');
            var patientId = $(this).attr('patientId');
            special == 0 ? special = 1 : special = 0;

            var self = $(this)
            ajaxCommon(function() {}, null, null, { patientId: patientId, special: special }, pcurl + 'patient/updateSpecialById', function(data) {

                var isStar = self.attr('value');
                if (isStar == 'star' && special == 1) {
                    $(self).parent().parent().addClass('active')
                    self.attr('value', 'noStar');
                    self.attr('special', 1);
                    wetoast('关注成功');
                } else if (isStar == 'noStar' && special == 0) {
                    $(self).parent().parent().removeClass('active')
                    self.attr('value', 'star');
                    self.attr('special', 0);
                    wetoast('已取消关注');
                }

                self.attr('timeout', 'true');
                /*setTimeout(function () {
                 self.attr('timeout','true');
                 },3000)*/
            })
        } else {
            // wetoast('请五秒之后，再进行操作');
        }
        return false;
    });

    //出院处理
    $('.patientList .out').delegate('.outBtn', 'click', function() {
        $('.outPupop').removeClass('hideItem');
        $('.outPupop').find('.tips').addClass('hideItem');
        $('#outDate').val('');

        var str = [];
        //获取所有的选中病人信息
        var item = $('.patientList tbody').find('.td1');
        for (var i = 0; i < item.length; i++) { //获取选中复选框的值
            if ($(item[i]).find('input').is(':checked')) {
                str.push($(item[i]).siblings('.td3').text().trim());
            }
        }

        function removeDuplicatedItem2(ar) {
            var tmp = {},
                ret = [];

            for (var i = 0, j = ar.length; i < j; i++) {
                if (!tmp[ar[i]]) {
                    tmp[ar[i]] = 1;
                    ret.push(ar[i]);
                }
            }

            return ret;
        }
        var res = removeDuplicatedItem2(str)
        console.log(res);
        var text = res.join(' ');
        if (text.length == 0) {
            $('.outPupop').find('.tips').removeClass('hideItem').html('请选择出院患者!');
        }
        $('.outPupop').find('.patientName').html(text);
    })
    $('.outPupop').delegate('.cancelBtn', 'click', function() {
        $('.outPupop').addClass('hideItem');
    })

    $('.outPupop').delegate('.sureBtn', 'click', function() {
        //获取当前时间
        var time = $('#outDate').val();
        var arr = [];

        //获取所有的选中病人信息
        var item = $('.patientList tbody').find('.td1');
        for (var i = 0; i < item.length; i++) { //获取选中复选框的值
            if ($(item[i]).find('input').is(':checked')) {
                arr.push($(item[i]).find('input').val())
            }
        }
        if (time == '' || arr.length == 0) {
            console.log('未填写时间，或者选择出院患者');
            $('.outPupop').find('.tips').removeClass('hideItem').html('未填写出院时间或未选择出院患者!');
        } else {
            ajaxCommon(null, null, null, { patientIdList: arr, outHospitalTime: time }, pcurl + 'patient/updatePatientStatusBatch', function(data) {
                // console.log(data);
                $('.outPupop').addClass('hideItem');
                $('.patientList thead').find('.td1').children('input').attr('checked', false);
                $('.patientList').removeAttr('lang');
                gethomeData();
                $('.outPupop').find('.patientName').html('');
                wetoast('设置成功');
            })
        }


    });

    /*转科*/
    $('.patientList tbody').delegate('.transferBtn', 'click', function(evt) {
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;

        $('.transfer').removeClass('hideItem');
        var patientId = $(this).parent().attr('patientId');
        /*初始化*/
        $('.transfer').find('.deptId').val('').removeAttr('valId');
        $('.transfer').find('.doctorId').val('').removeAttr('valId');
        $('.transfer').find('.nurseId').val('').removeAttr('valId');
        $('.transfer').find('.sureBtn').attr('patientId', patientId);
        $('.transfer').find('.patientName').html($(this).siblings('.td3').text());
        $('.transfer').find('.tips').hide();

        objCall.td = $(this);
    });
    $('.transfer').delegate('.cancelBtn', 'click', function() {
        $('.transfer').addClass('hideItem');
    });
    $('.transfer').delegate('.sureBtn', 'click', function() {
        var params = {};
        params.patientId = $(this).attr('patientId');
        params.deptId = $('.transfer').find('.deptId').attr('valId');
        params.doctorId = $('.transfer').find('.doctorId').attr('valId');
        params.nurseId = $('.transfer').find('.nurseId').attr('valId');

        console.log(objCall.td)


        if (params.patientId && params.deptId && params.doctorId && params.nurseId) {

            ajaxCommon(null, null, null, params, pcurl + 'patient/updatePatient2', function(data) {
                $('.transfer').addClass('hideItem');
                // 不刷新列表，只更新改行数据
                objCall.td.siblings('.td8').html($('.transfer').find('.deptId').val());
                objCall.td.siblings('.td9').attr('doctorId', params.doctorId).html($('.transfer').find('.doctorId').val());
                objCall.td.siblings('.td10').html($('.transfer').find('.nurseId').val());

            })
        } else {
            $(this).parent().siblings('.tips').show();
        }
    });

    /*血糖预警设置*/
    $('.patientList .out').delegate('.gisBtn', 'click', function() {
        $('.giswarn').removeClass('hideItem');
    })
    $('.giswarn').delegate('.cancelBtn', 'click', function() {
        $('.giswarn').addClass('hideItem');
    });

    /*取消出院处理*/
    $('.outpatient tbody').delegate('.cancelOut', 'click', function(evt) {
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;
        var str = $(this).parent().find('.name').text();
        $('.cancel-out-hospital').find('.name').html(str);
        $('.cancel-out-hospital').removeClass('hideItem');
        $('.cancel-out-hospital').find('.sureBtn').attr('patientId', $(this).attr('patientId'));
        objCall.cancelout = $(this);
    });
    $('.cancel-out-hospital').delegate('.cancelBtn', 'click', function() {
        $(this).parent().parent().parent().addClass('hideItem');
    });

    $('.cancel-out-hospital').delegate('.sureBtn', 'click', function() {
        ajaxCommon(null, null, null, { patientId: $(this).attr('patientId') }, pcurl + 'patient/updatePatientCancelOutHospital', function(data) {
            $('.cancel-out-hospital').addClass('hideItem');
            objCall.cancelout.parent().remove();
        })
    });

    /*点击进入患者明细页面*/
    $('.newest .newest-content tbody').delegate('tr', 'click', function() {
        getPatientData($(this).attr('patientId'))
    })

    $('.begList .list').delegate('.item', 'click', function() {
        getPatientData($(this).attr('patientId'));
    })

    $('.patientList tbody').delegate('tr', 'click', function() {
        getPatientData($(this).attr('patientId'));
    })

    $('.outpatient .outpatient-content tbody').delegate('tr', 'click', function() {
        getPatientData($(this).attr('patientId'));
    })

}


//最新动态
function loadnewestpage(params) {
    hideallblock(['newest']);

    if (params == undefined) { params = { page: 1 } }

    var count = 0;
    ajaxCommon(null, null, null, params, pcurl + 'patient/getPatientRecentSugarTests', function(data) {
        var list = data.ret.statistics;
        count = data.ret.pages;
        list.map(function(e, i) {
            if (e.lastTime) {
                var arr = e.lastTime.split(':');
                arr.pop();
                e.lastTime = arr.join(':');
            }
            if (e.birthday) {
                e.age = getAge(e.birthday);
            }
        })
        $('.newest .newest-content tbody').html(templates.template3(list));

        if (count > 1) {
            $('.newest .page').show();
            var open = false;
            $('.newest .page').createPage(function(n) { //分页
                if (!open) {
                    open = true;
                    return;
                }
                params.page = n;
                ajaxCommon(null, false, null, params, pcurl + 'patient/getPatientRecentSugarTests', function(data) {
                    var list = data.ret.statistics;
                    list.map(function(e, i) {
                        if (e.lastTime) {
                            var arr = e.lastTime.split(':');
                            arr.pop();
                            e.lastTime = arr.join(':');
                        }
                        if (e.birthday) {
                            e.age = getAge(e.birthday);
                        }
                    })
                    $('.newest .newest-content tbody').html(templates.template3(list));
                });

            }, {
                pageCount: count,
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });
        } else {
            $('.newest .page').hide();
        }
    });
}

// 住院患者
function loadinpatientpage() {
    hideallblock(['inpatient', 'begList']);
    getBegList();

    $('.inpatient .searchNav').find('.begBtn').attr('value', 'begList').text('列表模式');
    $('.inpatient .searchNav').attr('type', 'begList');
}

// 出院患者
function loadoutpatientpage(params) {
    hideallblock(['outpatient']);
    /*$('.outpatient .searchNav')
    var searchId = $('.outpatient .searchNav').find('.txt').val();
    var searchSex = $('.outpatient .searchNav').find('.sex').find('.select-btn').attr('valId');// 1男2女
    var searchType = $('.outpatient .searchNav').find('.teamName').find('.select-btn').attr('valId');// 糖尿病类型

    var params = {
        page:1,
        condition:searchId,
        sex:searchSex,
        diabetesType:searchType,
    }

    if(searchSex==0){delete params.sex;}
    if(searchType==0){delete params.diabetesType;}
    if(searchId==''){delete params.condition;}*/

    if (params == undefined) { params = { page: 1 } }
    var count = 0;
    ajaxCommon(null, null, null, params, pcurl + '/patient/getOutHosPatientsByNameOrHosNo', function(data) {
        // console.log(data);
        count = data.ret.pages;
        var list = data.ret.patients;
        list.map(function(e, i) {
            if (e.birthday) {
                e.age = getAge(e.birthday);
            }
        })
        $('.outpatient-content tbody').html(templates.template4(list));

        if (count > 1) {
            $('.outpatient .page').show();
            var open = false;
            $('.outpatient .page').createPage(function(n) { //分页
                if (!open) {
                    open = true;
                    return;
                }
                params.page = n;
                ajaxCommon(function() {}, null, null, params, pcurl + '/patient/getOutHosPatientsByNameOrHosNo', function(data) {
                    var list = data.ret.patients;
                    list.map(function(e, i) {
                        if (e.birthday) {
                            e.age = getAge(e.birthday);
                        }
                    })
                    $('.outpatient-content tbody').html(templates.template4(list));
                });
            }, {
                pageCount: count,
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });
        } else {
            $('.outpatient .page').hide();
        }
    })
}


// 住院患者-患者列表
function gethomeData() {
    if (!$('.patientList').attr('lang')) {
        ajaxCommon(function() {}, false, null, { page: pages.currentPage, model: 1 }, pcurl + 'patient/getPatientsByNameOrHosNo', function(data) {
            pages.count = data.ret.pages;
            var list = data.ret.patients;
            list.map(function(e, i) {
                    if (e.birthday) {
                        e.age = getAge(e.birthday);
                    }
                })
                // console.log(list);
            $('.patientList .page1').html(templates.template1(list));
        });
        if (pages.count > 1) {
            $('.inpatient .page').show();
            var open = false;
            $('.inpatient .page').createPage(function(n) { //分页
                if (!open) {
                    open = true;
                    return;
                }
                // console.log(n);
                pages.currentPage = n;
                ajaxCommon(function() {}, null, null, { page: pages.currentPage, model: 1 }, pcurl + 'patient/getPatientsByNameOrHosNo', function(data) {
                    // console.log(data);
                    var list = data.ret.patients;
                    list.map(function(e, i) {
                        if (e.birthday) {
                            e.age = getAge(e.birthday);
                        }
                    })
                    $('.patientList .page1').html(templates.template1(list))
                });
            }, {
                pageCount: pages.count,
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });
        } else {
            $('.inpatient .page').hide();
        }

        // $('.patientList').attr('lang',1)
    }


}

// 住院患者-床位列表
function getBegList() {
    pages.currentPage = 1;
    if (!$('.begList').attr('lang')) {
        ajaxCommon(function() {}, false, null, { page: pages.currentPage, model: 2 }, pcurl + 'patient/getPatientsByNameOrHosNo', function(data) {
            // console.log(data);
            pages.count = data.ret.pages;
            var list = data.ret.patients;
            list.map(function(e, i) {
                    if (e.birthday) {
                        e.age = getAge(e.birthday);
                    }
                })
                // console.log(list);
            $('.begList .list').html(templates.template2(list));
        });
        if (pages.count > 1) {
            $('.inpatient .page').show();
            var open = false;
            $('.inpatient .page').createPage(function(n) { //分页
                if (!open) {
                    open = true;
                    return;
                }


                // console.log(n);
                pages.currentPage = n;
                ajaxCommon(function() {}, null, null, { page: pages.currentPage, model: 2 }, pcurl + 'patient/getPatientsByNameOrHosNo', function(data) {
                    // console.log(data);
                    var list = data.ret.patients;
                    list.map(function(e, i) {
                        if (e.birthday) {
                            e.age = getAge(e.birthday);
                        }
                    })
                    $('.begList .list').html(templates.template2(list))
                });
            }, {
                pageCount: pages.count,
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });
        } else {
            $('.inpatient .page').hide();
        }

        // $('.begList').attr('lang',1);
    }

}

// 初始化搜索title
function initSearchNav() {
    $('.searchNav').find('.txt').val('');

    $('.searchNav').find('.sex').find('.select-btn').val('全部性别');
    $('.searchNav').find('.sex').find('.select-btn').attr('valId', 0);

    $('.searchNav').find('.teamName').find('.select-btn').val('全部分组');
    $('.searchNav').find('.teamName').find('.select-btn').attr('valId', 0);

    $('.searchNav').find('.special').find('.select-btn').val('全部患者');
    $('.searchNav').find('.special').find('.select-btn').attr('valId', -1);
}


//最大值
Array.prototype.max = function() {
    var max = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++) {
        if (this[i] > max) {
            max = this[i];
        }
    }
    return max;
}


//血糖数据
function init() {

    if (!!window.ActiveXObject || "ActiveXObject" in window) {
        $('.main-content .searchNav .bugId').css('top', '45px')
    }




    // 按钮切换
    $(".basicSugarTab").on('click', 'a', function() {
        $(this).parent().find('a').removeClass('active');
        $(this).addClass('active');
    });

    // 血糖概况-时间选择按钮
    $('#sugarStatus').on('click', '.timeBtn', function() {
        var time = $(this).attr('data-time');

        //表格
        if ($('#sugarStatus .time-select-btn').find('a').eq(0).hasClass('active')) {
            sugarStatusTabel({ patientId: baseInfo.patientId, page: pages.currentPage, condition: time });
        }
        if ($('#sugarStatus .time-select-btn').find('a').eq(1).hasClass('active')) {
            // 时间表格
            addTimePatientList({ patientId: baseInfo.patientId, page: pages.currentPage, condition: time })
        }


        //图
        sugarStatusChar({ patientId: baseInfo.patientId, condition: time });
    });
    //血糖概况--表格编辑
    $('.sugarStatus tbody').on('hover', 'td', function() {
        $(this).find(".addSugarDisplayMask").toggle();
        $(this).find(".addSugarDisplay").toggle();

        var displayW = $(this).find('.addSugarDisplay').width();

        $(this).find('.addSugarDisplay').css('transform', 'translateX(30%)');

        var tdW = $(this).width();
        var tdL = $(this).offset().left;
        // var tdOffset=tdW+tdW+tdL+4;
        var tdOffset = 400 + tdL + 4;

        var tbodyW = $('.sugarStatus tbody').width();
        var tbody = $('.sugarStatus tbody').offset().left;
        var tbOffset = tbodyW + tbody;

        if (tdOffset > tbOffset) {
            $(this).find('.addSugarDisplayMask').css('right', '0');
            $(this).find('.addSugarDisplay').css('transform', 'translateX(-60%)');
        }


    });


    $('.sugarStatus tbody').on('click', 'td>p.addHand', function() {
        $(".PopMask").show();
        $("#addSugarBox").show();
        document.documentElement.style.overflow = "hidden";

        $('.addSugarTitile p').text('编辑血糖');
        $("#addSugarSubmit").attr('val', 'editSugar');
        $("#addSugarDelSubmit").addClass('handDel');

        var sugar = $(this).attr('sugar');
        $('#addSugarNo').val(sugar);
        var timeTypeName = $(this).attr('timeTypeName');
        $('#addSugarTime').val(timeTypeName);
        var timeType = $(this).attr('timeType');
        $('#addSugarTime').attr('data-value', timeType);
        var createTime = $(this).attr('createTime').split(':');
        var createTimeStr = createTime[0] + ':' + createTime[1];
        $('#addSugarMeasureTime').val(createTimeStr);
        var remark = $(this).next('ul').find('li').text();
        $('#addSugarRemark').val(remark);
        var testId = $(this).attr('testId');
        $('#addSugarNo').attr('testId', testId);

    });

    $('.sugarStatus tbody').on('click', 'td .addSugarDisplay .addSugarTitle.addHand', function() {
        $(".PopMask").show();
        $("#addSugarBox").show();
        document.documentElement.style.overflow = "hidden";
        $('.addSugarTitile p').text('编辑血糖');
        $("#addSugarSubmit").attr('val', 'editSugar');
        $("#addSugarDelSubmit").addClass('handDel');

        var sugar = $(this).find('span').text();
        $('#addSugarNo').val(sugar);
        var timeTypeName = $(this).attr('timeTypeName');
        $('#addSugarTime').val(timeTypeName);
        var timeType = $(this).attr('timeType');
        $('#addSugarTime').attr('data-value', timeType);
        var createTime = $(this).attr('createTime').split(':');
        var createTimeStr = createTime[0] + ':' + createTime[1];
        console.log(createTimeStr);
        $('#addSugarMeasureTime').val(createTimeStr);
        var remark = $(this).next('ul').find('li').text();
        $('#addSugarRemark').val(remark);
        var testId = $(this).attr('testId');
        $('#addSugarNo').attr('testId', testId);


    });




    //血糖测量数据分析
    $('#patientInfosugarTestAnalyse').on('click', '.timeBtn', function() {
        var time = $(this).attr('data-time');
        var hours = $('#timeSel-sugarStatus').attr('data-value'); //时段
        sugarTestChar({ patientId: baseInfo.patientId, condition: time, timeType: hours });
    });
    $('.sugarTestAnalyse .timeSlot .option_box a').click(function() {
        var hours = $(this).attr('data-value');
        var item = $(this).parent().parent().siblings('li').children('a');
        var time = '';
        for (var i = 0; i < item.length; i++) {
            if ($(item[i]).hasClass('bg_sel')) {
                time = $(item[i]).parent().attr('data-time');
            }
        }
        sugarTestChar({ patientId: baseInfo.patientId, condition: time, timeType: hours });
    });
    //血糖统计
    $('#sugarTotal').on('click', '.timeBtn', function() {
        var time = $(this).attr('data-time');
        sugarTotalTable({ patientId: baseInfo.patientId, condition: time });
    })

    //添加血糖弹窗
    $("#addSugarBtn").on('click', function() {
        isSureCode.warnSubmit = false;
        isSureCode.addSubmit = false;
        isSureCode.updatePwdSubmit = false;
        isSureCode.addSugarSubmit = true;

        $(".PopMask").show();
        $("#addSugarBox").show();
        document.documentElement.style.overflow = "hidden";
        $('.addSugarTitile p').text('添加血糖');
        $("#addSugarSubmit").attr('val', 'addSugar');
        clearAddSugar();
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
        clearAddSugar();
    });

    //确定提交
    $("#addSugarSubmit").on('click', function() {
        var btnVal = $("#addSugarSubmit").attr('val');
        var params = {};
        params.patientId = baseInfo.patientId;
        var editSugar = parseFloat($('#addSugarNo').val());
        if (editSugar > 0.6 && editSugar < 33.3) {
            addSugarFlag = 1;
            params.sugar = editSugar
        } else {
            addSugarFlag = 0;
            $('.addSugarContent .noTips').show();
            setTimeout(function() {
                $('.addSugarContent .noTips').hide();
            }, 1000)
        }
        params.timeType = $('#addSugarTime').attr('data-value');
        params.createTime = $('#addSugarMeasureTime').val();
        params.remark = $('#addSugarRemark').val();

        var date = new Date();
        var strDate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
        var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var number1 = strDate.split('-')[0] * 365 * 24 * 60 * 60 + strDate.split('-')[1] * 30 * 24 * 60 * 60 + strDate.split('-')[2] * 24 * 60 * 60 + hour * 60 * 60 + minutes * 60;

        var year2 = params.createTime.split('-')[0];
        var month2 = params.createTime.split('-')[1];
        var date2 = params.createTime.split('-')[2].split(' ')[0]
        var hour2 = params.createTime.split('-')[2].split(' ')[1].split(':')[0]
        var minutes2 = params.createTime.split('-')[2].split(' ')[1].split(':')[1]
        var number2 = year2 * 365 * 24 * 60 * 60 + month2 * 30 * 24 * 60 * 60 + date2 * 24 * 60 * 60 + hour2 * 60 * 60 + minutes2 * 60;

        if (number1 < number2) {
            $('#patientManageAddSugar').css('display', 'block');
            setTimeout(function() {
                $('#patientManageAddSugar').css('display', 'none');
            }, 1000)
            return
        }

        if (addSugarFlag == 1) {
            if (btnVal == 'addSugar') {
                ajaxCommon(null, null, null, params, pcurl + 'test/addSugarTest', function(res) {
                    clearAddSugar();
                    $(".PopMask").hide();
                    $("#addSugarBox").hide();
                    document.documentElement.style.overflow = "scroll";
                    wetoast('添加成功');
                    isSureCode.addSugarSubmit = false;
                    //血糖概况表格更新
                    var sugarStatusLis = $('#sugarStatus .timeBtn');
                    var sugarStatusTime = '';
                    for (var i = 0; i < sugarStatusLis.length; i++) {
                        var item = $(sugarStatusLis[i]).find('a').hasClass('bg_sel');
                        if (item) {
                            sugarStatusTime = $(sugarStatusLis[i]).find('a').parent('li').attr('data-time');
                        }
                    };

                    //表格
                    if ($('#sugarStatus .time-select-btn').find('a').eq(0).hasClass('active')) {
                        sugarStatusTabel({ patientId: baseInfo.patientId, page: pages.currentPage, condition: sugarStatusTime });
                    }
                    if ($('#sugarStatus .time-select-btn').find('a').eq(1).hasClass('active')) {
                        // 时间表格
                        addTimePatientList({ patientId: baseInfo.patientId, page: pages.currentPage, condition: sugarStatusTime })
                    }

                    //图
                    sugarStatusChar({ patientId: baseInfo.patientId, condition: sugarStatusTime });

                    //血糖测量数据分析
                    var sugarTestTime = '';
                    var sugarTestLis = $('#patientInfosugarTestAnalyse .timeBtn');
                    for (var k = 0; k < sugarTestLis.length; k++) {
                        var item = $(sugarTestLis[k]).find('a').hasClass('bg_sel');
                        if (item) {
                            sugarTestTime = $(sugarTestLis[k]).find('a').parent('li').attr('data-time');
                        }
                    };
                    var sugarTestHours = $('#timeSel-sugarStatus').attr('data-value'); //时段
                    sugarTestChar({ patientId: baseInfo.patientId, condition: sugarTestTime, timeType: sugarTestHours });

                    //血糖统计
                    var sugarTotalLis = $('#sugarTotal .timeBtn');
                    var sugarTotalTime = '';
                    for (var j = 0; j < sugarTotalLis.length; j++) {
                        var item = $(sugarTotalLis[j]).find('a').hasClass('bg_sel');
                        if (item) {
                            sugarTotalTime = $(sugarTotalLis[j]).find('a').parent('li').attr('data-time');
                        }
                    };
                    sugarTotalTable({ patientId: baseInfo.patientId, condition: sugarTotalTime });

                }, function() {});
            } else if (btnVal == 'editSugar') {
                params.testId = $('#addSugarNo').attr('testId');
                ajaxCommon(null, null, null, params, pcurl + 'test/updateSugarTest', function(res) {
                    $(".PopMask").hide();
                    $("#addSugarBox").hide();
                    document.documentElement.style.overflow = "scroll";
                    wetoast('修改成功');
                    isSureCode.addSugarSubmit = false;
                    clearAddSugar();
                    //血糖概况表格更新
                    var sugarStatusLis = $('#sugarStatus .timeBtn');
                    var sugarStatusTime = '';
                    for (var i = 0; i < sugarStatusLis.length; i++) {
                        var item = $(sugarStatusLis[i]).find('a').hasClass('bg_sel');
                        if (item) {
                            sugarStatusTime = $(sugarStatusLis[i]).find('a').parent('li').attr('data-time');
                        }
                    };

                    // console.log(pages);
                    ajaxCommon(null, null, null, {
                        patientId: baseInfo.patientId,
                        page: pages.statusPage,
                        condition: sugarStatusTime
                    }, pcurl + 'patient/getSugarsById', function(res) {
                        var list = res.ret.statistics;
                        // console.log(list);
                        pages.count = res.ret.pages; //总页数
                        $('.sugarStatus tbody').html(templates.template1(list));
                        if (pages.count > 1) {
                            $('.sugarStatus .page').show();
                            var open = false;
                            $('.sugarStatus .page').createPage(function(n) { //分页
                                if (!open) {
                                    open = true;
                                    return;
                                }

                                // parms.page = n;
                                pages.statusPage = n;
                                ajaxCommon(null, null, null, {
                                    patientId: baseInfo.patientId,
                                    page: pages.statusPage,
                                    condition: sugarStatusTime
                                }, pcurl + 'patient/getSugarsById', function(res) {
                                    var list = res.ret.statistics;
                                    pages.totalage = res.ret.pages; //总页数

                                    $('.sugarStatus tbody').html(templates.template1(list));

                                }, function() {})

                            }, {
                                pageCount: pages.count, //总页数
                                showTurn: true, //是否显示跳转,默认可以
                                showSumNum: false, //是否显示总页码
                                current: pages.statusPage
                            });
                        } else {
                            $('.sugarStatus .page').hide();
                        }
                    }, function() {});

                    // sugarStatusTabel({patientId: baseInfo.patientId, page: pages.currentPage, condition: sugarStatusTime});


                    //图
                    sugarStatusChar({ patientId: baseInfo.patientId, condition: sugarStatusTime });

                    //血糖测量数据分析
                    var sugarTestTime = '';
                    var sugarTestLis = $('#patientInfosugarTestAnalyse .timeBtn');
                    for (var k = 0; k < sugarTestLis.length; k++) {
                        var item = $(sugarTestLis[k]).find('a').hasClass('bg_sel');
                        if (item) {
                            sugarTestTime = $(sugarTestLis[k]).find('a').parent('li').attr('data-time');
                        }
                    };
                    var sugarTestHours = $('#timeSel-sugarStatus').attr('data-value'); //时段
                    sugarTestChar({ patientId: baseInfo.patientId, condition: sugarTestTime, timeType: sugarTestHours });

                    //血糖统计
                    var sugarTotalLis = $('#sugarTotal .timeBtn');
                    var sugarTotalTime = '';
                    for (var j = 0; j < sugarTotalLis.length; j++) {
                        var item = $(sugarTotalLis[j]).find('a').hasClass('bg_sel');
                        if (item) {
                            sugarTotalTime = $(sugarTotalLis[j]).find('a').parent('li').attr('data-time');
                        }
                    };
                    sugarTotalTable({ patientId: baseInfo.patientId, condition: sugarTotalTime });

                }, function() {});
            }
        }
    })

    /*血糖明细表打印*/
    $('#addSugarPrintBtn').on('click', function() {
        $('.statistics').trigger("click");
        $('.patient-gis-print').removeClass('hideItem');
        $(".user-choose").addClass("hideItem");
        // var lis = $('#sugarStatus .timeBtn');
        // var time = '';
        // for (var i = 0; i < lis.length; i++) {
        //     var item = $(lis[i]).find('a').hasClass('bg_sel');
        //     if (item) {
        //         time = $(lis[i]).find('a').parent('li').attr('data-time');
        //     }
        // };
        // var parms = {};
        // parms.patientId = baseInfo.patientId;
        // parms.condition = time;

        // ajaxCommon(null, null, null, parms, pcurl + 'patient/getAllSugarsById', function(data) {
        //     console.log(23223);
        //     var list = data.ret;
        //     list.statistics.map(function(e, i) {
        //         var tdarr = [];
        //         var idx = 0;
        //         var obj = { tests: [], timeType: 0 }
        //             //补全数组，首先是要补全这个数组
        //         if (e.timeTypeSugars.length < 8) {
        //             var length = 8 - e.timeTypeSugars.length;
        //             for (var l = 0; l < length; l++) {
        //                 e.timeTypeSugars.push(obj)
        //             }
        //         }
        //         e.timeTypeSugars.map(function(ele, j) {
        //             var num = ele.tests.length;
        //             tdarr.push(num);
        //             /*console.log(ele)*/
        //             if (ele.timeType != (j + 1)) {
        //                 /*console.log(j+1);*/
        //                 var eleobj = { tests: [], timeType: j + 1 }
        //                 e.timeTypeSugars.splice(j, 0, eleobj);
        //             }

        //         });
        //         e.timeTypeSugars.length = 8;

        //         e.maxTr = tdarr.max();
        //         for (var k = 0; k < tdarr.length; k++) {
        //             if (tdarr[k] == e.maxTr) {
        //                 idx = k;
        //             }
        //         }
        //         e.maxIdx = idx;
        //     });
        //     // console.log(list);
        //     $('.patient-gis-print .statistics-content').html(templates.template8(list));
        //     $(".hospital-title-text").text($('.nav .firmName').text());
        // });
    })


    //      <!--//血糖记录明细单-->
    $(".details").on("click", function() {
        $(this).addClass('select-choose');
        $(".user-choose").removeClass("hideItem");
        $(this).siblings().removeClass("select-choose");
        $('.details-content').removeClass("hideItem");
        $('.details-content').siblings().addClass("hideItem");
        var lis = $('#sugarStatus .timeBtn');
        var time = '';
        for (var i = 0; i < lis.length; i++) {
            var item = $(lis[i]).find('a').hasClass('bg_sel');
            if (item) {
                time = $(lis[i]).find('a').parent('li').attr('data-time');
            }
        };

        var parmss = {};

        parmss.patientId = baseInfo.patientId || {};
        //	        parms.condition=time;

        //	         console.log(parms);
        //	        获取执行者信息
        ajaxCommon(null, null, null, parmss, pcurl + 'patient/getSugarRecordNurses', function(data) {
            var list = data.ret.nurses;
            $('.user-choose .user-select-list').html(templates.template15(list));
        });
        var parms = {};
        parms.nurseId = $('.user-choose .select-btn').attr('id');
        parms.patientId = baseInfo.patientId;
        // if($('.user-choose .select-btn')){
        // console.log($('.user-choose .select-btn').val())
        // }
        ajaxCommon(null, null, null, parms, pcurl + 'patient/getSugarRecordDetails', function(data) {
            //				var list = {};
            var list = data.ret;
            var tdarr = [];
            list.records.map(function(e, i) {

                var idx = 0;
                var obj = { tests: [], timeType: 0 }
                    //补全数组，首先是要补全这个数组
                    //	               console.log(e.date);
                tdarr[i] = e.date;
                //	               console.log(tdarr)



            });


            $('.patient-gis-print .details-content').html(templates.template13(list));
            $(".hospital-title-text").text($('.nav .firmName').text());
            $(function() {
                $("#detailsTab").rowspan(0); //传入的参数是对应的列数从0开始，哪一列有相同的内容就输入对应的列数值

            });
        })
    });
    //      血糖检测统计单
    $(".statistics").on("click", function() {
        // console.log(2);
        $(".user-choose").addClass("hideItem")
        $(this).addClass('select-choose');
        $(this).siblings().removeClass("select-choose");
        $('.statistics-content').removeClass("hideItem");
        $('.statistics-content').siblings().addClass("hideItem")
        var lis = $('#sugarStatus .timeBtn');
        var time = '';
        for (var i = 0; i < lis.length; i++) {
            var item = $(lis[i]).find('a').hasClass('bg_sel');
            if (item) {
                time = $(lis[i]).find('a').parent('li').attr('data-time');
            }
        };
        var parms = {};
        parms.patientId = baseInfo.patientId;
        parms.condition = time;
        // console.log(parms);

        ajaxCommon(null, null, null, parms, pcurl + 'patient/getAllSugarsById', function(data) {
            var list = data.ret;
            list.statistics.map(function(e, i) {
                var tdarr = [];
                var idx = 0;
                var obj = { tests: [], timeType: 0 }
                    //补全数组，首先是要补全这个数组
                if (e.timeTypeSugars.length < 8) {
                    var length = 8 - e.timeTypeSugars.length;
                    for (var l = 0; l < length; l++) {
                        e.timeTypeSugars.push(obj)
                    }
                }
                e.timeTypeSugars.map(function(ele, j) {
                    var num = ele.tests.length;
                    tdarr.push(num);
                    /*console.log(ele)*/
                    if (ele.timeType != (j + 1)) {
                        /*console.log(j+1);*/
                        var eleobj = { tests: [], timeType: j + 1 }
                        e.timeTypeSugars.splice(j, 0, eleobj);
                    }

                });
                e.timeTypeSugars.length = 8;

                e.maxTr = tdarr.max();
                for (var k = 0; k < tdarr.length; k++) {
                    if (tdarr[k] == e.maxTr) {
                        idx = k;
                    }
                }
                e.maxIdx = idx;
            });
            // console.log(list);
            $('.patient-gis-print .statistics-content').html(templates.template8(list));
            $(".hospital-title-text").text($('.nav .firmName').text());

        })
    })

    //		血糖检测执行单
    $(".implement").on("click", function() {
        console.log(3);
        $(this).addClass('select-choose');
        $(".user-choose").removeClass("hideItem");
        $(this).siblings().removeClass("select-choose");
        $('.implement-content').removeClass("hideItem");
        $('.implement-content').siblings().addClass("hideItem");
        var lis = $('#sugarStatus .timeBtn');
        var time = '';
        for (var i = 0; i < lis.length; i++) {
            var item = $(lis[i]).find('a').hasClass('bg_sel');
            if (item) {
                time = $(lis[i]).find('a').parent('li').attr('data-time');
            }
        };
        var parmss = {};

        parmss.patientId = baseInfo.patientId || {};
        //	        parms.condition=time;

        //	         console.log(parms);
        //	        获取执行者信息
        ajaxCommon(null, null, null, parmss, pcurl + 'patient/getSugarRecordNurses', function(data) {
            var list = data.ret.nurses;
            $('.user-choose .user-select-list').html(templates.template15(list));
            //						console.log(data);
        });
        var parms = {};
        parms.nurseId = $('.user-choose .select-btn').attr('id') || "";
        parms.patientId = baseInfo.patientId;

        ajaxCommon(null, null, null, parms, pcurl + 'patient/getPatientSugarExecution', function(data) {
            var list = {};
            var list = data.ret;
            list.records.map(function(e, i) {
                var tdarr = [];
                var idx = 0;
                var obj = { tests: [], timeType: 0 }

            });
            $('.patient-gis-print .implement-content').html(templates.template14(list));
            $(".hospital-title-text").text($('.nav .firmName').text());
            $(function() {
                $("#implementTab").rowspan(0); //传入的参数是对应的列数从0开始，哪一列有相同的内容就输入对应的列数值

            });
        })


    })


    jQuery.fn.rowspan = function(colIdx) { //封装的一个JQuery小插件
        return this.each(function() {
            var that;
            $('tr', this).each(function(row) {
                $('td:eq(' + colIdx + ')', this).filter(':visible').each(function(col) {
                    if (that != null && $(this).html() == $(that).html()) {
                        rowspan = $(that).attr("rowSpan");
                        if (rowspan == undefined) {
                            $(that).attr("rowSpan", 1);
                            rowspan = $(that).attr("rowSpan");
                        }
                        rowspan = Number(rowspan) + 1;
                        $(that).attr("rowSpan", rowspan);
                        $(this).hide();
                    } else {
                        that = this;
                    }
                });
            });
        });
    }

    $('.patient-gis-print').delegate('.printBtn', 'click', function() {
        $('.print-content').jqprint({
            debug: false, //如果是true则可以显示iframe查看效果（iframe默认高和宽都很小，可以再源码中调大），默认是false
            importCSS: true, //true表示引进原来的页面的css，默认是true。（如果是true，先会找$("link[media=print]")，若没有会去找$("link")中的css文件）
            printContainer: true, //表示如果原来选择的对象必须被纳入打印（注意：设置为false可能会打破你的CSS规则）。
            operaSupport: true //表示如果插件也必须支持歌opera浏览器，在这种情况下，它提供了建立一个临时的打印选项卡。默认是true
        });

    });
    $('.patient-gis-print').delegate('.cancelBtn', 'click', function() {
        $('.patient-gis-print').addClass('hideItem');
    });


    /*患者明细-血糖概况-切换时段/时间*/
    $('#sugarStatus .time-select-btn').delegate('a', 'click', function() {
        // console.log($(this).attr('val'));
        // 点击切换状态
        $(this).addClass('active');
        $(this).siblings('a').removeClass('active');
        var valtime = $(this).attr('val');
        if (valtime == 'table-vertical') { // 时间
            $('.list-time-content').find('#table-vertical').removeClass('hideItem');
            $('.list-time-content').find('.patientList').addClass('hideItem');

            if (!$('#table-vertical').attr('lang')) {
                addTimePatientList()
            }
        } else if (valtime == 'time') { // 时段
            $('.list-time-content').find('.patientList').removeClass('hideItem');
            $('.list-time-content').find('#table-vertical').addClass('hideItem');

            sugarStatusTabel({ patientId: baseInfo.patientId, page: pages.currentPage, condition: 1 });

        }
        // 切换后默认为第一个时间段条件
        $('#sugarStatus>ul').find('li').eq(0).find('a').addClass('bg_sel');
        $('#sugarStatus>ul').find('li').eq(0).siblings().find('a').removeClass('bg_sel');
    });
    $('#table-vertical .tbody').delegate('.tr', 'hover', function() {
            $(this).find('.showmore-remark').toggle();
            $(this).find('.showmore').toggle();

            // console.log($(this).find('.showmore').length);
            if ($(this).find('.showmore').length > 0) {
                var parentLeft = $('#positionLeft').offset().left;
                var childLeft = $(this).find('.showmore').offset().left
                var differ = parentLeft - childLeft;
                var childW = $(this).find('.showmore').width();
                if (differ < childW) {
                    $(this).find('.showmore').css({
                        '-webkit-transform': 'translate(0,100%)',
                        '-moz-transform': 'translate(0,100%)',
                        '-ms-transform': 'translate(0,100%)',
                        '-o-transform': 'translate(0,100%)',
                        'transform': 'translate(0,100%)',
                    })
                } else {
                    $(this).find('.showmore').css({
                        '-webkit-transform': 'translate(90%,100%)',
                        '-moz-transform': 'translate(90%,100%)',
                        '-ms-transform': 'translate(90%,100%)',
                        '-o-transform': 'translate(90%,100%)',
                        'transform': 'translate(90%,100%)',
                    })
                }
            }

        })
        /*-------------------*/
}


//自定义下拉框
$('.patient-gis-print .content .select-patient').delegate('.select-btn', 'click', function(evt) {
    // console.log(999);
    var evt = event || evt;
    if (evt && evt.stopPropagation) {
        evt.stopPropagation()
    } else {
        window.event.cancelBubble = true;
    };
    //		console.log(159);
    $(this).siblings('.list-show').toggle();
    // console.log($(this).siblings('.list-show'));
    $(this).parent().parent().siblings('.item').find('.list-show').hide();
    //      console.log(456);
    var self = $(this);
    //      console.log(5648);
    // 下拉框选项点击功能
    $(self).siblings('.list-show').delegate('li', 'click', function() {
        $(self).val($(this).text().trim());
        // console.log('测试12212');
        $(this).parent().parent().hide();
        $(self).attr('id', $(this).attr('val'));
        // console.log($(self).attr('id'));
        $(self).siblings('.list-show').undelegate();

        var lis = $('#sugarStatus .timeBtn');
        var time = '';
        for (var i = 0; i < lis.length; i++) {
            var item = $(lis[i]).find('a').hasClass('bg_sel');
            if (item) {
                time = $(lis[i]).find('a').parent('li').attr('data-time');
            }
        };
        var parms = {};
        parms.nurseId = $('.user-choose .select-btn').attr('id');
        parms.patientId = baseInfo.patientId;
        if ($('.user-choose .select-btn').val() == '全部') {
            $('.user-choose .select-btn').attr('id', '');
            delete parms.nurseId;
        }

        ajaxCommon(null, null, null, parms, pcurl + 'patient/getSugarRecordDetails', function(data) {

            //	             console.log(data);
            var list = {};
            list = data.ret;
            // console.log(list);
            list.records.map(function(e, i) {
                var tdarr = [];
                var idx = 0;
                var obj = { tests: [], timeType: 0 }
                    //补全数组，首先是要补全这个数组
            });

            $('.patient-gis-print .details-content').html(templates.template13(list));
            $(".hospital-title-text").text($('.nav .firmName').text());
            $(function() {
                $("#detailsTab").rowspan(0); //传入的参数是对应的列数从0开始，哪一列有相同的内容就输入对应的列数值

            });

        })
        ajaxCommon(null, null, null, parms, pcurl + 'patient/getPatientSugarExecution', function(data) {
            var list = {};
            var list = data.ret;
            // console.log(list);
            list.records.map(function(e, i) {
                var tdarr = [];
                var idx = 0;
                var obj = { tests: [], timeType: 0 }

            });
            $('.patient-gis-print .implement-content').html(templates.template14(list));
            $(".hospital-title-text").text($('.nav .firmName').text());
            $(function() {
                $("#implementTab").rowspan(0); //传入的参数是对应的列数从0开始，哪一列有相同的内容就输入对应的列数值

            });
        })


    })

})


//基本信息
function loadPatientInfo(patientId) {
    hideallblock(['secondKinds']);
    $('#searchPatientPop').hide(); //隐藏左边搜索的盒子
    $('#searchPatient input').val('');

    //当前点击名字才是蓝色
    $('.levelTwo').find('li').removeClass('active');
    $(patientId).addClass('active');

    var id = $(patientId).attr('data-patientId');

    // 打通院外---注意阳西项目中要关闭打通院外功能
    //var longling = sessionStorage.getItem('longling');
    //if (!longling) {
    //    sessionStorage.setItem('longling', new Date().getTime());
    //    ajaxCommon(null, false, null, { patientId: id }, pcurl + 'patient/syncOutsideData', function(res) {
    //        // console.log(res);
    //    }, function() {});
    //
    //} else {
    //    var oldTime = sessionStorage.getItem('longling');
    //    var currentTime = new Date().getTime();
    //
    //    var longlongTime = currentTime - oldTime; // 毫秒数
    //    var compareTime = 1000 * 60; //秒
    //    //相差分钟
    //    if (longling > 0 && longlongTime >= compareTime) {
    //        sessionStorage.removeItem('longling');
    //    };
    //}
    /*------------------------------*/

    //基本信息加载
    ajaxCommon(null, null, null, { patientId: id }, pcurl + 'patient/getPatientById', function(res) {
        var data = [res.ret.patient];
        data.map(function(e, i) {
            if (e.birthday) {
                e.age = getAge(e.birthday);
            }
        });
        $('.basicInfoDetail').html(templates.template5(data));

        baseInfo = res.ret.patient;


        $('#yangxiBtn').attr('patientId', baseInfo.patientId);
    }, function() {});







    // 左边--血糖首次加载

    //血糖概况--表格
    $('.list-time-content').find('.patientList').removeClass('hideItem');
    $('.list-time-content').find('#table-vertical').addClass('hideItem');
    // 切换后默认为第一个时间段条件
    $('#sugarStatus>ul').find('li').eq(0).find('a').addClass('bg_sel');
    $('#sugarStatus>ul').find('li').eq(0).siblings().find('a').removeClass('bg_sel');
    $('#sugarStatus .time-select-btn').find('a').eq(0).addClass('active');
    $('#sugarStatus .time-select-btn').find('a').eq(0).siblings().removeClass('active');

    sugarStatusTabel({ patientId: id, page: pages.currentPage, condition: pages.condition });
    //血糖概况--图
    sugarStatusChar({ patientId: id, condition: pages.condition });
    //血糖测量数据分析--折线图
    sugarTestChar({ condition: 1, patientId: id, timeType: 1 });
    //血糖统计表格
    sugarTotalTable({ patientId: id, condition: pages.condition });

}


//左边
function loadTabLeft() {
    $(".tabLeft").removeClass('hideItem');
    $(".tabRight").addClass('hideItem');
}

//日期插件回调
function checkDate(res) {}






//血糖概况--表格
function sugarStatusTabel(parms) {

    pages.statusPage = 1;
    ajaxCommon(null, null, null, parms, pcurl + 'patient/getSugarsById', function(res) {

        var list = res.ret.statistics;
        pages.count = res.ret.pages; //总页数

        list.map(function(e, i) {
            e.timeTypeSugars.map(function(ex, i) {
                ex.text = JSON.parse(localStorage.getItem('bloodSlucosEearlyEarning'));
            })
        })
        console.log(list);
        $('.sugarStatus tbody').html(templates.template6(list));
        if (pages.count > 1) {
            $('.sugarStatus .page').show();
            var open = false;
            $('.sugarStatus .page').createPage(function(n) { //分页
                if (!open) {
                    open = true;
                    return;
                }
                // pages.currentPage = n;
                parms.page = n;
                pages.statusPage = n;

                ajaxCommon(null, null, null, parms, pcurl + 'patient/getSugarsById', function(res) {
                    var list = res.ret.statistics;
                    pages.totalage = res.ret.pages; //总页数
                    list.map(function(e, i) {
                        e.timeTypeSugars.map(function(ex, i) {
                            ex.text = JSON.parse(localStorage.getItem('bloodSlucosEearlyEarning'));
                        })
                    })
                    $('.sugarStatus tbody').html(templates.template6(list));

                }, function() {})

            }, {
                pageCount: pages.count, //总页数
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });

        } else {
            $('.sugarStatus .page').hide();
        }
    }, function() {});
};

//图表按钮点击样式
$('.timeSelect li>a').click(function() {
    $(this).addClass('bg_sel');
    $(this).parent('li').siblings().children().removeClass('bg_sel');
});


//血糖概况--图
function sugarStatusChar(parms) {
    ajaxCommon(null, null, null, parms, pcurl + 'patient/getSugarStatisticsById',
        function(res) {
            var data = res.ret.statistics[0];
            //左边值
            $('#sugarMin').text(data.lowest ? data.lowest : 0);
            $('#sugarMax').text(data.highest ? data.highest : 0);
            $('#sugarCount').text(data.count ? data.count : 0);

            //饼图
            sugarStatusPie(data);
            $('#hightLeft i').text(data.high ? data.high : 0);
            $('#norLeft i').text(data.normal ? data.normal : 0);
            $('#lowLeft i').text(data.low ? data.low : 0);

            //柱图
            var chartData = res.ret.columnCharts;
            sugarStatusBar(chartData);
        },
        function() {});
}
//饼图
function sugarStatusPie(data) {
    var count = data.count;
    var high = (((data.high) / count) * 100).toFixed(2);
    var low = (((data.low) / count) * 100).toFixed(2);
    // var normal = (((data.normal) / count) * 100).toFixed(2);
    // var normal = 100-low-high;
    var normal = (10000 - parseInt(low * 100) - parseInt(high * 100)) / 100;
    // console.log(normal);

    var option = {
        // tooltip : {
        //     trigger: 'item',
        //     formatter: function(params){
        //         return params.value+'%';
        //     }
        // },
        grid: {
            left: 1,
            right: 0,
            bottom: 0,
            containLabel: true
        },

        series: [{
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            itemStyle: {
                normal: {
                    borderColor: '#fff',
                    borderWidth: 2
                }
            },

            labelLine: {
                normal: {
                    length2: 0,
                    lineStyle: {
                        color: '#ccc'
                    }
                }
            },
            label: {
                normal: {
                    textStyle: {
                        color: '#999',
                        fontSize: 14
                    }
                }
            },
            hoverAnimation: false,
            data: [{
                    value: low,
                    name: low + '%',
                    itemStyle: {
                        normal: {
                            color: '#edb344'
                        }
                    }
                },
                {
                    value: high,
                    name: high + '%',
                    itemStyle: {
                        normal: {
                            color: '#f36868'
                        }
                    }
                },
                {
                    value: normal,
                    name: normal + '%',
                    itemStyle: {
                        normal: {
                            color: '#00c2b1'
                        }
                    }

                }
            ]

        }]
    };
    var patientInfoPie = echarts.init(document.getElementById('patientInfoPieChart'));
    patientInfoPie.setOption(option);
}
//柱图
function sugarStatusBar(data) {
    var dataArr = [];
    for (var i = 0; i < data.length; i++) {
        dataArr.push(parseFloat(data[i].times));
    };
    var max = Math.max.apply(null, dataArr);
    if (max == 0) {
        max = 10;
    } else {
        max = parseFloat((max * 1.1).toFixed(2));
    }


    var option = {
        grid: {
            left: 2,
            right: 0,
            bottom: '3%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            axisLabel: {
                interval: 0
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false,
            },
            data: ['0.6-4.3', '4.4-6.9', '7-9.9', '10-14.9', '15-19.9', '20-24.9', '25-29.9', '30-33.3']
        }],
        yAxis: [{
            show: false,
            type: 'value'
        }],
        series: [{
                type: 'bar',
                silent: true,
                itemStyle: {
                    normal: {
                        color: '#d5f1ef'
                    }
                },
                data: [max, max, max, max, max, max, max, max]
            },
            {
                type: 'bar',
                silent: true,
                barGap: '-100%',
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                        textStyle: {
                            color: '#00c2b1',
                            fontSize: 14
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#00c2b1'
                    }
                },
                z: 10,
                data: dataArr
            }
        ]
    };
    var patientInfoPie = echarts.init(document.getElementById('patientInfoBarChart'));
    patientInfoPie.setOption(option);
}


// 血糖测量数据分析--图数据处理
function sugarTestChar(parms) {
    ajaxCommon(null, null, null, parms, pcurl + 'patient/getTestsStatisticsById',
        function(res) {
            var data = res.ret.statistics;
            var dataCountLine = [];
            var timeCountX = [];
            var lowarr = [4.4, 4.4];
            var higharr = '';
            if (parms.timeType == 1 || parms.timeType == 8) {
                higharr = [2.6, 2.6];
            } else {
                higharr = [5.6, 5.6];
            }

            if (data.length == 0) {

                for (var empty = 0; empty < 2; empty++) {
                    timeCountX.push('');
                    dataCountLine.push('');
                };
                sugarStatusLine({
                    dataCountLine: dataCountLine, //数据
                    timeCountX: timeCountX, //x轴日期
                    lowarr: lowarr,
                    higharr: higharr
                })
            } else if (data.length == 1) {

                var dataCount1 = []; //数据提取
                for (var kd1 = 0; kd1 < data.length; kd1++) {
                    var dataList1 = data[kd1];
                    dataCount1.push(dataList1.sugar);
                };
                dataCountLine = dataCount1;

                var timeCount1 = [];
                for (var kt1 = 0; kt1 < data.length; kt1++) {
                    var timeList1 = data[kt1];
                    timeCount1.push(timeList1.date);
                };
                timeCountX = timeDate(timeCount1);

                for (var one = 0; one < 1; one++) {
                    timeCountX.push('');
                    dataCountLine.push('');
                };

                sugarStatusLine({
                    dataCountLine: dataCountLine, //数据
                    timeCountX: timeCountX, //x轴日期
                    lowarr: lowarr,
                    higharr: higharr
                })
            } else if (data.length == 2) {

                var dataCount2 = []; //数据提取
                for (var kd2 = 0; kd2 < data.length; kd2++) {
                    var dataList2 = data[kd2];
                    dataCount2.push(dataList2.sugar);
                };
                dataCountLine = dataCount2;

                var timeCount2 = [];
                for (var kt2 = 0; kt2 < data.length; kt2++) {
                    var timeList2 = data[kt2];
                    timeCount2.push(timeList2.date);
                };
                timeCountX = timeDate(timeCount2);

                sugarStatusLine({
                    dataCountLine: dataCountLine, //数据
                    timeCountX: timeCountX, //x轴日期
                    lowarr: lowarr,
                    higharr: higharr
                })

            } else {
                for (var k4 = 0; k4 < data.length - 2; k4++) {
                    lowarr.splice(1, 0, 4.4);
                    if (parms.timeType == 1 || parms.timeType == 8) {
                        higharr.splice(1, 0, 2.6);
                    } else {
                        higharr.splice(1, 0, 5.6);
                    }
                };

                //数据提取
                var dataCount = [];
                for (var i = 0; i < data.length; i++) {
                    var dataList = data[i];
                    dataCount.push(dataList.sugar);
                };

                // var dataCountLine = dataCount.reverse();
                dataCountLine = dataCount;

                //日期
                var timeCount = [];
                for (var k = 0; k < data.length; k++) {
                    var timeList = data[k];
                    timeCount.push(timeList.date);
                };

                // var timeList = timeCount.reverse();
                // var timeList = timeCount;
                timeCountX = timeDate(timeCount);
                sugarStatusLine({
                    dataCountLine: dataCountLine, //数据
                    timeCountX: timeCountX, //x轴日期
                    lowarr: lowarr,
                    higharr: higharr
                })
            }

        },
        function() {});
}
//血糖测量数据分析--折线图
function sugarStatusLine(data) {
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
            formatter: function(obj) {
                var timeDate = obj.name.replace(/-/g, '月');
                return timeDate + '日：' + obj.value + ' mmol/L';
            }
        },

        grid: {
            left: 20,
            right: 20,
            bottom: '3%',
            containLabel: true
        },

        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.timeCountX
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            axisLine: {
                show: false
            },
            axisLabel: {
                formatter: '{value}.0'
            }
        },
        series: [{
                symbolSize: 0,
                type: 'line',
                lineStyle: {
                    normal: {
                        color: '#e5f9f7'
                    }
                },
                areaStyle: {
                    normal: {
                        color: 'rgba(0,0,0,0)'
                    }
                },
                stack: '叠加',
                data: data.lowarr
            },
            {
                symbolSize: 0,
                lineStyle: {
                    normal: {
                        color: '#e5f9f7'
                    }
                },
                areaStyle: {
                    normal: {
                        color: '#e5f9f7'
                    }
                },
                type: 'line',
                stack: '叠加',
                data: data.higharr
            },
            {
                type: 'line',
                symbol: 'roundRect',
                symbolSize: 6,
                symbolRotate: 45,
                lineStyle: {
                    normal: {
                        color: '#2fa6f0'
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#2fa6f0'
                    }
                },
                data: data.dataCountLine
            }
        ]
    };
    var sugarTestLine = echarts.init(document.getElementById('patientInfoLineChart'));
    sugarTestLine.setOption(option);
}

//血糖统计--表
function sugarTotalTable(obj) {
    ajaxCommon(null, null, null, obj, pcurl + 'patient/getTestsDetilStatisticsById', function(res) {
        var data = res.ret.statistics;
        var totalTableArr = sugarTotalData(data);
        $('.sugarTotal tbody').html(templates.template7(totalTableArr));
    }, function() {});
}
//血糖统计--数据处理
function sugarTotalData(data) {
    var timeTypeArr = []; //时段
    var totalTableObj = {};
    totalTableObj.countArr = []; //总计
    totalTableObj.averageArr = []; //平均值
    totalTableObj.highestArr = []; //最高值
    totalTableObj.lowestArr = []; //最低值
    totalTableObj.highArr = []; //偏高
    totalTableObj.normalArr = []; //正常
    totalTableObj.lowArr = []; //偏低

    for (var i = 0; i < data.length; i++) {
        var itemT = data[i].timeType;
        timeTypeArr[itemT] = itemT;
    };

    for (var k = 0; k < timeTypeArr.length; k++) {
        if (timeTypeArr[k] != undefined) {
            for (var j = 0; j < data.length; j++) {
                if (data[j].timeType == timeTypeArr[k]) {
                    totalTableObj.countArr.push(data[j].count);
                    totalTableObj.averageArr.push(parseFloat(data[j].average).toFixed(2));
                    // averageArr.push(data[j].average);
                    totalTableObj.highestArr.push(data[j].highest);
                    totalTableObj.lowestArr.push(data[j].lowest);
                    totalTableObj.highArr.push(data[j].high);
                    totalTableObj.normalArr.push(data[j].normal);
                    totalTableObj.lowArr.push(data[j].low);
                }
            };

        } else {
            totalTableObj.countArr.push('');
            totalTableObj.averageArr.push('');
            totalTableObj.highestArr.push('');
            totalTableObj.lowestArr.push('');
            totalTableObj.highArr.push('');
            totalTableObj.normalArr.push('');
            totalTableObj.lowArr.push('');
        }
    }


    totalTableObj.countArr.shift();
    totalTableObj.averageArr.shift();
    totalTableObj.highestArr.shift();
    totalTableObj.lowestArr.shift();
    totalTableObj.highArr.shift();
    totalTableObj.normalArr.shift();
    totalTableObj.lowArr.shift();

    totalTableObj.countArr.unshift("总次数");
    totalTableObj.averageArr.unshift("平均血糖(mmol/L)");
    totalTableObj.highestArr.unshift("highestName");
    totalTableObj.lowestArr.unshift("lowestName");
    totalTableObj.highArr.unshift("偏高次数");
    totalTableObj.normalArr.unshift("正常次数");
    totalTableObj.lowArr.unshift("偏低次数");


    for (var H in totalTableObj.countArr) {
        var numH = parseFloat(((totalTableObj.highArr[H] / totalTableObj.countArr[H]) * 100).toFixed(2));
        var numL = parseFloat(((totalTableObj.lowArr[H] / totalTableObj.countArr[H]) * 100).toFixed(2));
        var numN = (10000 - parseInt(numH * 100) - parseInt(numL * 100)) / 100;

        // var numN = parseFloat(((totalTableObj.normalArr[H] / totalTableObj.countArr[H]) * 100).toFixed(2));
        if (isNaN(numH)) {
            totalTableObj.highArr[H] = totalTableObj.highArr[H] + '';
        } else {
            totalTableObj.highArr[H] = totalTableObj.highArr[H] + '(' + numH + '%)';
        }

        if (isNaN(numL)) {
            totalTableObj.lowArr[H] = totalTableObj.lowArr[H] + '';
        } else {
            totalTableObj.lowArr[H] = totalTableObj.lowArr[H] + '(' + numL + '%)';
        }

        if (isNaN(numL)) {
            totalTableObj.normalArr[H] = totalTableObj.normalArr[H] + '';
        } else {
            totalTableObj.normalArr[H] = totalTableObj.normalArr[H] + '(' + numN + '%)';
        }
    }

    return totalTableObj;
}

//添加血糖窗口清空
function clearAddSugar() {
    $('.addSugarTitile p').text('');
    $('#addSugarNo').val('');
    $('#addSugarRemark').val('');
    $('#addSugarTime').val('空腹');
    $('#addSugarTime').attr('data-value', '1');
    $('#addSugarRemark').css({ 'height': '110px' });
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



//血糖预警弹窗
sugarWarnpop();
var warnFlag = 0; //数值超过标准
var dataEmpt = 0; //是否有数据
function sugarWarnpop() {
    $('#sugarWarnBtn').click(function() {
        isSureCode.warnSubmit = true;
        isSureCode.addSubmit = false;
        isSureCode.addSugarSubmit = false;
        isSureCode.updatePwdSubmit = false;

        var patientId = $('#patientInfoUserName').attr('data-patientid');
        $('.PopMask').show();
        $('#sugarWarnBox').show();
        //      console.log(123);
        $("#emptyEx").focus();
        //      console.log(456);
        sugarWarnpopAjax({ patientId: baseInfo.patientId });
    });

    $('#WarnCloseAdd,#WarnCancel').click(function() {
        $('#warnContent').find('input').val('');
        $('.PopMask').hide();
        $('#sugarWarnBox').hide();

    })

}

//确定按钮提交
warnSubmit();

function warnSubmit() {
    $('#WarnSubmit').on('click', function() {

        if (dataEmpt == 1) { //新增
            var dataParms = warnData();
            dataParms.patientId = baseInfo.patientId;
            if (warnFlag != 1) {
                ajaxCommon(null, null, null, dataParms, pcurl + 'patient/addWarnSetting',
                    function(res) {
                        warnFlag = 0;
                        isSureCode.warnSubmit = false;
                        wetoast('添加成功');
                        $('.PopMask').hide();
                        $('#sugarWarnBox').hide();
                    },
                    function() {});
            }
        } else if (dataEmpt == 2) { //更新
            var updateDataParms = warnData();
            updateDataParms.patientId = $('#warnContent').attr('data-patientId');
            updateDataParms.settingId = $('#warnContent').attr('data-settingId');
            if (warnFlag != 1) {
                ajaxCommon(null, null, null, updateDataParms, pcurl + 'patient/updateWarnSetting',
                    function(res) {
                        warnFlag = 0;
                        isSureCode.warnSubmit = false;
                        wetoast('修改成功');
                        $('.PopMask').hide();
                        $('#sugarWarnBox').hide();
                    },
                    function() {});
            }
        }

    });
}

function sugarWarnpopAjax(patientIdObj) {
    ajaxCommon(null, null, null, patientIdObj,
        pcurl + 'patient/getWarnSetting',
        function(res) {
            var data = res.ret.setting;
            if (data == null) { //没有数据，新添加
                dataEmpt = 1;

            } else { //有数据，填上去
                dataEmpt = 2;

                $('#warnContent').attr('data-patientId', data.patientId); //患者id
                $('#warnContent').attr('data-settingId', data.settingId); //settingID
                $('#emptyEx').val(data.beforeBreakfastEx); //空腹1
                $('#emptyAf').val(data.beforeBreakfastAf); //空腹2
                $('#afterBreakfastEx').val(data.afterBreakfastEx); //早餐后1
                $('#afterBreakfastAf').val(data.afterBreakfastAf); //早餐后2
                $('#beforeLunchEx').val(data.beforeLunchEx); //午餐前1
                $('#beforeLunchAf').val(data.beforeLunchAf); //午餐前2
                $('#afterLunchEx').val(data.afterLunchEx); //午餐后1
                $('#afterLunchAf').val(data.afterLunchAf); //午餐后2
                $('#beforeDinnerEx').val(data.beforeDinnerEx); //晚餐前1
                $('#beforeDinnerAf').val(data.beforeDinnerAf); //晚餐前2
                $('#afterDinnerEx').val(data.afterDinnerEx); //晚餐后1
                $('#afterDinnerAf').val(data.afterDinnerAf); //晚餐后2
                $('#beforeSleepEx').val(data.beforeSleepEx); //睡前1
                $('#beforeSleepAf').val(data.beforeSleepAf); //睡前2
                $('#beforeDawnEx').val(data.beforeDawnEx); //凌晨1
                $('#beforeDawnAf').val(data.beforeDawnAf); //凌晨2
            }
        },
        function() {});
}
//数据处理
function warnData() {
    var dataParms = {};
    dataParms.obj1 = {};
    dataParms.obj2 = {};
    dataParms.obj3 = {};
    dataParms.obj4 = {};
    dataParms.obj5 = {};
    dataParms.obj6 = {};
    dataParms.obj7 = {};
    dataParms.obj8 = {};
    dataParms.obj1.beforeBreakfastEx = $('#emptyEx').val() - 0; //空腹1
    dataParms.obj1.beforeBreakfastAf = $('#emptyAf').val() - 0; //空腹2
    dataParms.obj2.afterBreakfastEx = $('#afterBreakfastEx').val() - 0; //早餐后1
    dataParms.obj2.afterBreakfastAf = $('#afterBreakfastAf').val() - 0; //早餐后2
    dataParms.obj3.beforeLunchEx = $('#beforeLunchEx').val() - 0; //午餐前1
    dataParms.obj3.beforeLunchAf = $('#beforeLunchAf').val() - 0; //午餐前2
    dataParms.obj4.afterLunchEx = $('#afterLunchEx').val() - 0; //午餐后1
    dataParms.obj4.afterLunchAf = $('#afterLunchAf').val() - 0; //午餐后2
    dataParms.obj5.beforeDinnerEx = $('#beforeDinnerEx').val() - 0; //晚餐前1
    dataParms.obj5.beforeDinnerAf = $('#beforeDinnerAf').val() - 0; //晚餐前2
    dataParms.obj6.afterDinnerEx = $('#afterDinnerEx').val() - 0; //晚餐后1
    dataParms.obj6.afterDinnerAf = $('#afterDinnerAf').val() - 0; //晚餐后2
    dataParms.obj7.beforeSleepEx = $('#beforeSleepEx').val() - 0; //睡前1
    dataParms.obj7.beforeSleepAf = $('#beforeSleepAf').val() - 0; //睡前2
    dataParms.obj8.beforeDawnEx = $('#beforeDawnEx').val() - 0; //凌晨1
    dataParms.obj8.beforeDawnAf = $('#beforeDawnAf').val() - 0; //凌晨2

    compare(dataParms.obj1.beforeBreakfastEx, dataParms.obj1.beforeBreakfastAf);
    compare(dataParms.obj2.afterBreakfastEx, dataParms.obj2.afterBreakfastAf);
    compare(dataParms.obj3.beforeLunchEx, dataParms.obj3.beforeLunchAf);
    compare(dataParms.obj4.afterLunchEx, dataParms.obj4.afterLunchAf);
    compare(dataParms.obj5.beforeDinnerEx, dataParms.obj5.beforeDinnerAf);
    compare(dataParms.obj6.afterDinnerEx, dataParms.obj6.afterDinnerAf);
    compare(dataParms.obj7.beforeSleepEx, dataParms.obj7.beforeSleepAf);
    compare(dataParms.obj8.beforeDawnEx, dataParms.obj8.beforeDawnAf);

    for (var k in dataParms) {
        var itemObjNo = dataParms[k];
        for (var j in itemObjNo) {
            var listKey = itemObjNo[j];
            if (listKey == '') {
                for (var p in itemObjNo) {
                    itemObjNo[p] = '';
                }
            }
        }
    }

    var dataParmsNew = $.extend(dataParms.obj1, dataParms.obj2, dataParms.obj3, dataParms.obj4, dataParms.obj5, dataParms.obj6, dataParms.obj7, dataParms.obj8);
    return dataParmsNew;

}

function compare(a, b) {
    if (a == '' || b == '') {
        a = 0;
        b = 0;
    }
    if (a > b) {
        warnFlag = 1;
        //提示
        $("#warnPopTips").show();
        $("#warnPopTips").text('请正确填写值');
        setTimeout(function() {
            $("#warnPopTips").hide();
        }, 1000);

    }
    if (a < b) {
        warnFlag = 0;
    }
}
//限制只能是小数点1位
function clearNoNum(obj) {
    obj.value = obj.value.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    obj.value = obj.value.replace(/^\./g, ""); //验证第一个字符是数字而不是
    obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$2'); //只能输入1个小数
}


//编辑信息弹窗
editPatientPop();

function editPatientPop() {

    $('#sugarEditBtn').on('click', function() {
        isSureCode.addSubmit = true;
        isSureCode.updatePwdSubmit = false;
        isSureCode.warnSubmit = false;
        isSureCode.addSugarSubmit = false;

        addPatientFlag = 2;
        $('.PopMask').show();
        $('.addPatientPop').show();
        document.documentElement.style.overflow = "hidden";
        $('.addPatientPop').find('#addPatientSubmit').attr('value', 'edit');
        var addOrEdit = $('#addPatientSubmit').attr('value');
        deptajax(addOrEdit);
        clearAddPatient();
        $('#addHospitalizationNo').attr('readonly', 'readonly');
        // 将信息填上去
        $('#addTitlePop span').text('编辑患者');
        $('#addHospitalizationNo').val(baseInfo.hospitalizationNo); //住院号
        $('#addUserName').val(baseInfo.name); //姓名
        var sex = baseInfo.sex; //性别
        if (sex == 1) {
            $("#addSex .male input[type='radio']").attr('checked', 'checked');
        } else {
            $("#addSex .female input[type='radio']").attr('checked', 'checked');
        }
        var birthday = baseInfo.birthday; //出生年月
        if (birthday) {
            $('#addBirthday').val(birthday.split(' ')[0]);
        }

        $('#addIdCard').val(baseInfo.idCard); //身份证号
        $('#addHeight').val(baseInfo.height); //身高
        $('#addWeight').val(baseInfo.weight); //体重

        var InHospitalTime = baseInfo.inhospitalTime; //入院日期
        if (InHospitalTime) {
            $('#addInHospitalNo').val(InHospitalTime.split(' ')[0]);
        }

        $('#addDeptId').val(baseInfo.deptName); //科室
        $('#addDeptId').attr('data-value', baseInfo.deptId);
        $('#addDoctorId').val(baseInfo.doctorName); //主治医师
        $('#addDoctorId').attr('data-value', baseInfo.doctorId);
        $('#addNurseId').val(baseInfo.nurseName); //责任护士
        $('#addNurseId').attr('data-value', baseInfo.nurseId);
        var diabetesType = baseInfo.diabetesType; //分组糖尿病
        if (diabetesType == 1) {
            $('#addDiabetesType').val('一型糖尿病');
            $('#addDiabetesType').attr('data-value', 1);
        } else if (diabetesType == 2) {
            $('#addDiabetesType').val('二型糖尿病');
            $('#addDiabetesType').attr('data-value', 2);
        } else if (diabetesType == 3) {
            $('#addDiabetesType').val('妊娠型糖尿病');
            $('#addDiabetesType').attr('data-value', 3);
        } else if (diabetesType == 4) {
            $('#addDiabetesType').val('特殊类型糖尿病');
            $('#addDiabetesType').attr('data-value', 4);
        } else {
            $('#addDiabetesType').val('非糖尿病');
            $('#addDiabetesType').attr('data-value', 5);
        }

        $('#addSickbedNo').val(baseInfo.sickbedNo); //床号
        $('#addMobile').val(baseInfo.mobile); //手机号
        var nurseLevel = baseInfo.nurseLevel; //护理级别
        if (nurseLevel == 1) {
            $('#addNurseLevel').val('一级护理');
            $('#addNurseLevel').attr('data-value', 1);
        } else if (nurseLevel == 2) {
            $('#addNurseLevel').val('二级护理');
            $('#addNurseLevel').attr('data-value', 2);
        } else if (nurseLevel == 3) {
            $('#addNurseLevel').val('三级护理');
            $('#addNurseLevel').attr('data-value', 3);
        } else {
            $('#addNurseLevel').val('特级护理');
            $('#addNurseLevel').attr('data-value', 4);
        }

        $('#addInhospitalDiagnose').val(baseInfo.inhospitalDiagnose); //入院诊断
        $('#addComplication').val(baseInfo.complication); //并发症
        $('#addFamilySickness').val(baseInfo.familySickness); //家族史
        $('#addAllergy').val(baseInfo.allergy); //药物过敏史
        $('#addHistoryTherapy').val(baseInfo.historyTherapy); //过去治疗方式

    })
}

//关闭添加患者弹窗
closeAddPatientPop();

function closeAddPatientPop() {
    $('#closeAdd,#cancel').click(function() {
        clearAddPatient();
        $(this).parents('.addPatientPop').hide();
        $(this).parents().find('.PopMask').hide();
        document.documentElement.style.overflow = "scroll";
        if (isOpenAdd == 1) {
            window.location.href = 'index.html';
        }

    });
}

//确定发送数据-新增患者/编辑患者确定按钮
$('#addPatientSubmit').click(function() {
    var newParms = {};
    newParms.hospitalizationNo = $('#addHospitalizationNo').val();
    newParms.name = $('#addUserName').val();
    newParms.sex = $("#addSex input[type='radio']:checked").val();
    newParms.birthday = $('#addBirthday').val();

    newParms.inhospitalTime = $('#addInHospitalNo').val();

    newParms.deptId = $('#addDeptId').attr('data-value');
    newParms.doctorId = $('#addDoctorId').attr('data-value');
    newParms.nurseId = $('#addNurseId').attr('data-value');
    newParms.diabetesType = $('#addDiabetesType').attr('data-value');

    newParms.sickbedNo = $('#addSickbedNo').val();
    newParms.nurseLevel = $('#addNurseLevel').attr('data-value');

    for (var k in newParms) {
        if (!newParms[k]) {
            $(".addPatientPop .tips").show();
            $(".addPatientPop .tips").text('请确认所有信息都已经填写完整');
            setTimeout(function() {
                $(".addPatientPop .tips").hide();
            }, 1000);
            return;
        }
    }

    newParms.inhospitalDiagnose = $('#addInhospitalDiagnose').val();
    newParms.idCard = $('#addIdCard').val();
    newParms.mobile = $('#addMobile').val();

    if (newParms.mobile != null && newParms.mobile != undefined && newParms.mobile.length > 0 && /^1[345678][0-9]{9}$/.test(newParms.mobile) == false) {
        $(".addPatientPop .tips").show();
        $(".addPatientPop .tips").text('手机号格式不正确');
        setTimeout(function() {
            $(".addPatientPop .tips").hide();
        }, 1000);
        return;
    }


    newParms.height = $('#addHeight').val();
    newParms.weight = $('#addWeight').val();
    newParms.complication = $('#addComplication').val();
    newParms.familySickness = $('#addFamilySickness').val();
    newParms.allergy = $('#addAllergy').val();
    newParms.historyTherapy = $('#addHistoryTherapy').val();

    var btnVal = $(this).val();
    if (btnVal == 'add') {
        ajaxCommon(null, null, null, newParms, pcurl + 'patient/addPatient', function(res) {
            wetoast('添加成功');
            isSureCode.addSubmit = false;
            $('.addPatientPop').hide();
            $('.PopMask').hide();
            document.documentElement.style.overflow = "scroll";
            window.location.href = 'index.html';
        }, function(res) {

            $(".addPatientPop .tips").show();
            // $(".addPatientPop .tips").text('再检查一下填入信息');
            $(".addPatientPop .tips").text(res.errorMsg);
            setTimeout(function() {
                $(".addPatientPop .tips").hide();
            }, 1000);
        });
    } else if (btnVal == 'edit') {
        newParms.patientId = baseInfo.patientId;
        newParms.status = baseInfo.status;
        ajaxCommon(null, null, null, newParms, pcurl + 'patient/updatePatient', function(res) {
            wetoast('修改成功');
            $('.addPatientPop').hide();
            $('.PopMask').hide();
            document.documentElement.style.overflow = "scroll";
            isSureCode.addSubmit = false;
            //重新渲染基本信息
            ajaxCommon(null, null, null, { patientId: baseInfo.patientId }, pcurl + 'patient/getPatientById', function(res) {
                var data = [res.ret.patient];
                data.map(function(e, i) {
                    if (e.birthday) {
                        e.age = getAge(e.birthday);
                    }
                });
                $('.basicInfoDetail').html(templates.template5(data));
                baseInfo = res.ret.patient;
            }, function() {});
            //              //左边菜单更新
            ajaxCommon(null, null, null, {}, pcurl + 'workbench/getPatientsByType', function(res) {
                $('#Sugar1 ul,#Sugar2 ul,#Sugar3 ul,#Sugar4 ul,#Sugar5 ul').html('');
                var data = res.ret.patients;
                //                  patientType(data);
            }, function() {});
        }, function() {});
    }

});

//图表按钮点击样式
$('.timeSelect li>a').click(function() {
    $(this).addClass('bg_sel');
    $(this).parent('li').siblings().children().removeClass('bg_sel');
});


// 添加患者下拉框
$(".select_box").click(function(event) {
    var options = $(this).find(".option_box").children('a');
    if (options.length == 0) {
        $(this).find(".option_box").hide();
    } else {
        $(this).find(".option_box").toggle();
        $(this).parents().siblings().find(".option_box").hide();
    }

});


//*赋值给文本框*/
$(".option_box a").click(function() {
    var value = $(this).text();
    var dataVal = $(this).attr('data-value');
    $(this).parent().siblings("input").val(value);
    $(this).parent().siblings("input").attr('data-value', dataVal);
});
//点击其他位置也隐藏
$(document).on('click', function(e) {
    if ($(e.target).eq(0).is($(".itemSelct input"))) {
        return;
    }
    // $(".listBox .option_box").hide();
    $(".option_box").hide();
});


/*龙陵医院电脑血糖检测记录表打印表2*/
$('#addSugarPrintBtn2').on('click', function() {
    $('.patient-gis-print2').removeClass('hideItem');

    var lis = $('#sugarStatus .timeBtn');
    var time = '';
    for (var i = 0; i < lis.length; i++) {
        var item = $(lis[i]).find('a').hasClass('bg_sel');
        if (item) {
            time = $(lis[i]).find('a').parent('li').attr('data-time');
        }
    }

    var parms = {};
    parms.patientId = baseInfo.patientId;
    parms.condition = time;

    ajaxCommon(null, null, null, parms, pcurl + 'patient/getSugarRecordTwo', function(data) {

        var list = data.ret.sugarTests;

        var newList = [];
        $.each(list, function(j, e) {
            for (var i = 0; i < newList.length; i++) {
                if (newList[i].createTime.split(' ')[0] === e.createTime.split(' ')[0]) {
                    newList[i].daylist.push(e);
                    return;
                }
            }
            newList.push({
                createTime: e.createTime,
                daylist: [e]
            });
        });

        $('.patient-gis-print2 .print-content2 tbody').html(templates.template9(newList));

        var infoData = [data.ret.patient];
        $('.patient-gis-print2 .patient-info').html(templates.template11(infoData));

        $('.patient-gis-print2 .hospital-title').find('.name').html('龙陵县人民医院' + (data.ret.patient.deptName ? data.ret.patient.deptName : ''));
    }, function() {})

})

$('.patient-gis-print2').delegate('.printBtn', 'click', function() {
    $('.print-content2').jqprint({
        debug: false, //如果是true则可以显示iframe查看效果（iframe默认高和宽都很小，可以再源码中调大），默认是false
        importCSS: true, //true表示引进原来的页面的css，默认是true。（如果是true，先会找$("link[media=print]")，若没有会去找$("link")中的css文件）
        printContainer: true, //表示如果原来选择的对象必须被纳入打印（注意：设置为false可能会打破你的CSS规则）。
        operaSupport: true //表示如果插件也必须支持歌opera浏览器，在这种情况下，它提供了建立一个临时的打印选项卡。默认是true
    });

});

$('.patient-gis-print2').delegate('.cancelBtn', 'click', function() {
    $('.patient-gis-print2').addClass('hideItem');
})

/*龙陵医院电脑血糖检测记录表打印表3*/
$('#addSugarPrintBtn3').on('click', function() {
    $('.patient-gis-print3').removeClass('hideItem');
    document.documentElement.style.overflow = "hidden";
    var date = new Date();
    var strDate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
    $('#startDate').val(strDate);
    $('#endDate').val(strDate);

    var params = {};
    params.patientId = baseInfo.patientId;
    params.dateEx = $('#startDate').val();
    params.dateAf = $('#endDate').val();
    // console.log(parms);
    dateSelectAjax(params)

})

$('.patient-gis-print3').delegate('.printBtn', 'click', function() {
    $('.print-content3').jqprint({
        debug: false, //如果是true则可以显示iframe查看效果（iframe默认高和宽都很小，可以再源码中调大），默认是false
        importCSS: true, //true表示引进原来的页面的css，默认是true。（如果是true，先会找$("link[media=print]")，若没有会去找$("link")中的css文件）
        printContainer: true, //表示如果原来选择的对象必须被纳入打印（注意：设置为false可能会打破你的CSS规则）。
        operaSupport: true //表示如果插件也必须支持歌opera浏览器，在这种情况下，它提供了建立一个临时的打印选项卡。默认是true
    });

});

$('.patient-gis-print3').delegate('.cancelBtn', 'click', function() {
    $('.patient-gis-print3').addClass('hideItem');
    document.documentElement.style.overflow = "scroll";
})

var start = {
    elem: '#startDate',
    format: 'YYYY-MM-DD',
    istoday: false,
    // min: '2099-06-16', //设定最小日期为当前日期
    max: laydate.now(), //最大日期
    choose: function(date) {
        $('#startDate').val(date);
        end.min = date //将结束日的初始值设定为开始日
    }
}

var end = {
    elem: '#endDate',
    format: 'YYYY-MM-DD',
    istoday: false,
    // min: '2099-06-16', //设定最小日期为当前日期
    max: laydate.now(), //最大日期
    choose: function(date) {
        $('#endDate').val(date);
        var startDate = $('#startDate').val();
        start.max = date;
        var diff = getDays(startDate, date);
        if (diff) {
            $('#startDate').val('');
        }
    }
}

laydate(start);
laydate(end);

function getDays(startDate, endDate) {
    var aStart = startDate.split('-'); //转成成数组，分别为年，月，日，下同
    var aEnd = endDate.split('-');
    var startDateTemp = aStart[0] + "/" + aStart[1] + "/" + aStart[2];
    var endDateTemp = aEnd[0] + "/" + aEnd[1] + "/" + aEnd[2];
    if (startDateTemp > endDateTemp)
        return true;
    else
        return false;
}


function dateSelect() {
    var params = {};
    params.patientId = baseInfo.patientId;
    var start = $('#startDate').val();
    var end = $('#endDate').val();
    if (start == '' || end == '') {
        alert('请选择日期');
    } else {
        params.dateEx = start;
        params.dateAf = end;
        dateSelectAjax(params)
    }
}

function dateSelectAjax(dateObj) {
    ajaxCommon(null, null, null, dateObj, pcurl + 'patient/getSugarRecordThird', function(res) {
        var data = res.ret.sugarTestLogs;
        var list = chunkDate(data, 4);
        var infoData = res.ret.patient;
        if (infoData.birthday) {
            infoData.age = getAge(infoData.birthday);
        }

        var info = '<div class="item"><span>姓名 ：' + infoData.name + '</span></div>' +
            '<div class="item"><span>性别 ：' + (infoData.sex == 1 ? '男' : '女') + '</span></div>' +
            '<div class="item"><span>年龄 ：' + (infoData.age ? infoData.age + '岁' : '') + '</span></div>' +
            '<div class="item"><span>床位号 : ' + infoData.sickbedNo + '</span></div>' +
            '<div class="item"><span>住院号 : ' + infoData.hospitalizationNo + '</span></div>';

        $('.patient-gis-print3 .print-content3').html(templates.template10(list));

        $('.patient-gis-print3 .patient-info').append(info);

        $('.patient-gis-print3 .hospital-title').find('.name').html('龙陵县人民医院' + (res.ret.patient.deptName ? res.ret.patient.deptName : ''));

    })
}

function chunkDate(data, size) {
    var group = [];
    for (var i = 0; i < data.length; i = i + size) {
        group.push(data.slice(i, i + size));
    };
    return group;
}


/*患者明细页面-血糖概况-新增时间表*/

function addTimePatientList(params) {
    if (!params) {
        //condition: 1-最近一周 2-最近1个月 3-最近三个月 4全部
        params = { patientId: baseInfo.patientId, page: 1, condition: 1 }
    }
    // console.log(params);
    var count = 0;
    ajaxCommon(null, null, null, params, pcurl + '/patient/getSugarsByIdTime', function(data) {
        //      console.log(data);
        count = data.ret.pages;
        var list = data.ret.tests;


        var datalist = gettableVerticaldata(list);

        //      console.log(datalist);

        $('#table-vertical .tbody').html(templates.template12(datalist));
        if (count > 1) {
            $('#table-vertical .page').show();
            var open = false;
            $('#table-vertical .page').createPage(function(n) { //分页
                if (!open) {
                    open = true;
                    return;
                }
                params.page = n;
                ajaxCommon(null, null, null, params, pcurl + '/patient/getSugarsByIdTime', function(data) {
                    var list = data.ret.tests;
                    var datalist = gettableVerticaldata(list);

                    $('#table-vertical .tbody').html(templates.template12(datalist));
                });

            }, {
                pageCount: count,
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });
        } else {
            $('#table-vertical .page').hide();
        }
    });

}


function gettableVerticaldata(list) {
    var newList = [];
    $.each(list, function(j, e) {
        for (var i = 0; i < newList.length; i++) {
            if (newList[i].createTime.split(' ')[0] === e.createTime.split(' ')[0]) {
                newList[i].testlist.push(e);
                return;
            }
        }
        newList.push({
            createTime: e.createTime,
            testlist: [e]
        });
    });

    newList.map(function(ele, i) {
        // console.log(ele);
        ele.allList = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ]
        ele.testlist.map(function(dom, k) {
            var comparetime = dom.createTime.split(' ')[1].split(':');
            comparetime.pop();
            if (comparetime[0].length == 1) {
                comparetime[0] = '0' + comparetime[0]
            }
            var str = comparetime[0];

            if (str >= '07' && str <= '09') {
                ele.allList[0].push(dom)
            } else if (str >= '10' && str <= '12') {
                ele.allList[1].push(dom)
            } else if (str >= '13' && str <= '15') {
                ele.allList[2].push(dom)
            } else if (str >= '16' && str <= '18') {
                ele.allList[3].push(dom)
            } else if (str >= '19' && str <= '21') {
                ele.allList[4].push(dom)
            } else if ((str >= '22') || (str >= '00' && str < '01')) {
                ele.allList[5].push(dom)
            } else if (str >= '00' && str <= '03') {
                ele.allList[6].push(dom)
            } else if (str >= '04' && str <= '06') {
                ele.allList[7].push(dom)
            }

        });
    });

    $.each(newList, function(k2, dom2) {
        dom2.allList.map(function(element, n) {
            if (element.length < 6) {
                var numlength = 6 - element.length;
                for (var m = 0; m < numlength; m++) {
                    element.push({ createTime: '0000-00-00 00:00:00' })
                }
            } else {
                return;
            }
        })
    })

    return newList;
}


// 患者明细页
function getPatientData(patientId) {
    // hideallblock(['patient-info']);
    // console.log(patientId);
}

function loadDept() { //加载科室下拉列表
    $('.transfer').find('.deptList').parent().siblings('.select-btn').val('');
    $('.transfer').find('.deptList').parent().siblings('.select-btn').removeAttr('valId');

    var deptId = '';
    ajaxCommon(null, null, null, {}, pcurl + 'dept/getAllDept', function(data) {
        var list = data.ret.depts;
        var str = '';
        $.each(list, function(i, item) {
            str += '<li val="' + item.departmentId + '">' + item.name + '</li>';
        })
        $('.transfer').find('.deptList').html(str);
        //默认显示第一个
        /*$('.transfer').find('.deptList').parent().siblings('.select-btn').val(list[0].name);
        $('.transfer').find('.deptList').parent().siblings('.select-btn').attr('valId',list[0].departmentId);*/
        deptId = list[0].departmentId;
        // 默认显示第一个医生
        /*loadDoctor(deptId);
        loadNurse(deptId);*/
    })

}

function loadDoctor(deptId) {
    $('.transfer').find('.doctorList').parent().siblings('.select-btn').val('');
    $('.transfer').find('.doctorList').parent().siblings('.select-btn').removeAttr('valId');

    ajaxCommon(null, null, null, { deptId: deptId }, pcurl + 'user/getDoctors', function(data) {
        var list = data.ret.doctors;
        var str = '';
        $.each(list, function(i, item) {
            str += '<li val="' + item.userId + '">' + item.name + '</li>';
        })

        if (str == '') { //加入没有主治医生
            str = '<span style="width: 100%;text-align: center;display: block;font-size: 14px;">暂无数据</span>';
            $('.transfer').find('.doctorList').parent().siblings('.select-btn').val('暂无数据');
            $('.transfer').find('.doctorList').parent().siblings('.select-btn').removeAttr('valId');
        }
        $('.transfer').find('.doctorList').html(str);

        if (list.length > 0) {
            //默认显示第一个
            $('.transfer').find('.doctorList').parent().siblings('.select-btn').val(list[0].name);
            $('.transfer').find('.doctorList').parent().siblings('.select-btn').attr('valId', list[0].userId);
        }

    })
}

function loadNurse(deptId) {
    $('.transfer').find('.nurseList').parent().siblings('.select-btn').val('');
    $('.transfer').find('.nurseList').parent().siblings('.select-btn').removeAttr('valId');

    ajaxCommon(null, null, null, { deptId: deptId }, pcurl + 'user/getNurses', function(data) {

        var list = data.ret.nurses;
        var str = '';
        $.each(list, function(i, item) {
            str += '<li val="' + item.userId + '">' + item.name + '</li>';
        })

        if (str == '') { //加入没有责任护士
            str = '<span style="width: 100%;text-align: center;display: block;font-size: 14px;">暂无数据</span>';
            $('.transfer').find('.nurseList').parent().siblings('.select-btn').val('暂无数据');
            $('.transfer').find('.nurseList').parent().siblings('.select-btn').removeAttr('valId');
        }
        $('.transfer').find('.nurseList').html(str);

        if (list.length > 0) {
            //默认显示第一个
            $('.transfer').find('.nurseList').parent().siblings('.select-btn').val(list[0].name);
            $('.transfer').find('.nurseList').parent().siblings('.select-btn').attr('valId', list[0].userId);
        }

    })
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

//限制只能是小数点两位
function clearNoNum(obj) {
    obj.value = obj.value.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    obj.value = obj.value.replace(/^\./g, ""); //验证第一个字符是数字而不是
    obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
}