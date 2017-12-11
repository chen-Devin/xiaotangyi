/**
 * Created by admin on 2017/7/10.
 */
/*全局变量*/
var pages = { count: 1, currentPage: 1, menu: 0 }
var iskeydow = { dept: true, role: true, user: true }
var templates = {
    template1: _.template($('#delpartment-list-template').html()), //患者列表
    template2: _.template($('#role-list-template').html()), // 角色列表
    template3: _.template($('#user-list-template').html()), // 用户列表
    template4: _.template($('#checkbox-list-template').html()), // 复选框菜单列表
    template5: _.template($('#radio-list-template').html()), // 单选框菜单列表
    template6: _.template($('#select-list-template').html()), //下拉框列表科室
    template7: _.template($('#select-role-template').html()), // 下拉框列表角色
    template8: _.template($('#select-list-template-titl').html()), // 下拉框列表角色
    template9: _.template($('#bloodGlucoseInfo-list-template').html()), // 参数设置默认血糖参数。
}
$(function() {
    // 这里是我注销测试的。
    // secondNav();
    initEvent();
    // 首次加载第一页
    institutionalInformation()
    getOrganizationInfo();
    // loaddepart(); // 首次加载第一页


    $(document).keydown(function(e) {
        var theEvent = e || window.event || arguments.callee.caller.arguments[0];
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == 13) {
            //回车执行查询
            e.preventDefault();
            if (iskeydow.dept && !iskeydow.role && !iskeydow.user) {
                $('.new-department .sureBtn').click();
            } else if (!iskeydow.dept && iskeydow.role && !iskeydow.user) {
                $('.add-role .sureBtn').click();
            } else if (!iskeydow.dept && !iskeydow.role && iskeydow.user) {
                $('.add-user .sureBtn').click();
            }


        }
    });
})

////科室管理搜索
$('.department-manage .searchNav').delegate('.activeBtn', 'click', function() {
    var searchId = $(this).parent().find('.txt').val();
    //      console.log(searchId);
    var params = {
        page: 1,
        condition: searchId,
    }
    if (searchId == '') { delete params.condition; }
    $('.department-manage').removeAttr('lang');
    loaddepartSearch(params);
    //      console.log(params);
    // ajaxCommon(null, null, null, params, pcurl + 'dept/getDeptList', function(data) {
    //     //      	console.log(data.ret.deptList[0]);
    //     var list = data.ret.deptList;
    //     $('.department-manage .page1').html(templates.template1(list));
    //     // $('.department-manage').removeAttr('lang');
    //     // loaddepart();
    // })

})

//科室管理重置
$('.department-manage .searchNav').delegate('.resetBtn', 'click', function() { //条件重置功能
    $(this).parent().parent().find('.txt').val('');
    $('.department-manage').removeAttr('lang');
    loaddepart();
})

// 科室管理左边点击没有刷新问题解决。
$('#departmentManage').delegate('a', 'click', function() {
    $('.department-manage .searchNav .txt').val('');
    $('.department-manage').removeAttr('lang');
    loaddepart();
})

//用户管理
//	科室选择下拉框
$('.user-manage .searchNav').delegate('.select-btn', 'click', function(evt) {
        var evt = event || evt;
        if (evt && evt.stopPropagation) {
            evt.stopPropagation()
        } else {
            window.event.cancelBubble = true;
        }

        $(this).siblings('.list-show').toggle();
        $(this).parent().parent().siblings('.item').find('.list-show').hide();
        var self = $(this);
        // 下拉框选项点击功能
        $(self).siblings('.list-show').delegate('li', 'click', function() {
            $(self).val($(this).text());
            $(this).parent().parent().hide();
            $(self).attr('id', $(this).attr('val'));
        })
    })
    //  用户管理搜索
$('.user-manage .searchNav').delegate('.activeBtn', 'click', function() {
        var condition = $(this).parent().find('.txt').val();
        var deptId = $(this).parent().find('.select-btn').attr('id');
        var params = {
            page: 1,
            condition: condition,
            deptId: deptId,
        }
        if (condition == '') { delete params.condition; }
        if (deptId == '') { delete params.deptId; }
        // ajaxCommon(null, null, null, params, pcurl + 'userManage/getAllUsers', function(data) {
        //     var list = data.ret.users;
        //     $('.user-manage .page1').html(templates.template3(list));
        // })
        $('.user-manage').removeAttr('lang');
        loaduserText(params);
    })
    //用户管理重置
$('.user-manage .searchNav').delegate('.resetBtn', 'click', function() { //条件重置功能
    $(this).parent().parent().find('.txt').val('');
    $(this).parent().find('.select-btn').val('全部科室');
    $(this).parent().find('.select-btn').attr('id', '');
    // $(this).parent().find('.select-btn').attr('id', 0);
    // ajaxCommon(null, null, null, { 'page': '1' }, pcurl + 'userManage/getAllUsers', function(data) {
    //     var list = data.ret.users;
    //     $('.user-manage .page1').html(templates.template3(list));
    // })
    $('.user-manage').removeAttr('lang');
    loaduser();
})

// 点击侧边导航 刷新用户管理页面。
$('#userManage').delegate('a', 'click', function() {
    $('.user-manage .searchNav .select-btn').val('全部科室');
    $('.user-manage .searchNav .select-btn').attr('id', '');
    $('.user-manage .searchNav .txt').val('');
    $('.user-manage').removeAttr('lang');
    loaduser();
})



function secondNav() {
    var secondNavList = JSON.parse(sessionStorage.getItem('setting'));
    if (secondNavList != null) {
        var item = $('.main-content').find('.leftNav').find('li');
        item.map(function(idx, ele) {
            $(ele).addClass('hideItem');
            for (var i = 0; i < secondNavList.length; i++) {
                if ($(ele).find('span').text() == secondNavList[i].name) {
                    $(ele).removeClass('hideItem');
                }
            }
        })
    }
}

function initEvent() {
    //左边菜单栏
    var navItem = $('.leftNav').find('li');
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
        })
        /*公共功能*/
    $('.patientList thead').delegate('.td1', 'click', function() { //全选功能
        // console.log($(this).find('input').is(':checked'))
        if ($(this).find('input').is(':checked')) {
            $('.patientList tbody').find('.td1').children('input').attr('checked', true);
        } else {
            $('.patientList tbody').find('.td1').children('input').attr('checked', false);
        }
    })

    // 弹出批量删除
    /*$('.searchNav').delegate('.delAllBtn','click',function () {
        // console.log('click all del')
        $('.all-del').removeClass('hideItem');
    })*/
    //取消批量删除
    $('.all-del').delegate('.cancelBtn', 'click', function() {
        $('.all-del').addClass('hideItem');
    })

    /*科室管理*/
    // 新建科室
    $('.department-manage').delegate('.addBtn', 'click', function() {
        $('.new-department').removeClass('hideItem');
        $('.new-department').find('.title').find('span').text('新建科室');
        $('.new-department').find('input').val('')

        $('.new-department').find('.sureBtn').attr('value', 'addnew');
        $('.new-department').find('.tips').addClass('hideItem');

        iskeydow.dept = true;
        iskeydow.role = false;
        iskeydow.user = false;
    })

    // 确定新增/编辑科室
    $('.new-department').delegate('.sureBtn', 'click', function() {
            var param = {} //获取相关数据
            param.deptNo = $('.new-department').find('.num').val();
            param.deptName = $('.new-department').find('.name').val(); // *
            param.remark = $('.new-department').find('.msg').val();

            if (param.deptNo == '') { delete param.deptNo; }
            if (param.remark == '') { delete param.remark; }
            var self = $(this);
            if ($(this).attr('value') == 'addnew') { //新增
                if (param.deptName != '') {
                    ajaxCommon(null, null, null, param, pcurl + 'dept/addDept', function(data) {
                        $('.new-department').addClass('hideItem');
                        $('.department-manage').removeAttr('lang');
                        loaddepart();
                        $('.user-manage').removeAttr('loadin');
                        wetoast('设置成功')
                        iskeydow.dept = false;
                    }, function(data) {
                        $(self).parent().siblings('.tips').removeClass('hideItem');
                        $(self).parent().siblings('.tips').text(data.errorMsg);
                    })
                } else {
                    $(this).parent().siblings('.tips').removeClass('hideItem');
                    $(this).parent().siblings('.tips').html('必须填写科室名称!');
                }
            } else if ($(this).attr('value') == 'edit') { // 编辑
                param.deptId = $(this).attr('deptId');
                ajaxCommon(null, null, null, param, pcurl + 'dept/updateDept', function(data) {
                    $('.new-department').addClass('hideItem');
                    $('.department-manage').removeAttr('lang');
                    loaddepart();
                    wetoast('设置成功');
                    iskeydow.dept = false;
                }, function(data) {
                    $(self).parent().siblings('.tips').removeClass('hideItem');
                    $(self).parent().siblings('.tips').text(data.errorMsg);
                })
            }
            // console.log(param);

        })
        //获取所有的选中信息
    $('.department-manage').delegate('.delAllBtn', 'click', function() {
            var item = $('.patientList tbody').find('.td1');
            for (var i = 0; i < item.length; i++) { //获取选中复选框的值
                if ($(item[i]).find('input').is(':checked')) {

                    console.log($(item[i]).find('input').val());
                }
            }
        })
        // 取消新建科室
    $('.new-department').delegate('.cancelBtn', 'click', function() {
            $('.new-department').addClass('hideItem');
        })
        //编辑科室
    $('.department-manage .patientList tbody').delegate('.editBtn', 'click', function() {
        $('.new-department').removeClass('hideItem');
        $('.new-department').find('.title').find('span').text('编辑科室');
        $('.new-department').find('.tips').addClass('hideItem');

        //获取相关信息
        var idx = $(this).parent().siblings('.td2').text();
        var num = $(this).parent().siblings('.td3').text();
        var name = $(this).parent().siblings('.td4').text();
        var msg = $(this).parent().siblings('.td5').text()

        $('.new-department').find('.num').val(num);
        $('.new-department').find('.name').val(name);
        $('.new-department').find('.msg').val(msg);
        $('.new-department').find('.sureBtn').attr('value', 'edit');
        $('.new-department').find('.sureBtn').attr('deptId', $(this).attr('value'));

        iskeydow.dept = true;
        iskeydow.role = false;
        iskeydow.user = false;
    });
    // 删除
    $('.department-manage tbody').delegate('.delBtn', 'click', function() {
            $('.all-del').removeClass('hideItem');
            var slef = $(this);

            $('.all-del').delegate('.sureBtn', 'click', function() {
                ajaxCommon(null, null, null, { deptId: $(slef).attr('value') }, pcurl + 'dept/deleteDept', function(data) {
                    // console.log(data);
                    $('.all-del').addClass('hideItem');
                    $(slef).parent().parent().remove();

                    // 优化删除。
                    // var searchId = $('.department-manage .searchNav .txt').val();
                    // var params = {
                    //     page: 1,
                    //     condition: searchId,
                    // }
                    // if (searchId == '') { delete params.condition; }
                    // $('.department-manage').removeAttr('lang');
                    // loaddepartSearch(params);


                    $('.department-manage').removeAttr('lang');
                    loaddepart();




                })
            })

        })
        //科室管理导入数据
    $('.department-manage').delegate('.import', 'click', function() {
            $('.newImport').removeClass('hideItem');
        })
        //选择文件
    $('.department-manage').delegate('.chooseFile', 'change', function() {
            //   	console.log(this.files[0].name);
            $(".tips").hasClass("hideItem");
            $(".tips").html("");
            $(".newImport .name").val(this.files[0].name);
        })
        //   确定提交导入数据
        //	 $('.department-manage').delegate('.sureBtn','click',function () {
        //	 	var param = "{'file':'" + $('.name').val() "'}";
        //$.ajaxFileUpload({
        //url: 'http://192.168.8.18:8080/hospital-manage/dept/importDeptBatch' + param, //用于文件上传的服务器端请求地址
        //secureuri: false, //是否需要安全协议，一般设置为false
        //fileElementId: 'fileBtn', //文件上传域的ID
        //dataType: 'json', //返回值类型 一般设置为json
        //type: 'post',
        //data: $('#fileBtn').serialize(),
        //success: function(data) {
        //// getOrganizationInfo()
        //console.log(data);
        //// window.location.href = '../../../WEB-INF/page/html/setting.html'
        //},
        //error: function(data) {
        //// getOrganizationInfo()
        //console.log(data);
        ////window.location.href = '../../../WEB-INF/page/html/setting.html'
        //}
        //})
        //return false;
        //	 	 $.ajaxFileUpload
        //          (
        //              {
        //                  url: 'http://192.168.8.18:8080/hospital-manage/dept/importDeptBatch', //用于文件上传的服务器端请求地址
        //                  secureuri: false, //是否需要安全协议，一般设置为false
        //                  fileElementId: 'fileBtn', //文件上传域的ID
        //                  type : "post",
        //					xhrFields:{withCredentials:true},
        //      			crossDomain: true,
        //                  data :$('#fileBtn').serialize() ,
        //                  
        //                  dataType: 'json', //返回值类型 一般设置为json
        //                   success: function(data, status){
        ////                      if (typeof (data.error) != 'undefined') {
        ////                          if (data.error != '') {
        ////                              console.log(data.error);
        //                  	 console.log(data.errorCode);
        //                  	 console.log("上传成功！");
        //                              
        //// 								console.log("！！！");
        ////                  	 		alert("！！！");
        ////                          } else {
        ////                              console.log(data.msg);
        ////                          }
        //console.log(data);
        ////                      }
        //						
        //                 }, 
        //                  error: function(data, status, e ,xml){
        //                  	 //console.log("服务器响应失败，请检查网络！！！");
        //                  	 
        //                  	 //console.log(data.errorMsg);
        //                  	 //var val = eval(data.errorMsg);
        //                  	 
        //                  	 //console.log(val);
        //                  	 
        //                  	 //console.log(data.errorCode);
        //                  	 
        //                  	 console.log(data);
        //                  }
        //              }
        //          )
        //          return false;
        //	 })
        //
        //function ajaxFileUpload() {
        //var param = "{'file':'" + $('.name').val() "'}";
        //$.ajaxFileUpload({
        //url: 'http://192.168.8.18:8080/hospital-manage/dept/importDeptBatch' + param, //用于文件上传的服务器端请求地址
        //secureuri: false, //是否需要安全协议，一般设置为false
        //fileElementId: 'fileBtn', //文件上传域的ID
        //dataType: 'json', //返回值类型 一般设置为json
        //type: 'post',
        //data: $('#fileBtn').serialize(),
        //success: function(data) {
        //// getOrganizationInfo()
        //console.log(data);
        //// window.location.href = '../../../WEB-INF/page/html/setting.html'
        //},
        //error: function(data) {
        //// getOrganizationInfo()
        //console.log(data);
        ////window.location.href = '../../../WEB-INF/page/html/setting.html'
        //}
        //})
        //return false;
        //}








    // 科室管理取消导入数据
    $('.department-manage').delegate('.cancelBtn', 'click', function() {
        $('.newImport').addClass('hideItem');

    })



    /*角色管理*/
    $('.role-manage').delegate('.addBtn', 'click', function() { // 新建角色
        $('.add-role').removeClass('hideItem');
        $('.add-role').attr('value', 'addnew');
        $('.add-role').find('.title').find('span').text('新增角色')
        clearRole();
        $('.add-role .range').find('input:last').map(function(i, e) { $(e).attr('checked', true); })
    });

    // 获取新建角色信息
    $('.add-role').delegate('.sureBtn', 'click', function() {
        console.log(125);
        var params = { roleName: '', remark: '', menuList: [] }
        params.roleName = $('.add-role').find('.roleName').val();
        console.log(params.roleName);
        params.remark = $('.add-role').find('.remark').val();
        var radioItem = $('.add-role .range-content').find($(':radio'));
        var checkItem = $('.add-role .choose-item').find($(':checkbox'));
        radioItem.map(function(i, e) {
            if ($(e).is(':checked')) {
                params.menuList.push($(e).attr('value'));
            }
        })
        checkItem.map(function(i, e) {
            if ($(e).is(':checked')) {
                params.menuList.push($(e).attr('value'));
            }
        })

        var self = $(this);
        if ($('.add-role').attr('value') == 'addnew') { //添加新角色

            if ((params.roleName != '') && (params.menuList.length != 0)) {
                ajaxCommon(null, null, null, params, pcurl + 'role/addRole', function(data) {
                    $('.add-role').addClass('hideItem');
                    $('.role-manage').removeAttr('lang');
                    loadrole();
                    $('.user-manage').removeAttr('loadin');
                    wetoast('设置成功');
                    iskeydow.role = false;
                }, function(data) {
                    $(self).parent().siblings('.tips').removeClass('hideItem');
                    $(self).parent().siblings('.tips').text(data.errorMsg);
                })
            } else {
                $(this).parent().siblings('.tips').removeClass('hideItem');
                $(self).parent().siblings('.tips').text('请确认角色名称是否填写了以及权限是否开通了');
            }
        } else if ($('.add-role').attr('value') == 'edit') { // 编辑角色
            params.roleId = $('.add-role').attr('roleId');
            ajaxCommon(null, null, null, params, pcurl + 'role/updateRole', function(data) {
                $('.add-role').addClass('hideItem');
                $('.role-manage').removeAttr('lang');
                loadrole();
                wetoast('设置成功');
                iskeydow.role = false;
            }, function(data) {
                $(self).parent().siblings('.tips').removeClass('hideItem');
                $(self).parent().siblings('.tips').text(data.errorMsg);
            })
        }

    })

    $('.add-role').delegate('.cancelBtn', 'click', function() {
        $('.add-role').addClass('hideItem');
    })

    // 编辑角色管理
    $('.role-manage .page1').delegate('.editBtn', 'click', function() {
        clearRole()
        var roleId = $(this).attr('value');
        $('.add-role').removeClass('hideItem');
        $('.add-role').attr('value', 'edit');
        $('.add-role').attr('roleId', roleId);
        $('.add-role').find('.title').find('span').text('编辑角色')
            //填入该角色信息
        var info = { roleName: '' }
        info.roleName = $(this).parent().siblings('.roleName').text();
        info.remark = $(this).parent().siblings('.remark').text();
        $('.role-manage').find('.roleName').val(info.roleName);
        $('.role-manage').find('.remark').val(info.remark);

        var radioItem = $('.add-role .range-content').find($(':radio'));
        var checkItem = $('.add-role .choose-item').find($(':checkbox'));

        ajaxCommon(null, null, null, { roleId: roleId }, pcurl + 'role/getRoleInfo', function(data) {
            var menuList = data.ret.roleMenus;
            $.each(menuList, function(i, e) {
                var menuId = e.menuId
                radioItem.map(function(j, ele) {
                    if (menuId == $(ele).attr('value')) {
                        $(ele).attr('checked', true);
                    }
                })
                checkItem.map(function(k, dom) {
                    if (menuId == $(dom).attr('value')) {
                        $(dom).attr('checked', true);
                    }
                })

            })
            chooseallcheckbox();
        })

    })

    // 删除角色
    $('.role-manage .page1').delegate('.delBtn', 'click', function() {
        $('.all-del').removeClass('hideItem');
        var slef = $(this);

        $('.all-del').delegate('.sureBtn', 'click', function() {
            ajaxCommon(null, null, null, { roleId: $(slef).attr('value') }, pcurl + 'role/deleteRole', function(data) {
                $('.all-del').addClass('hideItem');
                $(slef).parent().parent().remove();
                $('.role-manage').removeAttr('lang');
                loadrole();
            })
        })

    })

    /*用户管理*/
    $('.user-manage').delegate('.addBtn', 'click', function() {
        $('.add-user').removeClass('hideItem');
        $('.add-user').find('.title').find('span').text('新增帐号');
        clearAddUser(); //初始化
        $('.add-user').find('.userName').parent().removeClass('hideItem');
        $('.add-user').find('.password').parent().removeClass('hideItem');
        $('.add-user').attr('type', 'addNew'); //设置弹出为新增模式

    });
    $('.add-user').delegate('.cancelBtn', 'click', function() {
            $('.add-user').addClass('hideItem');
        })
        // 添加新用户
    $('.add-user').delegate('.sureBtn', 'click', function() {
        //获取所有参数
        var userParams = {};
        var radioItem = $('.add-user').find(':radio');
        radioItem.map(function(i, e) {
            if ($(e).is(':checked')) {
                userParams.sex = $(e).attr('value')
            }
        })
        userParams.name = $('.add-user').find('.name').val();
        userParams.position = $('.add-user').find('.position').val();
        userParams.deptId = $('.add-user').find('.deptId').attr('id');
        userParams.roleId = $('.add-user').find('.roleId').attr('id');
        userParams.mobile = $('.add-user').find('.mobile').val();
        userParams.userName = $('.add-user').find('.userName').val();
        userParams.password = $('.add-user').find('.password').val();

        userParams.mobile = userParams.mobile.replace(/ /g, '');

        if ($('.add-user').attr('type') == 'addNew') {
            // console.log(userParams);
            if (userParams.name && userParams.deptId && userParams.roleId && userParams.userName && userParams.password) {
                if (userParams.mobile && !(/^1\d{10}$/.test(userParams.mobile))) { // 如果手机不为空就验证手机号
                    $('.add-user').find('.tips').removeClass('hideItem')
                    $('.add-user').find('.tips').text('请填写正确的手机号');
                } else {
                    ajaxCommon(null, null, null, userParams, pcurl + 'userManage/addUser', function(data) {
                        $('.add-user').addClass('hideItem');
                        $('.user-manage').removeAttr('lang');
                        loaduser();
                        wetoast('设置成功');
                        iskeydow.user = false;
                    }, function(data) {
                        $('.add-user').find('.tips').removeClass('hideItem');
                        $('.add-user').find('.tips').text(data.errorMsg);
                    })
                }


            } else {
                $('.add-user').find('.tips').removeClass('hideItem')
                $('.add-user').find('.tips').text('出错啦！你确认信息都填写完毕了吗？');
            }
        } else if ($('.add-user').attr('type') == 'edit') {
            //不能修改帐号和密码
            delete userParams.userName;
            delete userParams.password;
            userParams.userId = $(this).attr('userId');
            // console.log(userParams);
            if (userParams.mobile && !(/^1\d{10}$/.test(userParams.mobile))) { // 如果手机不为空就验证手机号
                $('.add-user').find('.tips').removeClass('hideItem')
                $('.add-user').find('.tips').text('请填写正确的手机号');
            } else {
                ajaxCommon(null, null, null, userParams, pcurl + 'userManage/updateUser', function(data) {
                    $('.add-user').addClass('hideItem');
                    $('.user-manage').removeAttr('lang');
                    loaduser();
                    wetoast('设置成功');
                    iskeydow.user = false;
                })
            }

        }

    })
    $('.user-manage .patientList tbody').delegate('.editBtn', 'click', function() {
        $('.add-user').removeClass('hideItem');
        $('.add-user').find('.title').find('span').text('编辑帐号');
        $('.add-user').attr('type', 'edit')
        clearAddUser()
            // 不能修改帐号和密码
        $('.add-user').find('.userName').parent().addClass('hideItem');
        $('.add-user').find('.password').parent().addClass('hideItem');

        //获取相关信息
        var personal = {}
        personal.userName = $(this).parent().siblings('.td2').text(); //帐号

        personal.name = $(this).parent().siblings('.td3').text(); // 姓名
        personal.position = $(this).parent().siblings('.td4').text(); //职位
        personal.phone = $(this).parent().siblings('.td7').text(); //手机
        personal.sex = $(this).attr('sex') - 1;
        personal.deptId = $(this).attr('deptId'); //科室
        personal.roleId = $(this).attr('roleId'); //用户
        $('.add-user').find('.sureBtn').attr('userId', $(this).attr('userId'));


        // console.log(personal);
        $('.add-user').find('.user-select-list').children('li').map(function(i, e) {
            if (personal.deptId == $(e).attr('val')) {
                $('.add-user').find('.deptId').val($(e).text());
                $('.add-user').find('.deptId').attr('id', $(e).attr('val'));
            }
        })
        $('.add-user').find('.role-select-list').children('li').map(function(i, e) {
                if (personal.roleId == $(e).attr('val')) {
                    $('.add-user').find('.roleId').val($(e).text());
                    $('.add-user').find('.roleId').attr('id', $(e).attr('val'));
                }
            })
            // 录入相关信息
        $('.add-user').find('.name').val(personal.name);
        $('.add-user').find('.position').val(personal.position);
        // $('.add-user').find('.deptId').val('');
        // $('.add-user').find('.roleId').val('');
        $('.add-user').find('.mobile').val(personal.phone);
        $('.add-user').find('.userName').val(personal.userName);
        $('.add-user').find('.password').val('');
        $('.add-user').find('.list-show').css('display', 'none');



        $('.add-user').find('.item-radio').find('input').eq(personal.sex).attr('checked', true);

    })

    //用户管理导入数据
    $('.user-manage').delegate('.userImport', 'click', function() {
        //   	console.log(123);
        $('.newUserImport').removeClass('hideItem');
    })

    //	// 用户管理取消导入数据
    $('.newUserImport').delegate('.cancelBtn', 'click', function() {
        //  	console.log(456);
        $('.newUserImport').addClass('hideItem');
    })



    //自定义下拉框
    $('.add-user .text-content').delegate('.select-btn', 'click', function(evt) {
        var evt = event || evt;
        if (evt && evt.stopPropagation) {
            evt.stopPropagation()
        } else {
            window.event.cancelBubble = true;
        }

        $(this).siblings('.list-show').toggle();
        $(this).parent().parent().siblings('.item').find('.list-show').hide();
        var self = $(this);
        // 下拉框选项点击功能
        $(self).siblings('.list-show').delegate('li', 'click', function() {
            $(self).val($(this).text());
            $(this).parent().parent().hide();
            $(self).attr('id', $(this).attr('val'));
        })
    })

    $('.add-user').on('click', function() { // 点击其他也要关闭下拉框
            $(this).find('.list-show').hide();
        })
        // 删除用户
    $('.user-manage .page1').delegate('.delBtn', 'click', function() {

        $('.all-del').removeClass('hideItem');
        var slef = $(this);

        $('.all-del').delegate('.sureBtn', 'click', function() {
            ajaxCommon(null, null, null, { userId: $(slef).attr('value') }, pcurl + 'userManage/deleteUser', function(data) {
                // console.log(data);
                $('.all-del').addClass('hideItem');
                $(slef).parent().parent().remove();
                $('.user-manage').removeAttr('lang');
                loaduser();
            })
        })

    });

    // 下面是机构信息开始
    //编辑信息弹窗开始
    $(".editOrganizationInfo").on('click', function() {
        // 点击的时候赋值
        $('.patient-name').val($('#organizationName').text());
        $('#address').val($('#organizationAddress').text());
        $('#addSugarRemark').val($('#organizationIntroduce').text());
        // isSureCode.warnSubmit = false;
        // isSureCode.addSubmit = false;
        // isSureCode.updatePwdSubmit = false;
        // isSureCode.addSugarSubmit = true;
        $(".PopMask").show();
        $("#addSugarBox").show();
        document.documentElement.style.overflow = "hidden";
        $('.addSugarTitile p').text('编辑机构信息');
    });
    //关闭
    $("#addSugarCloseBtn,#addSugarCancel").on('click', function() {
        $(".PopMask").hide();
        $("#addSugarBox").hide();
        document.documentElement.style.overflow = "scroll";
        // clearAddSugar();
    });
    //提交编辑信息
    $('#addOrganizationInfo').on('click', function() {
        // 判读如果不是默认的占位图片的话，选择图片。
        // 这段逻辑有点问题，暂时先放着。
        // if ($('#logoImg').attr('src') != '../../../image/logoBg.png') {
        //     $('.chooseImg').text('请上传图片')
        //     $('.chooseImg').css('display', 'block')
        //     setTimeout(function() {
        //         $('.chooseImg').css('display', 'none')
        //     }, 1000)
        //     return;
        // }
        var f = $('#logoFile').val();
        if (f) {
            if (!/\.(jpg|png|JPG|PNG)$/.test(f)) {
                $('.chooseImg').text('图片格式必须是jpg/png格式')
                $('.chooseImg').css('display', 'block')
                setTimeout(function() {
                    $('.chooseImg').css('display', 'none')
                }, 1000)
                return;
            }
        }
        if ($('.institutionalInformation-manage .logo img').attr('src') == '../../../image/logoBg.png') {
            if (!$('#logoFile').val()) {
                $('.textId').text('请上传图片')
                $('.textId').css('display', 'block');
                setTimeout(function() {
                    $('.textId').css('display', 'none');
                }, 1000)
                return;
            }
        }
        if (!$('#addSugarBox .patient-name').val()) {
            $('.textId').text('请填写机构名称')
            $('.textId').css('display', 'block');
            setTimeout(function() {
                $('.textId').css('display', 'none');
            }, 1000)
            return;
        }
        $('#logoImg').attr('src', pcurl + 'organization/getPhoto');
        ajaxFileUpload();
        $(".PopMask").hide();
        $("#addSugarBox").hide();
    });
    // 机构信息结束

    // 编辑参数信息开始
    $('.editParameterInfo').on('click', function() {
        // 下面的ajax请求是填写默认的血糖参数数据。
        ajaxCommon(null, null, null, {}, pcurl + 'sugarParam/getSugarParamSetting', function(data) {
            var list = data.ret.param;
            $('.editBloodGlucoseInfo .list:eq(0) input:eq(0)').val(list.beforeBreakfastEx)
            $('.editBloodGlucoseInfo .list:eq(0) input:eq(1)').val(list.beforeBreakfastAf)
            $('.editBloodGlucoseInfo .list:eq(1) input:eq(0)').val(list.afterBreakfastEx)
            $('.editBloodGlucoseInfo .list:eq(1) input:eq(1)').val(list.afterBreakfastAf)

            $('.editBloodGlucoseInfo .list:eq(2) input:eq(0)').val(list.beforeLunchEx)
            $('.editBloodGlucoseInfo .list:eq(2) input:eq(1)').val(list.beforeLunchAf)
            $('.editBloodGlucoseInfo .list:eq(3) input:eq(0)').val(list.afterLunchEx)
            $('.editBloodGlucoseInfo .list:eq(3) input:eq(1)').val(list.afterLunchAf)

            $('.editBloodGlucoseInfo .list:eq(4) input:eq(0)').val(list.beforeDinnerEx)
            $('.editBloodGlucoseInfo .list:eq(4) input:eq(1)').val(list.beforeDinnerAf)
            $('.editBloodGlucoseInfo .list:eq(5) input:eq(0)').val(list.afterDinnerEx)
            $('.editBloodGlucoseInfo .list:eq(5) input:eq(1)').val(list.afterDinnerAf)


            $('.editBloodGlucoseInfo .list:eq(6) input:eq(0)').val(list.beforeSleepEx)
            $('.editBloodGlucoseInfo .list:eq(6) input:eq(1)').val(list.beforeSleepAf)
            $('.editBloodGlucoseInfo .list:eq(7) input:eq(0)').val(list.beforeDawnEx)
            $('.editBloodGlucoseInfo .list:eq(7) input:eq(1)').val(list.beforeDawnAf)
        })
        $(".PopMask").show();
        $("#editBloodGlucose").show();
        document.documentElement.style.overflow = "hidden";
        $('#editBloodGlucose .addSugarTitile p').text('编辑机构信息');
    });
    //关闭
    $("#addBloodGlucoseCloseBtn,#addBloodGlucoseCancel").on('click', function() {
        $(".PopMask").hide();
        $("#editBloodGlucose").hide();
        document.documentElement.style.overflow = "scroll";
    });
    // 点击确认
    $('#addBloodGlucose').on('click', function() {
        var obj = {
            'beforeBreakfastEx': $('.editBloodGlucoseInfo .list:eq(0) input:eq(0)').val(),
            'beforeBreakfastAf': $('.editBloodGlucoseInfo .list:eq(0) input:eq(1)').val(),
            'afterBreakfastEx': $('.editBloodGlucoseInfo .list:eq(1) input:eq(0)').val(),
            'afterBreakfastAf': $('.editBloodGlucoseInfo .list:eq(1) input:eq(1)').val(),

            'beforeLunchEx': $('.editBloodGlucoseInfo .list:eq(2) input:eq(0)').val(),
            'beforeLunchAf': $('.editBloodGlucoseInfo .list:eq(2) input:eq(1)').val(),
            'afterLunchEx': $('.editBloodGlucoseInfo .list:eq(3) input:eq(0)').val(),
            'afterLunchAf': $('.editBloodGlucoseInfo .list:eq(3) input:eq(1)').val(),

            'beforeDinnerEx': $('.editBloodGlucoseInfo .list:eq(4) input:eq(0)').val(),
            'beforeDinnerAf': $('.editBloodGlucoseInfo .list:eq(4) input:eq(1)').val(),
            'afterDinnerEx': $('.editBloodGlucoseInfo .list:eq(5) input:eq(0)').val(),
            'afterDinnerAf': $('.editBloodGlucoseInfo .list:eq(5) input:eq(1)').val(),


            'beforeSleepEx': $('.editBloodGlucoseInfo .list:eq(6) input:eq(0)').val(),
            'beforeSleepAf': $('.editBloodGlucoseInfo .list:eq(6) input:eq(1)').val(),
            'beforeDawnEx': $('.editBloodGlucoseInfo .list:eq(7) input:eq(0)').val(),
            'beforeDawnAf': $('.editBloodGlucoseInfo .list:eq(7) input:eq(1)').val()
        }
        for (var key in obj) {
            if (obj[key] < 0.6 || obj[key] > 33.3) {
                $('#judgeBloodGlucose').css('display', 'block');
                setTimeout(function() {
                    $('#judgeBloodGlucose').css('display', 'none');
                }, 1000);
                return
            }
        }
        if (+obj.afterBreakfastEx >= +obj.afterBreakfastAf || +obj.beforeBreakfastEx >= +obj.beforeBreakfastAf || +obj.afterLunchEx >= +obj.afterLunchAf || +obj.beforeLunchEx >= +obj.beforeLunchAf || +obj.afterDinnerEx >= +obj.afterDinnerAf || +obj.beforeDinnerEx >= +obj.beforeDinnerAf || +obj.beforeSleepEx >= +obj.beforeSleepAf || +obj.beforeDawnEx >= +obj.beforeDawnAf) {
            $('#judgeBloodGlucose').css('display', 'block');
            setTimeout(function() {
                $('#judgeBloodGlucose').css('display', 'none');
            }, 1000);
            return
        }
        ajaxCommon(null, null, null, obj, pcurl + 'sugarParam/updateSugarParamSetting', function(data) {
            $(".PopMask").hide();
            $("#editBloodGlucose").hide();
            wetoast('修改成功')
            parametersBeginInfo()
        })
    });
    //输入中的验证。
    $('.editBloodGlucoseInfo input').on('keyup', function() {
        clearNoNum(this);
    });
    // 编辑参数信息结束
}
// 编辑和提交机构信息的ajax方法。
function ajaxFileUpload() {
    var param = "{'name':'" + $('.patient-name').val() + "'," +
        "'address':'" + $('#address').val() + "'," +
        "'information':'" + $('#addSugarRemark').val() + "'}";
    $.ajaxFileUpload({
        url: pcurl + 'organization/addOrganization?param=' + param, //用于文件上传的服务器端请求地址
        secureuri: false, //是否需要安全协议，一般设置为false
        fileElementId: 'logoFile', //文件上传域的ID
        dataType: 'json', //返回值类型 一般设置为json
        type: 'post',
        data: $('#logoFile').serialize(),
        success: function(data) {
            // getOrganizationInfo()
            // window.location.href = '../../../WEB-INF/page/html/setting.html'
        },
        error: function(data) {
            // getOrganizationInfo()

            // 刷新本页面。
            // window.location.href = '../../../WEB-INF/page/html/setting.html'
            history.go(0)
        }
    })
    return false;
}
// 初始化机构信息。
function getOrganizationInfo() {
    ajaxCommon(null, null, null, {}, pcurl + 'organization/getOrganization', function(data) {
        if (!data.ret.organization) {
            $('#organizationAddress').text('')
            $('#organizationIntroduce').text('')
        } else {
            if (!data.ret.organization.address) {
                $('#organizationAddress').text('')
            } else {
                $('#organizationAddress').text(data.ret.organization.address)
            }
            if (!data.ret.organization.information) {
                $('#organizationIntroduce').text('')
            } else {
                $('#organizationIntroduce').text(data.ret.organization.information)
            }
        }
        console.log(data.ret.organization);
        if (!data.ret.organization) {
            $('.institutionalInformation-manage .logo img').attr('src', '../../../image/logoBg.png');
        } else {
            $('#organizationName').text(data.ret.organization.name)
            $('#logoImg').attr('src', pcurl + 'organization/getPhoto');
        }
    })

}

function loaddepart() { // 科室管理
    hideallblock(['department-manage']);
    // console.log('department-manage');
    pages.count = 1;
    if (!$('.department-manage').attr('lang')) {
        var no = 0 //排序
        ajaxCommon(null, null, null, { page: pages.currentPage }, pcurl + 'dept/getDeptList', function(data) {
            var list = data.ret.deptList;
            list.map(function(item) { // 排序
                no++;
                item.no = no;
            })
            pages.count = data.ret.pages;
            $('.department-manage .page1').html(templates.template1(list));

            if (pages.count > 1) {
                $('.department-manage .page').show();
                var isload = false;
                $('.department-manage .page').createPage(function(n) { //分页
                    if (!isload) {
                        isload = true;
                        return;
                    }
                    var num = 0;
                    ajaxCommon(null, null, null, { page: n }, pcurl + 'dept/getDeptList', function(data) {
                        var list = data.ret.deptList;
                        // 排序
                        n > 1 ? num = (num + n - 1) * 10 : no;
                        list.map(function(item) {
                                num++;
                                item.no = num;
                            })
                            // console.log(list);
                        $('.department-manage .page1').html(templates.template1(list));
                    })

                }, {
                    pageCount: pages.count,
                    showTurn: true, //是否显示跳转,默认可以
                    showSumNum: false //是否显示总页码
                });
            } else {
                $('.department-manage .page').hide();
            }

        })

        $('.department-manage').attr('lang', 1)
    }

}

// 科室管理搜索
function loaddepartSearch(params) {
    hideallblock(['department-manage']);
    // console.log('department-manage');
    pages.count = 1;
    if (!$('.department-manage').attr('lang')) {
        var no = 0 //排序
        ajaxCommon(null, null, null, params, pcurl + 'dept/getDeptList', function(data) {
            var list = data.ret.deptList;
            list.map(function(item) { // 排序
                no++;
                item.no = no;
            })
            pages.count = data.ret.pages;
            $('.department-manage .page1').html(templates.template1(list));

            if (pages.count > 1) {
                $('.department-manage .page').show();
                var isload = false;
                $('.department-manage .page').createPage(function(n) { //分页
                    if (!isload) {
                        isload = true;
                        return;
                    }
                    var num = 0;
                    ajaxCommon(null, null, null, { page: n, condition: params.condition }, pcurl + 'dept/getDeptList', function(data) {
                        var list = data.ret.deptList;
                        // 排序
                        n > 1 ? num = (num + n - 1) * 10 : no;
                        list.map(function(item) {
                                num++;
                                item.no = num;
                            })
                            // console.log(list);
                        $('.department-manage .page1').html(templates.template1(list));
                    })

                }, {
                    pageCount: pages.count,
                    showTurn: true, //是否显示跳转,默认可以
                    showSumNum: false //是否显示总页码
                });
            } else {
                $('.department-manage .page').hide();
            }

        })

        $('.department-manage').attr('lang', 1)
    }

}


function loadrole() { // 用户管理
    hideallblock(['role-manage']);
    // console.log('role-manage');
    pages.count = 1;
    if (!$('.role-manage').attr('lang')) {
        var no = 0 //排序
        ajaxCommon(null, null, null, { page: pages.currentPage }, pcurl + 'role/getAllRole', function(data) {
            var list = data.ret.roles;
            list.map(function(item) { // 排序
                no++;
                item.no = no;
            })
            pages.count = data.ret.pages;
            $('.role-manage .page1').html(templates.template2(list));

            if (pages.count > 1) {
                $('.role-manage .page').show();
                var isload = false;
                $('.role-manage .page').createPage(function(n) { //分页
                    if (!isload) {
                        isload = true;
                        return;
                    }
                    var num = 0;
                    ajaxCommon(null, null, null, { page: n }, pcurl + 'role/getAllRole', function(data) {
                        var list = data.ret.roles;
                        // 排序
                        n > 1 ? num = (num + n - 1) * 10 : no;
                        list.map(function(item) {
                            num++;
                            item.no = num;
                        })
                        $('.role-manage .page1').html(templates.template2(list));
                    })

                }, {
                    pageCount: pages.count,
                    showTurn: true, //是否显示跳转,默认可以
                    showSumNum: false //是否显示总页码
                });
            } else {
                $('.role-manage .page').hide();
            }

        })

        $('.role-manage').attr('lang', 1)
    }
    // 获取新建角色菜单
    if (!$('.add-role').attr('lang')) {
        ajaxCommon(null, null, null, {}, pcurl + 'menu/getMenus', function(data) {
            // console.log(data);
            var list = data.ret.menuList;
            var radioList = [];
            var checkList = [];
            list.map(function(item) {
                // 单选按钮所有集合
                if (item.type == 2) {
                    radioList.push(item);
                }
                // 多选框第一层(0)||子层(1)
                if (item.type == 0 || item.type == 1) {
                    checkList.push(item)
                }
            })

            pages.menu = checkList.length;

            $('.add-role .choose-item').html(templates.template4(checkList));
            $('.add-role .range-content').html(templates.template5(radioList));

            $('.add-role').attr('lang', 1);
            getMenu()
        })
    }

}

function clearRole() {
    $('.add-role').find($(':checkbox')).attr('checked', false) //清空所有的复选框以及单选框
    $('.add-role').find($(':radio')).attr('checked', false);
    //  console.log(159);
    $('.add-role').find($(':text')).val('');
    $('.add-role').find('.tips').addClass('hideItem');
    $('.add-role').find('.all-choose').attr('checked', false);
    iskeydow.dept = false;
    iskeydow.role = true;
    iskeydow.user = false;
}



// 用户管理搜索。
function loaduserText(params) {
    pages.count = 1;
    hideallblock(['user-manage']);
    // console.log('user-manage');

    ajaxCommon(null, null, null, {}, pcurl + 'dept/getAllDept', function(data) {
        var list = data.ret.depts;
        //          console.log(list);
        $('.searchNav .user-select-list').html(templates.template8(list));
    });


    pages.count = 1;
    if (!$('.user-manage').attr('lang')) {
        var no = 0 //排序
        ajaxCommon(null, null, null, params, pcurl + 'userManage/getAllUsers', function(data) {
            // console.log(data)
            var list = data.ret.users;
            list.map(function(item) { // 排序
                no++;
                item.no = no;
            })
            pages.count = data.ret.pages;
            $('.user-manage .page1').html(templates.template3(list));


            if (pages.count > 1) {
                $('.user-manage .page').show();
                var isload = false;
                $('.user-manage .page').createPage(function(n) { //分页
                    if (!isload) {
                        isload = true;
                        return;
                    }
                    var num = 0;
                    ajaxCommon(null, null, null, { page: n, deptId: params.deptId }, pcurl + 'userManage/getAllUsers', function(data) {
                        var list = data.ret.users;
                        // 排序
                        n > 1 ? num = (num + n - 1) * 10 : no;
                        list.map(function(item) {
                                num++;
                                item.no = num;
                            })
                            // console.log(list);
                        $('.user-manage .page1').html(templates.template3(list));
                    })

                }, {
                    pageCount: pages.count,
                    showTurn: true, //是否显示跳转,默认可以
                    showSumNum: false //是否显示总页码
                });
            } else {
                $('.user-manage .page').hide();
            }

        })

        $('.user-manage').attr('lang', 1)
    }

    //打开获取下拉框
    if (!$('.user-manage').attr('loadin')) {
        ajaxCommon(null, null, null, {}, pcurl + 'dept/getAllDept', function(data) {
            var list = data.ret.depts;
            $('.add-user .user-select-list').html(templates.template6(list));
        });
        ajaxCommon(null, null, null, {}, pcurl + 'role/getRoles', function(data) {
            var list = data.ret.roles;
            $('.add-user .role-select-list').html(templates.template7(list));
        });
        $('.user-manage').attr('loadin', 1);
    }
}



















function loaduser() {
    pages.count = 1;
    hideallblock(['user-manage']);
    // console.log('user-manage');

    ajaxCommon(null, null, null, {}, pcurl + 'dept/getAllDept', function(data) {
        var list = data.ret.depts;
        //          console.log(list);
        $('.searchNav .user-select-list').html(templates.template8(list));
    });


    pages.count = 1;
    if (!$('.user-manage').attr('lang')) {
        var no = 0 //排序
        ajaxCommon(null, null, null, { page: pages.currentPage }, pcurl + 'userManage/getAllUsers', function(data) {
            // console.log(data)
            var list = data.ret.users;
            list.map(function(item) { // 排序
                no++;
                item.no = no;
            })
            pages.count = data.ret.pages;
            $('.user-manage .page1').html(templates.template3(list));


            if (pages.count > 1) {
                $('.user-manage .page').show();
                var isload = false;
                $('.user-manage .page').createPage(function(n) { //分页
                    if (!isload) {
                        isload = true;
                        return;
                    }
                    var num = 0;
                    ajaxCommon(null, null, null, { page: n }, pcurl + 'userManage/getAllUsers', function(data) {
                        var list = data.ret.users;
                        // 排序
                        n > 1 ? num = (num + n - 1) * 10 : no;
                        list.map(function(item) {
                                num++;
                                item.no = num;
                            })
                            // console.log(list);
                        $('.user-manage .page1').html(templates.template3(list));
                    })

                }, {
                    pageCount: pages.count,
                    showTurn: true, //是否显示跳转,默认可以
                    showSumNum: false //是否显示总页码
                });
            } else {
                $('.user-manage .page').hide();
            }

        })

        $('.user-manage').attr('lang', 1)
    }

    //打开获取下拉框
    if (!$('.user-manage').attr('loadin')) {
        ajaxCommon(null, null, null, {}, pcurl + 'dept/getAllDept', function(data) {
            var list = data.ret.depts;
            $('.add-user .user-select-list').html(templates.template6(list));
        });
        ajaxCommon(null, null, null, {}, pcurl + 'role/getRoles', function(data) {
            var list = data.ret.roles;
            $('.add-user .role-select-list').html(templates.template7(list));
        });
        $('.user-manage').attr('loadin', 1);
    }
}
// 初始化添加用户信息
function clearAddUser() {
    //清空内容
    $('.add-user').find('.name').val('');
    $('.add-user').find('.position').val('');
    $('.add-user').find('.deptId').val('');
    $('.add-user').find('.roleId').val('');
    $('.add-user').find('.mobile').val('');
    $('.add-user').find('.userName').val('');
    $('.add-user').find('.password').val('');
    $('.add-user').find('.list-show').css('display', 'none');
    $('.add-user').find('.tips').addClass('hideItem');

    iskeydow.dept = false;
    iskeydow.role = false;
    iskeydow.user = true;
}
// 机构信息
function institutionalInformation() {
    hideallblock(['institutionalInformation-manage']);
    getOrganizationInfo();
}

function loadsetting() {
    hideallblock(['setting-manage']);
    parametersBeginInfo();
}
// 参数设置初始数据。
function parametersBeginInfo() {
    ajaxCommon(null, null, null, {}, pcurl + 'sugarParam/getSugarParamSetting', function(data) {
        var list = data.ret.param;
        $('.page2').html(templates.template9(list));
    })
}
// 机构信息结束
function getMenu() {
    // 单选菜单默认选中第一个
    /* $('.add-role .range-content').find('.range').each(function (i,e) {
     $(e).find('input').eq(0).attr('checked',true)
     })*/
    //多选框，标题全选功能
    $('.add-role').delegate('.choose-title', 'click', function() {
            if ($(this).find('input').is(':checked')) {
                $(this).siblings('.choose-item').find('input').attr('checked', true);
            } else {
                $(this).siblings('.choose-item').find('input').attr('checked', false);
            }
        })
        //多选框主菜单的全选功能
        /*首先判断有没有子菜单,有子菜单则有全选功能。当子菜单有一个选中的时候，则主菜单也是选中状态*/
    $('.add-role .check-item').delegate('.firstCheck', 'click', function() {
            var hasSecondNav = $(this).parent().find('.second-content').children('input');
            if (hasSecondNav.length > 0) {
                if ($(this).is(':checked')) {
                    $(this).parent().find('.second-content').find('input').attr('checked', true);
                } else {
                    $(this).parent().find('.second-content').find('input').attr('checked', false);
                }
            }
            chooseallcheckbox()
        })
        // 子菜单有一个选中就选中主菜单
    $('.add-role .second-content').delegate('input', 'click', function() {
        if ($(this).is(':checked')) {
            $(this).parent().parent().find('.firstCheck').attr('checked', true);
        }
        chooseallcheckbox()
    })

}

function chooseallcheckbox() {
    var checkItem = $('.add-role .choose-item').find($(':checkbox'));
    var menuarr = []
    checkItem.map(function(i, e) {
        if ($(e).attr('checked') == 'checked') {
            menuarr.push(i)
        }
    })
    if (menuarr.length == pages.menu) {
        $('.add-role').find('.all-choose').attr('checked', true);
    } else {
        $('.add-role').find('.all-choose').attr('checked', false);
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