import { VertexList } from "../common/vertices";
import { Vector } from "../math/vector";
import { Polygon, PolygonOpt } from "./polygon";

export interface RectOpt extends PolygonOpt {
  width: number;
  height: number;
}

export class Rect extends Polygon {
  // 宽
  width: number;
  // 高
  height: number;

  constructor(opt: RectOpt) {
    super(opt);
  }

  getVertexList(): VertexList {
    let leftTop = this.origin.clone(),
      rightTop = leftTop.add(new Vector(this.width, 0)),
      rightBottom = leftTop.add(new Vector(this.width, this.height)),
      leftBottom = leftTop.add(new Vector(0, this.height));

    return [leftTop, rightTop, rightBottom, leftBottom];
  }

  getArea(): number {
    return this.width * this.height;
  }

  getCentroid(): Vector {
    return this.origin.add(new Vector(this.width / 2, this.height / 2));
  }

  getInertia(): number {
    return (
      (this.mass * (this.width * this.width + this.height * this.height)) / 12
    );
  }
}
