/**
 * 复合刚体
 */

import { Bound } from "../common/bound";
import { Compose } from "../common/compose";
import { Vector } from "../math/vector";
import { Body, BodyType, IBodyOpt } from "./body";

export interface CompositeOpt extends IBodyOpt {
  bodies?: Body[];
  // 是否沿用父图形的属性（质量，摩擦力，恢复系数等）
  useParentProps: boolean;
}

export class Composite extends Body {
  useParentProps: boolean;

  constructor(opt: CompositeOpt) {
    super(opt, BodyType.Composite);
  }

  // -------------------------- 内部方法 ------------------------

  beforeInitializeProperties(opt: CompositeOpt) {
    this.parts.length = 0;

    for (let i = 0; i < opt.bodies.length; i++) {
      this.parts.push(...opt.bodies[i].parts);
    }

    if (this.useParentProps === undefined) {
      this.useParentProps = false;
    }

    if (!this.useParentProps) {
      this.mass = Compose.getMass(this.parts);
    }
  }

  afterInitializeProperties(opt: CompositeOpt) {
    if (this.useParentProps) {
      this.density = this.mass / this.area;

      for (let i = 0; i < this.parts.length; i++) {
        this.parts[i].mass = this.parts[i].area * this.density;
        this.parts[i].friction = this.friction;
        this.parts[i].restitution = this.restitution;
      }

      this.position = this.getCentroid();

      for (let i = 0; i < this.parts.length; i++) {
        this.parts[i].inertia = this.parts[i].getInertia(this.position);
      }

      this.inertia = this.getInertia();
      this.invInertia = this.getInvInertia();
    }

    for (let i = 0; i < this.parts.length; i++) {
      this.parts[i].rotateCenter = this.position;
      this.parts[i].parent = this;
      this.parts[i].static = this.static;
      this.parts[i].kinetic = this.kinetic;
      this.parts[i].mask = this.mask;
    }
  }

  getArea(): number {
    return Compose.getArea(this.parts);
  }

  getCentroid(): Vector {
    return Compose.getCentroid(this.parts, this.mass);
  }

  getInertia(): number {
    return Compose.getInertia(this.parts);
  }

  getBound(): Bound {
    let firstChildBound = this.parts[0].bound,
      bound: Bound = new Bound(firstChildBound.min, firstChildBound.max);

    for (let i = 0; i < this.parts.length; i++) {
      bound = this.parts[i].bound.union(bound);
    }

    return bound;
  }

  translate(dx: number, dy: number) {
    let part: Body;

    for (let i = 0; i < this.parts.length; i++) {
      part = this.parts[i];

      part.position.x += dx;
      part.position.y += dy;
      part.translate(dx, dy);
    }

    this.bound.translate(dx, dy);
  }

  rotate(radian: number) {
    let part: Body;

    for (let i = 0; i < this.parts.length; i++) {
      part = this.parts[i];

      part.rotation += radian;
      part.position = part.position.rotate(
        radian,
        this.position,
        part.position
      );
      part.rotate(radian);
    }

    this.bound.updateByBounds(this.parts);
  }

  isContains(x: number, y: number): boolean {
    for (let i = 0; i < this.parts.length; i++) {
      if (this.parts[i].isContains(x, y)) return true;
    }

    return false;
  }
}
