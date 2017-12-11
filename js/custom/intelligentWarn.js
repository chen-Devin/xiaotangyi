/**
 * Created by admin on 2017/7/9.
 */

/*全局变量*/
var templates = {
    template1: _.template($('#warn-list-template').html()),//患者列表
}
var pages = {count:0,currentPage:1,time:1}
/**/

var isNavMsg=0, isInHospitalNo=null;
isNavMsg = GetQueryString('navMsg');
isInHospitalNo = GetQueryString('navMsgInHospitalNo');

$(function () {
    initEvent();

    if (isInHospitalNo!=null&&isInHospitalNo.length>0) {// 从导航栏消息提醒单个人-跳转到智能提醒
        var paramsObj={};
        paramsObj.page=1;
        paramsObj.condition=isInHospitalNo;
        getData(paramsObj);
    }else{
        getData();
    }

})

function getData(params) {

    if(!params){
        params = {page:1}
    }

    var item = $('.searchNav').find('.btn');
    for(var i=0;i<item.length;i++){
        if($(item[i]).hasClass('activeBtn')){
            params.time = $(item[i]).attr('value');
        }
    }
    if(params.time<0){
        delete params.time;
    }

    var count = 0;
    ajaxCommon(function(){},false,null,params,pcurl+'warn/getWarnInfo',function (data) {
        count = data.ret.pages;
       // console.log(data);
        var list = data.ret.warns;
        list.map(function (e,i) {
            if(e.patient.birthday){
                e.patient.age = getAge(e.patient.birthday)
            }
        })

        $('.patientList tbody').html(templates.template1(list))
        if(count>1){
            $('.patientList .page').show();
            var open = false;
            $('.patientList .page').createPage(function(n){//分页
                if(!open){
                    open=true;
                    return;
                }
                params.page=n;
                ajaxCommon(function(){},null,null,params,pcurl+'warn/getWarnInfo',function (data) {
                    console.log(data);
                    var list = data.ret.warns;
                    list.map(function (e,i) {
                        if(e.patient.birthday){
                            e.patient.age = getAge(e.patient.birthday)
                        }
                    })
                    $('.patientList tbody').html(templates.template1(list))
                });
            },{
                pageCount:count,
                showTurn:true,//是否显示跳转,默认可以
                showSumNum:false//是否显示总页码
            });
        }else{
            $('.patientList .page').hide();
        }
    });

}
function initEvent() {

    /*搜索功能*/
    $('.searchNav').delegate('.btn','click',function () {// 选择按钮
        $(this).addClass('activeBtn');
        $(this).siblings('.btn').removeClass('activeBtn');
    })
    
    $('.searchNav').delegate('.searchBtn','click',function () {

        var params = {}//获取搜索条件
        params.page = 1;
        if($('.searchNav').find('.txt').val()!==''){
            params.condition = $('.searchNav').find('.txt').val();
        }
        getData(params);
    })

    $('.searchNav').delegate('.resetBtn','click',function () {//条件重置功能

        if (isInHospitalNo!=null&&isInHospitalNo.length>0){
            window.location.href = 'intelligentWarn.html';
        }

        $('.searchNav').find('.txt').val('');
        var item = $('.searchNav').find('.btn');
        for(var i=0;i<item.length;i++){
            if(i<item.length-1){
                $(item[i]).removeClass('activeBtn');
            }else{
                $(item[i]).addClass('activeBtn');
            }
        }
        getData();
    })

}

function getAge(strBirthday){
    strBirthday = strBirthday.split(' ')[0];
    var returnAge;
    var strBirthdayArr=strBirthday.split("-");
    var birthYear = strBirthdayArr[0];
    var birthMonth = strBirthdayArr[1];
    var birthDay = strBirthdayArr[2];

    var d = new Date();
    var nowYear = d.getFullYear();
    var nowMonth = d.getMonth() + 1;
    var nowDay = d.getDate();

    if(nowYear == birthYear){
        returnAge = 0;//同年 则为0岁
    }
    else{
        var ageDiff = nowYear - birthYear ; //年之差
        if(ageDiff > 0){
            if(nowMonth == birthMonth) {
                var dayDiff = nowDay - birthDay;//日之差
                if(dayDiff < 0) {
                    returnAge = ageDiff - 1;
                }else {
                    returnAge = ageDiff ;
                }
            }else{
                var monthDiff = nowMonth - birthMonth;//月之差
                if(monthDiff < 0) {
                    returnAge = ageDiff - 1;
                }else{
                    returnAge = ageDiff ;
                }
            }
        }
        else {
            returnAge = -1;//返回-1 表示出生日期输入错误 晚于今天
        }
    }
    return returnAge;//返回周岁年龄

}