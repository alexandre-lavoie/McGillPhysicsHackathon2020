class Mass extends Phaser.GameObjects.Graphics {
    public body: MatterJS.BodyType;
    private static smallestMass: number = 0;
    private static largestMass: number = 0;
    private isSelected: boolean;

    public set mass(mass: number | undefined) {
        if(mass) {
            this.body.mass = mass;
            Mass.smallestMass = Math.min(mass, Mass.smallestMass);
            Mass.largestMass = Math.max(mass, Mass.largestMass);
        }
    }

    constructor(scene: Phaser.Scene, x: number, y: number, verticies: string | any[], options: Phaser.Types.Physics.Matter.MatterBodyConfig) {
        super(scene);

        this.isSelected = false;

        this.body = this.scene.matter.add.fromVertices(x, y, verticies, options);

        this.mass = options.mass;

        this.scene.add.existing(this);
    }

    public preUpdate() {
        let verticies = this.body.vertices;

        this.clear();

        this.fillStyle(Phaser.Display.Color.GetColor((this.body.mass < 20) ? 255 : 0, (this.body.mass >= 20) ? 255 : 0, 0), 1);

        this.beginPath();

        this.moveTo(verticies[0].x, verticies[0].y);

        for (let i = 1; i < verticies.length; i++) {
            this.lineTo(verticies[i].x, verticies[i].y);
        }

        this.closePath();

        this.fillPath();

        let mousePointer = this.scene.input.mousePointer;

        if(mousePointer.isDown && this.scene.matter.intersectPoint(mousePointer.x, mousePointer.y, [this.body]).length > 0) {
            this.isSelected = true;
        } else if(!mousePointer.isDown) {
            this.isSelected = false;
        }

        if(this.isSelected) {
            this.scene.matter.body.setPosition(this.body, new Phaser.Math.Vector2(mousePointer.x, mousePointer.y));
            this.scene.matter.body.setVelocity(this.body, new Phaser.Math.Vector2(0, 0));
        }
    }
}