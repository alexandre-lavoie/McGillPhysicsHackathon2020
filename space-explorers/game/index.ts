/// <reference path="../node_modules/phaser/types/phaser.d.ts" />
/// <reference path="./scenes/GameScene.ts"/>

(async () => {
    new Phaser.Game({
        title: "Sink or Float",
        type: Phaser.AUTO,
        scene: [GameScene],
        width: window.innerWidth,
        height: window.innerHeight,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        autoRound: false,
        physics: {
            default: 'matter',
            matter: {
            }
        },
        parent: 'alexandre-lavoie',
        backgroundColor: '#000'
    } as any);
})();