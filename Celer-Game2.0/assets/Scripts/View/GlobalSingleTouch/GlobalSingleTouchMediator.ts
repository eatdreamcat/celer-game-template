import { GameStateController } from "../../Controller/GameStateController";
import { GetPixels } from "../../Utils/Cocos";
import { BaseSignal } from "../../Utils/Signal";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import SingleTouchMediator from "../SingleTouchMediator";
import GlobalSingleTouchView from "./GlobalSingleTouchView";

const { ccclass, property } = cc._decorator;

export class ShowTipSignal extends BaseSignal {}
@ccclass
export default class GlobalSingleTouchMediator extends SingleTouchMediator<GlobalSingleTouchView> {
  onRegister() {
    super.onRegister();
    this.node["_touchListener"].swallowTouches = false;
  }

  protected onTouchStart(event: cc.Event.EventTouch) {
    if (
      GameStateController.inst.canStart() &&
      GameStateController.inst.isRoundStart() == false
    ) {
      GameStateController.inst.roundStart();
    }

    this.time = 0;
  }

  protected onTouchMove(event: cc.Event.EventTouch) {
    this.time = 0;
  }

  protected onTouchEnd(event: cc.Event.EventTouch) {
    this.time = 0;
  }

  protected onTouchCancel(event: cc.Event.EventTouch) {
    this.time = 0;
  }

  private time: number = 0;
  update(dt: number) {
    this.time += dt;

    if (this.time >= 3) {
      this.time = 0;
      ShowTipSignal.inst.dispatch();
    }
  }
}
