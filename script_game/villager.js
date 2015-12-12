
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
	//TEMP:
	if (!this.path || this.path.length <= 0)
	{
		this.pathToLocation((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
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
	
	Actor.prototype.update.call(this);
	
	if (destination)
	{
		// detect reaching destination
		var signToDestinationX = Math.sign(destination.x - this.transform.position.x);
		var signToDestinationY = Math.sign(destination.y - this.transform.position.y);
		if ((signToDestinationX !== oldSignToDestinationX || oldSignToDestinationX == 0)
		 && (signToDestinationY !== oldSignToDestinationY || oldSignToDestinationY == 0))
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
