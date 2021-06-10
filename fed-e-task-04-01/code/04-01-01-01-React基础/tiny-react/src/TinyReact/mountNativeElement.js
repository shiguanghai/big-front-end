import createDOMElement from "./createDOMElement"
import unmountNode from "./unmountNode"

export default function mountNativeElement(virtualDOM, container, oldDOM) {
  let newElement = createDOMElement(virtualDOM)
  // 将转换之后的DOM对象放置在页面中
  if (oldDOM) {
    container.insertBefore(newElement, oldDOM)
  } else {
    container.appendChild(newElement)
  }
  // 判断旧的DOM对象是否存在 如果存在 删除
  if (oldDOM) {
    unmountNode(oldDOM)
  }

  // 获取类组件实例对象
  let component = virtualDOM.component
  // 如果类组件实例对象存在
  if (component) {
    // 将DOM对象存储在类组件实例对象中
    component.setDOM(newElement)
  }
}
