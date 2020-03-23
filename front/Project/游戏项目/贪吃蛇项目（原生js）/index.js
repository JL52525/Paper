var sw = 20,
    sh = 20,
    tr = 30,
    td = 30;

    var snake = null,//蛇的实列
        food = null;//食物的实列

    //方块的构造函数
function Square (x,y,classname){
    this.x = x*sw;
    this.y = y*sh;
    this.class = classname;

    this.viewContent = document.createElement('div');//方块的对应DOM
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap');//方块的父级

}
//prototype 属性允许您向对象添加属性和方法
Square.prototype.create= function(){//创建方块,给方块添加属性，定义方块的位置
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw+'px';
    this.viewContent.style.height = sh+'px';
    this.viewContent.style.left = this.x+'px';
    this.viewContent.style.top = this.y+'px';

    this.parent.appendChild(this.viewContent);
};
Square.prototype.remove = function(){
    this.parent.removeChild(this.viewContent);
}

//蛇
function Snake(){
    this.head = null;//储存蛇头的信息
    this.tail = null;//储存蛇尾的信息
    this.pos = [];//存一下每个方块的位置

    this.directionNum = {//存储蛇走的走向，用一个对象来表示
        left:{
            x:-1,
            y:0,
            rotate:180 //蛇头根据方向进行旋转
        },
        right:{
            x:1,
            y:0,
            rotate:0
        },
        top:{
            x:0,
            y:-1,
            rotate:-90
        },
        bottom:{
            x:0,
            y:1,
            rotate:90
        }
    };
};

Snake.prototype.init = function(){
    //创建蛇头
    var snakeHead =new Square(10,5,'snakeHead');
    snakeHead.create();
    this.head = snakeHead;//存储蛇头信息
    this.pos.push([10,5]);//储存蛇头的位置

    //创建蛇身1
    var snakeBody1 = new Square(9,5,'snakeBody');
    snakeBody1.create();
    this.pos.push([9,5]);//储存蛇身1的位置

    //创建蛇身2
    var snakeBody2 = new Square(8,5,'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;//把蛇尾的信息存起来
    this.pos.push([8,5]);//储存蛇身2的位置

    //蛇身蛇头形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇添加一条属性，用来表示蛇的走向
    this.direction = this.directionNum.right;//默认让蛇往右走
    
};

//这个方法用来获取蛇头的下一个位置对应的元素，要根据元素做不同的事
Snake.prototype.getNextPos = function(){
    var nextPos = [//蛇头要走的下一个点的坐标
        this.head.x/sw+this.direction.x,
        this.head.y/sh+this.direction.y
    ]

    //下一个点是自己，撞到自己游戏结束
    var selfCollied = false;//默认状态下是否撞到自己
    this.pos.forEach(function(value){//value表示pos数组中的某一个值
        if(value[0] == nextPos[0] && value[1] == nextPos[1]){//取出数组中的两个数据分别比较，相等则撞到自己
            selfCollied = true;
        }
    });
    if(selfCollied){
        console.log("把自己撞死了！");
        this.startegies.die.call(this);
        return;
    }
    
    //下一个点是墙，游戏结束
    if(nextPos[0]<0 || nextPos[0]>tr-1 || nextPos[1]<0 || nextPos[1]>td-1 ){
        console.log("哎呀妈呀，撞墙了！");
        this.startegies.die.call(this);
        return;
    }


    //下一个点是食物，吃，变长
    if(food && food.pos[0] == nextPos[0] && food.pos[1]==nextPos[1]){
        //判断食物和蛇头下一个要走的点是否一样
        console.log("撞到食物了!");
        
        this.startegies.eat.call(this);
        return;
    }
    //下一个点啥也没有
    this.startegies.move.call(this);
    

};

//处理碰撞后需要做的事
Snake.prototype.startegies = {
    move:function(format){//这个参数用于决定要不要删除最后一个方块（蛇尾）
        //在旧蛇头的位置创建一个新的身体
        var newBody = new Square(this.head.x/sw,this.head.y/sh,"snakeBody");
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;
        
        this.head.remove();//把旧蛇头移除
        newBody.create();
        
        //创建一个新的蛇头
        var newHead = new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead');
        //更新链表关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform='rotate('+this.direction.rotate+'deg)';//将创建的新蛇头旋转
        //更新蛇身的每一个坐标
        //array.splice(index,howmany,item1,.....,itemX)
        //index:必须。规定从何处添加/删除元素。该参数是开始插入和（或）删除的数组元素的下标，必须是数字。
        //howmany:可选。规定应该删除多少元素。必须是数字，但可以是 "0"。如果未规定此参数，则删除从 index 开始到原数组结尾的所有元素。
        //item1,.....,itemX:可选。要添加到数组的新元素。
        this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y]);
        //更新链表关系
        newHead.next = newBody;
        newHead.last = null;
        this.head = newHead;//还要把this.head的信息更新一下
        newHead.create();
        
        if(!format){//如果foemat的值为false，表示需要删除（吃了之外的操作）
            this.tail.remove();
            this.tail = this.tail.last;
            
            this.pos.pop();
        }
    },
    eat:function(){
        this.startegies.move.call(this,true);
        createFood();
        game.score++;
    },
    die:function(){
        //console.log("die");
        game.over();
    }
};

snake = new Snake();


//创建一个食物
function createFood(){
    //食物小方块的随机坐标
    var x = null;
    var y = null;

    var include = true;//循环跳出的条件，true表示食物的坐标在蛇身上。false表示食物的坐标不在蛇身上（不循环）
    while(include){
        x = Math.floor(Math.random()*(tr-1));
        y = Math.floor(Math.random()*(td-1));
        
        snake.pos.forEach(function(value){

            if(x!= value[0] && y!=value[1]){
                //这个条件成立说明现在随机出来的坐标没有在蛇身上找到
                include = false;
            }
        });
    }
    //生成食物
    food = new Square(x,y,'food');
    food.pos = [x,y];//存储食物的坐标，跟蛇头要走的下一个点做对比
    var foodDom = document.querySelector('.food');
    if(foodDom){
        foodDom.style.left = x*sw+'px';
        foodDom.style.top = y*sh+'px';
    }else{
        food.create();
    }
};

//游戏逻辑
function Game(){
    this.timer = null;
    this.score = 0;//得分
}
Game.prototype.init = function(){
    snake.init();
    //snake.getNextPos();
    createFood();

    document.onkeydown = function(ev){
        if(ev.which == 37 && snake.direction!= snake.directionNum.right){//用户按下左键的时候蛇不能往右走
            snake.direction = snake.directionNum.left;
        }else if(ev.which == 38 && snake.direction!= snake.directionNum.bottom){
            snake.direction = snake.directionNum.top;
        }else if(ev.which == 39 && snake.direction!= snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }else if(ev.which == 40 && snake.direction!= snake.directionNum.top){
            snake.direction = snake.directionNum.bottom;
        }

    }
    this.start();
};
//游戏开始启动定时器，最开始按照规定方向前进
Game.prototype.start = function(){
    this.timer = setInterval(function(){
        snake.getNextPos();
    },150);
}
//清除定时器让游戏暂停
Game.prototype.pause = function(){
    clearInterval(this.timer);
}
//游戏结束后显示得分并刷新游戏
Game.prototype.over = function(){
    clearInterval(this.timer);
    alert("你的得分为:"+this.score);
    
    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();

    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}
//暂停游戏
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.stopBtn button')
snakeWrap.onclick = function(){
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
};
pauseBtn.onclick = function(){
    pauseBtn.parentNode.style.display = 'none';
    game.start();
}

//开始游戏
game = new Game;
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function(){
    startBtn.parentNode.style.display = 'none';
    game.init();
};