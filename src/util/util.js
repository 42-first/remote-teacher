/*
 *
 *
 */

export function setWeixinTitle(title) {
  let $body = document.body;
  document.title = title;

  // hack在微信等webview中无法修改document.title的情况
  let $iframe = createDom('<iframe src="/static/images/favicon.ico"></iframe>');

  $iframe.addEventListener('load', load);
  $body.appendChild($iframe);

  function load(){
    setTimeout(function() {
      $iframe.removeEventListener('load', load);
      $body.removeChild($iframe);
    }, 0);
  }

  function createDom(htmlStr){
    let tmp = document.createElement('div');
    tmp.innerHTML = htmlStr;

    let children = tmp.childNodes;

    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeType ===1 ) {
        return children[i];
      }
    }

    return;
  }

}

