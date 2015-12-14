
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
	
	this.activeParticles = [];
	this.pooledParticles = [];
	this.leafTexture = THREE.ImageUtils.loadTexture("media/vfx_leaf.png");
	this.leafGeo = bmacSdk.GEO.makeSpriteGeo(10,10);
	
	this.tooltipDiv = document.getElementById("helperMessage");
	this.notifyDiv = document.getElementById("notifyMessage");
	this.notificationLifetime = 5;
	this.notificationTimer = 0;
	
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
		this.updateParticles();
	}
	
	if (this.notificationTimer > 0)
	{
		this.notificationTimer -= bmacSdk.deltaSec;
		if (this.notificationTimer <= 0)
		{
			this.notifyDiv.innerHTML = "";
		}
	}
};

sampleGame.updateParticles = function()
{
	for (var c = this.activeParticles.length-1; c >= 0; c--)
	{
		var particle = this.activeParticles[c];
		particle.timer -= bmacSdk.deltaSec;
		particle.mesh.rotation.z += particle.angular * bmacSdk.deltaSec;
		if (particle.stage == 0)
		{
			particle.mesh.position.x += particle.velocityx * bmacSdk.deltaSec;
			particle.mesh.position.y += particle.velocityy * bmacSdk.deltaSec;
			
			if (particle.timer <= 0)
			{
				particle.stage = 1;
				particle.timer = 1;
			}
		}
		else
		{
			particle.mesh.position.y += 25 * bmacSdk.deltaSec;
			
			if (particle.timer <= 0)
			{
				particle.mesh.visible = false;
				this.activeParticles.splice(c, 1);
				this.pooledParticles.push(particle);
			}
		}
	}
}

sampleGame.spawnLeafPlume = function(x, y)
{
	for (var c = 0; c < 6; c++)
	{
		var particle = this.getLeafParticle();
		particle.stage = 0;
		particle.velocityx = (Math.random() - 0.5) * 70;
		particle.velocityy = (Math.random() / 2 + 0.5) * -70;
		particle.angular = Math.PI + Math.PI * Math.random() / 2;
		particle.timer = 0.4;
		particle.mesh.position.set(x + (Math.random()-0.5)*60, y + (Math.random()-0.5)*40, -25);
		particle.mesh.rotation.z = Math.random() * Math.PI * 2;
	}
};

sampleGame.getLeafParticle = function()
{
	var particle;
	if (this.pooledParticles.length > 0)
	{
		particle = this.pooledParticles[0];
		this.pooledParticles.splice(0, 1);
		particle.mesh.visible = true;
	}
	else
	{
		particle = {
			mesh: bmacSdk.GEO.makeSpriteMesh(this.leafTexture, this.leafGeo)
		}
		GameEngine.scene.add(particle.mesh);
	}
	this.activeParticles.push(particle);
	return particle;
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

sampleGame.tooltip = function(key)
{
	var content = "";
	if (key == 'food')
	{
		content = "Villagers eat it for energy.";
	}
	else if (key == 'wood')
	{
		content = "Every 20 builds a house for a new villager.";
	}
	else if (key == 'stone')
	{
		content = "Villagers use it to build roads.";
	}
	else if (key == 'iron')
	{
		content = "Villagers use it to increase machete strength.";
	}
	this.tooltipDiv.innerHTML = content;
}

sampleGame.notify = function(message)
{
	this.notifyDiv.innerHTML = message;
	this.notificationTimer = this.notificationLifetime;
}

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

