
GameEngine = new bmacSdk.Engine("canvasDiv");

sampleGame =
{
	
};

sampleGame.added = function()
{
	this.halfScreenDiag = Math.sqrt(GameEngine.screenWidth*GameEngine.screenWidth + GameEngine.screenHeight*GameEngine.screenHeight)/2;
	
	this.player = new Player();
	GameEngine.addObject(this.player);

	this.tileManager = new tileManager();

	this.resourceManager = new ResourceManager();
	
	this.villagerManager = new VillagerManager();
	
	this.cameraController = new CameraController(GameEngine.mainCamera);
	
	this.resources = new ResourceManager();
	
	this.introComplete = false;
	
	// muzak
	this.music = new Audio("media/ngxmusicalngx_astrangedream.mp3");
	this.music.loop = true;
	this.music.play();
	
	this.soundVolume=1;
	//TEMP:ship with 0.6
	this.music.volume=0;
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

sampleGame.playSoundFallOff = function(sound, vol, pos)
{
	var dx = pos.x - this.player.transform.position.x;
	var dy = pos.y - this.player.transform.position.y;
	var dist = Math.sqrt(dx*dx-dy*dy);
	if (dist < this.halfScreenDiag)
	{
		var diff = dist/this.halfScreenDiag;
		AUDIOMANAGER.playSound(sound, this.soundVolume * vol * (1-(diff*diff)));
	}
};

sampleGame.updateVolume = function()
{
	var music = document.getElementById("musicMute");
	this.music.volume = !music.checked ? 0.6 : 0;
	
	var sound = document.getElementById("soundMute");
	this.soundVolume = !sound.checked ? 1 : 0;
};

GameEngine.addObject(sampleGame);
