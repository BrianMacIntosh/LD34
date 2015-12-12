
var Villager = function()
{
	Actor.call(this);
	
	// create mesh
	this.geometry = bmacSdk.GEO.makeSpriteGeo(24,32);
	var texture = Villager.textures[Math.floor(Math.random() * Villager.textures.length)];
	this.mesh = bmacSdk.GEO.makeSpriteMesh(texture, this.geometry);
	this.transform.add(this.mesh);
	this.mesh.position.set(400, 200, -20);
	
	bmacSdk.GEO.setTilesheetGeometry(this.geometry, 0, 1, 24, 4);
}

Villager.textures =
[
	THREE.ImageUtils.loadTexture("media/villager.png"),
]

Villager.prototype = Object.create(Actor.prototype);

Villager.prototype.update = function()
{
	
	Actor.prototype.update.call(this);
}