import { Util } from "../common/util";

/** stepper 接口约束 */
export interface IStepper {
  /** tick开始 */
  tickStart: () => void;
  /** tick结束 */
  tickEnd: () => void;
  /** update之前 */
  beforeUpdate: () => void;
  /** update结束 */
  afterUpdate: () => void;
  /** 渲染之前 */
  beforeRender: () => void;
  /** 渲染结束 */
  afterRender: () => void;
  /** 开始 */
  start: () => void;
  /** 暂停 */
  pause: () => void;
  /** update 迭代 */
  update: (dt: number, timeStamp: number) => void;
  /** 渲染接口 */
  render: (dt: number) => void;
}

export interface IOpt {
  /**帧率 */
  fps: number;
  /**  是否固定步长 */
  deltaFixed: boolean;

  /** 是否开启碰撞检测 */
  enableCollisionDetection: boolean;
  /** 约束求解迭代次数 */
  iteration: number;
  /** 是否开启休眠 */
  enableSleeping: boolean;
  /** 是否开启缓存 */
  enableCache: boolean;

  /** 重力 */
  gravity: any;

  /** 方法 */
  methods: {
    tickStart: () => void;
    tickEnd: () => void;
    beforeUpdate: () => void;
    afterUpdate: () => void;
    beforeRender: () => void;
    afterRender: () => void;
    start: () => void;
    pause: () => void;
    collisionStart: (manifolds: any[]) => void;
    collisionActive: (manifolds: any[]) => void;
    collisionEnd: (manifolds: any[]) => void;
  };
}
/**
 * 时间步迭代器
 */
export class TimeStepper {
  // 主引擎
  private engine: IStepper;
  // requestAnimationFrame的id
  private raf: number;
  // 运行状态（开始/暂停）
  private status: boolean;

  // 帧率
  public fps: number;
  // 步长 （1000/fps）
  private dt: number;
  // 允许最小步长
  private dtMin: number;
  // 允许最大步长
  private dtMax: number;
  // 是否固定步长
  private deltaFixed: boolean;
  // 上次tick执行时间
  private prevTime: number;
  // 步长记录器
  private deltaRecorder: number[];
  // 步长记录数量上限
  private deltaRecordLimit: number;
  // 帧计数器
  private frameCounter: number;
  // 帧时间
  private frameStamp: number;
  // 总帧计算器
  private frameTotal: number;
  // 帧限制
  private frameNumLimit: number;

  constructor(engine: IStepper, opt: IOpt) {
    this.engine = engine;

    this.status = false;

    this.fps = opt.fps || 60;
    this.deltaFixed = opt.deltaFixed === undefined ? true : opt.deltaFixed;
    this.deltaRecordLimit = 60;

    Util.merge(this, opt);

    this.dt = 1 / this.fps;
    this.dtMin = this.dt;
    this.dtMax = this.dt * 2;
    this.frameCounter = 0;
    this.frameStamp = 0;
    this.prevTime = 0;
    this.frameTotal = 0;
    this.frameNumLimit = -1;
    this.deltaRecorder = [];
  }

  /**
   * 一次tick，也就是一次模拟
   * @param timeStamp 当前时间戳
   */
  tick(timeStamp: number = 0) {
    let dt: number;

    // 固定dt
    if (this.deltaFixed === false) {
      // 动态计算dt
      dt = (timeStamp - this.prevTime) / 1000 || this.dt;
      this.prevTime = timeStamp;

      // 根据过去的变化步长情况，优化当前步长，使引擎稳定
      this.deltaRecorder.push(dt);
      this.deltaRecorder = this.deltaRecorder.slice(-this.deltaRecordLimit);
      dt = Util.clamp(
        Math.min.apply(Math, this.deltaRecorder),
        this.dtMin,
        this.dtMax
      );

      // 更新dt
      this.dt = dt;
    }

    // 动态计算fps
    this.frameCounter += 1;
    if (timeStamp - this.frameStamp >= 1000) {
      this.fps = this.frameCounter / ((timeStamp - this.frameStamp) / 1000);
      this.frameStamp = timeStamp;
      this.frameCounter = 0;
    }

    this.engine.tickStart();

    // 更新物理引擎
    this.engine.beforeUpdate();
    this.engine.update(this.dt, timeStamp);
    this.engine.afterUpdate();

    // 渲染物理引擎
    this.engine.beforeRender();
    this.engine.render(this.dt);
    this.engine.afterRender();

    this.engine.tickEnd();

    this.frameTotal++;

    if (this.frameNumLimit > 0 && this.frameTotal >= this.frameNumLimit) {
      this.pause();
      return;
    }

    if (this.status) {
      this.raf = window.requestAnimationFrame(this.tick.bind(this));
    }
  }

  /**
   * 开始模拟
   * @param frameNumLimit 限制运行多少帧停下
   */
  start(frameNumLimit?: number) {
    if (this.status) return;

    if (frameNumLimit && frameNumLimit > 0) {
      this.frameNumLimit = frameNumLimit;
    }

    this.status = true;
    this.engine.start();
    this.tick();
  }

  /**
   * 暂停模拟
   */
  pause() {
    if (!this.status) return;

    this.status = false;
    this.frameTotal = 0;
    this.engine.pause();
    window.cancelAnimationFrame(this.raf);
  }
}
