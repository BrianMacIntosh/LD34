
var Player = function()
{
	Actor.call(this);
	
	this.transform.position.set(-50, 0, 0);
	
	this.maxMovementSpeed = 100;
	this.acceleration = 512;
	this.ignoreSpeedMultAbove = 0.15;
	
	// create mesh
	this.geometry = bmacSdk.GEO.makeSpriteGeo(24,32);
	this.mesh = bmacSdk.GEO.makeSpriteMesh(Player.texture, this.geometry);
	this.transform.add(this.mesh);
	this.mesh.position.set(0, 0, -50);
	
	this.controlHelperDom = document.getElementById("interactionMessage");
	
	bmacSdk.GEO.setTilesheetGeometry(this.geometry, 0, 1, 24, 4);
}

Player.texture = bmacSdk.GEO.loadPixelTexture("media/player.png");

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
	
	// take input and set desired movement
	if (Player.controls.left())
	{
		this.desiredMovement.x--;
	}
	if (Player.controls.right())
	{
		this.desiredMovement.x++;
	}
	if (Player.controls.up())
	{
		this.desiredMovement.y--;
	}
	if (Player.controls.down())
	{
		this.desiredMovement.y++;
	}
	if (Player.controls.machete())
	{
		this.swingMachete();
	}
	
	// display a UI helper for the player to interact with things
	var tileX = sampleGame.tileManager.worldToTileX(this.transform.position.x);
	var tileY = sampleGame.tileManager.worldToTileY(this.transform.position.y);
	var currentTile = sampleGame.tileManager.getTile(tileX, tileY);
	var interactionMessage = "";
	if (currentTile)
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
					sampleGame.villagerManager.unflagResourceAt(tileX, tileY);
				}
			}
			else
			{
				//TODO: resource name string
				interactionMessage = "(X): Flag " + resource + " for gathering";
				
				if (Player.controls.interact())
				{
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
