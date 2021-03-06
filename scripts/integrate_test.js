//falling object with air resistance;
const getExpectValue = function(t) {
	const g = 9.81;
	const k = 0.1;
	const m = 1.0;
	
	const coef = m / k
	const inner = t + coef * Math.exp(-k * t / m) - coef;
	return coef * g * inner;
};

//TODO
const getAccel = function(d) {
	return a;
};

const rk4 = function(d, v, dt) {
	const k1 = getAccel(d);//accel at start
	
	const v2 = v + (dt / 2.0) * k1;
	const d2 = d + (dt / 2.0) * v2;
	const k2 = getAccel(d2);//accel in middle
	
	const v3 = v + (dt / 2.0) * k2;
	const d3 = d + (dt / 2.0) * v3;
	const k3 = getAccel(d3);//accel in middle if accel at start was k2
	
	const v4 = v + dt * k3;
	const d4 = d + dt * v4;
	const k4 = getAccel(d4);//accel at end if accel at start was k3
	
	const acceleration = (k1 + (2.0 * k2) + (2.0 * k3) + k4) / 6.0;
	
	const vFinal = v + dt * acceleration;
	const dFinal = d + v * dt + 0.5 * acceleration * dt * dt;
	
	return [dFinal, vFinal];
};


const midpointEuler = function(d, v, dt) {
	const accel = getAccel(d);
	const vFinal = v + accel * dt;
	const vAvg = (v + vFinal) / 2.0;
	const dFinal = d + vAvg * dt;
	return [dFinal, vFinal];
};

const dt = Math.PI / 32;
let d1 = 0.0, d2 = 0.0;
let v1 = 0.0, v2 = 0.0;
let t = 0.0;
let expect = 0.0;
for(; t < 10 * Math.PI; t = t + dt) {
	[d1, v1] = rk4(d1, v1, dt);
	[d2, v2] = midpointEuler(d2, v2, dt);
}
expect = getExpectValue(t);
console.log("RK4 err: " + (d1 - expect));
console.log("Eul err: " + (d2 - expect));
for(; t < 20; t = t + dt) {
	[d1, v1] = rk4(d1, v1, dt);
	[d2, v2] = midpointEuler(d2, v2, dt);
}
expect = getExpectValue(t);
console.log("RK4 err: " + (d1 - expect));
console.log("Eul err: " + (d2 - expect));
for(; t < 30 * Math.PI; t = t + dt) {
	[d1, v1] = rk4(d1, v1, dt);
	[d2, v2] = midpointEuler(d2, v2, dt);
}
expect = getExpectValue(t);
console.log("RK4 err: " + (d1 - expect));
console.log("Eul err: " + (d2 - expect));

