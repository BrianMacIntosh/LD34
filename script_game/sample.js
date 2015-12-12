
GameEngine = new bmacSdk.Engine("canvasDiv");

sampleGame =
{
	
};

sampleGame.added = function()
{
	this.dirtTexture = THREE.ImageUtils.loadTexture("media/dirt.png");
	this.dirtGeo = bmacSdk.GEO.makeSpriteGeo(128, 64);
	
	var m = bmacSdk.GEO.makeSpriteMesh(this.dirtTexture, this.dirtGeo);
	m.position.set(200, 200, -90);
	GameEngine.scene.add(m);
	
	this.player = new Player();
	GameEngine.addObject(this.player);
	
	this.villagerManager = new VillagerManager();
};

sampleGame.removed = function()
{
	
};

sampleGame.update = function()
{
	this.villagerManager.update();
};

GameEngine.addObject(sampleGame);
