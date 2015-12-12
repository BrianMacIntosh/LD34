
var Actor = function()
{
	this.maxMovementSpeed = 30;
	this.acceleration = 256;
	this.macheteCooldown = 0.4;
	
	this.currentMacheteCooldown = 0;
	this.queueSwingMachete = false;
	
	this.transform = new THREE.Object3D();
	GameEngine.scene.add(this.transform);
	
	this.velocity = new Vector2();
	this.desiredMovement = new Vector2();
	
	this.timeToNextFrame = 0;
	this.currentFrame = 0;
}

Actor.frameTime = 0.03;

Actor.macheteSounds =
[
	"media/118792__lmbubec__1-knife-slash-a.wav"
];

// multiplier on Y movement to account for the iso camera angle
Actor.yMotionMultiplier = 1 / Math.sqrt(2);

Actor.prototype.update = function()
{
	// cool down machete
	if (this.currentMacheteCooldown > 0)
	{
		this.currentMacheteCooldown -= bmacSdk.deltaSec;
	}
	
	// swing machete if you attempted to do so during the cooldown
	if (this.queueSwingMachete && this.currentMacheteCooldown <= 0)
	{
		this.swingMachete();
	}
	
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
	this.transform.position.y += this.velocity.y * bmacSdk.deltaSec * Actor.yMotionMultiplier;
	
	// restrict in bounds
	//TODO: unify with other collision code?
	this.transform.position.x = Math.clamp(this.transform.position.x, sampleGame.hardWorldBounds[0], sampleGame.hardWorldBounds[2]);
	this.transform.position.y = Math.clamp(this.transform.position.y, sampleGame.hardWorldBounds[1], sampleGame.hardWorldBounds[3]);
	
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

Actor.prototype.swingMachete = function()
{
	if (this.currentMacheteCooldown > 0)
	{
		this.queueSwingMachete = true;
	}
	else
	{
		// execute machete swing
		this.queueSwingMachete = false;
		
		//TODO: stuff!
		AUDIOMANAGER.playSound(Actor.macheteSounds);
		
		this.currentMacheteCooldown = this.macheteCooldown;
	}
}
