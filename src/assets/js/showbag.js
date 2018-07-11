/*秀包活动*/

var showbag = {};
var $things = $('.things');
var thingsWidth = 0;
var thingsHeight = 0;
var drawing = document.getElementById('drawing');
var $choose = $('.choose');
var chooseHeight;
var chooseListScroll;
var $result = $('.result');
var $welcome = $('.welcome');
var $percent = $('.percent');
var $take = $('.choose-take');
var inTaking = false;
var rem = 100;
var ratio = window.devicePixelRatio ? window.devicePixelRatio : 1;
var cdnUrl = $('input[name="requestUrl"]').val();
var imgUrl = '../static/img/activity_showbag_h5_';/*跨域，相对路径*/

/*预加载图片分组*/
var imgList = {0:[
    'bag_a.png',
    'bag_b.png',
    'bag_c.png',
    'bag_d.png',
    'bag_e.png',
    'bag_f.png',
    'bag_f.png',
    'bag_g.png',
    'bag_h.png',
    'bag_i.png'
    ],
    1:[
    'must_a.png',
    'must_c.png',
    'must_d.png',
    'must_e.png',
    'must_f.png',
    'must_g.png',
    'must_h.png',
    'must_i.png',
    'must_j.png',
    'must_k.png',
    'must_l.png',
    'must_m.png',
    ],
    2:[
    'girl_a.png',
    'girl_b.png',
    'girl_c.png',
    'girl_d.png',
    'girl_e.png',
    'girl_f.png',
    ],
    3:[
    'food_a.png',
    'food_b.png',
    'food_c.png',
    'food_d.png',
    'food_e.png',
    ],
    4:[
    'spoof_a.png',
    'spoof_b.png',
    'spoof_c.png',
    'spoof_d.png',
    'spoof_e.png',
    'spoof_f.png',
    'spoof_g.png',
    'spoof_h.png',
    'spoof_i.png',
    'spoof_j.png',
    'spoof_k.png',
    'spoof_l.png',
    'spoof_m.png'
]};
/*预加载图片分组 end*/

$(function(){
    document.addEventListener('touchmove', function(event) {
        event.preventDefault();/*禁止页面拖动*/
    }, {passive: false});
    showbag.loadImage(imgList[0], 0);/*加载图片*/
});

$(window).resize(function(){
    showbag.drawing();/*画布大小调整*/
});

/*预先加载第一分组图片*/
showbag.loadImage = function(imgListItem, imgIndex){
    if(!imgListItem.length) return;
    var img = new Image();
    imgIndex = imgIndex ? imgIndex : 0;
    img.src = imgUrl + imgListItem[imgIndex];
    var percent = parseInt(imgIndex/imgListItem.length *100);
    img.onload = function(){
        imgIndex ++;
        if(imgIndex < imgListItem.length){
            $percent.html(percent+'%');
            showbag.loadImage(imgListItem, imgIndex);
        }else{
            $percent.html('100%');
            imgListItem.length = 0;
            setTimeout(function(){
                $percent.remove();
                $welcome.find('.btn').addClass('btn-in');
            },400);
            showbag.init();
        }
    }
    img.onerror = function(e){
        console.log(imgUrl + imgListItem[imgIndex] + ' 图片丢失或路径错误');
        $percent.remove();
        $welcome.find('.btn').addClass('btn-in');
        showbag.init();        
    }
};

/*按用户点击分组预先加载图片*/
showbag.loadImageOther = function(imgListItem,imgIndex){
    if(!imgListItem.length) return;
    var img = new Image();
    imgIndex = imgIndex ? imgIndex : 0;
    img.src = imgUrl + imgListItem[imgIndex];
    img.onload = function(){
        imgIndex ++;
        if(imgIndex < imgListItem.length){
            showbag.loadImageOther(imgListItem, imgIndex);          
        }else{
            imgListItem.length = 0;
        }
    }
};

/*初始化*/
showbag.init = function(){

    $choose.removeClass('hide');
    $things.parent().removeClass('hide');
    showbag.drawing();/*画布初始化*/
    
    /*关闭欢迎页*/
    $welcome.on('click','.btn a',function(){
        $welcome.addClass('welcome-out');
        setTimeout(function(){            
            $welcome.remove();            
        },500);
        
        /*生成当前地址二维码*/
        showbag.onloadJS(cdnUrl+'/js/qrcode.min.js', function(){
            var showbagQrcode = new QRCode('linkQrcode',{
                text: window.location.href,
                width: 400,
                height: 400,
                correctLevel: QRCode.CorrectLevel.L
            });
        });

        /*物品列表滚动条初始化*/
        showbag.onloadJS(cdnUrl+'/js/iscroll.min.js', function(){
            chooseListScroll = new IScroll('#chooseListScroll', {
                tap: true
            });
        });
    });
    
    rem = showbag.rem();
    /*添加物品*/
    $choose.on('tap','.goods',function(e){
        chooseHeight = $choose.height();
        var timeStamp = parseInt(e.timeStamp),
            klassRadio = '';
            width = $(this).attr('data-width'),
            height = $(this).attr('data-height'),
            thingImg = $(this).attr('data-img'),
            thingWidth = width * rem,
            thingHeight = height * rem,
            thingLeft = (thingsWidth - thingWidth)/2,
            thingTop = (thingsHeight - thingHeight - chooseHeight)/2;
        if($(this).hasClass('goods-radio')){/*单选物品*/
            klassRadio = 'thing-radio';
            $('.'+klassRadio).remove();
        }
        $things.append('<div class="thing '+klassRadio+'" id="thing-'+timeStamp+'" style="width:'+thingWidth+'px;height:'+thingHeight+'px;left:'+thingLeft+'px;top:'+thingTop+'px;"><img src="'+imgUrl+thingImg+'"><div class="del"></div><div class="big"></div></div>');            
        showbag.touchScale('#thing-'+timeStamp);
    }).on('click','.choose-toggle',function(){
        $choose.toggleClass('choose-down');
        setTimeout(function(){
            chooseListScroll.refresh();/*等待展开->物品列表滚动重置*/
        },310);
    }).on('click','.choose-cate li',function(){
        var index = $(this).index();
        showbag.loadImageOther(imgList[index]);
        $(this).addClass('current').siblings('li').removeClass('current');
        $choose.removeClass('choose-down');
        $choose.find('.choose-list ul').eq(index).removeClass('hide').siblings('ul').addClass('hide');
        chooseListScroll.scrollTo(0,0);/*物品列表滚动至顶部*/
        setTimeout(function(){
            chooseListScroll.refresh();/*等待展开->物品列表滚动重置*/
        },310);
    });
    /*移除、放大物品*/
    $things.on('click','.del',function(){
        $(this).parents('.thing').remove();
    }).on('touchstart',function(e){
        if(e.target==this){
            $('.thing',$(this)).removeClass('thing-touch');
        }
        $('.thing',$(this)).on('touchstart',function(e){
            e.stopPropagation();
        });
    }).on('click', '.big', function(){
        showbag.clickScale($(this), 1.1);
    });
    
    /*阻止微信点击图片预览-解决Android下base64太长无法识别问题*/
    $result.on('click','.image',function(event){
        event.preventDefault();
    });
};

/*画布初始化*/
showbag.drawing = function(){
    if(!$things.length) return;
    thingsWidth = $things.width();
    thingsHeight = $things.height();
    rem = showbag.rem();
    if(!$(drawing).length) return;
    drawing.width = showbag.take.ratio(thingsWidth);
    drawing.height = showbag.take.ratio(thingsHeight);
};

/*拍照*/
showbag.take = function(){
    if(inTaking || !$(drawing).length) return;
    inTaking = true;
    showbag.waiting('图片生成中');
    $take.addClass('choose-taking');
    var ctx = drawing.getContext('2d');
    var thingsWidthRatio = showbag.take.ratio(thingsWidth);
    var thingsHeightRatio = showbag.take.ratio(thingsHeight);
    var remRatio = showbag.take.ratio(rem);
    var textLeft = .5*remRatio;
    var thingLen = $('.thing',$things).length;
    /*1.画底色 start*/
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, thingsWidthRatio, thingsHeightRatio);
    /*1.画底色 end*/
    /*2.画背景 start*/
    var bg = new Image();
    bg.src = imgUrl + 'bg.jpg';
    bg.onload = function(){
        ctx.drawImage(bg, 0, (thingsHeightRatio - (thingsWidthRatio*2.2))/2, thingsWidthRatio, thingsWidthRatio*2.2);/*2.2为背景高宽比*/
        thingContentDraw();/*画物品*/
    }
    /*2.画背景 end*/

    var countDraw = 0;/*计数*/
    
    var thingContentDraw = function(){
         if($('.thing',$things).length){
             /*3.画多个物品 start*/             
             thingImageDraw($('.thing',$things).eq(countDraw));             
             /*3.画多个物品 end*/
         }else{
             thingFooterDraw();/*画底部*/
         }
    };

    var thingImageDraw = function(obj){
        var img = new Image(), width = showbag.take.pixel($(obj).css('width')), height = showbag.take.pixel($(obj).css('height')), left = showbag.take.pixel($(obj).css('left')), top = showbag.take.pixel($(obj).css('top'));
        img.crossOrigin = 'Anonymous';
        img.onload = function(){
            ctx.drawImage(img, left, top, width, height);
            if(countDraw >= thingLen - 1){/*当画完最后一个物品*/
                thingFooterDraw();/*画底部*/
            }else{
                countDraw ++;
                thingImageDraw($('.thing',$things).eq(countDraw));
            }
        };
        img.onerror = function(){
            thingFooterDraw();/*画底部*/
        };
        img.src = $(obj).find('img').attr('src');        
    };    

    var thingFooterDraw = function(){
        var slogan = showbag.createSlogan();
        /*4.画底部底色 start*/
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, thingsHeightRatio-(2.2*remRatio), thingsWidthRatio, 2.2*remRatio);
        /*4.画底部底色 end*/
        /*5.画底部文案 start*/
        ctx.textBaseline='middle';
        ctx.fillStyle = '#333';
        ctx.font = 'bold '+(.24*remRatio)+'px Microsoft YaHei';
        ctx.fillText('#今天翻我的包#', textLeft, thingsHeightRatio - 1.54*remRatio);
        ctx.fillStyle = '#444';
        ctx.font = .23*remRatio+'px Microsoft YaHei';
        ctx.fillText(slogan, textLeft, thingsHeightRatio - 1.1*remRatio);
        ctx.fillStyle = '#aaa';
        ctx.font = .21*remRatio+'px Microsoft YaHei';
        ctx.fillText('扫码翻出你的包', textLeft, thingsHeightRatio - .6*remRatio);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#bcbcbc';
        ctx.moveTo(textLeft, thingsHeightRatio - (1.1 + .2)*remRatio);
        ctx.lineTo(textLeft+(.23*slogan.length*remRatio), thingsHeightRatio - (1.1 + .2)*remRatio);/*每个字23，共11个字*/
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#bcbcbc';
        ctx.moveTo(textLeft, thingsHeightRatio - (1.1 - .2)*remRatio);
        ctx.lineTo(textLeft+(.23*slogan.length*remRatio), thingsHeightRatio - (1.1 - .2)*remRatio);/*每个字23，共11个字*/
        ctx.stroke();
        /*5.画底部文案 end*/
        /*6.画底部二维码 start*/
        var qrcode = new Image();
        qrcode.src = $('#linkQrcode img').attr('src');
        if(qrcode.complete){
            thingQrcodeDraw(qrcode);
            return
        }
        qrcode.onload = function(){
            thingQrcodeDraw(qrcode);
        };
        /*6.画底部二维码 end*/
    };
    
    var thingQrcodeDraw = function(qrcode){
        ctx.drawImage(qrcode,thingsWidthRatio - 1.7*remRatio,thingsHeightRatio - 1.7*remRatio, 1.26*remRatio,1.26*remRatio);
        /*6.当画完底部二维码，生成图片 start*/
        var image = drawing.toDataURL('image/png');/*浏览器出于安全性考虑，本地会报错*/
        $result.removeClass('hide').find('.image').attr('src',image);
        inTaking = false;
        $take.removeClass('choose-taking');
        showbag.waiting.remove();
        /*6.当画完底部二维码，生成图片 end*/

    };

};

/*拍照-返回修改*/
showbag.take.back = function(){
    $result.addClass('hide');
};

/*获取相应像素密度的值，解决canvas存在模糊问题*/
showbag.take.ratio = function(val){
    return val * ratio;
};

/*获取像素值*/
showbag.take.pixel = function(str){
    return showbag.take.ratio(str.substr(0,str.length-2));
};

/*获取页面rem*/
showbag.rem = function(){
    var boundWidth = document.documentElement.getBoundingClientRect().width;
    var rem = boundWidth/6.4>100?100:(boundWidth/6.4<50?50:boundWidth/6.4);    
    return rem;
};

/*显示当前拖动*/
showbag.touch = function(obj){
    $(obj).addClass('thing-touch').siblings('.thing').removeClass('thing-touch');
};

/*单指拖动图片，双指缩放图片*/
showbag.touchScale = function(thing) {
    var startX, startY, startY, endX, endY, scale, x1, x2, y1, y2, imgLeft, imgTop, imgWidth, imgHeight,
        one = false, /*区分屏幕上现在是一根手指还是两根手指，因为在滑动的时候两根手指先离开一根会触发一根手指移动图片位置这个方法*/
        $touch = $(thing),
        originalWidth = $touch.width(),
        originalHeight = $touch.height(),
        baseScale = parseFloat(originalWidth/originalHeight);
    showbag.touch(thing);/*thing-touch自动回到当前*/
    function siteData(name) {
        imgLeft = parseInt(name.css('left'));
        imgTop = parseInt(name.css('top'));
    }
    $(thing).on('touchstart touchmove touchend', function(event){
        var $self = $(this),
            touch1 = event.targetTouches[0],  /* 第一根手指touch事件*/
            touch2 = event.targetTouches[1],  /* 第二根手指touch事件*/
            fingers = event.touches.length;   /* 屏幕上手指数量*/
        /*手指放到屏幕上的时候，还没有进行其他操作*/
        if (event.type == 'touchstart') {
            originalWidth = $touch.width();
            originalHeight = $touch.height();
            baseScale = parseFloat(originalWidth/originalHeight);
            if (fingers == 2) {
                /* 缩放图片的时候X,Y坐标起始值*/
                startX = Math.abs(touch1.pageX - touch2.pageX);
                startY = Math.abs(touch1.pageY - touch2.pageY);
                one = false;
            }
            else if (fingers == 1) {
                x1 = touch1.pageX;
                y1 = touch1.pageY;
                one = true;
            }
            siteData($self);
            showbag.touch($self);
        }
        /*手指在屏幕上滑动*/
        else if (event.type == 'touchmove') {
            if (fingers == 2) {
                /* 缩放图片的时候X,Y坐标滑动变化值*/
                endX = Math.abs(touch1.pageX - touch2.pageX) - startX;
                endY = Math.abs(touch1.pageY - touch2.pageY) - startY;
                scale = Math.abs(endX) > Math.abs(endY) ? endX : endY;
                $self.css({
                    'width' : originalWidth + scale,
                    'height' : (originalWidth + scale)/baseScale,
                    'left' : imgLeft - scale/2,
                    'top' : imgTop - (scale/2/baseScale)
                });
                
            }else if (fingers == 1) {
                x2 = touch1.pageX;
                y2 = touch1.pageY;
                if (one) {
                    $self.css({
                        'left' : imgLeft + (x2 - x1),
                        'top' : imgTop + (y2 - y1)
                    });
                }
            }
        }
        /*手指移开屏幕*/
        else if (event.type == 'touchend') {
            /* 手指移开后保存图片的宽*/
            originalWidth = $touch.width(),
            originalHeight = $touch.width(),
            siteData($self);
            showbag.touchSort($self);/*拖动完成后排序*/
        }
    });
};

/*点击放大*/
showbag.clickScale = function(thing,multiple){
    var $thing = $(thing).parent('.thing');
    if($thing.hasClass('transition')) return;
    $thing.css({
        'width' : $thing.width()*multiple,
        'height' : $thing.height()*multiple,
        'left' : $thing.position().left - ($thing.width()*multiple -$thing.width())/2,
        'top' : $thing.position().top - ($thing.height()*multiple -$thing.height())/2
    }).addClass('transition');
    setTimeout(function(){
        $thing.removeClass('transition');
    },300);
};

/*拖动完成后排序*/
showbag.touchSort = function(obj){
    var thing = $(obj).attr('id');
    /*调整到最后面*/
    if($(obj).next().length){
        $things.append($(obj).clone());
        $(obj).remove();
        showbag.touchScale($('#'+thing));
    }
    /*调整到最后面 end*/
};

/*添加js文件*/
showbag.onloadJS =  function(url, callback) {
  var script = document.createElement('script')
  script.src = url
  document.getElementsByTagName('body')[0].appendChild(script)
  script.onload = callback
};

/*随机文案*/
var sloganIndex = 0;
var slogans = [
    {title:'你包里有药，我包里有刀'},
    {title:'壕包里的一万种可能'},
    {title:'那些年的旧物与新欢'},
    {title:'装满自己给的安全感'},
    {title:'把全世界装好带走，唯独带不走你'},
    {title:'大包套小包 小包套What？'},
    {title:'社会我佩奇，我妈都觉得时髦'},
    {title:'论一只好脾气包包的自我修养'},
    {title:'朋克养生佛系青年，跟爷走起'},
    {title:'哆啦A梦口袋的前世今生'}
];

showbag.indexSlogan = function(){
    var arr = [];
    for (var i = 0; i <slogans.length; i++) {
        arr.push(i);
    }
    arr.sort(
        function () {
            return 0.5 - Math.random();
        }
    );
    return arr;
};
var sloganIndexArray = showbag.indexSlogan();/*生成随机序号，前11道题不重复*/

showbag.createSlogan = function(){
    if(sloganIndex >= sloganIndexArray.length){
        sloganIndexArray = showbag.indexSlogan();/*重新生成序号*/
        sloganIndex = 0;
    }
    var slogan = slogans[sloganIndexArray[sloganIndex]];
    sloganIndex ++;
    return slogan.title;
};

/*生成中提示*/
showbag.waiting = function(txt){
    var txt = txt ? txt : '';
    if($('.loading-wait').length){
        $('.loading-wait').attr('data-txt',txt);
    }else{
        $('body').append('<div class="loading-wait" data-txt="'+txt+'"></div>');
    }
};

showbag.waiting.remove = function(){
    $('.loading-wait').remove();
};