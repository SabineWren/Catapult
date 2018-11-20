/*
	@license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt
	
	Copyright (C) 2018 SabineWren
	https://github.com/SabineWren
	
	GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007
	https://www.gnu.org/licenses/agpl-3.0.html
	
	@license-end
*/
import * as Create from "../shaders/create.js";
import { Draw } from "./renderLoop.js";
import { FetchText } from "./fetch.js";
import * as Input from "./input.js";
import * as Loader from "../node_modules/webgl-obj-loader/src/index.js";
import * as M3 from "./matrices3D.js";
import * as M4 from "./matrices4D.js";
import * as Physics from "./physics.js";
import { ResizeCanvas } from "./resize.js";
import { ShaderSourceVertex } from "../shaders/vertex.js";
import { ShaderSourceFragment } from "../shaders/frag.js";
import { State } from "./state.js";

const root = "/a3/";
State.canvas = document.getElementById("c");
State.gl = State.canvas.getContext("webgl2");
const gl = State.gl;
if (!gl) { alert("webgl2 is not supported by your device") }
//allow right click for camera control
State.canvas.oncontextmenu = function(event) {
	event.preventDefault();
	return false;
};

window.onload = async function() {
	const sphereStr = await FetchText(new Error(), root + "models/sphere.obj");
	const mesh = new Loader.Mesh(sphereStr);
	
	const getDefaultModels = function() {
		return [
			{
				id: "bucket",
				matrix: M4.GetIdentity(),
				mesh: mesh,
			},
			{
				id: "projectile",
				matrix: M4.GetIdentity(),
				mesh: mesh,
			},
		];
	};
	
	let models = getDefaultModels();
	
	const shaderVertex   = Create.Shader(gl, gl.VERTEX_SHADER,   ShaderSourceVertex);
	const shaderFragment = Create.Shader(gl, gl.FRAGMENT_SHADER, ShaderSourceFragment);

	const program = Create.Program(gl, shaderVertex, shaderFragment);

	Loader.initMeshBuffers(gl, mesh);

	const locations = Object.freeze({
		model: gl.getUniformLocation(program, "model"),
		normal: gl.getAttribLocation(program, "in_normal"),
		position: gl.getAttribLocation(program, "in_position"),
		proj: gl.getUniformLocation(program, "proj"),
		texture: gl.getAttribLocation(program, "in_texture"),
		view: gl.getUniformLocation(program, "view")
	});
	Object.keys(locations).forEach(function(key, index) {
		if(locations[key] === -1) { console.log(key + ": " + locations[key]); }
	});

	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	//texture
	//TODO

	//lighting here??
	//TODO

	document.onkeydown   = Input.HandleKeyDown;
	document.onkeyup     = Input.HandleKeyUp;
	document.onmousedown = Input.HandleMouseDown;
	document.onmousemove = Input.HandleMouseMove;
	document.onmouseup   = Input.HandleMouseUp;
	
	document.getElementById("restart").onclick = function(e) {
		State.properties.releaseAngle = document
			.getElementById("release-angle").value * Math.PI / 180.0;
		models = getDefaultModels();
		State.angular.displacement = 0.0;
		State.angular.velocity = 0.0;
		State.angular.isReleased = false;
	};

	const render = function() {
		ResizeCanvas(State);
		Input.UpdateViewMat();
		models[0].matrix = M4.GetIdentity()
			.Scale(0.08, 0.08, 0.08)
			.Translate(50.0, 0.0, -5.0)
			.RotateZ(State.angular.displacement),
		Draw(locations, models, program, State);
		window.requestAnimationFrame(render);
	}
	render();
	setInterval(function() {
		const di = State.angular.displacement;
		const vi = State.angular.velocity;
		const step = 0.005;
		
		let m = 0.0;
		if(State.angular.isReleased) {
			m = State.properties.massBucket;
			const px = State.projVelocityX * step;
			const py = State.projVelocityY * step;
			models[1].matrix = models[1].matrix.Translate(px, py, 0.0);
		} else {
			if(di > State.properties.releaseAngle) {
				State.angular.isReleased = true;
				State.projVelocityX = -State.angular.velocity * 50.0 * Math.sin(di);
				State.projVelocityY = di > Math.PI / 2 ? -1.0 : 1.0;
				State.projVelocityY *= State.angular.velocity * 50.0 * Math.cos(di);
			}
			
			m = State.properties.massBucket + State.properties.massProjectile;
			models[1].matrix = models[0].matrix.Translate(0.0, 0.0, 0.0);//copy using no-op
		}

		[State.angular.displacement, State.angular.velocity] = Physics.GetNextRk4(di, vi, m, step);
	}, 0);
}();

