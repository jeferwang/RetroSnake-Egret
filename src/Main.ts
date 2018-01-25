import Shape = egret.Shape;

class Main extends egret.DisplayObjectContainer {

    snakePoint: Array<any> = [0, 0];  //贪吃蛇头坐标
    snakeObj: Array<any> = []; //贪吃蛇点集
    snakeSize: number = 20; //贪吃蛇宽度
    snakeDirection: number = 1;//+1上 -1下 +2左 -2右

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
        // 第二部分，画蛇
        this.createSnake()
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
            that.stage.addChild(rect);
            that.snakeObj.unshift(rect)
        }

        let next = that.snakePoint
        draw(that.snakePoint)
        setInterval(() => {
            next[0] += 20
            draw(next)
            that.stage.removeChild(that.snakeObj.pop())
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