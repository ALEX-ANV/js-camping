const formidable = require('formidable');
const form = formidable({ multiples: true });

async function formData(req, res, next) {
    try {
        form.parse(req, (err, fields, files) => {
            if (err) {
                res.status(400).send({error: err.message});
                return;
            }
            const data = {fields, files};
            req.body = {
                ...req.body,
                ...data.fields
            };
            req.files = data.files;

            next();
        });
    } catch (e) {
        res.status(400).send({error: e.message});
    }
}

module.exports = formData;
