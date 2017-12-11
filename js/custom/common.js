/**
 * Created by admin on 2017/7/7.
 *  因为是前段后端不分离的，所以发开环境和发布环境的代码会有路径问题，在开发环境这里，头部导航做了处理
 * 在initNav()函数中有一段代码，开发的时候使用。给代码后端融合时需要删掉
 */
var isSureCode = { addSubmit: false, warnSubmit: false, updatePwdSubmit: false, addSugarSubmit: false };

$(function() {
    //获取个人信息
    var userInfodata = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfodata != null) {
        $('.nav').find("#user-my").text(userInfodata.name);
        $('.nav').find("#user-my").attr('data-userId', userInfodata.userId);
        $('.nav').find("#user-my").attr('data-deptId', userInfodata.deptId);
        $('.nav').find("#user-my").attr('data-deptName', userInfodata.deptName);
    }

    //导航栏消息提醒
    var navMsgListData = JSON.parse(sessionStorage.getItem('navMsgList'));

    //nav导入
    var hash = window.location.href;
    // console.log(hash.indexOf('index'));//判断首页的时候就不导入nav.html
    if (hash.indexOf('index') <= -1) {
        $(".nav").load('../../../include/nav.html', function() {
            initNav();
            getOrganization();
            $(".nav-my").hover(function() { $(this).find('#drapDown-user').toggle(); });
            $('.nav').find("#user-my").text(userInfodata.name);
            $('.nav').find("#user-my").attr('data-userId', userInfodata.userId);
            $('.nav').find("#user-my").attr('data-deptId', userInfodata.deptId);
            $('.nav').find("#user-my").attr('data-deptName', userInfodata.deptName);

            $('#logo').click(function() { window.location.href = '../../../index.html'; });

            if (navMsgListData && navMsgListData.length > 0) { $('.navMsgImg').find('i').show(); }
            $('.nav .navMsg ul').html(_.template($('#navMsg-list-template').html())(navMsgListData));
            //导航栏消息
            navMsgBtn();
        });
        //修改密码导入
        $(".updatePwdPop").load('../../../include/pwdPop.html', function() {
            updatePwdSureBtn(); //确定
            updatePwdCancelBtn(); //取消，关闭
        });
    } else {
        initNav();
    };
    // 退出登录
    $(".nav-my").hover(function() {
        $(this).find('#drapDown-user').toggle();
    });

    $('.nav').delegate('#navExit', 'click', exitLogin);
    updatePwd(); //修改密码

    $(document).keydown(function(e) {
        var theEvent = e || window.event;
        var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == 13 && e.srcElement.type != 'textarea') {
            //回车执行查询
            e.preventDefault();
            if (isSureCode.updatePwdSubmit) {
                $('#updatePwdSureBtn').click(); //修改密码
            }
        }
    });

})


// 初始化机构信息。
function getOrganization() {
    ajaxCommon(null, null, null, {}, pcurl + 'organization/getOrganization', function(data) {
        if (!data.ret.organization) {
            $('#logo img').attr('src', '../../../image/logo1.png');
            console.log($('#logo img').attr('src'))
        } else {
            $('.firmName').text(data.ret.organization.name);
            $('#logo img').attr('src', pcurl + 'organization/getPhoto');
        }
    })
}
// 修改密码
function updatePwd() {

    $('#updatePwd').click(function() {
        //		console.log(456);
        isSureCode.warnSubmit = false;
        isSureCode.addSubmit = false;
        isSureCode.addSugarSubmit = false;
        isSureCode.updatePwdSubmit = true;
        $('.PopMask').show();
        $('#updatePwdPop').show();
    });
}

function updatePwdSureBtn() {
    $('#updatePwdSureBtn').click(function() {
        var oldPwd = $('#oldPwd').val();
        var newPwd = $('#newPwd').val();
        var newSurePwd = $('#newSurePwd').val();
        if (oldPwd != '' && newPwd != '' && newSurePwd != '') {
            if (newPwd == newSurePwd) { //新密码一致
                ajaxCommon(null, null, null, {
                    oldPassword: oldPwd,
                    newPassword: newPwd
                }, pcurl + 'user/updatePassword', function(res) {
                    wetoast('修改成功');
                    isSureCode.updatePwdSubmit = false;
                    $('.PopMask').hide();
                    $('#updatePwdPop').hide();
                    //跳到登录
                    exitLogin();

                }, function(err) {
                    //console.log(err);
                    $("#updatePwdPop .tips").show();
                    $("#updatePwdPop .tips").text(err.errorMsg);
                    setTimeout(function() {
                        $("#updatePwdPop .tips").hide();
                    }, 1000);
                });
            } else { //新密码不一致
                $("#updatePwdPop .tips").show();
                $("#updatePwdPop .tips").text('请确认新密码一致');
                setTimeout(function() {
                    $("#updatePwdPop .tips").hide();
                }, 1000);
                return;
            }
        } else {
            $("#updatePwdPop .tips").show();
            $("#updatePwdPop .tips").text('请填写密码');
            setTimeout(function() {
                $("#updatePwdPop .tips").hide();
            }, 1000);
            return;
        }
    });
}

function updatePwdCancelBtn() {
    $('#updatePwdCancelBtn,#updatePwdClose').click(function() {
        $('#updatePwdPop').hide();
        $('.PopMask').hide();
        $('.updatePwd-content input').val('');
    });
}

//退出
function exitLogin() {
    var postForm = document.createElement("form");
    postForm.method = "post";
    postForm.action = pcurl + 'user/logout';
    document.body.appendChild(postForm);
    postForm.submit();
    document.body.removeChild(postForm);
    // sessionStorage.clear();//退出登录清除所有缓存信息
    // sessionStorage.removeItem('userInfo');// 退出登录后删除个人信息缓存；
    sessionStorage.removeItem('iswarn'); // 清除红点
}
//导航消息提醒
function navMsgBtn() {
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
        // 清除智能提醒的小红点。
    $('.nav .navBarLeft').find('.li_4 i').css('display', 'none');
}

//请求头部导航权限
function initNav() {
    var menuList = JSON.parse(sessionStorage.getItem('menuList'));

    // console.log(menuList);
    if (menuList == null) {
        return;
    } else {
        menuList.map(function(e, i) {
            var str = e.url;
            str = str.split('.')[0];
            if (str == 'index') {} else {
                str = str.split('/')[1];
            }
            e.isActive = str;
            e.url = navUrl + e.url;
        })

        var str = '';
        for (var i = 0; i < menuList.length; i++) {
            str += '<li class="fl li_' + i + '" isActive="' + menuList[i].isActive + '"><a href="' + menuList[i].url + '">' + menuList[i].name + '</a></li>'
        }
        $('.nav .navBarLeft').html(str);

        var item = $('.nav').find('.navBarLeft').children('li');
        var isActive = window.location.href;
        isActive = isActive.split('.html')[0];
        var url = isActive.split('/');
        isActive = url[url.length - 1];
        // var isActive = $('.nav').find('.navBarLeft').attr('page')

        item.map(function(idx, ele) {
            /*本地调试代码-路径(上环境的时候删除)-----*/
            if (isActive == 'index' && idx == 0) {
                $(ele).find('a').attr('href', 'index.html');
            } else if (isActive != 'index' && idx == 0) {
                $(ele).find('a').attr('href', '../../../index.html');
            } else if (isActive != 'index' && idx > 0) {
                var url = $(ele).find('a').attr('href');
                url = url.split('/');
                url = url[url.length - 1];
                $(ele).find('a').attr('href', url);
            }
            /*----0------------------------------------------*/

            if ($(ele).attr('isActive') == isActive) {
                $(ele).find('a').addClass('active');
            }

        })
        for (var i = 0; i < menuList.length; i++) {
            // console.log(menuList[i].list.length)
            if (menuList[i].list.length > 0) { // 二级菜单
                var str = menuList[i].url;
                str = str.split('.')[0];
                if (str != 'index') {
                    var arr = str.split('/');
                    str = arr[arr.length - 1]
                }
                var secondList = JSON.stringify(menuList[i].list)
                sessionStorage.setItem(str, secondList);
            }
        }

        var iswarn = sessionStorage.getItem('iswarn')
        if (sessionStorage.getItem('iswarn') == null) {
            ajaxCommon(function() {}, false, null, { page: 1 }, pcurl + 'warn/getWarnInfo', function(data) {
                var list = data.ret.warns;
                if (list && list.length > 0) {
                    sessionStorage.setItem('iswarn', true);
                } else {
                    sessionStorage.setItem('iswarn', false);
                }
            });
            redwarn()
        } else if (iswarn == 'true') {
            redwarn()
        }
    }
}

function redwarn() {
    var leftLis = $('.navBarLeft li'); /*console.log(leftLis);*/
    for (var k = 0; k < leftLis.length; k++) {
        var intelligentRedDot = leftLis[k];
        var lisDom = $(intelligentRedDot).attr('isActive');
        if (lisDom == 'intelligentWarn') {
            $(intelligentRedDot).append('<i></i>')
        }
    }
}

/*js,css按需加载*/
function asyLoadScript(filenames, fileType, callback) {
    var container = document.getElementsByTagName('body')[0];
    var node;
    if (fileType == "js") {
        for (var i = 0; i < filenames.length; i++) {
            var oJs = document.createElement('script');
            oJs.setAttribute("type", "text/javascript");
            oJs.setAttribute("src", filenames[i]); //文件的地址 ,可为绝对及相对路径
            container.appendChild(oJs); //绑定
            node = oJs;
        }
    } else if (fileType == "css") {
        for (var i = 0; i < filenames.length; i++) {
            var oCss = document.createElement("link");
            oCss.setAttribute("rel", "stylesheet");
            oCss.setAttribute("type", "text/css");
            oCss.setAttribute("href", filenames[i]);
            container.appendChild(oCss); //绑定
            node = oCss;
        }
    }
    node.onload = function() {
        $.isFunction(callback) && callback();
    }
}

function hideallblock(domlist) { //隐藏每个模块区域,只显示当前区域 贰
    $('body').find('.main-template-block').addClass('hideItem');
    for (var dom in domlist) { $('.' + domlist[dom]).removeClass('hideItem'); }
}
var numNo = 0;

function ajaxCommon(beforeCallback, async, type, params, url, successCallback, failCallback) { //ajax通用方法
    type = type || 'post'; //默认post
    if (async == null) async = true; //默认异步
    // 时间戳
    var date = Date.parse(new Date());

    if (params.length == 0) {
        params = 'reqId=' + date
    } else {
        params = JSON.stringify(params);
        params = 'reqId=' + date + '&param=' + params
    }

    $.ajax({
        beforeSend: beforeCallback != null ? beforeCallback : function() {},
        async: async, //true或false
        type: type,
        url: url,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: params,
        dataType: 'json',
        xhrFields: { withCredentials: true },
        crossDomain: true,
        success: function(data) {
            // console.log(data);
            if (data.errorCode == 200 || data.errorCode == 0) {
                successCallback && successCallback(data);
            } else {
                if (failCallback) { failCallback(data); }
            }
        },
        error: function(res) {
            if (res.responseText.indexOf("window.top.location.href=") > 0) {
                alert("当前是无登陆状态!操作数据时请重新登陆!!!");
                toLocation(pcurl + "/user/logout", {});
            }
            // if(failCallback){failCallback(data);}
        }
    });
}

function toLocation(method, paramObj) {
    if (typeof(method) == 'undefined') {
        throw new Error('params error, please tell me method.');
    }
    var basePath = $("#BasePath").val();
    var url = method;
    if (typeof(basePath) != 'undefined' && basePath != '') {
        url = basePath + url;
    }

    var data = {};

    if (typeof(paramObj) != 'undefined' && paramObj != "" && paramObj != null) {
        data.param = JSON.stringify(paramObj);
    }

    var paramStr = "";
    //	$.each(data,function(key,value){
    //		paramStr = paramStr + key + "=" + value + "&";
    //	});
    //	paramStr = paramStr.substring(0,paramStr.length - 1);
    //	window.location.href = url + "?" + paramStr;
    // 为避免刷新界面造成丢失问题，全部改回get提交

    var postForm = document.createElement("form");
    postForm.method = "post";
    postForm.action = url;
    var input;
    $.each(data, function(key, value) {
        input = document.createElement("input");
        input.setAttribute("name", key);
        input.setAttribute("value", value);
        postForm.appendChild(input);
    });

    document.body.appendChild(postForm);
    postForm.submit();
    document.body.removeChild(postForm);

}

function GetQueryString(name) { //采取正则表达式获取地址栏参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function wetoast(message) { //显示toast弹出层
    var toast = document.createElement('div');
    toast.classList.add('toast-container');
    toast.innerHTML = '<div class="' + 'toast-message' + '">' + message + '</div>';
    toast.addEventListener('webkitTransitionEnd', function() {
        if (!toast.classList.contains('active')) {
            toast.parentNode.removeChild(toast);
        }
    });
    document.body.appendChild(toast);
    toast.offsetHeight;
    toast.classList.add('active');
    setTimeout(function() {
        toast.classList.remove('active');
        document.body.removeChild(toast);
    }, 2000);
}