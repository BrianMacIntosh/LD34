
var Villager = function()
{
	Actor.call(this);
	
	this.acceleration = 99999;
	
	this.transform.position.set(0, 0, 0);
	
	// create mesh
	this.geometry = bmacSdk.GEO.makeSpriteGeo(24,32);
	var texture = Villager.textures[Math.floor(Math.random() * Villager.textures.length)];
	this.mesh = bmacSdk.GEO.makeSpriteMesh(texture, this.geometry);
	this.transform.add(this.mesh);
	this.mesh.position.set(0, 0, -20);
	
	this.path = [];
	
	bmacSdk.GEO.setTilesheetGeometry(this.geometry, 0, 1, 24, 4);
}

Villager.textures =
[
	THREE.ImageUtils.loadTexture("media/villager.png"),
]

Villager.prototype = Object.create(Actor.prototype);

Villager.prototype.update = function()
{
	var tile = sampleGame.tileManager.getTileAtWorld(this.transform.position.x, this.transform.position.y);
	
	//TEMP:
	if (!this.path || this.path.length <= 0)
	{
		if (this.task)
		{
			sampleGame.villagerManager.freeTask(this.task);
			if (this.task instanceof ResourceTask)
			{
				// pick up a resource and take it back
				this.heldResource = terainKey[tile.terrainType].resource;
			}
			else if (this.task instanceof ReturnResourceTask)
			{
				//TODO: return resource
				this.heldResource = undefined;
			}
		}
		if (this.heldResource)
		{
			this.task = new ReturnResourceTask();
		}
		else
		{
			this.task = sampleGame.villagerManager.takeTask();
		}
		this.pathToLocation(this.task.x * tilePixelWidth, this.task.y * tilePixelHeight);
	}
	
	var destination = undefined;
	if (this.path && this.path.length > 0)
	{
		destination = this.path[0];
		
		// navigate toward destination
		var oldSignToDestinationX = Math.sign(destination.x - this.transform.position.x);
		var oldSignToDestinationY = Math.sign(destination.y - this.transform.position.y);
		
		this.desiredMovement.x = oldSignToDestinationX;
		this.desiredMovement.y = oldSignToDestinationY;
	}
	
	// if we are standing on or looking at a tile with growth, swing the machete
	if (!tile || tile.growthLevel == 0)
	{
		tile = sampleGame.tileManager.getTileAtWorld(
			this.transform.position.x + this.getFacingX() * tilePixelWidth,
			this.transform.position.y + this.getFacingY() * tilePixelHeight);
	}
	if (tile && tile.growthLevel > 0)
	{
		this.swingMachete();
	}
	
	Actor.prototype.update.call(this);
	
	if (destination)
	{
		// detect reaching destination
		var signToDestinationX = Math.sign(destination.x - this.transform.position.x);
		var signToDestinationY = Math.sign(destination.y - this.transform.position.y);
		var passedX = signToDestinationX !== oldSignToDestinationX || oldSignToDestinationX == 0;
		var passedY = signToDestinationY !== oldSignToDestinationY || oldSignToDestinationY == 0;
		if (passedX)
		{
			this.transform.position.x = destination.x;
		}
		if (passedY)
		{
			this.transform.position.y = destination.y;
		}
		if (passedX && passedY)
		{
			if (this.path && this.path.length > 0)
			{
				this.path.splice(0, 1);
				if (this.path.length <= 0)
				{
					this.path = undefined;
				}
			}
		}
	}
}

Villager.prototype.pathToLocation = function(x, y)
{
	this.path = sampleGame.villagerManager.findPathTo(x, y);
}
