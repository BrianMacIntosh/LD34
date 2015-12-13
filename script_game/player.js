
var Player = function()
{
	Actor.call(this);
	
	this.isPlayer = true;
	
	this.transform.position.set(-50, 0, 0);
	
	this.maxMovementSpeed = 100;
	this.acceleration = 512;
	this.ignoreSpeedMultAbove = 0.15;
	
	// create mesh
	this.geometry = bmacSdk.GEO.makeSpriteGeo(24,32);
	this.mesh = bmacSdk.GEO.makeSpriteMesh(Player.texture, this.geometry);
	this.transform.add(this.mesh);
	this.mesh.position.set(0, 0, -50);
	
	// create control intro
	this.controlGeo = bmacSdk.GEO.makeSpriteGeo(98,64);
	this.controlMesh = bmacSdk.GEO.makeSpriteMesh(bmacSdk.GEO.loadPixelTexture("media/controls.png"), this.controlGeo);
	GameEngine.scene.add(this.controlMesh);
	this.controlMesh.position.set(-98/2, -64/2, -2);
	
	this.controlHelperDom = document.getElementById("interactionMessage");
	
	bmacSdk.GEO.setTilesheetGeometry(this.geometry, 0, 1, 24, 4);
}

Player.texture = bmacSdk.GEO.loadPixelTexture("media/player.png");

Player.plantFlagSound =
[
	"media/95275__department64__metal-rings-04.wav",
];

Player.lowerFlagSound =
[
	"media/19291__martian__foley-cloth-rustle.wav",
];

// stores functions to call to check control states
Player.controls =
{
	left: function()
	{
		return GameEngine.keyboard.keyDown(bmacSdk.KEYBOARD.LEFT)
			|| bmacSdk.INPUT.gamepadButtonPressed(bmacSdk.INPUT.FIRST_PLAYER, bmacSdk.INPUT.GB_DPAD_LEFT);
	},
	right: function()
	{
		return GameEngine.keyboard.keyDown(bmacSdk.KEYBOARD.RIGHT)
			|| bmacSdk.INPUT.gamepadButtonPressed(bmacSdk.INPUT.FIRST_PLAYER, bmacSdk.INPUT.GB_DPAD_RIGHT);
	},
	up: function()
	{
		return GameEngine.keyboard.keyDown(bmacSdk.KEYBOARD.UP)
			|| bmacSdk.INPUT.gamepadButtonPressed(bmacSdk.INPUT.FIRST_PLAYER, bmacSdk.INPUT.GB_DPAD_UP);
	},
	down: function()
	{
		return GameEngine.keyboard.keyDown(bmacSdk.KEYBOARD.DOWN)
			|| bmacSdk.INPUT.gamepadButtonPressed(bmacSdk.INPUT.FIRST_PLAYER, bmacSdk.INPUT.GB_DPAD_DOWN);
	},
	machete: function()
	{
		return GameEngine.keyboard.keyDown("z")
			|| bmacSdk.INPUT.gamepadButtonDown(bmacSdk.INPUT.FIRST_PLAYER, bmacSdk.INPUT.GB_A);
	},
	interact: function()
	{
		return GameEngine.keyboard.keyPressed("x")
			|| bmacSdk.INPUT.gamepadButtonPressed(bmacSdk.INPUT.FIRST_PLAYER, bmacSdk.INPUT.GB_B);
	},
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.update = function()
{
	//DEBUG CHEAT
	if (GameEngine.keyboard.keyPressed("p"))
	{
		sampleGame.tileManager.peek();
	}
	
	var anyControl = false;
	
	// take input and set desired movement
	if (Player.controls.left())
	{
		this.desiredMovement.x--;
		anyControl = true;
	}
	if (Player.controls.right())
	{
		this.desiredMovement.x++;
		anyControl = true;
	}
	if (Player.controls.up())
	{
		this.desiredMovement.y--;
		anyControl = true;
	}
	if (Player.controls.down())
	{
		this.desiredMovement.y++;
		anyControl = true;
	}
	if (Player.controls.machete())
	{
		this.swingMachete();
		anyControl = true;
	}
	
	if (anyControl)
	{
		this.controlMesh.visible = false;
	}
	
	// display a UI helper for the player to interact with things
	var tileX = sampleGame.tileManager.worldToTileX(this.transform.position.x);
	var tileY = sampleGame.tileManager.worldToTileY(this.transform.position.y);
	var currentTile = sampleGame.tileManager.getTile(tileX, tileY);
	var interactionMessage = "";
	if (currentTile instanceof tile)
	{
		var resource = terainKey[currentTile.terrainType].resource;
		if (resource !== undefined && currentTile.growthLevel < growthMax)
		{
			if (sampleGame.villagerManager.hasResourceFlagAt(tileX, tileY))
			{
				//TODO: resource name string
				interactionMessage = "(X): Unflag " + resource;
				
				if (Player.controls.interact())
				{
					AUDIOMANAGER.playSound(Player.lowerFlagSound, 1);
					sampleGame.villagerManager.unflagResourceAt(tileX, tileY);
				}
			}
			else
			{
				//TODO: resource name string
				interactionMessage = "(X): Flag " + resource + " for gathering";
				
				if (Player.controls.interact())
				{
					AUDIOMANAGER.playSound(Player.plantFlagSound, 1);
					sampleGame.villagerManager.flagResourceAt(tileX, tileY);
				}
			}
		}
	}
	if (interactionMessage != this.controlHelperDom.innerHTML)
	{
		this.controlHelperDom.innerHTML = interactionMessage;
	}
	
	Actor.prototype.update.call(this);
}
