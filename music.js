
var $play=$(".play"),
    $back=$(".back"),
    $heart=$(".heart .fa"),
    $random=$(".random .fa"),
    $forward=$(".forward");

var music=new Audio(),
    lyricArr=[],
    musicIndex = 0,
    randomIndex=1;

window.onload=getMusic()     //页面刚开始就加载 
music.autoplay = true  //自动播放



$play.click(function(){     //点击播放按钮和暂停按钮之间的切换
    if(this.querySelector('.fa').classList.contains('fa-play')){
        music.play()
    }else{
        music.pause()
    }
    this.querySelector('.fa').classList.toggle('fa-play')
    this.querySelector('.fa').classList.toggle('fa-pause')
})

$random.click(function(){        //同理 循环播放和随机播放的切换 通过class来实现就行
    var randomList=["icon-shuffle","icon-single","icon-xunhuanbofang"];
        $random.removeClass(randomList[randomIndex-1]);
        $random.addClass(randomList[randomIndex]);
        if(randomIndex>2){
            randomIndex=1
            $random.addClass(randomList[0]); 
        }else if(randomIndex=2){
            music.loop=true;
            randomIndex++   
        };

})



$back.click(getMusic)   //点击后退  得到音乐
$forward.click(getMusic)  //点击前进  得到音乐



//获取歌曲的ajax
function getMusic(){     //通过json格式  获得端口的数据
    $.ajax({
        url:"https://jirenguapi.applinzi.com/fm/getSong.php?channel=public_fengge_xiaoqingxin",
        dataType:"json",
        type:"get",
        data:"",
        success:playMusic,    //获取成功后 播放音乐
        error:function(){
            alert("获取失败")
        }
    })
    $('.fa-play').removeClass('fa-play').addClass("fa-pause");  //播放音乐 去掉播放的状态 改为暂停状态
}



//播放歌曲产生的效果，作者，专辑名等等
function playMusic(data){
    var resource=data.song[0],
        img=resource.picture,
        sid = resource.sid,
        ssid = resource.ssid,
        title = resource.title,
        author = resource.artist,
        Sid=resource.sid;
        Ssid=resource.ssid;

    music.src=resource.url;
    $(".main").css({
        'background':'url('+img+')',
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-size': 'cover',
        "width":'100%'
    })
    $(".singer").text(author);
    $('.songName').text(title);
    getLyrics(Sid);
}


//获取歌词
function getLyrics(Sid,Ssid){
    $.ajax({
        url:"https://jirenguapi.applinzi.com/fm/getLyric.php",
        type:"get",
        data:{sid:Sid},
        dataType:"json",
        success:playLyrics,
        error:function(){
            $('.lyricsUl').html("<li>该歌曲没有歌词</li>")
        }
    })
}

//得到歌词并且按照歌词出现的时间，来排序，然后渲染歌词
function playLyrics(data){
    var lyc=data.lyric
    if(!!lyc){
        $('.lyricsUl').empty();
        var line=lyc.split("\n"),
            timeReg = /\[\d{2}:\d{2}.\d{2}\]/g,
            result=[];
        if(line!=""){
            for(var i=0;i<line.length;i++){
                var time=line[i].match(timeReg);//每组歌词匹配时间，得到时间数组，数组里都是时间
                if(!time)continue;
                var value=line[i].replace(timeReg,'') //用""代替了line[i]里面的时间
                for(var j=0;j<time.length;j++){
                    var t = time[j].slice(1, -1).split(':');
                    var timeArr=parseInt(t[0],10)*60+parseFloat(t[1]); //歌词的时间全部换算成秒
                    result.push([timeArr,value]);
                }
            }
        }


        result.sort(function(a,b){
            return a[0]-b[0]
        })
        console.log(result)
        lyricArr=result;
        renderLyric()
    }
}


function renderLyric(){
       var lycLi=''
       for(var i=0;i<lyricArr.length;i++){
           lycLi+="<li date-time='"+lyricArr[i][0]+"'>"+ lyricArr[i][1]+"</li>"
       }
       $('.lyricsUl').append(lycLi)
       setInterval(showLyric,1000)
}


//怎么展示歌词
function showLyric(){
    var lyricHeight=$(".lyricsUl li").eq(5).outerHeight()-7;
    for(var i=0;i<lyricArr.length;i++){
            var cur=music.currentTime;
            var curTime=$('.lyricsUl li').eq(i).attr("date-time"),
                nextTime=$('.lyricsUl li').eq(i+1).attr("date-time")
        if((cur>curTime)&&(cur<nextTime)){
            $('.lyricsUl li').removeClass("active");
            $(".lyricsUl li").eq(i).addClass("active");
            $('.lyricsUl').css('top', -lyricHeight*(i-4)); 
        }
    }
}



Number.prototype.formatTime=function(){
    // 计算
    var h=0,i=0,s=parseInt(this);
    if(s>60){
        i=parseInt(s/60);
        s=parseInt(s%60);
        if(i > 60) {
            h=parseInt(i/60);
            i = parseInt(i%60);
        }
    }
    // 补零
    var zero=function(v){
        return (v<10)?"0"+v:v;
    };
    return [zero(i),zero(s)].join(":");
};


//控制音乐播放进度条
music.shouldUpdate=true;
music.ontimeupdate=audioLen;
function audioLen(){
    var len=music.currentTime/music.duration*100,
        songLen=music.duration-music.currentTime
    console.log(songLen.formatTime())

    $("#progressBar").width(len+"%")
    $("#control").text(songLen.formatTime())
    if(music.currentTime==music.duration){
        getMusic()
    }

}


$("#bar").mousedown(function(event){
    var x=event.clientX,
        wid=$("#bar").width(),
        targetLen=$(this).offset().left;
    var percentage=(x-targetLen)/wid *100
     console.log(x)
     music.currentTime=music.duration*percentage/100
})


//控制footer里的function
$heart.click(function(){
    $(this).toggleClass("red");
})



//控制音量
$(".voice").mousedown(function(event){
    var volumeX=event.clientX,
        volumeWidth=$(".voice").width(),
        targetVolumeLen=$(this).offset().left;
    var percentage=(volumeX-targetVolumeLen)/volumeWidth *100
     music.volume=1*percentage/100;
     $(".volume").width(music.volume*100+"%")
})