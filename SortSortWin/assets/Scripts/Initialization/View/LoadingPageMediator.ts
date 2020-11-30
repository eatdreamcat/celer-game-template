// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BaseMediator from "../../View/BaseMediator";
import LoadingView from "./LoadingView";
import { CelerSDK } from "../../Utils/Celer/CelerSDK";
import {
  GameReadySignal,
  GameStartSignal,
  ShowTutorialSignal,
} from "../../Command/CommonSignal";
import { GameStateController } from "../../Controller/GameStateController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingPageMediator extends BaseMediator<LoadingView> {
  private time = 3000;
  private startTime = 0;
  onRegister() {
    this.startTime = Date.now();

    GameReadySignal.inst.addListener(this.onGameReady, this);
  }

  onGameReady() {
    let waitingTime = Date.now() - this.startTime;
    console.log(" -- game init done, hide loading page: ", waitingTime);
    if (waitingTime <= this.time) {
      setTimeout(() => {
        this.View.Hide(() => {
          this.startGame();
        });
      }, this.time - waitingTime);
    } else {
      this.View.Hide(() => {
        this.startGame();
      });
    }
  }

  startGame() {
    if (CelerSDK.inst.isNew()) {
      ShowTutorialSignal.inst.dispatchOne(() => {
        GameStartSignal.inst.dispatch();
        GameStateController.inst.isReady = true;
      });
    } else {
      GameStartSignal.inst.dispatch();
      GameStateController.inst.isReady = true;
    }
  }

  onDestroy() {}
}
