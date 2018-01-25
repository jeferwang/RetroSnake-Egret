import Shape = egret.Shape;
import Sprite = egret.Sprite;

class Main extends egret.DisplayObjectContainer {
    gameArea: Sprite;
    snakePoint: Array<any> = [0, 0];  //贪吃蛇头坐标
    snakeObj: Array<any> = []; //贪吃蛇点集
    snakeSize: number = 20; //贪吃蛇宽度
    snakeDirection: number = 1;//+1右 -1左 +2下 -2上
    hitPoint: Array<Array<number>>;//碰撞点，记录俩就行，食物方块的左上和右下

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            // egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            // egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })


    }

    private async runGame() {
        // 加载资源
        await this.loadResource()
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
        // 第一步，创建黑色背景
        let bg_black = new Shape()
        bg_black.graphics.beginFill(0x000000)
        bg_black.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight)
        bg_black.graphics.endFill()
        this.stage.addChild(bg_black)
        // 第二步，可以创建一个固定大小的方框作为游戏区域
        let gameArea = new Sprite();
        gameArea.graphics.lineStyle(5, 0xffffff)
        gameArea.graphics.beginFill(0x000000)
        gameArea.graphics.drawRect(0, 0, 400, 800)
        gameArea.graphics.endFill()
        gameArea.x = (this.stage.stageWidth - gameArea.width) / 2
        gameArea.y = (this.stage.stageHeight - gameArea.height) / 2
        this.gameArea = gameArea;
        this.stage.addChild(this.gameArea)
        // 第三步，手指滑动事件
        bg_black.touchEnabled = true;
        bg_black.addEventListener(egret.TouchEvent.TOUCH_BEGIN, bgOnTouch, this)
        bg_black.addEventListener(egret.TouchEvent.TOUCH_END, bgOffTouch, this)
        let offsetX: number;
        let offsetY: number;


        // 第四步，画蛇
        this.createSnake()

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
                    console.log('右');
                    newDirection = 1
                } else {
                    // 向左滑动
                    console.log('左');
                    newDirection = -1
                }
            } else {
                // 纵向滑动
                if (resY > 0) {
                    // 向下滑动
                    console.log('下');
                    newDirection = 2
                } else {
                    // 向上滑动
                    console.log('上');

                    newDirection = -2
                }
            }
            if (Math.abs(this.snakeDirection) == Math.abs(newDirection)) {
                console.log('不允许更改');
            } else {
                this.snakeDirection = newDirection;
                console.log('更改方向');
            }
        }

    }

    private createSnake() {
        let that = this;

        function draw(point: Array<number>): void {
            let rect = new Shape();
            rect.graphics.beginFill(0xffffff)
            rect.graphics.drawRect(0, 0, 18, 18)
            rect.graphics.endFill()
            rect.x = point[0]
            rect.y = point[1]
            that.gameArea.addChild(rect);
            that.snakeObj.unshift(rect)
        }

        let next = that.snakePoint
        draw(that.snakePoint)
        let itv = setInterval(() => {
            if (that.snakeDirection == 1) {
                // 向右
                next[0] += 20
            } else if (that.snakeDirection == -1) {
                // 向左
                next[0] -= 20
            } else if (that.snakeDirection == 2) {
                // 向下
                next[1] += 20
            } else if (that.snakeDirection == -2) {
                // 向上
                next[1] -= 20
            }
            if (next[0] < 0 || next[0] >= 400 || next[1] < 0 || next[1] >= 800) {
                clearInterval(itv);
                return;
            }
            draw(next)
            that.gameArea.removeChild(that.snakeObj.pop())
        }, 100)
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