'use strict'

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');
var Follow = require('../models/follow');

var controller = {

    prueba: (req, res) => {
        res.status(200).send({
            message: "Accion de prueba en el servidor de NoseJS desde controllador Follow"
        });
    },
    saveFollow: (req, res) => {
        var params = req.body;
        var follow = new Follow();
        follow.user = req.user.sub;
        follow.followed = params.followed;

        follow.save((err, followStored) => {

            if (err) {

                return res.status(500).send({
                    status: 'error',
                    message: 'Error al guardar el seguimiento'
                });
            }

            if (!followStored) {

                return res.status(404).send({
                    status: 'error',
                    message: 'El seguimiento no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'success',
                follow: followStored
            });

        });


    },
    deleteFollow: (req, res) => {
        var userId = req.user.sub;
        var followId = req.params.id;

        Follow.find({ 'user': userId, 'followed': followId }).remove(err => {

            if (err) {

                return res.status(500).send({
                    status: 'error',
                    message: 'Error al dejar de seguir'
                });
            }


            return res.status(200).send({
                status: 'success',
                message: 'el follow se ha eliminado'
            });


        });
    },
    getFollowingUsers: (req, res) => {
        var userId = req.user.sub;

        if (req.params.id && req.params.page) {

            userId = req.params.id;

        }

        var page = 1;
        if (req.params.page) {

            page = req.params.page;

        }

        var itemsPerPage = 4;

        Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage, (err, follows, total) => {


            if (err) {

                return res.status(500).send({
                    status: 'error',
                    message: 'Error al listar los seguidores'
                });
            }

            if (follows.length == 0) {

                return res.status(200).send({
                    status: 'error',
                    message: 'No hay seguidores para listar'
                });
            }

            return res.status(200).send({
                status: 'success',
                total: total,
                pages: Math.ceil(total / itemsPerPage),
                follows
            });


        });

    },
    getFollowedUser: (req, res) => {
        var userId = req.user.sub;

        if (req.params.id && req.params.page) {

            userId = req.params.id;

        }

        var page = 1;
        if (req.params.page) {

            page = req.params.page;

        }

        var itemsPerPage = 4;

        Follow.find({ followed: userId }).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {


            if (err) {

                return res.status(500).send({
                    status: 'error',
                    message: 'Error al listar los seguidores'
                });
            }

            if (follows.length == 0) {

                return res.status(200).send({
                    status: 'error',
                    message: 'No Posees seguidores'
                });
            }

            return res.status(200).send({
                status: 'success',
                total: total,
                pages: Math.ceil(total / itemsPerPage),
                follows
            });


        });
    },
    getMyFollows: (req, res) => {
        //devuelve usuarios que sigo

        var userId = req.user.sub;

        Follow.find({ user: userId }).populate('followed').exec((err, follows) => {
            if (err) {

                return res.status(500).send({
                    status: 'error',
                    message: 'Error al listar los seguidores'
                });
            }

            if (follows.length == 0) {

                return res.status(200).send({
                    status: 'error',
                    message: 'No hay seguidores para listar'
                });
            }

            return res.status(200).send({
                status: 'success',
                follows
            });

        });

    },
    getFollowBack: (req, res) => {
        //devuelve usuarios que me 
        var userId = req.user.sub;

        Follow.find({ followed: userId }).populate('user').exec((err, follows) => {
            if (err) {

                return res.status(500).send({
                    status: 'error',
                    message: 'Error al listar los seguidores'
                });
            }

            if (follows.length == 0) {

                return res.status(200).send({
                    status: 'error',
                    message: 'No Posees seguidores'
                });
            }

            return res.status(200).send({
                status: 'success',
                follows
            });

        });

    },

}


module.exports = controller;