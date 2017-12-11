/**
 * Created by Administrator on 2017/6/27.
 */
// 判断是否要打开添加患者窗口

// 设置血糖参数。
function textText() {
    localStorage.removeItem('bloodSlucosEearlyEarning');
    ajaxCommon(function() {}, false, null, {}, pcurl + '/user/getUserInfo', function(data) {
        var obj = data.ret.sugarParamSetting;
        var str = JSON.stringify(obj);
        localStorage.setItem('bloodSlucosEearlyEarning', str);
        // var bloodSlucosVal = JSON.parse(localStorage.getItem('bloodSlucosEearlyEarning'));
        // console.log(bloodSlucosVal);
    })
}
textText();






var isOpenAdd = 0;
//加入login页面没有获取到菜单，则在首页重新获取一次
var menuList = JSON.parse(sessionStorage.getItem('menuList'));
if (menuList == null) {
    ajaxCommon(null, false, null, {}, pcurl + 'menu/getUserMenuList', function(data) {
        var list = data.ret.menuList;
        sessionStorage.setItem('menuList', JSON.stringify(list));
    })
}
//登录个人信息-只在首页获取一次
var userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
if (userInfo == null) {
    ajaxCommon(null, null, null, {}, pcurl + 'user/getUserInfo', function(res) {
        var data = res.ret.user;
        sessionStorage.setItem('userInfo', JSON.stringify(data));
        $("#user-my").text(data.name);
        $("#user-my").attr('data-userId', data.userId);
        $("#user-my").attr('data-deptId', data.deptId);
        $("#user-my").attr('data-deptName', data.deptName);

    }, function() {});
} else {
    $("#user-my").text(userInfo.name);
    $("#user-my").attr('data-userId', userInfo.userId);
    $("#user-my").attr('data-deptId', userInfo.deptId);
    $("#user-my").attr('data-deptName', userInfo.deptName);
}

//导航栏消息提醒--首页获取一次
var navMsg = JSON.parse(sessionStorage.getItem('navMsgList'));
if (navMsg == null) {
    ajaxCommon(null, null, null, {}, pcurl + 'workbench/getUnReadWarns', function(res) {
        var navMsgList = res.ret.warns;
        if (navMsgList.length > 0) {
            $('.navMsgImg').find('i').show();
        }
        sessionStorage.setItem('navMsgList', JSON.stringify(navMsgList));
        $('.nav .navMsg ul').html(_.template($('#navMsg-list-template').html())(navMsgList));

    }, function() {});
} else {
    if (navMsg.length > 0) {
        $('.navMsgImg').find('i').show();
    }
    $('.nav .navMsg ul').html(_.template($('#navMsg-list-template').html())(navMsg));
}

// 更改首页的logo
function getOrganization() {
    ajaxCommon(null, null, null, {}, pcurl + 'organization/getOrganization', function(data) {
        if (!data.ret.organization) {
            $('#logo img').attr('src', 'image/logo1.png');
        } else {
            $('.firmName').text(data.ret.organization.name);
            $('#logo img').attr('src', pcurl + 'organization/getPhoto');
        }
    });
}
getOrganization()


var addPatientFlag = 0;
var addPatientMobileFlag = 0;

$(function() {



    isOpenAdd = GetQueryString('addpatient');
    initEl();

    //修改密码导入
    $(".updatePwdPop").load('./include/pwdPop.html', function() {
        updatePwdSureBtn();
        updatePwdCancelBtn();
    });

});


//初始化
function initEl() {

    if (isOpenAdd == 1) { // 从患者管理-跳转到添加患者首页

        isSureCode.addSubmit = true;
        isSureCode.updatePwdSubmit = false;
        isSureCode.warnSubmit = false;
        clearAddPatient();
        $('.PopMask').show();
        $('.addPatientPop').show();
        document.documentElement.style.overflow = "hidden";
        $('#addTitlePop').text('新增患者 (全部信息必填)');
        $('#hospitalizationNo').removeAttr('readonly');
        $('#hospitalizationNo').focus();

        var date = new Date();
        var strDate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
        $('#admissionDate').val(strDate);

        $('.addPatientPop').find('#addPatientSubmit').attr('value', 'add');
        var addOrEdit = $('#addPatientSubmit').attr('value');
        //获取科室信息

        deptajax(addOrEdit);
    }

    $('#logo').click(function() {
        window.location.href = 'index.html';
    })


    //导航栏消息提示
    $('#navMsgBtn').click(function(evt) {
        var MsgPopIsShow = $(this).find('i').css('display');
        if (MsgPopIsShow == 'none') {
            $('#navMsgPop').hide();
        } else {
            $('#navMsgPop').toggle();
        }
        if (evt && evt.stopPropagation) {
            evt.stopPropagation();
        } else {
            window.event.cancelBubble = true;
        }
    });
    $('body').on('click', function() { // 点击其他也要关闭下拉框
        $(this).find('#navMsgPop').hide();
    })

    //登录显示
    ajaxCommon(null, null, null, {}, pcurl + 'user/getUserInfo', function(res) {
        var data = res.ret.user;
        $("#userLogo").text(data.name);
        $("#userLogo").attr('userId', data.userId);
        if (data.deptName == null) {
            $("#userDept").text('');
        } else {
            $("#userDept").text(data.deptName);
            $("#userDept").attr('deptId', data.deptId);
        }

        if (data.sex == 1) {
            $('#topDoctorPic').attr('src', 'image/home_people_pic_man.png');
        } else {
            $('#topDoctorPic').attr('src', 'image/home_people_pic_woman.png');
        }
    }, function() {});


    //获取所有患者左侧菜单
    ajaxCommon(null, null, null, {}, pcurl + 'workbench/getPatientsByType', function(res) {
        var data = res.ret.patients;
        patientType(data);
    }, function() {});

    function patientType(data) {

        var diaTypeArr1 = [];
        var diaTypeArr2 = [];
        var diaTypeArr3 = [];
        var diaTypeArr4 = [];
        var diaTypeArr5 = [];
        for (var i = 0; i < data.length; i++) {
            var diaType = data[i].diabetesType;
            if (diaType == 1) {
                diaTypeArr1.push(diaType = data[i])
            } else if (diaType == 2) {
                diaTypeArr2.push(diaType = data[i])
            } else if (diaType == 3) {
                diaTypeArr3.push(diaType = data[i])
            } else if (diaType == 4) {
                diaTypeArr4.push(diaType = data[i])
            } else {
                diaTypeArr5.push(diaType = data[i])
            }
        };

        $('#total1').text(diaTypeArr1.length);
        $('#total2').text(diaTypeArr2.length);
        $('#total3').text(diaTypeArr3.length);
        $('#total4').text(diaTypeArr4.length);
        $('#total5').text(diaTypeArr5.length);

        if (diaTypeArr1.length > 0) {
            $('#total1').parent('a').addClass('inactives');
        } else {
            $('#total1').parent('a').addClass('inactive');
        }

        if (diaTypeArr2.length > 0) {
            $('#total2').parent('a').addClass('inactives');
        } else {
            $('#total2').parent('a').addClass('inactive');
        }

        if (diaTypeArr3.length > 0) {
            $('#total3').parent('a').addClass('inactives');
        } else {
            $('#total3').parent('a').addClass('inactive');
        }

        if (diaTypeArr4.length > 0) {
            $('#total4').parent('a').addClass('inactives');
        } else {
            $('#total4').parent('a').addClass('inactive');
        }

        if (diaTypeArr5.length > 0) {
            $('#total5').parent('a').addClass('inactives');
        } else {
            $('#total5').parent('a').addClass('inactive');
        }



        var diaTypeStr1 = "";
        for (var j = 0; j < diaTypeArr1.length; j++) {
            var diaTypeArrObj1 = diaTypeArr1[j];
            diaTypeStr1 += '<li data-patientId="' + diaTypeArrObj1.patientId + '" onclick="loadPatientInfo(this)"><a href="javascript:void(0)">' + diaTypeArrObj1.name + '</a></li>';
        }
        $('#Sugar1>ul').append(diaTypeStr1);

        var diaTypeStr2 = "";
        for (var k = 0; k < diaTypeArr2.length; k++) {
            var diaTypeArrObj2 = diaTypeArr2[k];
            diaTypeStr2 += '<li data-patientId="' + diaTypeArrObj2.patientId + '" onclick="loadPatientInfo(this)"><a href="javascript:void(0)">' + diaTypeArrObj2.name + '</a></li>';
        }
        $('#Sugar2>ul').append(diaTypeStr2);


        var diaTypeStr3 = "";
        for (var t = 0; t < diaTypeArr3.length; t++) {
            var diaTypeArrObj3 = diaTypeArr3[t];
            diaTypeStr3 += '<li data-patientId="' + diaTypeArrObj3.patientId + '" onclick="loadPatientInfo(this)"><a href="javascript:void(0)">' + diaTypeArrObj3.name + '</a></li>';
        }
        $('#Sugar3>ul').append(diaTypeStr3);

        var diaTypeStr4 = "";
        for (var p = 0; p < diaTypeArr4.length; p++) {
            var diaTypeArrObj4 = diaTypeArr4[p];
            diaTypeStr4 += '<li data-patientId="' + diaTypeArrObj4.patientId + '" onclick="loadPatientInfo(this)"><a href="javascript:void(0)">' + diaTypeArrObj4.name + '</a></li>';
        }
        $('#Sugar4>ul').append(diaTypeStr4);

        var diaTypeStr5 = "";
        for (var f = 0; f < diaTypeArr5.length; f++) {
            var diaTypeArrObj5 = diaTypeArr5[f];
            diaTypeStr5 += '<li data-patientId="' + diaTypeArrObj5.patientId + '" onclick="loadPatientInfo(this)"><a href="javascript:void(0)">' + diaTypeArrObj5.name + '</a></li>';
        }
        $('#Sugar5>ul').append(diaTypeStr5);
    }


    //bar统计
    ajaxCommon(null, null, null, {}, pcurl + 'workbench/getWorkbenchSummary', function(res) {
        var data = res.ret;
        $('.bar .li_0 .num').text(data.bloodWarnPatient ? data.bloodWarnPatient : 0);
        $('.bar .li_1 .num').text(data.waitConsultationPatient ? data.waitConsultationPatient : 0);
        $('.bar .li_2 .num').text(data.specialPatient ? data.specialPatient : 0);
        $('.bar .li_3 .num').text(data.weekIncreasePatient ? data.weekIncreasePatient : 0);

    }, function() {});

    //床位列表
    var params = { //请求带的参数要修改
        page: pages.currentPage,
        model: 2
    };
    ajaxCommon(null, null, null, params, pcurl + 'patient/getPersonalPatients', function(data) {
        var list = data.ret.patients;
        $(".bedTableTitle span.bedSheet").text('床位列表');
        $(".bedTableTitle").attr('val', '');
        $(".bedTableTitle span.bedCount").text(data.ret.count);
        pages.count = data.ret.pages;
        list.map(function(e, i) {
            if (e.birthday) {
                e.age = getAge(e.birthday);
            }
        })
        $('.bedTable .list').html(templates.template3(list));

        if (pages.count > 1) {
            $('.bedTable .page').show();
            var isload = false;
            $('.bedTable .page').createPage(function(n) { //分页
                if (!isload) {
                    isload = true;
                    return;
                }
                params.page = n; //--修改url
                ajaxCommon(function() {}, null, null, params, pcurl + 'patient/getPersonalPatients', function(data) {
                    var list = data.ret.patients;
                    list.map(function(e, i) {
                        if (e.birthday) {
                            e.age = getAge(e.birthday);
                        }
                    })
                    $('.bedTable .list').html(templates.template3(list));
                })
            }, {
                pageCount: pages.count,
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });
        } else {
            $('.bedTable .page').hide();
        }
    })

    //床位收藏
    $('.bedTable .list').delegate('.start', 'click', function() {
        var canclick = $(this).attr('timeout');
        if (canclick == 'true') {
            var special = $(this).attr('special');
            var patientId = $(this).attr('patientId');
            special == 0 ? special = 1 : special = 0;

            var self = $(this);
            ajaxCommon(null, null, null, {
                patientId: patientId,
                special: special
            }, pcurl + 'patient/updateSpecialById', function(data) {
                var isStar = self.attr('value');
                if (isStar == 'star' && special == 1) {
                    $(self).parent().parent().addClass('active');
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

                //取消关注重新请求bar渲染
                ajaxCommon(null, null, null, {}, pcurl + 'workbench/getWorkbenchSummary', function(res) {
                    var data = res.ret;
                    $('.bar .li_2 .num').text(data.specialPatient ? data.specialPatient : 0);
                }, function() {});

                //特别关注里取消关注重新请求床位渲染
                var flagPatient = $(".bedTableTitle").attr('val');
                if (flagPatient == 'specialPatient') {
                    params.page = 1;
                    ajaxCommon(null, null, null, params, pcurl + 'patient/getSpecialPatients', function(res) {
                        // ajaxCommon(null, null, null, params, pcurl + 'patient/getPersonalPatients', function(res) {
                        var list = res.ret.patients;
                        $(".bedTableTitle span.bedSheet").text('特别关注患者');
                        $(".bedTableTitle").attr('val', 'specialPatient');
                        $(".bedTableTitle span.bedCount").text(res.ret.count);
                        pages.count = res.ret.pages;
                        list.map(function(e, i) {
                            if (e.birthday) {
                                e.age = getAge(e.birthday);
                            }
                        });
                        $('.bedTable .list').html(templates.template3(list));
                        if (pages.count > 1) {
                            $('.bedTable .page').show();
                            var isload = false;
                            $('.bedTable .page').createPage(function(n) { //分页
                                if (!isload) {
                                    isload = true;
                                    return;
                                }
                                params.page = n;
                                ajaxCommon(function() {}, null, null, params, pcurl + 'patient/getSpecialPatients', function(data) {
                                    var list = data.ret.patients;
                                    list.map(function(e, i) {
                                        if (e.birthday) {
                                            e.age = getAge(e.birthday);
                                        }
                                    })
                                    $('.bedTable .list').html(templates.template3(list));
                                })
                            }, {
                                pageCount: pages.count,
                                showTurn: true, //是否显示跳转,默认可以
                                showSumNum: false //是否显示总页码
                            });
                        } else {
                            $('.bedTable .page').hide();
                        }
                    }, function() {});
                }
            })
        }
    })


    //添加患者弹窗打开
    $('#addPatientBtn').click(function() {
        isSureCode.addSubmit = true;
        isSureCode.updatePwdSubmit = false;
        isSureCode.warnSubmit = false;
        isSureCode.addSugarSubmit = false;
        clearAddPatient();
        $('.PopMask').show();
        $('.addPatientPop').show();
        document.documentElement.style.overflow = "hidden";
        $('#addTitlePop span').text('新增患者');
        $('#addHospitalizationNo').removeAttr('readonly');
        $('#addHospitalizationNo').focus();

        var date = new Date();
        var strDate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
        $('#addInHospitalNo').val(strDate);

        $('.addPatientPop').find('#addPatientSubmit').attr('value', 'add');
        var addOrEdit = $('#addPatientSubmit').attr('value');
        deptajax(addOrEdit);

    });


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
                    $('.basicInfoDetail').html(templates.template4(data));
                    baseInfo = res.ret.patient;
                }, function() {});
                //左边菜单更新
                ajaxCommon(null, null, null, {}, pcurl + 'workbench/getPatientsByType', function(res) {
                    $('#Sugar1 ul,#Sugar2 ul,#Sugar3 ul,#Sugar4 ul,#Sugar5 ul').html('');
                    var data = res.ret.patients;
                    patientType(data);
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

    $('.levelOne>a').click(function() {
        if ($(this).hasClass('inactives')) {
            $(this).removeClass('inactives').addClass('inactive');
            $(this).siblings('ul').slideDown(100);
        } else {
            $(this).removeClass('inactive').addClass('inactives');
            $(this).siblings('ul').slideUp(100);
        }
    });

    $('.levelTwo>a').click(function() {
        var levelTwo = parseFloat($(this).find('span').text());
        if (levelTwo > 0) {
            if ($(this).hasClass('inactives')) {
                $(this).removeClass('inactives').addClass('inactive');
                $(this).siblings('ul').slideDown(100);
                // $(this).siblings('ul').slideDown(100).children('li');
            } else {
                $(this).removeClass('inactive').addClass('inactives');
                $(this).siblings('ul').slideUp(100);
            }
        } else {
            $(this).addClass('inactive');
        }
    });

    $(document).keydown(function(e) {
        var theEvent = e || window.event;
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == 13 && e.srcElement.type != 'textarea') {

            //回车执行查询
            e.preventDefault();
            if (isSureCode.addSubmit) {
                $('#addPatientSubmit').click(); //添加患者，编辑患者
            } else if (isSureCode.warnSubmit) {
                $('#WarnSubmit').click(); //血糖预警
            } else if (isSureCode.updatePwdSubmit) {
                $('#updatePwdSureBtn').click(); //修改密码
            } else if (isSureCode.addSugarSubmit) {
                $('#addSugarSubmit').click(); //添加血糖，修改血糖
            }
        }
    });

    // 清除智能提醒的小红点。
    $('.nav .navBarLeft').find('.li_4 i').css('display', 'none');




}



// 特别关注患者
function specialPatient() {
    var params = { 'page': 1 };
    // params.model = 2;
    // params.page = pages.currentPage;
    // params.page = 1;
    // params.special = 1;

    ajaxCommon(null, null, null, params, pcurl + 'patient/getSpecialPatients', function(res) {
        // ajaxCommon(null, null, null, params, pcurl + 'patient/getPersonalPatients', function(res) {
        var list = res.ret.patients;
        $(".bedTableTitle span.bedSheet").text('特别关注患者');
        $(".bedTableTitle").attr('val', 'specialPatient');
        $(".bedTableTitle span.bedCount").text(res.ret.count);
        pages.count = res.ret.pages;
        list.map(function(e, i) {
            if (e.birthday) {
                e.age = getAge(e.birthday);
            }
        });
        $('.bedTable .list').html(templates.template3(list));
        if (pages.count > 1) {
            $('.bedTable .page').show();
            var isload = false;
            $('.bedTable .page').createPage(function(n) { //分页
                if (!isload) {
                    isload = true;
                    return;
                }
                params.page = n; //--修改url
                ajaxCommon(function() {}, null, null, params, pcurl + 'patient/getSpecialPatients', function(data) {
                    var list = data.ret.patients;
                    list.map(function(e, i) {
                        if (e.birthday) {
                            e.age = getAge(e.birthday);
                        }
                    })
                    $('.bedTable .list').html(templates.template3(list));
                })
            }, {
                pageCount: pages.count,
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });
        } else {
            $('.bedTable .page').hide();
        }
    }, function() {});

}

// 本周新增患者
function weekAddPatient() {
    // console.log(222);
    var params = { 'page': 1 };
    // params.model = 2;
    // params.page = pages.currentPage;
    // params.weekAdd = 1;
    ajaxCommon(null, null, null, params, pcurl + 'patient/getWeekIncreasePatients', function(res) {
        var list = res.ret.patients;
        $(".bedTableTitle span.bedSheet").text('本周新增患者');
        $(".bedTableTitle").attr('val', 'weekAddPatient');
        $(".bedTableTitle span.bedCount").text(res.ret.count);
        pages.count = res.ret.pages;
        list.map(function(e, i) {
            if (e.birthday) {
                e.age = getAge(e.birthday);
            }
        });

        $('.bedTable .list').html(templates.template3(list));
        if (pages.count > 1) {
            $('.bedTable .page').show();
            var isload = false;
            $('.bedTable .page').createPage(function(n) { //分页
                if (!isload) {
                    isload = true;
                    return;
                }
                params.page = n; //--修改url
                ajaxCommon(function() {}, null, null, params, pcurl + 'patient/getWeekIncreasePatients', function(data) {
                    var list = data.ret.patients;
                    list.map(function(e, i) {
                        if (e.birthday) {
                            e.age = getAge(e.birthday);
                        }
                    })
                    $('.bedTable .list').html(templates.template3(list));
                })
            }, {
                pageCount: pages.count,
                showTurn: true, //是否显示跳转,默认可以
                showSumNum: false //是否显示总页码
            });
        } else {
            $('.bedTable .page').hide();
        }
        $('.bedTable .list').delegate('.start', 'click', function() {
            var canclick = $(this).attr('timeout');
            if (canclick == 'true') {
                var special = $(this).attr('special');
                var patientId = $(this).attr('patientId');
                special = (special == 0 ? 1 : 0);
                var self = $(this);
                ajaxCommon(function() {}, null, null, { patientId: patientId, special: special }, pcurl + 'patient/updateSpecialById', function(data) {
                    var isStar = self.attr('value');
                    if (isStar == 'star' && special == 1) {
                        $(self).parent().parent().addClass('active');
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
                    // self.attr('timeout', 'false');
                    // setTimeout(function () {
                    // 	self.attr('timeout', 'true');
                    // }, 3000)
                })
            } else {
                // wetoast('请三秒之后，再进行操作');
            }

        })
    }, function() {});
}

function deptajax(addOrEdit) {
    ajaxCommon(null, null, null, {}, pcurl + 'dept/getAllDept', function(res) {
        var data = res.ret.depts;
        if (data.length == 0) {
            return;
        }
        var deptStr = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i].name;
            var deptid = data[i].departmentId;
            deptStr += '<a data-value=' + deptid + '>' + item + '</a>';
        }

        $("#infoDept .option_box").append(deptStr);

        var userDeptId = $('#userDept').attr('deptid');
        var userDeptName = $('#userDept').text();

        if (addOrEdit == 'add') {
            if (userDept) {
                $("#addDeptId").val(userDeptName);
                $("#addDeptId").attr('data-value', userDeptId);
                nursesajaxAdd({ deptId: userDeptId, addOrEdit: addOrEdit });
                doctorajaxAdd({ deptId: userDeptId, addOrEdit: addOrEdit });
            } else {
                $("#addDeptId").val(data[0].name);
                $("#addDeptId").attr('data-value', data[0].departmentId);
                var firstDeptId = data[0].departmentId;
                nursesajaxAdd({ deptId: firstDeptId, addOrEdit: addOrEdit });
                doctorajaxAdd({ deptId: firstDeptId, addOrEdit: addOrEdit });
            }

        } else if (addOrEdit == 'edit') {
            var editDeptId = baseInfo.deptId;
            $('#addDeptId').val(baseInfo.deptName);
            $('#addDeptId').attr('data-value', baseInfo.deptId);
            doctorajax1({ deptId: editDeptId });
            nursesajax1({ deptId: editDeptId });

        }


        // 选择科室，再选择护士，主治医师
        $(".option_box.getOptionBox a").click(function() {
            var value = $(this).text();
            var deptDataVal = $(this).attr('data-value');

            $(this).parent().siblings("input").val(value);
            $(this).parent().siblings("input").attr('data-value', deptDataVal);

            nursesajax({ deptId: deptDataVal, addOrEdit: addOrEdit }); //id
            doctorajax({ deptId: deptDataVal, addOrEdit: addOrEdit }); //id
        });

    }, function() {});
}

function nursesajaxAdd(deptObj) {
    ajaxCommon(null, null, null, { deptId: deptObj.deptId }, pcurl + 'user/getNurses', function(res) {
        $("#addNurseId").val('');
        $("#addNurseId").attr('data-value', '');
        $("#infoNurse .option_box").html('');
        var data = res.ret.nurses;
        if (data.length == 0) {
            return;
        }
        var nurseStr = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i].name;
            var nurseid = data[i].userId;
            nurseStr += '<a data-value=' + nurseid + '>' + item + '</a>';
        }

        $("#infoNurse .option_box").append(nurseStr);

        var userId = $('#userLogo').attr('userid');
        for (var j = 0; j < data.length; j++) {
            if (data[j].userId == userId) {
                $("#addNurseId").val(data[j].name);
                $("#addNurseId").attr('data-value', data[j].userId);
            }
        };

        $(".option_box.getOptionBox a").click(function() {
            var value = $(this).text();
            var nurseDataVal = $(this).attr('data-value');
            $(this).parent().siblings("input").val(value);
            $(this).parent().siblings("input").attr('data-value', nurseDataVal);
        });

    }, function() {});
};

function doctorajaxAdd(deptObj) {
    ajaxCommon(null, null, null, { deptId: deptObj.deptId }, pcurl + 'user/getDoctors', function(res) {
        // console.log(res);
        $("#addDoctorId").val('');
        $("#addDoctorId").attr('data-value', '');
        $("#infoDoc .option_box").html('');
        var data = res.ret.doctors;

        if (data.length == 0) {
            return;
        }

        var docStr = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i].name;
            var docid = data[i].userId;

            docStr += '<a data-value=' + docid + '>' + item + '</a>';
        }
        $("#infoDoc .option_box").append(docStr);

        var userId = $('#userLogo').attr('userid');
        for (var j = 0; j < data.length; j++) {
            if (data[j].userId == userId) {
                $("#addDoctorId").val(data[j].name);
                $("#addDoctorId").attr('data-value', data[j].userId);
            }
        };

        $(".option_box.getOptionBox a").click(function() {
            var value = $(this).text();
            var docDataVal = $(this).attr('data-value');
            $(this).parent().siblings("input").val(value);
            $(this).parent().siblings("input").attr('data-value', docDataVal);
        });

    }, function() {});
}



function nursesajax(deptObj) {
    ajaxCommon(null, null, null, { deptId: deptObj.deptId }, pcurl + 'user/getNurses', function(res) {
        $("#addNurseId").val('');
        $("#addNurseId").attr('data-value', '');
        $("#infoNurse .option_box").html('');
        var data = res.ret.nurses;
        if (data.length == 0) {
            return;
        }
        var nurseStr = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i].name;
            var nurseid = data[i].userId;
            nurseStr += '<a data-value=' + nurseid + '>' + item + '</a>';
        }

        $("#infoNurse .option_box").append(nurseStr);

        $("#addNurseId").val(data[0].name);
        $("#addNurseId").attr('data-value', data[0].userId);


        $(".option_box.getOptionBox a").click(function() {
            var value = $(this).text();
            var nurseDataVal = $(this).attr('data-value');
            $(this).parent().siblings("input").val(value);
            $(this).parent().siblings("input").attr('data-value', nurseDataVal);
        });

    }, function() {});
};

function doctorajax(deptObj) {
    ajaxCommon(null, null, null, { deptId: deptObj.deptId }, pcurl + 'user/getDoctors', function(res) {
        // console.log(res);
        $("#addDoctorId").val('');
        $("#addDoctorId").attr('data-value', '');
        $("#infoDoc .option_box").html('');
        var data = res.ret.doctors;

        if (data.length == 0) {
            return;
        }
        var docStr = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i].name;
            var docid = data[i].userId;

            docStr += '<a data-value=' + docid + '>' + item + '</a>';
        }

        $("#addDoctorId").val(data[0].name);
        $("#addDoctorId").attr('data-value', data[0].userId);

        $("#infoDoc .option_box").append(docStr);

        $(".option_box.getOptionBox a").click(function() {
            var value = $(this).text();
            var docDataVal = $(this).attr('data-value');
            $(this).parent().siblings("input").val(value);
            $(this).parent().siblings("input").attr('data-value', docDataVal);
        });

    }, function() {});
}


function nursesajax1(deptObj) {
    ajaxCommon(null, null, null, { deptId: deptObj.deptId }, pcurl + 'user/getNurses', function(res) {
        $("#addNurseId").val('');
        $("#addNurseId").attr('data-value', '');
        $("#infoNurse .option_box").html('');
        var data = res.ret.nurses;
        if (data.length == 0) {
            return;
        }
        var nurseStr = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i].name;
            var nurseid = data[i].userId;
            nurseStr += '<a data-value=' + nurseid + '>' + item + '</a>';
        };
        $("#infoNurse .option_box").append(nurseStr);


        $('#addNurseId').val(baseInfo.nurseName); //责任护士
        $('#addNurseId').attr('data-value', baseInfo.nurseId);




        $(".option_box.getOptionBox a").click(function() {
            var value = $(this).text();
            var nurseDataVal = $(this).attr('data-value');
            $(this).parent().siblings("input").val(value);
            $(this).parent().siblings("input").attr('data-value', nurseDataVal);
        });

    }, function() {});
};

function doctorajax1(deptObj) {
    ajaxCommon(null, null, null, { deptId: deptObj.deptId }, pcurl + 'user/getDoctors', function(res) {
        $("#addDoctorId").val('');
        $("#addDoctorId").attr('data-value', '');
        $("#infoDoc .option_box").html('');
        var data = res.ret.doctors;

        if (data.length == 0) {
            return;
        }

        var docStr = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i].name;
            var docid = data[i].userId;

            docStr += '<a data-value=' + docid + '>' + item + '</a>';
        };


        $('#addDoctorId').val(baseInfo.doctorName); //
        $('#addDoctorId').attr('data-value', baseInfo.doctorId);

        $("#infoDoc .option_box").append(docStr);

        $(".option_box.getOptionBox a").click(function() {
            var value = $(this).text();
            var docDataVal = $(this).attr('data-value');
            $(this).parent().siblings("input").val(value);
            $(this).parent().siblings("input").attr('data-value', docDataVal);
        });

    }, function() {});
}


//图表日期截取方法
function timeDate(dateList) {
    if (dateList && dateList.length > 0) {
        var timeList = [];
        for (var i = 0; i < dateList.length; i++) {
            var time = dateList[i];
            var timeStr = time.split(' ')[0];
            timeStr = timeStr.split('-');
            timeStr.shift();
            timeList.push(timeStr.join('-'))
        };
        return timeList;
    }

}

//添加患者弹窗清空
function clearAddPatient() {
    $('#addTitlePop span').text('');
    $('#addHospitalizationNo').val(''); //住院号
    $('#addUserName').val(''); //姓名
    $('#addBirthday').val(''); //出生年月

    $('#addIdCard').val(''); //身份证号
    $('#addHeight').val(''); //身高
    $('#addWeight').val(''); //体重
    $('#addInHospitalNo').val(''); //入院日期

    $('#addDeptId').val(''); //科室
    $('#addDoctorId').val(''); //主治医师
    $('#addNurseId').val(''); //责任护士

    $('#addSickbedNo').val(''); //床号
    $('#addMobile').val(''); //手机号

    $('#addInhospitalDiagnose').val(''); //入院诊断
    $('#addComplication').val(''); //并发症
    $('#addFamilySickness').val(''); //家族史
    $('#addAllergy').val(''); //药物过敏史
    $('#addHistoryTherapy').val(''); //过去治疗方式

    $('.getOptionBox').html(''); //下选框，动态获取的清空
    $('.addInfo').find('textarea').css({ 'height': '30px' });

}

// 搜索患者
function searchPop(event) {
    if (event.keyCode == 13) {
        var val = $('#searchPatient input').val();
        if (val == '') {
            $('#searchPatientPop').hide();
            return;
        }
        ajaxCommon(null, null, null, { condition: val }, pcurl + 'workbench/getPatientsByCondition', function(res) {
            $('#searchPatientPop').show();
            var data = res.ret.patients;
            var searchStr = '';
            var tipsStr = '<p>数据过多，请精确搜索</p>';
            for (var i = 0; i < data.length; i++) {
                var item = data[i].name;
                var patientId = data[i].patientId;
                searchStr += '<li data-patientId="' + patientId + '" onclick="loadPatientInfo(this)">' + item + '</li>';
            }

            $('#searchPatientPop ul').html(''); //清空
            if (data.length > 50) {
                $('#searchPatientPop ul').append(searchStr);
                $('#searchPatientPop').append(tipsStr);
            } else {
                $('#searchPatientPop ul').append(searchStr);
            }
        }, function() {});

    }
}


//身份证号码验证及截取年龄计算
function dateNo(card) {
    var card = $(card).val();
    var idCard = Trim(card, 'g'); //去空格
    var date = idCardNo(idCard); //验证是否正确，得到拼接的出生年月日
    $('#addBirthday').val(date);
    // return date
};

function idCardNo(idCard) {

    var date = '';
    if (idCard) {
        if (idCard.length == 18) {
            var card = idCard.slice(6, 14);
            var year = card.slice(0, 4);
            var month = card.slice(4, 6) - 0;
            if (month <= 12) {
                var day = card.slice(6, 14) - 0;
                if (day <= 31) {
                    addPatientFlag = 2;
                    date = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
                } else {
                    addPatientFlag = 1;
                    // console.log('日期X');
                    $(".addPatientPop .tips").show();
                    $(".addPatientPop .tips").text('身份证号码日期有错');
                    setTimeout(function() {
                        $(".addPatientPop .tips").hide();
                    }, 1000);
                    return;
                }
            } else {
                addPatientFlag = 1;
                // console.log('月份X');
                $(".addPatientPop .tips").show();
                $(".addPatientPop .tips").text('身份证号码月份有错');
                setTimeout(function() {
                    $(".addPatientPop .tips").hide();
                }, 1000);
                return;
            }
        } else {
            addPatientFlag = 1;
            // console.log('请正确输入身份证号码');
            $(".addPatientPop .tips").show();
            $(".addPatientPop .tips").text('请正确输入身份证号码');
            setTimeout(function() {
                $(".addPatientPop .tips").hide();
            }, 1000);
            return;
        }
    }

    return date;
}

function Trim(str, is_global) {
    var result;
    result = str.replace(/(^\s+)|(\s+$)/g, "");
    if (is_global.toLowerCase() == "g") {
        result = result.replace(/\s/g, "");
    }
    return result;
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

//身高体重
function heightUnit(data) {
    var val = $(data).val();
    $('#addHeight').val(val + 'cm')
}

function clearHeight() {
    $('#addHeight').val('')
}

function clearWeight() {
    $('#addWeight').val('')
}

function weightUnit(data) {
    var val = $(data).val();
    $('#addWeight').val(val + 'kg')
}

function txtAutoHight(o) {
    if (window.navigator.userAgent.indexOf("Firefox") > -1) {
        o.style.height = o.scrollTop + 30 + "px";
    } else {
        if (o.scrollTop > 0) o.style.height = o.scrollTop + 30 + "px";
    }
}