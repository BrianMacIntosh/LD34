
var Actor = function()
{
	this.transform = new THREE.Object3D();
	GameEngine.scene.add(this.transform);
	this.maxMovementSpeed = 30;
	this.acceleration = 256;
	this.velocity = new Vector2();
	this.desiredMovement = new Vector2();
	
	this.timeToNextFrame = 0;
	this.currentFrame = 0;
}

Actor.frameTime = 0.03;

Actor.prototype.update = function()
{
	if (this.desiredMovement.x !== 0)
	{
		// accelerate
		this.velocity.x += this.desiredMovement.x * this.acceleration * bmacSdk.deltaSec;
		this.velocity.x = Math.clamp(this.velocity.x, -this.maxMovementSpeed, this.maxMovementSpeed);
	}
	else if (this.velocity.x !== 0)
	{
		// decelerate to 0
		var oldSig = Math.sign(this.velocity.x);
		this.velocity.x -= oldSig * this.acceleration * bmacSdk.deltaSec;
		if (Math.sign(this.velocity.x) !== oldSig)
		{
			this.velocity.x = 0;
		}
	}
	
	if (this.desiredMovement.y !== 0)
	{
		// accelerate
		this.velocity.y += this.desiredMovement.y * this.acceleration * bmacSdk.deltaSec;
		this.velocity.y = Math.clamp(this.velocity.y, -this.maxMovementSpeed, this.maxMovementSpeed);
	}
	else if (this.velocity.y !== 0)
	{
		// decelerate to 0
		var oldSig = Math.sign(this.velocity.y);
		this.velocity.y -= oldSig * this.acceleration * bmacSdk.deltaSec;
		if (Math.sign(this.velocity.y) !== oldSig)
		{
			this.velocity.y = 0;
		}
	}
	
	// move based on the desired movement
	this.transform.position.x += this.velocity.x * bmacSdk.deltaSec;
	this.transform.position.y += this.velocity.y * bmacSdk.deltaSec;
	
	// reset desired movement
	this.desiredMovement.x = this.desiredMovement.y = 0;
	
	// determine walk direction
	var direction = 0;
	if (Math.abs(this.velocity.x) > Math.abs(this.velocity.y))
	{
		if (this.velocity.x < 0)
			direction = 3;
		else
			direction = 1;
	}
	else
	{
		if (this.velocity.y < 0)
			direction = 0;
		else
			direction = 2;
	}
	
	// advance walk animation
	if (this.velocity.x !== 0 || this.velocity.y !== 0)
	{
		this.timeToNextFrame -= bmacSdk.deltaSec;
		if (this.timeToNextFrame <= 0)
		{
			this.timeToNextFrame = Actor.frameTime;
			this.currentFrame++;
			while (this.currentFrame >= 24) this.currentFrame -= 24;
			
			if (this.geometry)
			{
				bmacSdk.GEO.setTilesheetGeometry(this.geometry, this.currentFrame, direction, 24, 4);
			}
		}
	}
}
