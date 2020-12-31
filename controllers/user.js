'use strict'

var validator = require('validator');
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
const user = require('../models/user');


var controller = {
    home: (req, res) => {
        res.status(200).send({
            message: "Hola mundo desde mi Backend creado con NoseJS"
        });
    },

    pruebas: (req, res) => {
        res.status(200).send({
            message: "Accion de prueba en el servidor de NoseJS desde controllador User"
        });
    },
    save: (req, res) => {

        var params = req.body;

        User.find({
            $or: [{ email: params.email.toLowerCase() }, { nick: params.nick.toLowerCase() }]
        }).exec((err, users) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la peticion de usuario!!!"
                });
            }

            if (users && users.length >= 1) {
                return res.status(500).send({

                    status: 'error',
                    message: "El usuario que intentas registar ya existe!!"
                });

            }


            if (users.length == 0) {
                var user = new User();
                try {
                    var validate_name = !validator.isEmpty(params.name);
                    var validate_surname = !validator.isEmpty(params.surname);
                    var validate_nick = !validator.isEmpty(params.nick);
                    var validate_email = !validator.isEmpty(params.email);
                    var validate_password = !validator.isEmpty(params.password);
                } catch (err) {
                    return res.status(200).send({
                        status: 'error',
                        message: "Faltan datos por enviar !!!"
                    });
                }

                if (validate_name && validate_surname && validate_nick && validate_email && validate_password) {

                    user.name = params.name;
                    user.surname = params.surname;
                    user.nick = params.nick;
                    user.email = params.email;
                    user.role = 'ROLE_USER';
                    user.image = null;


                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;
                        //guardar el articulo,
                        user.save((err, userStored) => {
                            if (err || !userStored) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: "El usuario no se ha guardado!!!"
                                });
                            } else {

                                res.status(200).send({
                                    status: 'success',
                                    user: userStored
                                });

                            }
                        });

                    });



                } else {
                    return res.status(200).send({
                        status: 'error',
                        message: "Los datos no son validos!!!"
                    });
                }



            }

        });





    },
    login: (req, res) => {
        var params = req.body;

        var email = params.email;
        var password = params.password;

        User.findOne({ email: email }, (err, user) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }
            //console.log(user);
            if (user) {
                bcrypt.compare(password, user.password, (err, check) => {

                    if (check) {

                        if (params.getToken) {
                            //devolver token
                            //generar el token

                            return res.status(200).send({
                                token: jwt.createToken(user),
                                status: 'success'
                            });


                        } else {
                            //devolver datos del usuario
                            user.password = undefined;
                            return res.status(200).send({
                                status: 'success',
                                user
                            });
                        }



                    } else {

                        return res.status(404).send({
                            status: 'error',
                            message: 'El usuario no se ha podido identificar'
                        });

                    }

                });

            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'El usuario  no existe!!'
                });
            }
        });

    },
    getUser: (req, res) => {
        var userId = req.params.id;
        User.findById(userId, (err, user) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la peticion de usuario!!!"
                });
            }

            if (!user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El usuario no Encontrado'
                });
            }


            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error al comprobar el seguimiento"
                });
            }

            // Follow.findOne({ 'user': req.user.sub, 'followed': userId }).exec((err, follow) => {
            followThisUser(req.user.sub, userId).then((value) => {
                user.password = undefined;
                return res.status(200).send({
                    status: 'success',
                    user,
                    following: value.following,
                    followed: value.followed
                });

            });



            //  });





        });
    },
    getUsers: (req, res) => {
        var identity_user_id = req.user.sub;
        var page = 1;
        if (req.params.page) {

            page = req.params.page;

        }
        var itemsPerPage = 5;
        User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la peticion de usuario!!!"
                });
            }

            if (!users) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios disponibles'
                });
            }

            followUserIds(identity_user_id).then((value) => {

                return res.status(200).send({
                    status: 'success',
                    users,
                    users_following: value.following,
                    users_follow_me: value.followed,
                    total,
                    pages: Math.ceil(total / itemsPerPage)
                });

            });



        });

    },
    updateUser: (req, res) => {
        var userId = req.params.id;
        var update = req.body;

        //borrar propiedad password
        delete update.password;

        if (userId != req.user.sub) {
            return res.status(500).send({
                status: 'error',
                message: "no Tienes permiso para actualizar los datos del usuario!"
            });
        }

        User.find({
            $or: [{ email: update.email.toLowerCase() }, { nick: update.nick.toLowerCase() }]
        }).exec((err, usersFind) => {
            // console.log(usersFind);
            //console.log(usersFind.length);

            if (usersFind.length == 1) {

                User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {

                    if (err) {

                        return res.status(500).send({
                            status: 'error',
                            message: "Error en la petición"
                        });

                    }

                    if (!userUpdated) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'No se ha podidoa actualizar el usuario'
                        });
                    }


                    return res.status(200).send({
                        status: 'success',
                        user: userUpdated
                    });

                });


            } else {

                usersFind.forEach((userFind) => {
                    //  console.log(userFind);

                    if (userFind && userFind._id != userId) {
                        return res.status(500).send({
                            status: 'error',
                            message: "Los datos ingresados ya están en uso , intentaa con otro email o nickname!!"

                        });
                    }

                });


            }



        });


    },
    uploadImage: (req, res) => {
        var userId = req.params.id;



        if (req.files) {
            var file_path = req.files.image.path;
            // console.log(file_path);
            var file_split = file_path.split('\\');
            //console.log(file_split);

            var file_name = file_split[2];
            ///console.log(file_name);

            var ext_split = file_name.split('\.');
            var file_ext = ext_split[1];
            //  console.log(file_ext);

            if (userId != req.user.sub) {
                return removeFilesUploads(res, file_path, 'no Tienes permiso para actualizar los datos del usuario');
            }


            if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpge' || file_ext == 'gif') {
                //actualizar documento de usuario logueado
                User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {

                    if (err) {

                        return res.status(500).send({
                            status: 'error',
                            message: "Error en la petición"
                        });

                    }

                    if (!userUpdated) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'No se ha podidoa actualizar el usuario'
                        });
                    }


                    return res.status(200).send({
                        status: 'success',
                        user: userUpdated
                    });


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
        var path_file = './uploads/users/' + image_file;

        fs.exists(path_file, (exists) => {
            if (exists) {
                res.sendFile(path.resolve(path_file));
            } else {
                res.status(200).send({ message: 'No existe la imagen...' });
            }
        });
    },
    getCounters: (req, res) => {
        var userId = req.user.sub;
        if (req.params.id) {
            userId = req.params.id;

        }
        getCountFollow(userId).then((value) => {
            return res.status(200).send({
                status: 'success',
                value
            });
        });
    }
}

function removeFilesUploads(res, file_path, vMessage) {
    fs.unlink(file_path, (err) => {
        return res.status(500).send({
            status: 'error',
            message: vMessage
        });
    });
}

async function followThisUser(identity_user_id, user_id) {

    var following = await Follow.findOne({ user: identity_user_id, followed: user_id }).exec()
        .then((following) => {
            return following;
        })
        .catch((err) => {
            return handleError(err);
        });
    var followed = await Follow.findOne({ user: user_id, followed: identity_user_id }).exec()
        .then((followed) => {
            return followed;
        })
        .catch((err) => {
            return handleError(err);
        });


    return {
        following: following,
        followed: followed
    }

}


async function followUserIds(user_id) {


    var following_clean = await Follow.find({ "user": user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec()
        .then((follows) => {
            var follows_clean = [];

            follows.forEach((follow) => {
                follows_clean.push(follow.followed);
            });
            return follows_clean;
        })
        .catch((err) => {
            return handleError(err);
        });

    var followeded_clean = await Follow.find({ "followed": user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec()
        .then((follows) => {
            var followed_clean = [];

            follows.forEach((follow) => {
                followed_clean.push(follow.user);
            });
            return followed_clean;
        })
        .catch((err) => {
            return handleError(err);
        });



    return {
        following: following_clean,
        followed: followeded_clean
    }
}

async function getCountFollow(user_id) {
    var following = await Follow.count({ 'user': user_id }).exec()
        .then((count) => {
            return count;
        })
        .catch((err) => {
            return handleError(err);
        });

    var followed = await Follow.count({ 'followed': user_id }).exec()
        .then((count) => {
            return count;
        })
        .catch((err) => {
            return handleError(err);
        });

    var publications = await Publication.count({ 'user': user_id }).exec()
        .then((count) => {
            return count;
        })
        .catch((err) => {
            return handleError(err);
        });

    return {
        following: following,
        followed: followed,
        publications: publications
    }
}

module.exports = controller;