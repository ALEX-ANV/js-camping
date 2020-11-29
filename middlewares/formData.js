const formidable = require('formidable');
const form = formidable({ multiples: true });

async function formData(req, res, next) {
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.sendStatus(400);
            return;
        }
        const data = { fields, files };
        req.body = {
            ...req.body,
            ...data.fields
        };
        req.files = data.files;

        next();
    });
}

module.exports = formData;
