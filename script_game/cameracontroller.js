
var CameraController = function(camera)
{
	this.camera = camera;
}

CameraController.prototype.update = function()
{
	var halfWidth = GameEngine.screenWidth / 2;
	var halfHeight = GameEngine.screenHeight / 2;
	
	this.camera.position.x = sampleGame.player.transform.position.x - halfWidth;
	this.camera.position.y = sampleGame.player.transform.position.y - halfHeight;
	
	this.camera.position.x = Math.clamp(this.camera.position.x,
		sampleGame.hardWorldBounds[0], sampleGame.hardWorldBounds[2] - GameEngine.screenWidth);
	this.camera.position.y = Math.clamp(this.camera.position.y,
		sampleGame.hardWorldBounds[1], sampleGame.hardWorldBounds[3] - GameEngine.screenHeight);
}
