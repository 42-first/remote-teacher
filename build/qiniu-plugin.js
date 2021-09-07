/**
 * 静态资源上传到七牛插件
 * @type {[type]}
 */


const path = require('path');
const ora = require('ora');
const qiniu = require('qiniu');


// Uploading progress tip
const tip = (uploaded, failed, total, retrying) => {
  let percentage = Math.round(uploaded / total * 100);
  let msg = retrying ? 'Retrying failed files:' : 'Uploading to Qiniu CDN:';
  return `${msg} ${percentage}% ${uploaded}/${total} files uploaded, ${failed} files failed`;
};


module.exports = class QiniuPlugin {
  constructor(options) {
    if (
      !options ||
      !options.publicPath ||
      !options.accessKey ||
      !options.secretKey ||
      !options.bucket ||
      !options.zone
    ) {
      throw new Error('参数没有传递完全！');
    }

    // 保存用户传参
    this.options = options;
    // 创建的七牛认证信息
    this.qiniuAuth = {};
    // 鉴权
    this.qiniuAuth.mac = new qiniu.auth.digest.Mac(
      options.accessKey,
      options.secretKey
    );

    // 创建上传token
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: options.bucket
    });
    this.qiniuAuth.uploadToken = putPolicy.uploadToken(
      this.qiniuAuth.mac
    );

    let config = new qiniu.conf.Config();
    // 存储空间对应的机房
    config.zone = qiniu.zone[options.zone];
    config.useHttpsDomain = true;
    config.useCdnDomain = true;
    this.qiniuConfig = config;
    this.qiniuAuth.formUploader = new qiniu.form_up.FormUploader(
      config
    );
  }

  apply(compiler) {
    const uploadFiles = (compilation, callback) => {
      let hash = compilation.hash;
      let assets = compilation.assets;

      console.log('hash:', hash);


      // 七牛上传配置
      let batch = this.options.batch || 20;
      let maxRetryTimes = this.options.maxRetryTimes || 3;
      let mac = this.qiniuAuth.mac;
      let qiniuConfig = this.qiniuConfig;
      let bucket = this.options.bucket;
      // 增加域
      let uploadPath = this.options.assetsSubDirectory || 'static/lesson';

      let filesNames = Object.keys(assets);
      let totalFiles = 0;
      let uploadedFiles = 0;
      let retryFiles = [];
      let retryFilesCountDown = 0;

      // if(filesNames && filesNames.length) {
      //   filesNames.map((name, index)=>{
      //     if(index < 3) {
      //       console.log(name, ':', assets[name]);
      //     }
      //   })
      // }

      // Mark finished
      let _finish = (err) => {
        spinner.succeed();
        // eslint-disable-next-line no-console
        console.log('\n');

        if(typeof callback === 'function') {
          callback(err);
        }
      };

      // Filter files that should be uploaded to Qiniu CDN
      filesNames = filesNames.filter(fileName => {
        let file = assets[fileName] || {};

        // Ignore unemitted files
        if (!file.emitted) return false;

        // Check excluced files 排除.map文件
        if (/\.map$/gi.test(fileName)) return false;

        // 编辑器文件目录不部署七牛
        if (/ueditor\//gi.test(fileName)) return false;

        return true;
      });

      // 上传文件的数量
      if(filesNames.length) {
        totalFiles = filesNames.length;
      }

      console.log('\n');
      let spinner = ora({
        text: tip(0, retryFiles.length, totalFiles, false),
        color: 'green'
      }).start();


      // Perform upload to qiniu
      const performUpload = (fileName, retrying) => {
        let file = assets[fileName] || {};
        let key = path.posix.join(uploadPath, fileName);
        let putPolicy = new qiniu.rs.PutPolicy({ scope: bucket + ':' + key });
        let uploadToken = putPolicy.uploadToken(mac);
        let formUploader = this.qiniuAuth.formUploader;
        let putExtra = new qiniu.form_up.PutExtra();

        return new Promise((resolve) => {
          let begin = Date.now();

          // 文件上传
          let filePath = `${this.options.publicPath}${key}`;
          const spinnerFile = ora(`上传文件${filePath}...`).start();

          formUploader.putFile(
            uploadToken,
            key,
            file.existsAt,
            putExtra,
            (err, body, res) => {
              if (err) {
                console.log(`Upload file ${fileName} failed: ${err.message || err.name || err.stack}`);
                if (!~retryFiles.indexOf(fileName)) {
                  retryFiles.push(fileName);
                }
              } else {
                uploadedFiles++;
              }

              if(body) {
                body.duration = Date.now() - begin;
              }

              if (res.statusCode == 200) {
                resolve(body);
                spinnerFile.succeed(`文件：${filePath}，上传成功！`);
              } else {
                if ( res.status === 614 || res.statusCode === 614) {
                  if(this.qiniuConfig.cover) {
                    spinnerFile.fail(`文件：${filePath}，已存在，尝试覆盖上传！`);
                    if (!~retryFiles.indexOf(fileName)) {
                      retryFiles.push(fileName);
                    }

                    resolve(body);
                  } else {
                    spinnerFile.fail(`文件：${key}，已存在！`);
                    reject(body);
                  }
                } else {
                  // 失败重新上传1次
                  if (order && +order >= 1) {
                    spinnerFile.fail(`文件：${key}，上传失败！`);
                    reject(body);
                  } else {
                    spinnerFile.fail(`文件：${key}，上传失败！重新上传..`);
                    if (!~retryFiles.indexOf(fileName)) {
                      retryFiles.push(fileName);
                    }

                    resolve(body);
                  }
                }
              }

              // 上传进度
              spinner.text = tip(uploadedFiles, retryFiles.length, totalFiles, retrying);
            });
        });
      };

      // Retry all failed files one by one
      const retryFailedFiles = function(err) {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('\n');
          return Promise.reject(err);
        }

        if (retryFilesCountDown < 0) retryFilesCountDown = 0;

        // Get batch files
        let _files = retryFiles.splice(
          0,
          batch <= retryFilesCountDown ? batch : retryFilesCountDown
        );
        retryFilesCountDown = retryFilesCountDown - _files.length;


        if (_files.length) {
          return Promise.all(
            _files.map(file => performUpload(file, true))
          ).then(() => retryFailedFiles(), retryFailedFiles);
        } else {
          if (retryFiles.length) {
            return Promise.reject(new Error('File uploaded failed'));
          } else {
            return Promise.resolve();
          }
        }
      };

      // Execute stack according to `batch` option
      const execStack = function(err) {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('\n');
          return Promise.reject(err);
        }

        // Get batch files
        let _files = filesNames.splice(0, batch);

        if (_files.length) {
          return Promise.all(
            _files.map(file => performUpload(file, false))
          ).then(() => execStack(), execStack);
        } else {
          return Promise.resolve();
        }
      };

      execStack().then(() => {
        retryFilesCountDown = retryFiles.length * maxRetryTimes;
        return retryFailedFiles();
      }).then(() => _finish(), _finish);
    };

    // For webpack >= 4
    if (compiler.hooks) {
      compiler.hooks.compilation.tap('QiniuPlugin', compilation => {
        // compilation.outputOptions.publicPath = this.options.publicPath;
        // this.absolutePath = compilation.outputOptions.path;
      });

      // compiler.hooks.done.tapAsync('QiniuPlugin', uploadFiles);
      compiler.hooks.afterEmit.tapAsync('QiniuPlugin', uploadFiles);
    } else {
      // For webpack < 4
      compiler.plugin('compilation', (compilation) => {
        // console.log('The compiler is starting a new compilation...');
        // compilation.outputOptions.publicPath = this.options.publicPath;
      });

      compiler.plugin('after-emit', uploadFiles);
    }
  }
};

