
GameEngine = new bmacSdk.Engine("canvasDiv");

sampleGame =
{
	
};

sampleGame.added = function()
{
	/*this.dirtTexture = THREE.ImageUtils.loadTexture("media/dirt.png");
	this.dirtGeo = bmacSdk.GEO.makeSpriteGeo(64, 45);
	
	var m = bmacSdk.GEO.makeSpriteMesh(this.dirtTexture, this.dirtGeo);
	m.position.set(200, 200, -90);
	GameEngine.scene.add(m);*/
	
	this.player = new Player();
	GameEngine.addObject(this.player);

	this.tileManager = new tileManager();
	
	this.villagerManager = new VillagerManager();
	
	this.cameraController = new CameraController(GameEngine.mainCamera);
	
	this.resources = new ResourceManager();
};

sampleGame.removed = function()
{
	
};

sampleGame.update = function()
{
	this.villagerManager.update();
	this.cameraController.update();
	this.tileManager.update();

};

sampleGame.getWorldBoundsMinX = function()
{
	return -(centerLTileIndex + 0.5) * lTileSize * tilePixelWidth + tilePixelWidth / 2;
};

sampleGame.getWorldBoundsMaxX = function()
{
	return (centerLTileIndex + 0.5) * lTileSize * tilePixelWidth + tilePixelWidth / 2;
};

sampleGame.getWorldBoundsMinY = function()
{
	return -(centerLTileIndex + 0.5) * lTileSize * tilePixelHeight + tilePixelHeight / 2;
};

sampleGame.getWorldBoundsMaxY = function()
{
	return (centerLTileIndex + 0.5) * lTileSize * tilePixelHeight + tilePixelHeight / 2;
};

GameEngine.addObject(sampleGame);
