// import store from '@/store'
/**
 * copy data to current
 * @param current: contains current scene, camera, control.....
 * @param data: json data
 */
export function copyDataToCurrent(current, data) {
  current.camera = data.camera;
  // current.control = data.control
  current.orbitControls = data.orbitControls;
  current.transformControls = data.transformControls;
  current.dragControls = data.dragControls;
  current.rollOverMesh = data.rollOverMesh;
  current.cubeGeo = data.cubeGeo;
  current.clickGenerateModelList = data.clickGenerateModelList;
  current.operateModelList = data.operateModelList;
  current.scene = data.scene;
  current.data = data;
  // current.control.reset()
  // store.commit('SET_SCENE', current.scene)
}
