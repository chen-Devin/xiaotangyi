/**
 * Created by admin on 2017/7/12.
 */
/*全局时间戳配置*/
var config = {
        version: 1.0, //配置信息跟着版本迭代走，如测试则在其后用更后一位，如1.0.1
        min: '.min', //配置是否启用压缩版本，如不启用则为空，启用则为".min"
    }
    /*服务器地址*/
var pcurl = 'http://192.168.8.251/hospital-manage/'; //测试环境
//var pcurl = 'http://192.168.8.18:8081/hospital-manage/';//测试环境

// var pcurl = 'http://192.168.8.99:8080/hospital-manage/'; //后台联调地址

// var pcurl = 'http://192.168.8.18:8080/hospital-manage/'; //后台联调地址2 我的
// var pcurl = 'http://192.168.8.18:8081/hospital-manage/'; //后台联调地址2 我的 耀明。
// var pcurl = 'http://192.168.8.78:8080/hospital-manage/'; //后台联调地址2 谭哥测试地址。
// var pcurl = 'http://192.168.8.20:8080/hospital-manage/'; //后台联调地址2 谭哥测试地址。

// var pcurl = 'http://192.168.8.8:8081/hospital-manage/';//后台联调地址

/*路径问题*/
var linkUrl = '../../../';
// var linkUrl = '/hospital-manage/';

/*导航栏路径*/
// var navUrl = '/hospital-manage/';// 测试环境

// 本地环境-index
var navUrl = 'WEB-INF/page/';