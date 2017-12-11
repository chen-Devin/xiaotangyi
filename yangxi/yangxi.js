
$('.sugarStatus>.analyseTitle').html(
    '<p class="fl">血糖概况</p>'+
    '<a class="addSugarPrintBtn2 fr tc sugarStatusPrintBtn" id="yangxiBtn"  href="javascript:void(0)">血糖记录表二</a>'+
    '<a class="addSugarPrintBtn fr tc sugarStatusPrintBtn" id="addSugarPrintBtn"  href="javascript:void(0)" patientId="">血糖记录表一</a>'+
    '<a class="addSugarBtn fr tc sugarStatusPrintBtn" id="addSugarBtn"  href="javascript:void(0)">添加</a>'
)


var yangxiTemplate = {}
$('#yangxiBtn').on('click',function(){
    document.documentElement.style.overflow = "hidden";
    if(!$('#yangxiBtn').attr('lang')){
        $('#yangxi-gis-print').load('yangxi/yangxi.html',function(){
            yangxiTemplate.template1 = _.template($('#yangxi-table-template').html());
            yangxiInit();
            yangxiInitTime();
            yangxiData();
            $('#yangxiBtn').attr('lang',1);
            $('.yangxi-gis').find('.yangxi-search').attr('patientId',$('#yangxiBtn').attr('patientId'));
        })
    }else{
        $('.yangxi-gis').removeClass('hideItem');
        $('.yangxi-search').find('.tips').hide();
        yangxiInitTime();
        yangxiData();
    }
})

function yangxiInitTime() {
    $('.yangxi-search').find('.tips').hide();
    var date = new Date();
    var strDate = date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());

    var month = ((date.getMonth()-0)<10?'0'+(date.getMonth()-0+1):(date.getMonth()-0));
    if(month=='00'){
        month ='01';
    }

    $('#yangxi-startDate').val(date.getFullYear()+'-'+month+'-01');
    $('#yangxi-endDate').val(strDate);
}

function yangxiInit() {

    $('.yangxi-gis').delegate('.cancelBtn','click',function(){
        document.documentElement.style.overflow = "scroll"
        $('.yangxi-gis').addClass('hideItem');
    });

    $('.yangxi-gis').delegate('.yangxi-print','click',function () {
        $('.yangxi-gis .yangxi-table').jqprint({
            debug: false, //如果是true则可以显示iframe查看效果（iframe默认高和宽都很小，可以再源码中调大），默认是false
            importCSS: true, //true表示引进原来的页面的css，默认是true。（如果是true，先会找$("link[media=print]")，若没有会去找$("link")中的css文件）
            printContainer: true, //表示如果原来选择的对象必须被纳入打印（注意：设置为false可能会打破你的CSS规则）。
            operaSupport: true//表示如果插件也必须支持歌opera浏览器，在这种情况下，它提供了建立一个临时的打印选项卡。默认是true
        });
    });

    $('.yangxi-gis').delegate('.search-btn','click',function(){
        var params = {};
        params.dateEx =  $('#yangxi-startDate').val();
        params.dateAf = $('#yangxi-endDate').val();
        params.patientId = $('#yangxiBtn').attr('patientId');
        if(params.dateEx&&params.dateAf){
            yangxiData(params);
        }else{
            $('.yangxi-search').find('.tips').show();
        }
    })
}

function yangxiData(params) {
    if(!params){
        params = {};
        var date = new Date()
        params.dateAf  =  date.getFullYear()+'-'+((date.getMonth()-0+1)<10?'0'+(date.getMonth()-0+1):(date.getMonth()-0+1))+'-'+(date.getDate()-0<10?'0'+date.getDate():date.getDate());
        var month = ((date.getMonth()-0)<10?'0'+(date.getMonth()-0+1):(date.getMonth()-0));

        params.dateEx= date.getFullYear()+'-'+month+'-01';
        // params.dateEx = '2017-09-04';
        params.patientId = $('#yangxiBtn').attr('patientId');
    }

    ajaxCommon(null,null,null,params,pcurl+'yangxi/getSugarRecordByPatientId',function (data) {
       var patientInfo = data.ret.patient;
       if(patientInfo.birthday){
           patientInfo.age = getAge(patientInfo.birthday);
       }
       var pageList = [];//每页数据
       var list = data.ret.data;
        var allList = [];
        var alltr = 0;
        // console.log(list.length);
        if(list.length>0){
            for(var i=0;i<list.length;i++){//补全28条
                alltr += (list[i].length-0);
                if(list[i].length<28){
                    var temp = 28-list[i].length;
                    for(var j=0;j<temp;j++){
                        list[i].push({createTime:'0000-00-00 00:00:00'})
                    }
                }
            };

            /*每两条一页*/
            // console.log(list);
            var allnum = (list.length)/2;
            allnum = (allnum<1?1:allnum);
            var alltemp = 0;
            for(var a=1;a<=allnum;a++){
                // console.log(list.slice(alltemp,alltemp+2))
                var b = list.slice(alltemp,alltemp+2);
                allList.push({patientInfo:patientInfo,pageList:b,currentPage:a})
                alltemp += 2;
            };

            // 合并行
            allList.map(function (ele,i) {
                if(ele.pageList.length!=2){
                    var nulldaylist2 = [];
                    for(var n=0;n<28;n++){
                        nulldaylist2.push({createTime:'0000-00-00 00:00:00',daylist:[{createTime:'0000-00-00 00:00:00'}]});
                    }
                    ele.pageList.push(nulldaylist2);
                }

                for(var j=0;j<ele.pageList.length;j++){
                    var newList = [];
                    $.each(ele.pageList[j], function (j, e) {

                        for (var i = 0; i < newList.length; i++) {
                            if (newList[i].createTime.split(' ')[0] === e.createTime.split(' ')[0]&&e.createTime.split(' ')[0]!='0000-00-00') {
                                newList[i].daylist.push(e);
                                return;
                            }
                        }
                        newList.push({
                            createTime: e.createTime,
                            daylist: [e]
                        });
                    });
                    ele.pageList[j] = newList;
                    // console.log(newList);
                    // allList.page.push(newList);
                }

            });

        }else{
            var nulldaylist = [];
            for(var n=0;n<28;n++){
                nulldaylist.push({createTime:'0000-00-00 00:00:00',daylist:[{createTime:'0000-00-00 00:00:00'}]});
            }
            var nullarr = [
                nulldaylist,
                nulldaylist,
            ]
            allList.push({patientInfo:patientInfo,pageList:nullarr,currentPage:1,month:'0000-00'})
        }

        // console.log(allList);
        $('.yangxi-table').html(yangxiTemplate.template1(allList));
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
    }else{
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
function yangxiDate(flag) {
    var startTime = new Date(Date.parse( $('#yangxi-startDate').val()));
    var endTime = new Date(Date.parse($('#yangxi-endDate').val()));
    if(flag=='EX'){
        if(startTime>endTime){
            $('#yangxi-endDate').val('');
        }
    }else if(flag='AF'){
        if(startTime > endTime){
            $('#yangxi-startDate').val('');
            $('.yangxi-search').find('.tips').show();
        }else{
            $('.yangxi-search').find('.tips').hide();
        }
    }
}




