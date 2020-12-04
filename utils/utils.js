function getToken(req) {
    const {authorization} = req.headers;

    if (!authorization) {
        return;
    }

    return authorization.split(' ')?.[1];
}

module.exports.getToken = getToken;
