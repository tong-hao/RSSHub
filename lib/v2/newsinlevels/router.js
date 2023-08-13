module.exports = function (router) {
    router.get('/level1', require('./level1'));
    router.get('/level2', require('./level2'));
    router.get('/level3', require('./level3'));
};
