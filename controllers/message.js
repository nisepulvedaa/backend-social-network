'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

var controller = {

    probando: (req, res) => {
        res.status(200).send({
            message: "Hola desde el CONTROLADOR DE MESSAGE"
        });
    },
    saveMessage: (req, res) => {
        var params = req.body;

        if (!params.text || !params.receiver) {
            res.status(500).send({
                status: "Error",
                message: "Envia los datos necesario"
            });
        }

        var message = new Message();
        message.emitter = req.user.sub;
        message.receiver = params.receiver;
        message.text = params.text;
        message.created_at = moment().unix();
        message.viewed = 'False';

        message.save((err, messageStored) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: "Error en la Petición"
                });
            }

            if (!messageStored) {
                return res.status(500).send({
                    status: "Error",
                    message: "Error en al enviar el mensaje"
                });
            }

            return res.status(200).send({
                status: "success",
                messageStored
            });

        });



    },
    getReceivedMessages: (req, res) => {

        var userId = req.user.sub;
        var page = 1;
        if (req.params.page) {
            page = req.params.page;
        }

        var itemsPerPage = 4;

        Message.find({ receiver: userId }).populate('emitter', 'name surname _id image nick').paginate(page, itemsPerPage, (err, messages, total) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: "Error en la Petición"
                });
            }

            if (messages.length == 0) {
                return res.status(404).send({
                    status: "Error",
                    message: "No hay Mensajes para mostrar"
                });
            }

            return res.status(200).send({
                status: "success",
                total: total,
                pages: Math.ceil(total / itemsPerPage),
                messages
            });


        });

    },
    getEmittedMessages: (req, res) => {

        var userId = req.user.sub;
        var page = 1;
        if (req.params.page) {
            page = req.params.page;
        }

        var itemsPerPage = 4;

        Message.find({ emitter: userId }).populate('emitter receiver', 'name surname _id image nick').paginate(page, itemsPerPage, (err, messages, total) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: "Error en la Petición"
                });
            }

            if (messages.length == 0) {
                return res.status(404).send({
                    status: "Error",
                    message: "No hay Mensajes para mostrar"
                });
            }

            return res.status(200).send({
                status: "success",
                total: total,
                pages: Math.ceil(total / itemsPerPage),
                messages
            });


        });

    },
    getUnviewedMessages: (req, res) => {
        var userId = req.user.sub;

        Message.count({ receiver: userId, viewed: 'False' }).exec((err, count) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: "Error en la Petición"
                });
            }

            return res.status(200).send({
                status: "success",
                unviewed: count
            });
        });

    },
    setViewedMessages: (req, res) => {
        var userId = req.user.sub;

        Message.update({ receiver: userId, viewed: 'False' }, { viewed: 'True' }, { 'multi': true }, (err, messageUpdated) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: "Error en la Petición"
                });
            }

            if (messageUpdated.length == 0) {
                return res.status(404).send({
                    status: "Error",
                    message: "No hay Mensajes para actualizar"
                });
            }

            return res.status(200).send({
                status: "success",
                messageUpdated
            });


        });




    },

}

module.exports = controller;