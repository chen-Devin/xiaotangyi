/**
 * Created by admin on 2017/7/8.
 */

(function($) {

    function Page(container, fn, args, style) {
        //存参数
        var container = this.container = container || null;
        if (this.container.constructor != jQuery) {
            throw ('page插件第一个参数错误，请录入jQuery对象');
        }
        this.fn = fn || function() {};
        if (typeof(this.fn) != "function") {
            throw ('page插件第二个参数错误，请录入函数类型对象');
        }
        //存 args里的属性
        var args = this.args = $.extend({
            pageCount: 1, //总页码,默认10
            current: 1, //当前页码,默认1
            showPrev: true, //是否显示上一页按钮
            showNext: true, //是否显示下一页按钮
            showTurn: true, //是否显示跳转,默认显示
            showSumNum: true, //是否显示总页码
            showNear: 3, //显示当前页码前多少页和后多少页，默认2
            pageSwap: true, //是否同意调剂,默认是。调剂会最大数量显示页码。例如当前页码之前无页码可以显示。则会增加之后的页码。
            align: 'right' //对齐方式。默认右对齐.可选：left,right
        }, args || {});

        var width = this.width = parseInt(this.container.css('width')) || parseInt(this.container.parent().css('width'));
        var height = this.height = 20; //parseInt(this.obj.css('height'));

        var style = this.style = $.extend({
            "fontSize": 12, //字体大小
            "width": width, //页码盒子总宽度
            "height": height, //页码总高度，默认20px
            "pagesMargin": 2, //每个页码或按钮之间的间隔
            "paddL": 0, //左边留白
            "paddR": 0, //右边留白
            "borderColor": "#cecece", //边线颜色
            "currentColor": "#fff", //当前页码的字体颜色
            "disableColor": "#fff", //不可点击按钮的字体颜色
            "disableBackColor": "#1D9EEF", //不可点击按钮的背景色
            "prevNextWidth": 48, //上页下页的宽度
            "pagecountWidth": 48, //共计多少页的宽度
            "trunWidth": 110 //跳转模块宽度
        }, style || {});

        if (!style.pageWidth) style.pageWidth = (function() {
            var sumWidth = style.width - (style.prevNextWidth + 2 + style.pagesMargin) * (Number(args.showPrev) + Number(args.showNext)) - (style.pagecountWidth + style.pagesMargin) * Number(args.showSumNum) - (style.trunWidth + style.pagesMargin) * Number(args.showTurn);
            var sumLength = args.showNear * 2 + 5;
            return parseInt(sumWidth / sumLength) - style.pagesMargin;
        })(); //每个页码的宽度。默认按最大摆放量计算

        //设置容器样式
        this.container.css({ 'pading-left': style.paddL + 'px', 'pading-right': style.paddR + 'px', 'content': '', 'display': 'block', 'clear': 'both' });
        //建立自己的容器
        this.container.html('<div></div>');
        this.obj = this.container.children();
        this.obj.css({ 'content': '', 'display': 'block', 'clear': 'both', 'float': args.align });
        //初始化
        this.init();
    }

    Page.prototype.init = function() {
        this.fillHtml();
        this.bindEvent();
    }

    //填充DOM
    Page.prototype.fillHtml = function() {
        var args = this.args;
        var obj = this.obj;
        if (args.current > args.pageCount || args.current < 1) return;
        obj.empty();

        //上一页
        if (args.showPrev) {
            if (args.current > 1) {
                obj.append('<a href="javascript:;" class="homePage">首页</a>');
                obj.append('<a href="javascript:;" class="prevPage">上一页</a>');
            } else {
                obj.remove('.prevPage');
                obj.append('<span class="disabled">首页</span>');
                obj.append('<span class="disabled">上一页</span>');
            }
        }
        //中间页码
        if (args.current != 1) {
            obj.append('<a href="javascript:;" class="tcdNumber">' + 1 + '</a>');
        } else {
            obj.append('<span class="current">' + 1 + '</span>');
        }

        if (args.current > args.showNear + 2) {
            obj.append('<span class="hiding">...</span>');
        }

        var start = args.current > args.showNear + 2 ? args.current - args.showNear : 2,
            end = args.current + args.showNear >= args.pageCount ? args.pageCount - 1 : args.current + args.showNear;

        if (args.pageSwap) {
            var dstart = args.current - args.showNear - 2;
            var dend = args.pageCount - 1 - args.current - args.showNear;
            if (dstart < 1 && dend > 1) {
                end += Math.min(dend, Math.abs(dstart - 1));
            } else if (dstart > 1 && dend < 1) {
                start -= Math.min(dstart, Math.abs(dend - 1));
            }
        }

        for (; start <= end; start++) {
            if (start != args.current) {
                obj.append('<a href="javascript:;" class="tcdNumber">' + start + '</a>');
            } else {
                obj.append('<span class="current">' + start + '</span>');
            }
        }

        if (args.current + 1 + args.showNear < args.pageCount) {
            obj.append('<span class="hiding">...</span>');
        }

        if (args.current != args.pageCount && args.pageCount != 1) {
            obj.append('<a href="javascript:;" class="tcdNumber">' + args.pageCount + '</a>');
        } else if (args.current == args.pageCount && args.pageCount != 1) {
            obj.append('<span class="current">' + args.pageCount + '</span>');
        }
        //下一页
        if (args.showNext) {
            if (args.current == args.pageCount || args.pageCount == 1) {
                obj.remove('.nextPage');
                obj.append('<span class="disabled">下一页</span>');
                obj.append('<span class="disabled">末页</span>');
            } else {
                obj.append('<a href="javascript:;" class="nextPage">下一页</a>');
                obj.append('<a href="javascript:;" class="lastPage">末页</a>');
            }
        }

        if (args.showSumNum) {
            obj.append('<span class="pagecount">共' + args.pageCount + '页</span>');
        }
        //跳转页码
        if (args.showTurn) {
            obj.append('<span class="countYe">到第<input type="text" maxlength=' + args.pageCount.toString().length + '>页<a href="javascript:;" class="turndown">确定</a></span>');
        }
        this.setStyle();
        this.fn && this.fn(args.current);
        // console.log(this.fn)

    };
    //添加样式
    Page.prototype.setStyle = function() {
        var s = this.style;
        var marLR = s.pagesMargin;

        this.obj.children().css({ 'float': 'left', 'margin-left': marLR + 'px', 'text-align': 'center' });

        this.obj.find('a').css({ 'text-decoration': 'none', 'border': '1px solid ' + s.borderColor });

        this.obj.find('a.prevPage').css({ 'margin': '0 10px', 'padding': '0 10px', 'font-size': '14px', 'height': '30px', 'line-height': '30px', 'background': '#1d9eef', 'color': '#fff', 'border-radius': '4px', 'border': 'none', 'font-size': '14px' });
        this.obj.find('a.nextPage').css({ 'margin': '0 10px', 'padding': '0 10px', 'font-size': '14px', 'height': '30px', 'line-height': '30px', 'background': '#1d9eef', 'color': '#fff', 'border-radius': '4px', 'border': 'none', 'font-size': '14px' });

        this.obj.find('a.homePage').css({ 'margin': '0 10px', 'padding': '0 10px', 'font-size': '14px', 'height': '30px', 'line-height': '30px', 'background': '#1d9eef', 'color': '#fff', 'border-radius': '4px', 'border': 'none', 'font-size': '14px' });
        this.obj.find('a.lastPage').css({ 'margin': '0 10px', 'padding': '0 10px', 'font-size': '14px', 'height': '30px', 'line-height': '30px', 'background': '#1d9eef', 'color': '#fff', 'border-radius': '4px', 'border': 'none', 'font-size': '14px' });


        this.obj.find('a.turndown').css({ 'margin': '0 0 0 10px', 'padding': '0 10px', 'font-size': '14px', 'height': '30px', 'line-height': '30px', 'background': '#1d9eef', 'color': '#fff', 'border-radius': '4px', 'font-size': '14px', 'display': 'inline-block', 'border': 'none' });

        this.obj.find('span.current').css({ 'display': 'inline-block', 'height': '26px', 'min-width': '26px', 'width': 'auto', 'line-height': '26px', 'color': s.currentColor, 'vertical-align': 'middle', 'background': '#1986cd', 'border-radius': '4px' });

        this.obj.find('span.disabled').css({ 'margin': '0 10px', 'padding': '0 10px', 'display': 'inline-block', 'height': '30px', 'line-height': '26px', 'color': s.disableColor, 'background': s.disableBackColor, 'vertical-align': 'middle', 'font-size': '14px', 'border-radius': '4px' });

        this.obj.find('span.pagecount').css({ 'width': s.pagecountWidth + 'px', 'font-size': s.fontSize + 'px', 'color': '#999', 'height': s.height + 'px', 'line-height': s.height + 'px' });

        this.obj.find('span.countYe').css({ 'color': '#4C4C4C', 'font-size': '14px', 'width': '172px', 'display': 'inline-block', 'text-align': 'end' });

        this.obj.find('input').css({ 'outline': 'none', 'border': '1px solid #ddd', 'height': '30px', 'line-height': '30px', 'width': '50px', 'margin': '0 5px', 'text-align': 'center', 'padding': '0 5px', 'border-radius': '4px' });


        this.obj.find('.tcdNumber').css({ 'min-width': '26px', 'width': 'auto', 'padding': '0 5px', 'height': '26px', 'line-height': '26px', 'border-radius': '4px', 'box-sizing': 'border-box', 'margin': '0 5px', 'color': '#333' });
        this.obj.find('.hiding').css({ 'width': '25px', 'height': s.height + 'px' });


    };


    //绑定事件
    Page.prototype.bindEvent = function() {
        var obj = this.obj;
        var _this = this;

        obj.off("click");
        obj.on("click", "a.tcdNumber", function() {
            _this.args.current = parseInt($(this).text());
            _this.fillHtml();
        });
        //首页
        obj.on('click', 'a.homePage', function() {
            _this.args.current = 1;
            _this.fillHtml();
        });
        //末页
        obj.on('click', 'a.lastPage', function() {
                _this.args.current = _this.args.pageCount;
                _this.fillHtml();
            })
            //上一页
        obj.on("click", "a.prevPage", function() {
            _this.args.current = parseInt(obj.children("span.current").text()) - 1;
            _this.fillHtml();
        });
        //下一页
        obj.on("click", "a.nextPage", function() {
            _this.args.current = parseInt(obj.children("span.current").text()) + 1;
            _this.fillHtml();
        });
        //跳转
        obj.on("click", "a.turndown", function() {
            var page = _this.args.current = Number(obj.children("span.countYe").children('input').val());
            if (page > _this.args.pageCount) {
                alert("页码输入有误，请重新输入！");
                return;
            }
            _this.fillHtml();
        });
        $(document).keydown(function(e) {
            var theEvent = e || window.event;
            var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
            if (code == 13) {
                if (isSureCode.addSubmit == false && isSureCode.warnSubmit == false && isSureCode.updatePwdSubmit == false) {
                    $('a.turndown').click();
                }
            }
        })
    }

    //绑定成jQuery插件
    $.fn.createPage = function(fn, args, style) {
        var _this = this;
        new Page(_this, fn, args, style);
        return this;
    }
})(jQuery);