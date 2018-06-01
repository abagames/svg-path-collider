declare module "sat" {
  export class Vector {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    copy(other: Vector): Vector;
    clone(): Vector;
    perp(): Vector;
    rotate(angle: number): Vector;
    reverse(): Vector;
    normalize(): Vector;
    add(other: Vector): Vector;
    sub(other: Vector): Vector;
    scale(x: number, y?: number): Vector;
    project(other: Vector): Vector;
    projectN(other: Vector): Vector;
    reflect(axis: Vector): Vector;
    reflectN(axis: Vector): Vector;
    dot(other: Vector): number;
    len2(): number;
    len(): number;
    angle();
    number;
    set(x?: number, y?: number): Vector;
    addAngleLength(angle: number, length: number): Vector;
    mul(v: number): Vector;
    div(v: number): Vector;
    clamp(minX?: number, maxX?: number, minY?: number, maxY?: number): Vector;
    isIn(
      spacing?: number,
      minX?: number,
      maxX?: number,
      minY?: number,
      maxY?: number
    ): boolean;
    angleTo(other: Vector);
    distanceTo(other: Vector);
  }

  export class Circle {
    pos: Vector;
    constructor(pos?: Vector, radius?: number);
  }

  export class Polygon {
    pos: Vector;
    constructor(pos?: Vector, vectors?: Vector[]);
    setAngle(angle: number);
    setOffset(offset: Vector);
    setPoints(points: Vector[]);
    points: Vector[];
  }

  export class Box {
    constructor(pos?: Vector, width?: number, height?: number);
    toPolygon(): Polygon;
  }

  export class Response {
    a;
    b;
    overlap: number;
    overlapN: Vector;
    overlapV: Vector;
    aInB: boolean;
    bInA: boolean;
  }

  export function testCircleCircle(a: Circle, b: Circle, response?: Response);

  export function testCirclePolygon(
    circle: Circle,
    polygon: Polygon,
    response?: Response
  );

  export function testPolygonCircle(
    polygon: Polygon,
    circle: Circle,
    response?: Response
  );

  export function testPolygonPolygon(
    a: Polygon,
    b: Polygon,
    response?: Response
  );
}
