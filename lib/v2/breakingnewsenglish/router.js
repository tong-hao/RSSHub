module.exports = function (router) {
    router.get('/:level', require('./parse'));
};
