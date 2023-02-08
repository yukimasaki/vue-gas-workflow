import scrollHint from 'scroll-hint'
import 'scroll-hint/css/scroll-hint.css'

export const scrollHintHelper = {
  /** テーブルにScrollHintを表示する */
  showScrollHint () {
    const theTable = document.getElementsByTagName('table')[0]
    const parentOfTheTable = theTable.parentElement
    parentOfTheTable.classList.add('js-scrollable')
    new scrollHint(
      '.js-scrollable',
      { i18n: { scrollable: 'スクロールできます'} }
    )
  }
}
