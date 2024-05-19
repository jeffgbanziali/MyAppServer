const UserModel = require('../models/user.model');

module.exports = (io) => {
    let users = [];

    const addUser = (id, socketId) => {
        if (!users.some((user) => user.id === id)) {
            users.push({ id, socketId, online: true });
        } else {
            users = users.map(user => user.id === id ? { ...user, socketId, online: true } : user);
        }
        console.log("Users after adding:", users);
    };

    const removeUser = (socketId) => {
        users = users.map(user =>
            user.socketId === socketId ? { ...user, online: false } : user
        );
        console.log("Users after removing:", users);
    };

    const getUser = (id) => {
        const user = users.find((user) => user.id === id);
        return user;
    };

    io.on("connection", (socket) => {
        console.log("Utilisateur connecté !!!!");

        socket.on("addUser", (id) => {
            console.log("User added:", id, socket.id);
            addUser(id, socket.id);
            io.emit("getUsers", users);
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
            removeUser(socket.id);
            io.emit("getUsers", users);
            console.log("Users after disconnect:", users);
        });
    });
};
