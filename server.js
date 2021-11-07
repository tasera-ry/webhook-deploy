const http = require('http')
const { Webhooks, createNodeMiddleware } = require('@octokit/webhooks');
const config = require('./config.js');
const deploy = require('./deploy');
const webhooks = new Webhooks({
    secret: config.secret,
})

webhooks.onAny(async ({id, name, payload}) => {
    if(name === 'create' && config.development) {
        if(payload.ref_type === 'tag' && RegExp('^dev-').test(payload.ref)) {
            return deploy.getDevelopmentFiles(payload.repository.clone_url, payload.ref);
        }
    }
    if(config.production && name === "release" && payload.action === 'released') {
        return deploy.getReleaseFiles(payload.release.tarball_url, payload.release.name);
    }
});

module.exports = http.createServer(createNodeMiddleware(webhooks, {path: "/"}))