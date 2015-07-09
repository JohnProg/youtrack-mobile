var oauth = require('./auth__oauth');
var AsyncStorage = require('react-native').AsyncStorage;
const STORAGE_KEY = 'yt_mobile_auth';

class Auth {
    constructor() {
        this.authParams = null;
    }

    authorize() {
        return oauth();
    }

    authorizeAndStoreToken() {
        return this.authorize()
            .then(this.storeAuth.bind(this));
    }

    loadStoredAuthParams() {
        return this.readAuth()
            .then((authParams) => this.verifyToken(authParams))
            .then((authParams) => this.authParams = authParams);
    }

    logOut() {
        return AsyncStorage.removeItem(STORAGE_KEY).then(() => delete this.authParams);
    }

    verifyToken(authParams) {
        //TODO: verify token in Hub
        return authParams;
    }

    storeAuth(authParams) {
        return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authParams))
            .then(() => authParams);
    }

    readAuth() {
        return AsyncStorage.getItem(STORAGE_KEY)
            .then((authParamsString) => JSON.parse(authParamsString));
    }
}

module.exports = Auth;