export default {
  fullscreen: {
    name: 'fullscreen',
    regex: new RegExp(`\\/v3\\/\\d+\\/`),
    module: () => import('../module/fullscreen/v3/index'),
  },
};
