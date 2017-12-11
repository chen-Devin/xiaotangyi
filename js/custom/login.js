$(function() {
    var submitBtnflagNo = true;

    // changeImg();
    $('#userName').focus();

    $('#remberMe input').click(function() {
        if ($(this).attr("checked") == "checked") {
            $('.content .tips').show();
            $('.content .tips').text('7天内免登陆');
            setTimeout(function() {
                $('.content .tips').hide();
            }, 1000);
        }
    });

    $("#loginBtn").on('click', function() {

        var userName = $("#userName").val().replace(/\s/g, "");
        var password = $("#password").val();
        // var capt = $("#code").val();
        var isRem = $('#remberMe input').is(':checked');
        if (isRem) {
            isRem = 1;
        } else {
            isRem = 2;
        }

        //var pwd = hex_md5(password).toUpperCase();

        if (userName == "" || password == "") {
            $('.content .tips').show();
            setTimeout(function() {
                $('.content .tips').hide();
            }, 1000);
            $("#userName").val('')
            $("#password").val('');
            return false;
        }

        if (submitBtnflagNo) {
            ajaxCommon(function() {}, false, 'post', {
                userName: userName,
                password: password,
                // capt: capt,
                isRem: isRem
            }, pcurl + 'user/login', function(res) {

                submitBtnflagNo = 0;
                // console.log(res);
                window.location.href = 'index.html?userName=' + userName;
                submitBtnflagNo = false;
                if ($('#remberMe input').is(':checked')) {
                    //记住我
                    localStorage.setItem("isCheck", true);
                    localStorage.setItem("userNameId", userName);
                    localStorage.setItem("userNameId", password);
                    textText()
                } else {
                    localStorage.clear();
                    textText()
                }
                getNav();
                // localStorage.removeItem('bloodSlucosEearlyEarning');
                // var obj = res.ret.sugarParamSetting;
                // var str = JSON.stringify(obj);
                // localStorage.setItem('bloodSlucosEearlyEarning', str);
            }, function(data) {
                $('.tips').show();
                $('.tips').text(data.errorMsg);
                setTimeout(function() {
                        $('.tips').hide();
                    }, 2000)
                    // changeImg();
                $("#userName").val('')
                $("#password").val('');
                // $("#code").val('');
            });
        }

    });

    $(document).keydown(function(event) {
        if (event.keyCode == 13) {
            $("#loginBtn").click();
        }
    });

});

/*function changeImg() {

	$('#codeImg img').attr('src', pcurl + 'user/captcha');
}*/

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




function getNav() {
    sessionStorage.clear();
    ajaxCommon(null, false, null, {}, pcurl + 'menu/getUserMenuList', function(data) {
        var list = data.ret.menuList;
        sessionStorage.setItem('menuList', JSON.stringify(list))
    })
}

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
            // 大家都在发
            if (data.errorCode == 200 || data.errorCode == 0) {
                successCallback && successCallback(data);
            } else {
                if (failCallback) { failCallback(data); }
            }
        },
        error: function(data) { if (failCallback) { failCallback(data); } }
    });
}

function GetQueryString(name) { //采取正则表达式获取地址栏参数
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}