/**
 * 监听事件绑定
 * @param {Object} dom 要绑定监听事件的dom对象
 * @param {String} type 事件类型
 * @param {Function} fn 事件函数
 * @param {*} parms 事件函数参数
 * @param {Boolean} capture 是否是事件捕获(默认为事件冒泡)
 */
const addEvent = (dom, type, fn, parms, capture = false) => {
    dom['e' + type + fn] = dom['e' + type + fn] || null
    if (!dom['e' + type + fn]) {
        dom['e' + type + fn] = event => {
            let e = event || window.event
            e.parms = parms || {}
            fn.call(dom, e)
        }
    }
    dom.addEventListener(type, dom['e' + type + fn], capture)
}
/**
 * 监听事件移除
 * @param {Object} dom 要绑定监听事件的dom对象
 * @param {String} type 事件类型
 * @param {Function} fn 事件函数
 * @param {Boolean} capture 是否是事件捕获(需要和绑定事件capture一致，默认为事件冒泡)
 */
const removeEvent = (dom, type, fn, capture = false) => {
    dom.removeEventListener(type, dom['e' + type + fn], capture);
}

export {addEvent, removeEvent}