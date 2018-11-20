/*
	@license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt
	
	Copyright (C) 2018 SabineWren
	https://github.com/SabineWren
	
	GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007
	https://www.gnu.org/licenses/agpl-3.0.html
	
	@license-end
*/
export { GetNextRk4 };
import * as M3 from "./matrices3D.js";
import * as M4 from "./matrices4D.js";

const g = 9.81;
const k = 10.0;
const l_0 = 20.0;
const y = 40.0;
//
const d = 100.0;
const r = 50.0;

//this assumes theta in range [0, pi]
//to enforce that constraint, integration error must
//have less influence than damping term
const getAccel = function(di, vi, m) {
	const cosDi = Math.cos(di);
	const sinDi = Math.sin(di);
	
	const damping = -d * vi;
	const gravity = m * -g * r * cosDi;
	const c = r*r*cosDi*cosDi + r*r*sinDi*sinDi - 2*y*r*sinDi + y*y;
	const spring = k * y * r * cosDi * (1.0 - l_0 / Math.sqrt(c))

	return (damping + gravity + spring) / (m * r * r);
};

const GetNextRk4 = function(di, vi, m, dt) {
	const k1 = getAccel(di, vi, m);//accel at start
	
	const v2 = vi + (dt / 2.0) * k1;
	const d2 = di + (dt / 2.0) * v2;
	const k2 = getAccel(d2, v2, m);//accel in middle
	
	const v3 = vi + (dt / 2.0) * k2;
	const d3 = di + (dt / 2.0) * v3;
	const k3 = getAccel(d3, v3, m);//accel in middle if accel at start was k2
	
	const v4 = vi + dt * k3;
	const d4 = di + dt * v4;
	const k4 = getAccel(d4, v4, m);//accel at end if accel at start was k3
	
	const acceleration = (k1 + (2.0 * k2) + (2.0 * k3) + k4) / 6.0;
	
	const vf = vi + dt * acceleration;
	const df = di + vi * dt + 0.5 * acceleration * dt * dt;
	
	return [df, vf];
};

