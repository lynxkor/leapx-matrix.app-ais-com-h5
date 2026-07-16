import safeHtml from './safeHtml'

/**
 * 注册全局指令
 * @param {import('vue').App} app
 */
export const setupDirectives = (app) => {
  app.directive(safeHtml.name, safeHtml.directive)
}

export default setupDirectives
