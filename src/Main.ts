import Shape = egret.Shape;
import Sprite = egret.Sprite;
import Tween = egret.Tween;

class Main extends egret.DisplayObjectContainer {
    gameArea: Sprite;
    snakePoint: Array<Array<number>> = [];  //贪吃蛇头坐标
    snakeObj: Array<any> = []; //贪吃蛇点集
    snakeDirection: number = 1;//+1右 -1左 +2下 -2上
    foodPoint: Array<number>;
    foodObj: egret.Shape;
    next: Array<number>;
    snakeInterval: number;
    gameOver: boolean;

    //碰撞点，记录俩就行，食物方块的左上和右下

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            };
        });

        egret.lifecycle.onPause = () => {
            // egret.ticker.pause();
        };

        egret.lifecycle.onResume = () => {
            // egret.ticker.resume();
        };

        this.runGame().catch(e => {
            console.log(e);
        });


    }

    private async runGame() {
        // 加载资源
        await this.loadResource();
        // 创建游戏场景
        this.createGameScene();
    }

    /**
     * 加载资源
     * @returns {Promise<void>}
     */
    private async loadResource() {
        try {
            // 加载中
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            // 开始加载资源
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            // 取消加载中
            this.stage.removeChild(loadingView);
        } catch (e) {
            console.error(e);
        }
    }


    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        // 创建黑色背景，创建控制按钮
        let bg_black = new Shape();
        bg_black.graphics.beginFill(0x000000);
        bg_black.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        bg_black.graphics.endFill();
        this.stage.addChild(bg_black);
        // 添加标题
        let parser = new egret.HtmlTextParser();
        let gameTitle = new egret.TextField();
        gameTitle.textFlow = parser.parse('<font color=0xff00ff>RetroSnake</font>');
        gameTitle.width = 400;
        gameTitle.height = 400;
        gameTitle.textAlign = egret.HorizontalAlign.CENTER;
        gameTitle.x = (this.stage.stageWidth - gameTitle.width) / 2;
        gameTitle.y = 10;
        gameTitle.fontFamily='Source Code Pro'
        this.stage.addChild(gameTitle);
        let change = () => {
            let tw = egret.Tween.get(gameTitle);
            tw.to({"alpha": 0}, 1000);
            tw.to({"alpha": 1}, 1000);
            tw.call(change, this);
        };
        change();

        // 可以创建一个固定大小的方框作为游戏区域
        let gameArea = new Sprite();
        gameArea.graphics.lineStyle(5, 0xffffff);
        gameArea.graphics.beginFill(0x000000);
        gameArea.graphics.drawRect(0, 0, 400, 800);
        gameArea.graphics.endFill();
        gameArea.x = (this.stage.stageWidth - gameArea.width) / 2;
        gameArea.y = (this.stage.stageHeight - gameArea.height) / 2;
        this.gameArea = gameArea;
        this.stage.addChild(this.gameArea);
        // 手指滑动事件
        gameArea.touchEnabled = true;
        gameArea.addEventListener(egret.TouchEvent.TOUCH_BEGIN, bgOnTouch, this);
        gameArea.addEventListener(egret.TouchEvent.TOUCH_END, bgOffTouch, this);
        let offsetX: number;
        let offsetY: number;

        function bgOnTouch(e: egret.TouchEvent): void {
            offsetX = e.stageX;
            offsetY = e.stageY;
        }

        function bgOffTouch(e: egret.TouchEvent): void {
            let resX: number = e.stageX - offsetX;
            let resY: number = e.stageY - offsetY;
            let newDirection: number;
            if (Math.abs(resX) >= Math.abs(resY)) {
                // 横向滑动
                if (resX > 0) {
                    // 向右滑动
                    // console.log('右');
                    newDirection = 1;
                } else if (resX < 0) {
                    // 向左滑动
                    // console.log('左');
                    newDirection = -1;
                } else {
                    // console.log('未改变');
                    newDirection = this.snakeDirection;
                }
            } else {
                // 纵向滑动
                if (resY > 0) {
                    // 向下滑动
                    // console.log('下');
                    newDirection = 2;
                } else {
                    // 向上滑动
                    // console.log('上');
                    newDirection = -2;
                }
            }
            if (Math.abs(this.snakeDirection) == Math.abs(newDirection)) {
                // console.log('不允许更改');
            } else {
                this.snakeDirection = newDirection;
                // console.log('更改方向');
            }
        }


        // 画蛇
        this.createSnake();


        // 生成食物方块
        this.createFood();
    }

    private createFood() {
        let that = this;

        function draw(point: Array<number>): void {
            let rect = new Shape();
            rect.graphics.beginFill(0x0000ff);
            rect.graphics.drawRect(0, 0, 18, 18);
            rect.graphics.endFill();
            rect.x = point[0] + 1;
            rect.y = point[1] + 1;
            that.gameArea.addChild(rect);
            // 记录碰撞点，食物的左上和右下
            that.foodPoint = point;
            that.foodObj = rect;
        }

        // 生成食物的坐标点
        let foodX = ~~(Math.random() * 20);
        let foodY = ~~(Math.random() * 40);
        while (this.snakePoint.indexOf([foodX * 20, foodY * 20]) >= 0) {
            foodX = ~~(Math.random() * 20);
            foodY = ~~(Math.random() * 40);
        }

        draw([foodX * 20, foodY * 20]);

    }

    private createSnake() {
        this.next = [0, 0];
        this.drawSnake(this.next);
        this.startSnake();
    }

    private drawSnake(point: Array<number>) {
        let rect = new Shape();
        rect.graphics.beginFill(0xffffff);
        rect.graphics.drawRect(0, 0, 18, 18);
        rect.graphics.endFill();
        rect.x = point[0] + 1;
        rect.y = point[1] + 1;
        this.gameArea.addChild(rect);
        // 头部加一节
        this.snakeObj.unshift(rect);
        this.snakePoint.unshift([point[0], point[1]]);
    }

    private startSnake() {
        let that = this;
        this.snakeInterval = setInterval(() => {
            if (this.snakeDirection == 1) {
                // 向右
                this.next[0] += 20;
            } else if (this.snakeDirection == -1) {
                // 向左
                this.next[0] -= 20;
            } else if (this.snakeDirection == 2) {
                // 向下
                this.next[1] += 20;
            } else if (this.snakeDirection == -2) {
                // 向上
                this.next[1] -= 20;
            }
            // 撞墙了或者撞到自己就挂了
            if (this.next[0] < 0 || this.next[0] >= 400 || this.next[1] < 0 || this.next[1] >= 800 || this.snakePoint.slice(4).some((p) => p[0] == this.next[0] && p[1] == this.next[1])) {
                clearInterval(this.snakeInterval);
                return;
            }
            this.drawSnake(this.next);
            if (this.foodPoint[0] == this.next[0] && this.foodPoint[1] == this.next[1]) {
                // 生成新的食物
                this.gameArea.removeChild(this.foodObj);
                this.createFood();
            } else {
                // 尾部减一节
                this.gameArea.removeChild(this.snakeObj.pop());
                this.snakePoint.pop();
            }
        }, 200);
    }


    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

}