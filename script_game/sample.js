
GameEngine = new bmacSdk.Engine("canvasDiv");

sampleGame =
{
	
};

sampleGame.added = function()
{
	this.player = new Player();
	GameEngine.addObject(this.player);

	this.tileManager = new tileManager();

	this.resourceManager = new ResourceManager();
	
	this.villagerManager = new VillagerManager();
	
	this.cameraController = new CameraController(GameEngine.mainCamera);
	
	this.resources = new ResourceManager();
	
	this.introComplete = false;
};

sampleGame.removed = function()
{
	
};

sampleGame.update = function()
{
	if (this.introComplete)
	{
		this.villagerManager.update();
		this.cameraController.update();
		this.tileManager.update();
		this.resourceManager.update();
	}
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
