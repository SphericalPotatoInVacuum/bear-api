const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const router = express.Router();

const Bear = mongoose.model('Bear', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, 'Name is too short'],
        maxlength: [32, 'Name is too long']
    },
    type: {
        type: String,
        required: true,
        minlength: [3, 'Type is too short'],
        maxlength: [32, 'Type is too long']
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: validateDate
    }
}));

function validateDate(date) {
    return new Promise((resolve) => {
        now = new Date();
        resolve(now.getTime() >= date.getTime());
    });
};

router.get('/', async (req, res) => {
    const bears = await Bear.find().sort('name');
    res.send(bears);
});

router.get('/:id', async (req, res) => {
    const bear = await Bear.findById(req.params.id);
    if (bear) {
        res.send(bear);
    } else {
        res.status(404);
        res.send("There is no bear with such id");
    }
});

router.post('/', async (req, res) => {

    const { error } = validateBear(req.body);

    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    let bear;
    try {
        bear = new Bear({
            name: req.body.name,
            type: req.body.type,
            dateOfBirth: Date.parse(req.body.dateOfBirth)
        });
    } catch (ex) {
        res.status(400).send(ex);
        return;
    }

    let fail = false;
    await bear.validate((err) => {
        if (err) {
            console.error("Error: ", err.message);
            fail = true;
        }
    });
    if (!fail) {
        bear = await bear.save();
        res.status(201).send(bear);
    } else {
        res.status(500).send("Bear object validation failed");
    }
});

router.patch('/:id', async (req, res) => {
    const bear = await Bear.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (bear) {
        res.send(bear);
    } else {
        res.status(404).send("There is no bear with such id");
    }
});

router.delete('/:id', async (req, res) => {
    const bear = await Bear.findByIdAndDelete(req.params.id);
    if (bear) {
        res.send(bear);
    } else {
        res.status(404).send("There is no bear with such id");
    }
});

function validateBear(bear) {
    const schema = {
        name: Joi.string().min(3).max(32).required(),
        type: Joi.string().min(3).max(32).required(),
        dateOfBirth: Joi.date().max(Date.now()).required(true)
    }

    return Joi.validate(bear, schema);
}

module.exports = router;