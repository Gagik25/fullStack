if (process.env.NODE_ENV === 'production') {
    module.export = require('./keys.prod');
} else {
    module.export = require('./keys.dev');
}
