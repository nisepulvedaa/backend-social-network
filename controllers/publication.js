'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');
var fs = require('fs');
var path = require('path');

var controller = {

    probando: (req, res) => {
        res.status(200).send({
            message: "Hola desde el CONTROLADOR DE PUBLICACIONES"
        });
    },
    savePublication: (req, res) => {
        var params = req.body;

        if (!params.text) {
            return res.status(200).send({
                message: 'debes enviar un texto'
            });
        }

        var publication = new Publication();
        publication.text = params.text;
        publication.file = 'null';
        publication.user = req.user.sub;
        publication.created_at = moment().unix();
        publication.save((err, publicationStored) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error al guardar publicación"
                });
            }

            if (!publicationStored) {
                return res.status(404).send({
                    status: 'error',
                    message: "La  publicación no ha sido guardada"
                });
            }

            res.status(200).send({
                status: 'success',
                publication: publicationStored
            });




        });

    },
    getPublications: (req, res) => {
        var page = 1;
        if (req.params.page) {
            page = req.params.page;
        }

        var itemPerPage = 4;

        Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error al devolver el seguimiento"
                });
            }

            var follows_clean = [];

            follows.forEach((follow) => {
                follows_clean.push(follow.followed);
            });

            console.log(follows_clean);
            Publication.find({ user: { "$in": follows_clean } }).sort('-created_at').populate('user').paginate(page, itemPerPage, (err, publications, total) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: "Error al devolver las publicaciones"
                    });
                }

                if (!publications) {
                    return res.status(404).send({
                        status: 'error',
                        message: "No hay publicaciones"
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    total_items: total,
                    page: page,
                    pages: Math.ceil(total / itemPerPage),
                    publications: publications
                });


            });

            //  console.log(follows_clean);

        });
    },
    getPublication: (req, res) => {
        var publicationId = req.params.id;
        Publication.findById(publicationId, (err, publication) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error al devolver las publicaciones"
                });
            }

            if (!publication) {
                return res.status(404).send({
                    status: 'error',
                    message: "No exite la  publicacion"
                });
            }

            return res.status(200).send({
                status: 'success',
                publication: publication
            });
        });
    },
    deletePublication: (req, res) => {
        var publicationId = req.params.id;

        Publication.findOneAndDelete({ 'user': req.user.sub, '_id': publicationId }, (err, publicationRemoved) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error al borrar las publicaciones"
                });
            }

            if (!publicationRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: "No se ha borrado la  publicacion"
                });
            }

            return res.status(200).send({
                status: 'success',
                publication: publicationRemoved
            });


        });
    },
    uploadImage: (req, res) => {
        var publicationId = req.params.id;

        //  console.log(req.files.file.path);

        if (req.files) {
            var file_path = req.files.file.path;

            var file_split = file_path.split('\\');
            //console.log(file_split);

            var file_name = file_split[2];
            ///console.log(file_name);

            var ext_split = file_name.split('\.');
            var file_ext = ext_split[1];
            //console.log(file_ext);

            if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpge' || file_ext == 'gif') {

                Publication.findOne({ 'user': req.user.sub, '_id': publicationId }).exec((err, publication) => {

                    if (err) {

                        return res.status(500).send({
                            status: 'error',
                            message: "Error en la petición"
                        });

                    }


                    if (publication) {

                        //actualizar documento de usuario logueado
                        Publication.findByIdAndUpdate(publicationId, { file: file_name }, { new: true }, (err, publicationUpdated) => {

                            if (err) {

                                return res.status(500).send({
                                    status: 'error',
                                    message: "Error en la petición"
                                });

                            }

                            if (!publicationUpdated) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'No se ha podidoa actualizar la publicación'
                                });
                            }


                            return res.status(200).send({
                                status: 'success',
                                user: publicationUpdated
                            });


                        });

                    } else {
                        return removeFilesUploads(res, file_path, 'Tienes permiso para actualiar esta publicacion');
                    }
                });



            } else {
                //algo que no se ha subido el fichero
                return removeFilesUploads(res, file_path, 'Extencion no valida');
            }


        } else {
            return res.status(404).send({
                status: 'error',
                message: "No se han subido archivos o imagenes"
            });
        }
    },
    getImageFile: (req, res) => {
        var image_file = req.params.imageFile;
        var path_file = './uploads/publications/' + image_file;

        fs.exists(path_file, (exists) => {
            if (exists) {
                res.sendFile(path.resolve(path_file));
            } else {
                res.status(200).send({ message: 'No existe la imagen...' });
            }
        });
    },
}

function removeFilesUploads(res, file_path, vMessage) {
    fs.unlink(file_path, (err) => {
        return res.status(500).send({
            status: 'error',
            message: vMessage
        });
    });
}
module.exports = controller;