class GameScene extends Phaser.Scene {
    constructor() {
        super({
            active: true,
            visible: true,
            key: 'Game'
        } as Phaser.Types.Scenes.SettingsConfig);
    }

    public preload() {
        this.load.image('water', 'public/assets/sprites/water.png');
        this.load.image('mass', 'public/assets/sprites/mass.png');
    }

    public create() {
        this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height, 32, true, true, false, true);

        let offset = this.scale.width / 4;

        new Mass(this, offset, this.scale.height / 2, '0 0 0 50 75 50 100 0', { mass: 10, friction: 0.05 });

        new Mass(this, offset * 2, this.scale.height / 2, '50 50 -50 50 -50 -50 50 -50', { mass: 20, friction: 0.05 });

        new Mass(this, offset * 3, this.scale.height / 2, '0 0 500 0 500 100 100 100', { mass: 20, friction: 0.05 });

        new Mass(this, offset * 4, this.scale.height / 2, '50 50 -50 50 -50 -50 50 -50', { mass: 5, friction: 0.05 });

        new Liquid(this, this.scale.width / 2, this.scale.height / 2 + this.scale.height / 4, this.scale.width, this.scale.height / 2, 500);
    }
}