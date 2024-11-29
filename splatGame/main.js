/**
 * Main Menu Scene
 */
class MainMenu extends Phaser.Scene
{
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload ()
    {
        this.load.image('bg', '/assets/background.jpg');
        this.load.image('buttonbg', '/assets/ui/button_rectangle_depth_flat.png');
        this.load.image('buttonbghover', '/assets/ui/button_rectangle_depth_gradient.png');
    }

    create ()
    {
        this.add.image(400, 300, 'bg');
        // Add play button
        const playButton = this.add.image(400, 300, 'buttonbg').setInteractive();

        // Add text over the button
        const buttonText = this.add.text(400, 300, 'Play', {
            fontSize: '50px',
            color: '#ffffff',
        }).setOrigin(0.5);

        // Button click handler
        playButton.on('pointerdown', () => {
            playButton.setTexture('buttonbghover');
            this.scene.start('GameScene'); 
        });

    }
}

/**
 * Game Scene 
 */
class GameScene extends Phaser.Scene
{
    constructor(level = 1) {
        super({ key: 'GameScene' });
        this.level = level;
        this.splatGroup = null;
    }

    preload (){
        this.load.image('bg', '/assets/white-paper-texture.jpg');
        this.load.image('mainbg', '/assets/ui/button_square_border.png');
        this.load.image('star', '/assets/ui/star.png');
        this.load.spritesheet('splat', '/assets/playables/colours.png', {
            frameWidth: 256,  // Width of each frame
            frameHeight: 256 // Height of each frame
        });

        this.load.json('gridLayouts', '/levels.json');

    }

    create (){
        //Background
        this.add.image(400, 300, 'bg');

        //get base item
        var selectedItem = this.getRandomInt(5);
        var amount =  this.getItemAmount(this.level);
        this.currentGrid =  this.loadLVL(this.level);

        //Amount
        var selectedItemBG = this.add.image(100, 100, 'mainbg').setDisplaySize(120, 120).setOrigin(0.5);
        this.add.sprite(selectedItemBG.x, selectedItemBG.y - 15 , 'splat', selectedItem).setDisplaySize(64, 64).setOrigin(0.5);

        this.amountText = this.add.text(selectedItemBG.x, selectedItemBG.y + 30, amount, {
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0.5);

        var selectedScoreBG = this.add.image(700, 100, 'star').setDisplaySize(120, 120).setOrigin(0.5);
        this.scoreText = this.add.text(selectedScoreBG.x, selectedScoreBG.y, 0, {
            fontSize: '24px',
            color: '#000'
        }).setOrigin(0.5);

        this.regenGame();
    }

    update() {

    }



    //random number gen
    getRandomInt(max){
        return Math.floor(Math.random() * max);
    }

    //Item LVL
    getItemAmount(lvl = 3){
        if(lvl >= 10){
            return 30;
        }else{
            return 3 * lvl;
        }
    }

    //load grid lvl
    loadLVL(lvl){
        const gridData = this.cache.json.get('gridLayouts');
        return gridData.levels.find(level => level.level === lvl).grid;
    }

    clickableFunction(){
        this.selected = false;
        this.splatGroup.getChildren().forEach(element => {
            element.setInteractive();
            
            element.on('pointerdown', () => {
                if (this.selected) {
                    // Get positions of the selected tile and the clicked tile
                    const selectedPos = this.selected.getData('position');
                    const clickedPos = element.getData('position');
                    
                    // Check if the clicked tile is adjacent (left, right, up, or down)
                    const isAdjacent = (Math.abs(selectedPos.x - clickedPos.x) === 1 && selectedPos.y === clickedPos.y) || 
                                        (Math.abs(selectedPos.y - clickedPos.y) === 1 && selectedPos.x === clickedPos.x);
                    
                    if (isAdjacent) {
                        // Swap the tiles if they are adjacent
                        this.swapTiles(this.selected, element);
                        
                        // Reset the visual indication
                        this.selected.setAlpha(1); // Reset the alpha after swap
                        this.selected.clearTint(); // Remove the tint
                        this.detectMatches(this.splatGroup);
                        // Update the selected tile to null
                        this.selected = null;
                    } else {
                        console.log('Tiles are not adjacent');
                        this.selected.setAlpha(1);
                        this.selected.clearTint()
                        this.selected = null;
                    }
                } else {
                    // Set the selected tile and add a visual indicator (change alpha or tint)
                    this.selected = element;
                    this.selected.setAlpha(0.5); // Set alpha to 0.5 for selection visual cue
                    this.selected.setTint(0x00ff00); // Optional: Green tint for selection
                    console.log('Splat selected:', this.selected.getData('frameIndex'));
                }
            });
        });
    
    }

    regenGame(){
        if(this.splatGroup && this.bg ){
            this.splatGroup.getChildren().forEach(element => {
                element.destroy();
            });

            this.bg.getChildren().forEach(element => {
                element.destroy();
            });
        }

        const tileSize = 64; // Size of each tile
        const gridWidth = this.currentGrid[0].length * tileSize; // Grid width in pixels
        const gridHeight = this.currentGrid.length * tileSize; // Grid height in pixels

        this.levelWidth = this.currentGrid[0].length; // Number of columns
        this.levelHeight = this.currentGrid.length; // Number of rows

        // Calculate the starting position to center the grid
        const startX = (this.scale.width - gridWidth) / 2;
        const startY = (this.scale.height - gridHeight) / 2;

        this.bg = this.add.group();
        this.splatGroup = this.add.group();
       // Loop through the grid and display it
        var k = 0;
        for (let row = 0; row < this.currentGrid.length; row++) {
            for (let col = 0; col < this.currentGrid[row].length; col++) {
                // Calculate the position of each tile
                const x = startX + col * tileSize + tileSize / 2;
                const y = startY + row * tileSize + tileSize / 2;

                // Add a tile sprite with the same size as the grid cell
                var mainbg = this.add.image(x, y, 'mainbg').setDisplaySize(tileSize, tileSize).setOrigin(0.5);
                this.bg.add(mainbg);
                // Add the number in the center of the tile
                var randomnumber = this.getRandomInt(5);
                var splat = this.add.sprite(mainbg.x, mainbg.y , 'splat',  randomnumber).setDisplaySize(tileSize/1.5, tileSize/1.5).setOrigin(0.5);
                splat.setData('frameIndex', randomnumber);
                splat.setData('mainIndex', k);
                splat.setData('position', { x: col, y: row });
                this.splatGroup.add(splat);

                k++;
            }
        }
    
        this.clickableFunction();
        this.detectMatches(this.splatGroup);
    }
   // Function to swap tiles in splatGroup
    swapTiles(selected, clicked) {
        const selectedPos = selected.getData('position');
        const clickedPos = clicked.getData('position');

        // Swap their positions in the splatGroup visually
        const tempX = selected.x;
        const tempY = selected.y;

        // Update the positions of the selected and clicked tiles
        selected.setPosition(clicked.x, clicked.y);
        clicked.setPosition(tempX, tempY);

        // Update their 'position' data to reflect the new positions
        selected.setData('position', clickedPos);
        clicked.setData('position', selectedPos);

        // Now swap the tiles in the splatGroup array as well
        const children = this.splatGroup.getChildren();

        // Find the indices of the selected and clicked tiles in the group
        const selectedIndex = children.indexOf(selected);
        const clickedIndex = children.indexOf(clicked);

        // Swap the positions of the tiles in the splatGroup
        if (selectedIndex !== -1 && clickedIndex !== -1) {
            // Swap the elements in the group
            [children[selectedIndex], children[clickedIndex]] = [children[clickedIndex], children[selectedIndex]];
        }

    }
     // Detect matches in the splatGroup
    detectMatches(splatGroup) {
        let matches = [];
        
        splatGroup.getChildren().forEach(tile => {
            if (!tile) return; // Ensure the tile is not undefined
    
            // Check horizontal matches
            const tileData = tile.getData('frameIndex');
            const { x, y } = tile.getData('position');
            
            // Horizontal match check
            if (x < this.levelWidth - 2) {
                const neighbor1 = splatGroup.getChildren().find(t => t.getData('position').x === x + 1 && t.getData('position').y === y);
                const neighbor2 = splatGroup.getChildren().find(t => t.getData('position').x === x + 2 && t.getData('position').y === y);
                if (neighbor1 && neighbor2 && tileData === neighbor1.getData('frameIndex') && tileData === neighbor2.getData('frameIndex')) {
                    matches.push([tile, neighbor1, neighbor2]);
                    this.replaceMatchedTiles([tile, neighbor1, neighbor2]);
                }
            }
    
            // Vertical match check
            if (y < this.levelHeight - 2) {
                const neighbor1 = splatGroup.getChildren().find(t => t.getData('position').x === x && t.getData('position').y === y + 1);
                const neighbor2 = splatGroup.getChildren().find(t => t.getData('position').x === x && t.getData('position').y === y + 2);
                if (neighbor1 && neighbor2 && tileData === neighbor1.getData('frameIndex') && tileData === neighbor2.getData('frameIndex')) {
                    matches.push([tile, neighbor1, neighbor2]);
                    this.replaceMatchedTiles([tile, neighbor1, neighbor2]);
                }
            }
        });

        return matches;
    }

    // Replace matched tiles with new splats
    replaceMatchedTiles(matchedTiles) {
        matchedTiles.forEach((tile) => {
            const { col, row } = tile.getData('position');
            const randomnumber = this.getRandomInt(5); // Generate new random splat type
            const x = tile.x;
            const y = tile.y;
            const frametype = tile.getData('frameIndex');
            if(frametype == this.selectedItem){
                this.updateTextData(true);
                console.log("True Match");
            }else{
                this.updateTextData(false);
            }

            // Remove the old tile
            tile.destroy();
            
            // Add a new splat in the same position
            this.generateNewSplat(x, y, randomnumber, col, row);
        });
    }

    // Generate a new splat at the given position
    generateNewSplat(x, y, randomnumber, col, row) {
        const tileSize = 64; // Size of each tile (same as in create method)
        var splat = this.add.sprite(x, y, 'splat', randomnumber)
            .setDisplaySize(tileSize / 1.5, tileSize / 1.5)
            .setOrigin(0.5);
            
        splat.setData('frameIndex', randomnumber);
        splat.setData('position', { x: col, y: row });
        this.splatGroup.add(splat);

        this.clickableFunction();
    }

    /** Update score & collect */
    updateTextData(isRightTile = false) {
        if (this.scoreText) {
            let currentScore = parseInt(this.scoreText.text);
            let newScore = currentScore;
    
            if (isRightTile) {
                let currentAmount = parseInt(this.amountText.text);
                this.amountText.text = currentAmount - 1;
    
                newScore = currentScore + 10;
    
                if (parseInt(this.amountText.text) == 0) {
                    //TODO: Game Over
                }
            } else {
                newScore = currentScore + 5;
            }
    
            // Only update if the score has changed
            if (newScore !== currentScore) {
                this.scoreText.text = newScore;
            }
        }
    }
}



/**
 * Game Config
 */
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MainMenu , GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    }
};

const game = new Phaser.Game(config);