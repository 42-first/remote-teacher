/*
 *
 *
 */

export default {
  getFileSize (url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    // xhr.onload = response;

    xhr.send();
  }
}
