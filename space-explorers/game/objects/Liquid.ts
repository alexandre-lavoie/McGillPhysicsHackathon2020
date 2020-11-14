class Liquid extends Phaser.GameObjects.Graphics {
    public body: MatterJS.BodyType;
    private debugCircles: Phaser.GameObjects.Ellipse[];

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, density: number) {
        super(scene);

        this.body = this.scene.matter.add.rectangle(x, y, width, height, {
            ignoreGravity: true,
            isSensor: true,
            density
        });

        this.debugCircles = new Array(20).fill(0).map(() => new Phaser.GameObjects.Ellipse(scene, 0, 0, 10, 10, 0xFF00FF));

        this.debugCircles.forEach(c => this.scene.add.existing(c));

        this.body.onCollideActiveCallback = (data: any) => this.applyBuoyancy(data);

        this.scene.add.existing(this);

        this.render();
    }

    private render() {
        let verticies = this.body.vertices;

        this.clear();

        this.fillStyle(0x30A5D8, 0.5);

        this.beginPath();

        this.moveTo(verticies[0].x, verticies[0].y);

        for(let i = 1; i < verticies.length; i++) {
            this.lineTo(verticies[i].x, verticies[i].y);
        }

        this.closePath();

        this.fillPath();
    }

    public preUpdate() {

    }

    private applyBuoyancy(data: Phaser.Types.Physics.Matter.MatterCollisionData) {
        let dt = 0.00005;

        console.log(data);

        let buoyantForce = this.getBuoyantForce(data.bodyB, data.bodyA);

        let acceleration = buoyantForce.scale(1 / data.bodyA.mass);

        let deltaVelocity = acceleration.scale(dt);

        let velocity = data.bodyA.velocity;

        this.scene.matter.body.setVelocity(data.bodyA, { x: velocity.x + deltaVelocity.x, y: velocity.y + deltaVelocity.y });

        let submergedBodyCenterOfMass = this.getCenterOfMass(this.getSubmergedPolygon(data.bodyA));

        this.debugCircles[19].setPosition(submergedBodyCenterOfMass.x, submergedBodyCenterOfMass.y);

        let bodyCenterOfMass = this.getCenterOfMass(data.bodyA.vertices);

        if (new Phaser.Math.Vector2(bodyCenterOfMass.x, bodyCenterOfMass.y).distance(new Phaser.Math.Vector2(submergedBodyCenterOfMass.x, submergedBodyCenterOfMass.y)) > 10) {
            let angularAcceleration = this.getAngularAcceleration(data.bodyA, submergedBodyCenterOfMass, buoyantForce);

            let deltaAngularVelocity = angularAcceleration;

            this.scene.matter.body.setAngularVelocity(data.bodyA, data.bodyA.angularVelocity + deltaAngularVelocity);
        }
    }

    private getAngularAcceleration(body: MatterJS.BodyType, point: { x: number, y: number }, force: { x: number, y: number }) {
        let centerOfMass = this.getCenterOfMass(body.vertices);

        let r = new Phaser.Math.Vector2(point.x - centerOfMass.x, point.y - centerOfMass.y);
        let torque = r.cross(new Phaser.Math.Vector2(force.x, force.y));

        return torque / (body.mass * r.length() ** 2);
    }

    /**
     * Gets buoyant force applied by liquid.
     * @param liquid
     * @param body 
     */
    private getBuoyantForce(liquid: MatterJS.BodyType, body: MatterJS.BodyType) {
        return new Phaser.Math.Vector2(0, -1).scale(liquid.density * 9.8 * this.getWaterDisplacement(body) / 1000);
    }

    /**
     * Gets the 2D displacement of body on liquid.
     * @param body 
     */
    private getWaterDisplacement(body: MatterJS.BodyType): number {
        let submergedPoly = this.getSubmergedPolygon(body);

        return this.getPolygonArea(submergedPoly);
    }

    /**
     * Returns the centroid of the polygon.
     * @param verticies 
     */
    private getCenterOfMass(verticies: { x: number, y: number }[]) {
        let sumCx = 0;
        let sumCy = 0;
        let twicearea = 0;

        for (let i = 0, j = verticies.length - 1; i < verticies.length; j = i++) {
            let v = verticies[i];
            let nv = verticies[j];
            let rhs = v.x * nv.y - nv.x * v.y;

            twicearea += rhs;

            sumCx += (v.x + nv.x) * rhs;
            sumCy += (v.y + nv.y) * rhs;
        }

        let area = twicearea / 2;

        return new Phaser.Math.Vector2(sumCx / (6 * area), sumCy / (6 * area));
    }

    /**
     * Gets the surface between a submerged and non-submerged point.
     * @param p1 
     * @param p2 
     */
    private getSurfaceIntersection(p1: { x: number, y: number }, p2: { x: number, y: number }) {
        let m = (p1.y - p2.y) / (p1.x - p2.x);
        let b = p1.y - m * p1.x;

        return new Phaser.Math.Vector2((this.body.bounds.min.y - b) / m, this.body.bounds.min.y);
    }

    private isPointSubmerged(point: { x: number, y: number }) {
        return point.y > this.body.bounds.min.y;
    }

    /**
     * Polygon submerged in liquid.
     * @param verticies Sequenctial polygon verticies.
     */
    private getSubmergedPolygon(body: MatterJS.BodyType) {
        let verticies: { x: number, y: number }[] = body.vertices;
        let submergedVerticies: { x: number, y: number }[] = [];

        const checkVertex = (vertex, nextVertex) => {
            if (this.isPointSubmerged(vertex)) {
                submergedVerticies.push(new Phaser.Math.Vector2(vertex.x, vertex.y));
            } else if (this.isPointSubmerged(nextVertex) && !this.isPointSubmerged(vertex)) {
                submergedVerticies.push(this.getSurfaceIntersection(vertex, nextVertex));
            }

            if (this.isPointSubmerged(vertex) && !this.isPointSubmerged(nextVertex)) {
                submergedVerticies.push(this.getSurfaceIntersection(vertex, nextVertex));
            }
        };

        for (let i = 0; i < verticies.length - 1; i++) {
            checkVertex(verticies[i], verticies[i + 1]);
        }

        checkVertex(verticies[verticies.length - 1], verticies[0]);

        submergedVerticies.forEach((v, i) => this.debugCircles[i].setPosition(v.x, v.y));

        return submergedVerticies;
    }

    /**
     * Polygon area using Shoelace Formula.
     * @param verticies Sequenctial polygon verticies.
     */
    private getPolygonArea(verticies: { x: number, y: number }[]) {
        let area = 0;

        for (let i = 0, j = verticies.length - 1; i < verticies.length; j = i++) {
            let v = verticies[i];
            let nv = verticies[j];
            area += v.x * nv.y - nv.x * v.y;
        }

        return Math.abs(area / 2);
    }
}