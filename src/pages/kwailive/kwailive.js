import KwaiPlayerKernelExternal from '@/util/kwai-player-v1.0.0'


window.KwaiPlayerKernelExternal = KwaiPlayerKernelExternal;


// function initKernel(type) {
//     let kernel = new KwaiPlayerKernelExternal({
//         box: type || 'flv',
//         isLive: false,
//         debug: true,
//         logEnv: 'development',
//         logBaseConfig: { product_name: 'test' }
//     });
//     kernel.attachMedia(player);
//     kernel.on('error', function (e) {
//         log(JSON.stringify(e));
//     });

//     window.kernel = kernel;
// }


// initKernel();
