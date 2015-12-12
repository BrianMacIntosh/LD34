
var Player = function()
{
	Actor.call(this);
	
	this.transform.position.set(0, 0, 0);
	
	this.maxMovementSpeed = 100;
	this.acceleration = 512;
	
	// create mesh
	this.geometry = bmacSdk.GEO.makeSpriteGeo(24,32);
	this.mesh = bmacSdk.GEO.makeSpriteMesh(Player.texture, this.geometry);
	this.transform.add(this.mesh);
	this.mesh.position.set(0, 0, -20);
	
	bmacSdk.GEO.setTilesheetGeometry(this.geometry, 0, 1, 24, 4);
}

Player.texture = THREE.ImageUtils.loadTexture("media/player.png");

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
}

Player.prototype = Object.create(Actor.prototype);

Player.prototype.update = function()
{
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
	
	//console.log(sampleGame.tileManager.getTileAtWorld(this.transform.position.x, this.transform.position.y));
	
	Actor.prototype.update.call(this);
}
