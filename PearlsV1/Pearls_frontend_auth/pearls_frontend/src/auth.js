class Auth{
    constructor() {
        this.authenticated = false
    }
    
    login(follwUpFunction) {
        this.authenticated = true;
        follwUpFunction();
    }
  
    logout(follwUpFunction) {
        this.authenticated = false;
        follwUpFunction();
    }
    
    isAuthenticated() {
        return this.authenticated;
    }
}

export default new Auth