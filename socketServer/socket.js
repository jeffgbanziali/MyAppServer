const UserModel = require('../models/user.model');

module.exports = (io) => {
    let users = new Map();

    const addUser = async (id, socketId) => {
        try {
            const user = await UserModel.findById(id);
            if (user) {
                user.onlineStatus = true;
                await user.save();

                if (!users.has(id)) {
                    users.set(id, { socketId, online: true });
                } else {
                    const existingUser = users.get(id);
                    users.set(id, { ...existingUser, socketId, online: true });
                }
                console.log("Users after adding:", Array.from(users.values()));
                console.log("ils sont là:", users);

            } else {
                console.error(`User with ID ${id} not found.`);
            }
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };
    const updateUserOnlineStatusInDatabase = async (userId, onlineStatus) => {
        try {
            const user = await UserModel.findById(userId);
            if (user) {
                user.onlineStatus = onlineStatus;
                await user.save();
                console.log(`Statut en ligne de l'utilisateur ${userId} mis à jour dans la base de données.`);
                console.log(`Voici le status ${user.onlineStatus} m dans la base de données.`);
            } else {
                console.error(`Utilisateur avec l'ID ${userId} non trouvé.`);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut en ligne de l\'utilisateur:', error);
        }
    };


    const removeUser = async (socketId) => {
        try {
            for (let [id, user] of users) {
                if (user.socketId === socketId) {
                    const userModel = await UserModel.findById(id);
                    if (userModel) {
                        userModel.onlineStatus = false;
                        await userModel.save();
                    }
                    users.set(id, { ...user, online: false });
                    break;
                }
            }
            console.log("Users after removing:", Array.from(users.values()));
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    const getUser = (id) => {
        return users.get(id);
    };

    io.on("connection", (socket) => {
        console.log("Utilisateur connecté !!!!");

        socket.on("addUser", (id) => {
            console.log("User added:", id, socket.id);
            addUser(id, socket.id).then(() => {
                io.emit("getUsers", Array.from(users.values()));
            }).catch(error => console.error('Error emitting getUsers:', error));
        });


        socket.on("onlineStatusChanged", ({ userId, onlineStatus }) => {
            updateUserOnlineStatusInDatabase(userId, onlineStatus);
        });

        socket.on("sendMessage", ({ senderId, receiverId, text, attachment }) => {
            console.log("Affiche toi :", { senderId, receiverId, text, attachment });
            const user = getUser(receiverId);
            if (user && user.socketId) {
                io.to(user.socketId).emit("getMessage", {
                    senderId,
                    receiverId,
                    text,
                    attachment,
                });
            } else {
                console.log("Utilisateur non trouvé ou socketId non défini.");
            }
        });

        socket.on("disconnect", () => {
            console.log("Utilisateur déconnecté !!!!");
            removeUser(socket.id).then(() => {
                io.emit("getUsers", Array.from(users.values()));
                console.log("Users after disconnect:", Array.from(users.values()));
            }).catch(error => console.error('Error emitting getUsers after disconnect:', error));
        });
    });
};
