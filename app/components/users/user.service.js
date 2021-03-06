const service = ({ userRepository, passwordService }) => ({

    register: async(email, name, password) => {

        const hashedPassword = passwordService.hashPassword(password);

        const newUser = {
            name: name,
            email: email,
            password: hashedPassword,
            status: 'active'
        }

        const userAdded = await userRepository.insert(newUser);

        userAdded.password = ':)';

        return userAdded;

    },
    authenticate: async(email, password) => {


        let user = await userRepository.getToAuthenticate(email)

        if (!user) {
            return false
        }

        if (passwordService.comparePassword(password, user.password) && user.status === 'active') {

            user = user.toObject();

            delete user.refreshToken
            delete user.refreshTokenExpDate

            delete user.resetPassToken
            delete user.resetPassTokenExpDate

            delete user.password

            return user
        } else {
            return false
        }

    },
    existsByEmail: email => userRepository.existsByEmail(email),

    existsById: idUser => userRepository.existsById(idUser),

    existsByResetPassToken: resetPassToken => userRepository.existsByValidResetPassToken(resetPassToken, Date.now()),

    getByEmail: email => userRepository.getByEmail(email),

    getByResetPassToken: resetPassToken => userRepository.getByResetPassToken(resetPassToken, Date.now()),

    storeResetPassToken: async(idUser, resetPassToken) => {

        const expDate = Date.now() + 1000 * 60 * 60 * 24 * 2 // 2 days in milliseconds

        return userRepository.setResetPassToken(idUser, resetPassToken, expDate)

    },
    storeResfreshToken: (idUser, refreshToken) => {

        const expDate = Date.now() + 1000 * 60 * 60 * 24 * 2 // 2 days in milliseconds

        return userRepository.setRefreshToken(idUser, refreshToken, expDate)

    },
    storeNewPassword: (idUser, password) => {

        const passwordHash = passwordService.hashPassword(password)

        return userRepository.setNewPassword(idUser, passwordHash)
    },
    isBlocked: async(idUser) => {

        const user = await userRepository.getById(idUser)

        return (user && user.status === 'blocked');

    },
    hasRefreshToken: async(idUser, refreshToken) => {

        const user = await userRepository.getByIdWithRefreshToken(idUser, Date.now())

        return (user && user.refreshToken === refreshToken)

    },
    removeResetPassToken: idUser => userRepository.removeResetPassToken(idUser),

    addSeedUser: async(email, password, name) => {

        const passwordHash = passwordService.hashPassword(password);

        const existsUser = await userRepository.existsByEmail(email)

        if (existsUser) {
            return false
        }

        const newUser = await userRepository.insert({ email, password: passwordHash, name, status: 'active' })

        return newUser;

    }

})

module.exports = service;