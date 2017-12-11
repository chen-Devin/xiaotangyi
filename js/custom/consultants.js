var templateType = GetQueryString('templateType');
var templates = {
    template1: _.template($('#consultants-manage-template').html()), // 会诊管理数据
    template2: _.template($('#doctor-consultants-template').html()), // 医生会诊管理
    template3: _.template($('#doctor-handle-template').html()), // 医生会诊管理-处理/修改会诊
    template4: _.template($('#consultants-record-template').html()), // 会诊记录查看
}
var iskeydow = { newConsultants: false, handle: false }

$(function() {
    secondNav();
    initpage();
    loadDept(); //获取科室下拉框


    if (templateType == '2') {
        $('.leftNav').find("li[val='doctor-consultants']").addClass('active').siblings().removeClass('active');
        $('.doctor-consultants .title-search').find('.state').val('未处理').attr('valId', '1');
        doctorConsultants();

    } else {
        //初始化数据
        consultantsManage();
    }



    $(document).keydown(function(e) {
        var theEvent = e || window.event || arguments.callee.caller.arguments[0];
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == 13 && e.srcElement.type != 'textarea') {
            //回车执行查询
            e.preventDefault();

            if (iskeydow.newConsultants) {
                $('.newConsultants .sureBtn').click();
            } else if (iskeydow.handle) {
                $('.handle-consultants .sureBtn').click();
            }

        }
    })
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

            if (i == 0 && templateType == '2') {
                window.location.href = 'consultants.html';
            }
        })
        initSearchNav()
    });
}

function initpage() {
    //自定义下拉框
    $('.select').delegate('.select-btn', 'click', function(evt) {
        var e = evt || event;
        e.stopPropagation(); //阻止事件冒泡即可
        e.cancelBubble = true;

        $(this).closest('.rightBox').find('.select').children('.list-show').hide();
        $(this).siblings('.list-show').toggle();

        var self = $(this);

        // 下拉框选项点击功能
        $(self).siblings('.list-show').find('li').unbind('click').click(function() {
            //关联科室-医生
            $('.main-content .rightBox .consultants-manage .newConsultants .pupop-content .text-content .item .second-item input').css('padding', '.1px 5px')
            if ($(this).parent().hasClass('deptList')) {
                var deptid = $(this).attr('val');
                if ($(self).val() != $(this).text()) { // 如何选择和select-btn的值一样，则不改变医生的请求
                    loadDoctor(deptid);
                }
            }

            $(self).val($(this).text());
            $(this).parent().parent().hide();
            $(self).attr('valId', $(this).attr('val'));
        })
    })

    $('.main-content').on('click', function() { // 点击其他也要关闭下拉框
        $(this).find('.list-show').hide();
        $(this).find('.text-show').hide();
    });
    // 模糊搜索
    var oldtxt = '';
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]"); // 特殊字符验证
    $('.text-serach input').bind('input propertychange', function() {
        // console.log(oldtxt+'---'+$(this).val())
        // &&oldtxt!=$(this).val()
        if ($(this).val().length > 0 && !pattern.test($(this).val())) {
            oldtxt = $(this).val();
            $(this).siblings('.text-show').show();
            var str = '';
            var self = $(this);
            // 加入改变了输入的值就去掉valId
            $(this).removeAttr('valId');
            ajaxCommon(null, null, null, { condition: $(this).val() }, pcurl + 'patient/getPatientsByCondition', function(data) {
                // console.log(data);
                var list = data.ret.patients;
                $.each(list, function(i, e) {
                    str += '<li val="' + e.patientId + '"><span>' + e.name + '</span><span>' + e.sickbedNo + '床</span><span>' + e.hospitalizationNo + '</span></li>'
                })
                if (list.length == 0) {
                    str = '<span style="font-size: 14px;padding-left: 10px;">没有查询到此人</span>';
                }
                $(self).siblings('.text-show').find('.text-list').html(str);
            })

        } else {
            $(this).siblings('.text-show').hide(); // 输入框为空的时候隐藏
        }
    });
    $('.newConsultants .pupop-content').on('click', function() {
        if ((!$('.text-serach input').attr('valId')) && $('.text-serach input').val().length > 0) {
            $('.text-serach input').val('');
            $('.newConsultants').find('.tips').show().text('请选择一个患者');
        }
    })

    $('.text-serach .text-list').delegate('li', 'click', function() {
        $(this).parent().parent().siblings('input').val($(this).find('span').eq(0).text());
        $(this).parent().parent().siblings('input').attr('valId', $(this).attr('val'));
        $('.newConsultants').find('.tips').hide();

    })

    // 打印
    $('.consultantsRecord').delegate('.print', 'click', function() {
        $(".print-content").jqprint({
            debug: false, //如果是true则可以显示iframe查看效果（iframe默认高和宽都很小，可以再源码中调大），默认是false
            importCSS: true, //true表示引进原来的页面的css，默认是true。（如果是true，先会找$("link[media=print]")，若没有会去找$("link")中的css文件）
            printContainer: true, //表示如果原来选择的对象必须被纳入打印（注意：设置为false可能会打破你的CSS规则）。
            operaSupport: true //表示如果插件也必须支持歌opera浏览器，在这种情况下，它提供了建立一个临时的打印选项卡。默认是true
        });
    });
    $('.consultantsRecord').delegate('.export', 'click', function() {
        //         console.log($(this).attr('consultantsId'));
        window.location.href = "/hospital-manage/consultation/printConsultation?consultationId=" + $(this).attr('consultantsId');

    })

    /*会诊管理*/
    $('.consultants-manage thead').delegate('.td1', 'click', function() {
            if ($(this).find('input').is(':checked')) {
                $('.consultants-manage tbody').find('.td1').children('input').attr('checked', true);
            } else {
                $('.consultants-manage tbody').find('.td1').children('input').attr('checked', false);
            }
        })
        // 新建会诊
    $('.consultants-manage').delegate('.addconsultants', 'click', function() {
        $('.newConsultants').removeClass('hideItem');
        $('.newConsultants .title').find('span').html('新建会诊' + ' <span style="font-size: 14px;">(全部为必填项)</span>');
        $('.newConsultants').find('.tips').hide();
        $('.newConsultants').attr('type', 'newtype');


        $('.newConsultants').find('.patient-name').val('');
        $('.consultants-manage').find('.consultants-text').val('');
        // 会诊管理下拉框默认选中第一个
        $('.newConsultants').find('.select').map(function(i, ele) {
            var txt = $(ele).find('.list-show').find('li').eq(0).text()
            var valId = $(ele).find('.list-show').find('li').eq(0).attr('val');
            $(ele).find('.list-show').siblings('.select-btn').val(txt);
            $(ele).find('.list-show').siblings('.select-btn').attr('valId', valId);
        });

        oldtxt = $('.text-serach input').val();

        iskeydow.newConsultants = true;
    });
    var editParams = {}
        // 编辑会诊
    $('.consultants-manage table').delegate('.editBtn', 'click', function() {
            $('.newConsultants').removeClass('hideItem');
            $('.newConsultants .title').find('span').text('修改会诊');
            $('.newConsultants').find('.tips').hide();
            $('.newConsultants').attr('type', 'edittype');
            $('.newConsultants').find('.sureBtn').attr('consultantsId', $(this).attr('consultantsId'))
                //清空
            $('.newConsultants').find('.patient-name').val('');
            $('.consultants-manage').find('.consultants-text').val('');


            editParams.consultationId = $(this).attr('consultantsId');
            editParams.patientId = $(this).parent().siblings('.name').attr('patientId');
            editParams.type = $(this).parent().siblings('.type').attr('type');
            editParams.deptId = $(this).parent().siblings('.dept').attr('deptId');
            editParams.doctorId = $(this).parent().siblings('.doctor').attr('doctorId');
            editParams.applyRemark = $(this).parent().siblings('.remark').text();

            // 填入数据
            $('.newConsultants').find('.patient-name').val($(this).parent().siblings('.name').text());
            $('.newConsultants').find('.patient-name').attr('valId', editParams.patientId);

            $('.newConsultants').find('.consultants-type').val($(this).parent().siblings('.type').text());
            $('.newConsultants').find('.consultants-type').attr('valId', editParams.type);

            $('.newConsultants').find('.consultants-dept').val($(this).parent().siblings('.dept').text());
            $('.newConsultants').find('.consultants-dept').attr('valId', editParams.deptId);

            $('.newConsultants').find('.consultants-doctor').val($(this).parent().siblings('.doctor').text());
            $('.newConsultants').find('.consultants-doctor').attr('valId', editParams.doctorId);

            $('.newConsultants').find('.consultants-text').val($(this).parent().siblings('.remark').text());

            oldtxt = $('.text-serach input').val();

            iskeydow.newConsultants = true;
        })
        // 新建-编辑会诊确定按钮
    $('.newConsultants').delegate('.sureBtn', 'click', function() {
            var params = {}
            params.patientId = $('.newConsultants').find('.patient-name').attr('valId');
            params.type = $('.newConsultants').find('.consultants-type').attr('valId');
            params.deptId = $('.newConsultants').find('.consultants-dept').attr('valId');
            params.doctorId = $('.newConsultants').find('.consultants-doctor').attr('valId');
            params.applyRemark = $('.consultants-manage').find('.consultants-text').val();


            if (params.patientId && params.type && params.deptId && params.doctorId && params.applyRemark) {
                if ($('.newConsultants').attr('type') == 'newtype') { // 新增
                    // console.log(params);
                    if (params.patientId && params.type && params.deptId && params.doctorId && params.applyRemark) {
                        ajaxCommon(null, null, null, params, pcurl + 'consultation/addConsultation', function(data) {
                            // console.log(data);
                            $('.newConsultants').addClass('hideItem');
                            $('.consultants-manage').removeAttr('lang');
                            consultantsManage();
                            iskeydow.newConsultants = false;
                            wetoast('申请会诊成功');
                        }, function(data) {
                            $('.newConsultants').find('.tips').show().text(data.errorMsg);
                        })
                    }

                } else if ($('.newConsultants').attr('type') == 'edittype') { // 编辑
                    params.consultationId = $(this).attr('consultantsId');

                    if (!objEqual(params, editParams)) {
                        ajaxCommon(null, null, null, params, pcurl + 'consultation/updateConsultationByApply', function(data) {
                            $('.newConsultants').addClass('hideItem');
                            $('.consultants-manage').removeAttr('lang');
                            consultantsManage();
                            iskeydow.newConsultants = false;
                            wetoast('编辑会诊成功');
                        }, function(data) {
                            $('.newConsultants').find('.tips').show().text(data.errorMsg);
                        })
                    } else {
                        $('.newConsultants').addClass('hideItem');
                    }

                }
            } else {
                $('.newConsultants').find('.tips').show().text('请确认会诊信息是否全部都填写完毕');
            }

        })
        // 删除会诊
    $('.consultants-manage table').delegate('.delBtn', 'click', function() {
        var self = $(this);
        var arr = [];
        arr.push($(this).attr('consultantsId'))
        var params = { consultationIdList: arr }
        alldelevent(self, params);
    });
    // 批量删除
    /*$('.consultants-manage').delegate('.cancelconsultants','click',function () {
        var self = $(this);
        var arr = [];
        //获取选中信息
        var item = $('.consultants-manage tbody').find('.td1');
        for(var i=0;i<item.length;i++){//获取选中复选框的值
            if($(item[i]).find('input').is(':checked')){
                arr.push($(item[i]).find('input').val())
            }
        }
        if(arr.length>0){
            var params = {consultationId:arr}
            alldelevent(self,params)
        }else{
            wetoast('请选择你要取消的会诊')
        }

    })*/


    // 查看会诊记录
    $('.consultants-manage table').delegate('.checkBtn', 'click', function() {
        $('.consultantsRecord').removeClass('hideItem');
        var isRead = $(this).attr('isReady');

        getDoctorHandle($(this).attr('consultantsId'), 'record');
        var self = $(this);
        if (isRead == 1) {
            ajaxCommon(null, null, null, { consultationId: $(this).attr('consultantsId') }, pcurl + 'consultation/updateConsultationApplyIsReaded', function(data) {
                $(self).parent().parent().addClass('alreadyCheck');
            })
        }
    })

    // 取消事件
    $('.consultants-manage,.consultantsRecord,.handle-consultants').delegate('.cancelBtn', 'click', function() {
        $(this).parent().parent().parent().addClass('hideItem');
        iskeydow.newConsultants = false;
        iskeydow.handle = false;
    });

    /*医生会诊*/
    //处理会诊
    var oldcontent = { handletxt: '' }
    $('.doctor-consultants .content table').delegate('.handleBtn', 'click', function() {
        $('.handle-consultants').removeClass('hideItem');
        $('.handle-consultants .title').find('span').text('处理会诊');
        getDoctorHandle($(this).attr('valId'), 'doctor');
        oldcontent.handletxt = $('.handle-consultants .text').find('textarea').val();
        $('.handle-consultants').find('.sureBtn').attr('valId', $(this).attr('valId'));

        $('.handle-consultants').attr('type', 'newhandle');
        $('.handle-consultants').find('.tips').hide();
        iskeydow.handle = true;


    });
    $('.doctor-consultants .content table').delegate('.eidtBtn', 'click', function() {
        $('.handle-consultants').removeClass('hideItem');
        $('.handle-consultants .title').find('span').text('修改会诊');

        getDoctorHandle($(this).attr('valId'), 'doctor');
        oldcontent.handletxt = $('.handle-consultants .text').find('textarea').val();
        $('.handle-consultants').find('.sureBtn').attr('valId', $(this).attr('valId'));

        $('.handle-consultants').attr('type', 'edithandle');

        $('.handle-consultants').find('.tips').hide();
        iskeydow.handle = true;
    });


    $('.handle-consultants').delegate('.sureBtn', 'click', function() {
        var changtxt = $('.handle-consultants .text').find('textarea').val();


        if ($('.handle-consultants').attr('type') == 'newhandle' && changtxt == '') {
            $('.handle-consultants').find('.tips').show().text('请填写会诊意见');
            return;
        }
        if (changtxt != oldcontent.handletxt) {
            ajaxCommon(null, null, null, { consultationId: $(this).attr('valId'), suggest: changtxt }, pcurl + 'consultation/updateConsultationByDoctor', function(data) {
                $('.handle-consultants').addClass('hideItem');

                $('.doctor-consultants').removeAttr('lang');
                $('.consultants-manage').removeAttr('lang');
                doctorConsultants();

                iskeydow.handle = false;

                if ($('.handle-consultants').attr('type') == 'newhandle') {
                    wetoast('处理成功')
                } else if ($('.handle-consultants').attr('type') == 'edithandle') {
                    wetoast('修改成功');
                }
            }, function(data) {
                $('.handle-consultants').find('.tips').show().text(data.errorMsg);
            })
        } else {
            $('.handle-consultants').addClass('hideItem')
        }
    })



    // 查看会诊记录
    $('.doctor-consultants .content table').delegate('.checkBtn', 'click', function() {
        $('.consultantsRecord').removeClass('hideItem');
        getDoctorHandle($(this).attr('consultantsId'), 'record');
    });


    //搜索事件
    $('.title-search').delegate('.searchBtn', 'click', function() {

        var params = {}
        params.condition = $(this).parent().find('.txt').val();
        params.sex = $(this).parent().find('.sex').attr('valId');
        params.type = $(this).parent().find('.type').attr('valId');
        params.status = $(this).parent().find('.state').attr('valId');

        params.condition ? params.condition : delete params.condition;
        params.sex != 0 ? params.sex : delete params.sex;
        params.type != 0 ? params.type : delete params.type;
        params.status != 0 ? params.status : delete params.status;
        params.page = 1;

        if ($(this).parent().parent().hasClass('consultants-manage')) {
            consultantsManage(params)
        } else if ($(this).parent().parent().hasClass('doctor-consultants')) {
            doctorConsultants();
        }

    });
    $('.title-search').delegate('.resetBtn', 'click', function() {

        $(this).parent().find('.txt').val('');
        $(this).parent().find('.sex').val('性别');
        $(this).parent().find('.sex').attr('valId', 0);

        $(this).parent().find('.type').val('会诊类别');
        $(this).parent().find('.type').attr('valId', 0);

        $(this).parent().find('.state').val('全部');
        $(this).parent().find('.state').attr('valId', 0);


        if ($(this).parent().parent().hasClass('consultants-manage')) {
            $('.consultants-manage').removeAttr('lang');
            consultantsManage();
        } else if ($(this).parent().parent().hasClass('doctor-consultants')) {
            $('.doctor-consultants').removeAttr('lang');
            doctorConsultants();
        }

    });


}

function getDoctorHandle(param, flag) {
    // 医生会诊-flag -- doctor
    // 会诊记录-flag -- record
    $('.handle-consultants .text').find('textarea').val('');
    ajaxCommon(null, null, null, { consultationId: param }, pcurl + 'consultation/getConsultationById', function(data) {
        // console.log(data);
        var list = data.ret.consultation;
        if (list.patient.birthday) {
            list.patient.age = getAge(list.patient.birthday);
        }

        if (flag == 'doctor') {
            var txt = list.suggest;
            $('.handle-consultants .text-content tbody').html(templates.template3(list));
            $('.handle-consultants .text').find('textarea').val(txt);
        } else if (flag == 'record') {
            $('.consultantsRecord .print-content').html(templates.template4(list));
            $('.consultantsRecord').find('.export').attr('consultantsId', param);
        }

    })
}

function consultantsManage(params) {
    hideallblock(['consultants-manage']);
    if (!params) {
        params = { page: 1 }
    }
    var count;
    ajaxCommon(null, false, null, params, pcurl + 'consultation/getApplyConsultations', function(data) {
        var list = data.ret.consultations;
        // console.log(list);
        count = data.ret.pages;
        $('.consultants-manage tbody').html(templates.template1(list));
        $('.consultants-manage').attr('lang', 1)
    })
    if (count > 1) {
        $('.consultants-manage .page').show();
        var isload = false;
        $('.consultants-manage .page').createPage(function(n) { //分页
            if (!isload) {
                isload = true;
                return;
            }
            params.page = n;
            ajaxCommon(null, false, null, params, pcurl + 'consultation/getApplyConsultations', function(data) {
                var list = data.ret.consultations;
                $('.consultants-manage tbody').html(templates.template1(list));
            })

        }, {
            pageCount: count,
            showTurn: true, //是否显示跳转,默认可以
            showSumNum: false //是否显示总页码
        });
    } else {
        $('.consultants-manage .page').hide();
    }



}

function doctorConsultants() {
    var params = {}
    params.condition = $('.doctor-consultants .title-search').find('.txt').val();
    params.sex = $('.doctor-consultants .title-search').find('.sex').attr('valId');
    params.type = $('.doctor-consultants .title-search').find('.type').attr('valId');
    params.status = $('.doctor-consultants .title-search').find('.state').attr('valId');

    params.condition ? params.condition : delete params.condition;
    params.sex != 0 ? params.sex : delete params.sex;
    params.type != 0 ? params.type : delete params.type;
    params.status != 0 ? params.status : delete params.status;
    params.page = 1;
    var count = 0;

    // console.log(params)
    hideallblock(['doctor-consultants']);
    if (!$('.doctor-consultants').attr('lang')) {

        ajaxCommon(null, null, null, params, pcurl + 'consultation/getDoctorConsultations', function(data) {
            count = data.ret.pages;
            var list = data.ret.consultations;
            $('.doctor-consultants .content tbody').html(templates.template2(list));
            // $('.doctor-consultants').attr('lang',1);
            if (count > 1) {
                $('.doctor-consultants .page').show();
                var isload = false;
                $('.doctor-consultants .page').createPage(function(n) { //分页
                    if (!isload) {
                        isload = true;
                        return;
                    }
                    params.page = n
                    ajaxCommon(null, null, null, params, pcurl + 'consultation/getDoctorConsultations', function(data) {
                        var list = data.ret.consultations;
                        $('.doctor-consultants .content tbody').html(templates.template2(list));

                    });
                }, {
                    pageCount: count,
                    showTurn: true, //是否显示跳转,默认可以
                    showSumNum: false //是否显示总页码
                });
            } else {
                $('.doctor-consultants .page').hide();
            }

        });
    }




}

function alldelevent(dom, params) { // 删除会诊管理
    $('.del-consultants').removeClass('hideItem');
    var self = $(dom);
    $('.del-consultants').delegate('.sureBtn', 'click', function() {
        if (params) {
            ajaxCommon(null, null, null, params, pcurl + 'consultation/updateConsultationStatusBatch', function(data) {
                // console.log(data);
                $('.del-consultants').addClass('hideItem');
                self.parent().parent().remove();
                $('.consultants-manage').removeAttr('lang');
                consultantsManage();
                wetoast('取消会诊成功')
            })
        }
    })
}

function initSearchNav() {
    $('.title-search').find('.sex').val('性别');
    $('.title-search').find('.type').val('会诊类别');
    $('.title-search').find('.state').val('全部');
}

function loadDept() { //加载科室下拉列表
    $('.newConsultants').find('.deptList').parent().siblings('.select-btn').val('');
    $('.newConsultants').find('.deptList').parent().siblings('.select-btn').removeAttr('valId');

    var deptId = '';
    ajaxCommon(null, null, null, {}, pcurl + 'dept/getAllDept', function(data) {
        var list = data.ret.depts;
        var str = '';
        $.each(list, function(i, item) {
            str += '<li val="' + item.departmentId + '">' + item.name + '</li>';
        })
        $('.newConsultants').find('.deptList').html(str);
        //默认显示第一个
        $('.newConsultants').find('.deptList').parent().siblings('.select-btn').val(list[0].name);
        $('.newConsultants').find('.deptList').parent().siblings('.select-btn').attr('valId', list[0].departmentId);
        deptId = list[0].departmentId;
        // 默认显示第一个医生
        loadDoctor(deptId);
    })

}

function loadDoctor(deptId) {
    $('.newConsultants').find('.doctorList').parent().siblings('.select-btn').val('');
    $('.newConsultants').find('.doctorList').parent().siblings('.select-btn').removeAttr('valId');

    ajaxCommon(null, null, null, { deptId: deptId }, pcurl + 'user/getDoctors', function(data) {
        var list = data.ret.doctors;
        var userId = $('.nav').find("#user-my").attr('data-userId');
        for (var i = 0; i < list.length; i++) {
            var item = list[i].userId;
            //console.log(item);
            //console.log(i);
            if (item == userId) {
                list.splice(i, 1)
            }
        }

        var str = '';
        $.each(list, function(i, item) {
            str += '<li val="' + item.userId + '">' + item.name + '</li>';
        });

        if (str == '') { //加入没有主治医生
            str = '<span style="width: 100%;text-align: center;display: block;font-size: 14px;">暂无数据</span>';
            $('.newConsultants').find('.doctorList').parent().siblings('.select-btn').val('暂无数据');
            $('.newConsultants').find('.doctorList').parent().siblings('.select-btn').removeAttr('valId');
        }
        $('.newConsultants').find('.doctorList').html(str);

        if (list.length > 0) {
            //默认显示第一个
            $('.newConsultants').find('.doctorList').parent().siblings('.select-btn').val(list[0].name);
            $('.newConsultants').find('.doctorList').parent().siblings('.select-btn').attr('valId', list[0].userId);
        }

    })
}

function objEqual(a, b) { // 判断两个对象相同的属性名，属性值是否相同
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);


    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    return true;
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