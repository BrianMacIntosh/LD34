
var Player = function()
{
	Actor.call(this);
	
	this.maxMovementSpeed = 100;
	this.acceleration = 512;
	
	// create mesh
	this.geometry = bmacSdk.GEO.makeSpriteGeo(24,32);
	this.mesh = bmacSdk.GEO.makeSpriteMesh(Player.texture, this.geometry);
	this.transform.add(this.mesh);
	this.mesh.position.set(400, 200, -20);
	
	bmacSdk.GEO.setTilesheetGeometry(this.geometry, 0, 1, 24, 4);
}

Player.texture = THREE.ImageUtils.loadTexture("media/player.png");

// stores functions to call to check control states
Player.controls =
{
	left: function()
	{
		return GameEngine.keyboard.keyDown(bmacSdk.KEYBOARD.LEFT);
	},
	right: function()
	{
		return GameEngine.keyboard.keyDown(bmacSdk.KEYBOARD.RIGHT);
	},
	up: function()
	{
		return GameEngine.keyboard.keyDown(bmacSdk.KEYBOARD.UP);
	},
	down: function()
	{
		return GameEngine.keyboard.keyDown(bmacSdk.KEYBOARD.DOWN);
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
	
	Actor.prototype.update.call(this);
}
