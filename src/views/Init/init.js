import * as THREE from 'three'
import {createRenderer, createLabelRenderer} from './renderer'
import {createCamera} from './camera'
import {createLight} from './light'
import {initOrbitControls} from './controls'
import {copyDataToCurrent} from "../Common/copyToCurrent";

function initRenderer(renderers, dom) {
    renderers.renderer = createRenderer(dom)
    renderers.labelRenderer = createLabelRenderer(dom)
}

function initScene(data) {
    data.scene = new THREE.Scene()
}

function initCamera(data) {
    data.camera = createCamera(0,5,5)
}

function initControl(renderers, data) {
    data.orbitControls = initOrbitControls(renderers.labelRenderer, data.camera)
}

function initLight(data) {
    createLight(data.scene)
}

export function initAll(renderers, data, dom, current) {
    initRenderer(renderers, dom)
    initScene(data)
    initCamera(data)
    initControl(renderers, data)
    initLight(data)
    copyDataToCurrent(current, data)
}