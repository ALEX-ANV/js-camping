const formidable = require('formidable');
const form = formidable({ multiples: true });

async function formData(req, res, next) {
    const data = await new Promise((res, rej) => form.parse(req, (err, fields, files) => {
        if (err) {
            rej(err);
            return;
        }
        res({ fields, files });
    }));

    req.body = {
        ...req.body,
        ...data.fields
    };
    req.files = data.files;

    next();
}

module.exports = formData;
